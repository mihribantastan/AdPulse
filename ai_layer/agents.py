import io
import json
import os
import re
import html as html_lib

import requests

from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from openai import OpenAI

from state import CampaignState

# Her kategori için Creative Agent'a eklenen ekstra yönlendirme. Tek bir genel
# prompt yerine, kampanyanın gerçekte ne olduğuna (fiziksel ürün mü, SaaS mı,
# yerel işletme mi...) göre metin yapısı ve görsel kompozisyonu değişsin diye.
CATEGORY_GUIDANCE = {
    "e_ticaret_urun": (
        "Bu bir e-ticaret/fiziksel ürün kampanyası. ad_copy'lerde fiyat avantajı, kargo/teslimat hızı, "
        "stok sınırlılığı gibi somut aciliyet unsurlarına yer ver. image_prompt'lar ürünü net ve çekici "
        "şekilde öne çıkaran, e-ticaret reklamlarına uygun temiz kompozisyonlarda olsun."
    ),
    "dijital_hizmet_saas": (
        "Bu bir yazılım/SaaS/dijital hizmet kampanyası. ad_copy'lerde somut zaman/para tasarrufu, "
        "ücretsiz deneme gibi unsurları vurgula. image_prompt'lar arayüz/ekran hissi veren veya soyut, "
        "modern, teknolojik kompozisyonlarda olsun."
    ),
    "mobil_uygulama": (
        "Bu bir mobil uygulama kampanyası. ad_copy'de 'hemen indir', kolaylık ve anlık faydaya vurgu yap. "
        "image_prompt'lar telefon ekranında uygulamayı kullanma anını ima eden kompozisyonlarda olsun."
    ),
    "yerel_hizmet_isletme": (
        "Bu yerel bir işletme/hizmet kampanyası. ad_copy'de güven, konum yakınlığı, randevu/iletişim "
        "kolaylığına vurgu yap. image_prompt'lar sıcak, gerçekçi, samimi mekan/insan hissi veren "
        "kompozisyonlarda olsun."
    ),
    "etkinlik_organizasyon": (
        "Bu bir etkinlik/organizasyon kampanyası. ad_copy'de tarih aciliyeti ve deneyim vurgusu yap. "
        "image_prompt'lar enerjik, davetkar bir etkinlik atmosferi taşısın."
    ),
}


def _classify_product_category(context: str) -> str | None:
    """Kampanyanın gerçek türünü (e-ticaret, SaaS, yerel hizmet vb.) tespit eder.
    Sabit bir anahtar kelime sözlüğü yerine LLM'e sorduk çünkü gerçek metinler
    çok çeşitli oluyor; LLM anlam bazında çok daha güvenilir sınıflandırıyor."""
    categories = list(CATEGORY_GUIDANCE.keys())
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0)
    prompt = ChatPromptTemplate.from_messages([
        ("system", f"Aşağıdaki kampanya bilgisini oku ve SADECE şu kategorilerden birini yaz, "
                   f"başka hiçbir şey yazma: {', '.join(categories)}, genel"),
        ("user", "{context}"),
    ])
    try:
        chain = prompt | llm
        response = chain.invoke({"context": context})
        category = response.content.strip().lower()
        return category if category in categories else None
    except Exception as e:
        print(f"⚠️ [Research Agent] Kategori sınıflandırma başarısız: {e}")
        return None


def _fetch_site_context(url: str) -> str | None:
    """target_product bir URL ise gerçek sayfayı çekip ham metnini çıkarır.
    Kullanıcı 'öne çıkan özellikler' vs. alanlarını boş bırakırsa ajanların
    elinde ürün adından başka hiçbir şey kalmıyordu - bu jenerik çıktının asıl
    sebebiydi. Burada siteden gerçek başlık/açıklama/gövde metni çekilip
    ajanlara somut malzeme olarak veriliyor. BeautifulSoup gibi ek bir
    bağımlılık gerekmesin diye kaba ama yeterli bir regex tabanlı ayıklama
    kullanılıyor - LLM'e beslenecek metin için mükemmel temizlik şart değil.
    """
    if not url.strip().lower().startswith(("http://", "https://")):
        return None

    try:
        response = requests.get(
            url,
            timeout=8,
            headers={"User-Agent": "Mozilla/5.0 (compatible; AdPulseBot/1.0)"},
        )
        response.raise_for_status()
        raw = response.text
    except requests.RequestException as e:
        print(f"⚠️ [Research Agent] Site içeriği çekilemedi ({url}): {e}")
        return None

    title_match = re.search(r"<title[^>]*>(.*?)</title>", raw, re.IGNORECASE | re.DOTALL)
    desc_match = re.search(
        r'<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\']',
        raw, re.IGNORECASE,
    )

    # React/Vue gibi client-side render eden sitelerde ham HTML'in gövdesi neredeyse
    # boş gelir (içerik JS ile sonradan doluyor) - ama SEO için çoğu modern e-ticaret
    # sitesi structured data'yı (JSON-LD) sunucu tarafında, ham HTML'in içine gömer.
    # Bu yüzden gövde metninden önce JSON-LD'deki ürün adı/açıklama/fiyat bilgisini
    # ayrıca çıkarıyoruz - JS render edilmese bile bu genelde mevcut oluyor.
    ld_json_parts = []
    for ld_match in re.finditer(
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        raw, re.IGNORECASE | re.DOTALL,
    ):
        try:
            data = json.loads(ld_match.group(1).strip())
        except (json.JSONDecodeError, ValueError):
            continue
        for entry in (data if isinstance(data, list) else [data]):
            if not isinstance(entry, dict):
                continue
            name = entry.get("name")
            description = entry.get("description")
            offers = entry.get("offers")
            price = offers.get("price") if isinstance(offers, dict) else None
            currency = offers.get("priceCurrency") if isinstance(offers, dict) else None
            if name:
                ld_json_parts.append(f"Ürün adı (structured data): {name}")
            if description:
                ld_json_parts.append(f"Ürün açıklaması (structured data): {description}")
            if price:
                ld_json_parts.append(f"Fiyat (structured data): {price} {currency or ''}".strip())

    body = re.sub(r"<(script|style|nav|footer|header)[^>]*>.*?</\1>", " ", raw, flags=re.IGNORECASE | re.DOTALL)
    body = re.sub(r"<[^>]+>", " ", body)
    body = html_lib.unescape(body)
    body = re.sub(r"\s+", " ", body).strip()

    parts = []
    if title_match:
        parts.append(f"Sayfa başlığı: {html_lib.unescape(title_match.group(1)).strip()}")
    if desc_match:
        parts.append(f"Sayfa açıklaması: {html_lib.unescape(desc_match.group(1)).strip()}")
    parts.extend(ld_json_parts[:6])  # çok sayıda ürün şeması olan sayfalarda taşmasın
    if body:
        parts.append(f"Sayfa içeriğinden alıntı: {body[:2500]}")

    return "\n".join(parts) if parts else None


def _build_brief_context(state: CampaignState) -> str:
    """Kullanıcının formda verdiği somut bilgileri tek bir blokta toplar.
    Bunlar olmadan LLM ürünü/siteyi hiç bilmediği için jenerik, sektör
    klişesi metinler üretiyordu - burada verilen her şey ajanların
    kullanabileceği gerçek, somut girdi."""
    lines = [f"Ürün/Hizmet: {state['target_product']}"]

    site_context = _fetch_site_context(state["target_product"])
    if site_context:
        lines.append(f"\nHedef sayfadan otomatik çekilen gerçek içerik (bunu birebir kullan, uydurma):\n{site_context}")

    if state.get("target_audience"):
        lines.append(f"Kullanıcının belirttiği hedef kitle: {state['target_audience']}")
    if state.get("key_features"):
        lines.append(f"Ürünün öne çıkan özellikleri / satış noktaları: {state['key_features']}")
    if state.get("brand_tone"):
        lines.append(f"İstenen marka tonu: {state['brand_tone']}")
    if state.get("campaign_goal"):
        lines.append(f"Kampanya hedefi: {state['campaign_goal']}")
    if state.get("cta_preference"):
        lines.append(f"İstenen harekete geçirici çağrı (CTA): {state['cta_preference']}")
    if state.get("extra_notes"):
        lines.append(f"Kullanıcının ek istekleri/talimatları: {state['extra_notes']}")
    return "\n".join(lines)


def research_agent(state: CampaignState):
    print(f"🔍 [Research Agent] Analiz ediliyor: {state['target_product']}")
    current_logs = state.get("audit_log", [])
    context = _build_brief_context(state)

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Sen uzman bir pazar araştırmacısı ve dijital pazarlama stratejistisin. "
         "Sana verilen SOMUT bilgilere dayanarak (özellikle 'öne çıkan özellikler' ve 'ek istekler' varsa) "
         "bir strateji brief'i yaz. Jenerik, sektör klişesi ifadelerden kaçın; verilen özellikleri, "
         "kullanıcının belirttiği hedef kitleyi ve marka tonunu birebir yansıt. Eğer öne çıkan özellik "
         "verilmediyse, ürün adından/URL'den makul bir çıkarım yap ama bunu varsayım olarak belirt."),
        ("user", "{context}\n\nLütfen strateji brief'ini oluştur."),
    ])
    chain = prompt | llm
    response = chain.invoke({"context": context})

    product_category = _classify_product_category(context)
    print(f"🔍 [Research Agent] Brief başarıyla oluşturuldu. Kategori: {product_category or 'genel'}")

    return {
        "strategy_brief": response.content,
        "product_category": product_category,
        "audit_log": current_logs + ["Research Agent: Pazar araştırması tamamlandı."],
    }


def _download_reference_image(url: str) -> io.BytesIO | None:
    """Kullanıcının kampanyaya yüklediği gerçek ürün görselini worker'ın
    ulaşabildiği dahili URL'den indirir (bkz. CampaignController::dispatchToAgentQueue)."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        buffer = io.BytesIO(response.content)
        buffer.name = "reference.png"  # OpenAI SDK dosya tipini isimden çıkarıyor
        return buffer
    except requests.RequestException as e:
        print(f"⚠️ [Creative Agent] Referans görsel indirilemedi ({url}): {e}")
        return None


def creative_agent(state: CampaignState):
    print("🎨 [Creative Agent] Reklam metinleri ve görselleri hazırlanıyor...")
    strategy_brief = state.get("strategy_brief", "")
    current_logs = state.get("audit_log", [])
    context = _build_brief_context(state)
    category_guidance = CATEGORY_GUIDANCE.get(state.get("product_category") or "", "")
    reference_urls = state.get("reference_image_urls") or []

    # 1. AŞAMA: Metin üretimi
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Sen ödüllü bir reklam yazarı ve sanat yönetmenisin. "
         "Sana verilen strateji brief'ine VE kullanıcının verdiği somut ürün bilgilerine dayanarak "
         "AYNI hedef kitleye yönelik 3 FARKLI REKLAM AÇISI (angle) ile 3 ayrı reklam metni ve görsel "
         "promptu hazırla. Hedef kitleyi kullanıcının belirttiği/brief'teki şekilde SABİT tut - 3 farklı "
         "kitle uydurma, sadece mesajın açısını/kancasını değiştir. Örneğin: biri somut özellik/fayda "
         "vurgusu, biri duygusal/hikaye vurgusu, biri aciliyet/fırsat vurgusu gibi birbirinden belirgin "
         "şekilde farklı açılardan yaklaşsın - üçü de aynı şeyi farklı kelimelerle söylemesin. "
         "ÖNEMLİ: ad_copy'lerde 'öne çıkan özellikler' varsa bunları GERÇEK ve SOMUT şekilde ("
         "genel geçer 'kaliteli', 'harika' gibi sıfatlar değil, verilen özelliklerin kendisi) kullan. "
         "KESİNLİKLE UYDURMA: sana verilmeyen hiçbir somut rakam/oran/miktar YAZMA - '%20 indirim', "
         "'ilk 100 kişiye', 'stokta sadece 5 adet', belirli bir fiyat gibi ifadeleri SADECE bu bilgi "
         "sana context'te (özellikler, site içeriği, ek istekler) gerçekten verilmişse kullan. Verilmemişse "
         "bu tür somut vaatler yerine genel ama dürüst bir aciliyet/fayda dili kullan (ör. 'sınırlı fırsat' "
         "yerine gerçek bir oran uydurma). Bu gerçek reklam parasıyla yayınlanacak, yanlış/uydurma vaat "
         "yasal ve güven riski taşır. "
         "Kullanıcının belirttiği marka tonuna (ör. samimi, lüks, eğlenceli, profesyonel) harfiyen uy "
         "ve varsa ek isteklerini/talimatlarını mutlaka uygula. "
         "Kampanya hedefi belirtildiyse mesajın yapısını ona göre kur: 'Marka Bilinirliği' ise hikaye/marka "
         "anlatımına, 'Satış/Dönüşüm' ise aciliyet ve somut faydaya, 'Web Sitesi Trafiği' ise merak uyandırmaya, "
         "'Potansiyel Müşteri Toplama' ise güven/teklif netliğine, 'Uygulama İndirme' ise kolaylık/anlık faydaya "
         "ağırlık ver. CTA tercihi belirtildiyse ad_copy'nin SON cümlesi mutlaka o çağrıyı (ör. 'Hemen Al', "
         "'Ücretsiz Dene') birebir veya çok yakın bir ifadeyle içersin. "
         "Her ad_copy KISA BİR SLOGAN OLMASIN: dikkat çeken bir açılış cümlesi, ürünün somut özelliklerine "
         "dayanan bir gövde ve net bir harekete geçirici çağrı (CTA) içeren, Meta/Google Ads reklam metni "
         "olarak kullanılabilecek 4-6 cümlelik, doyurucu bir metin yaz (yaklaşık 400-600 karakter). "
         "image_prompt de jenerik stok-fotoğraf tarzında olmasın; ürünün/hizmetin somut özelliklerini ve "
         "istenen marka tonunu görsel olarak yansıtsın.\n"
         "{category_guidance}\n"
         "Her varyasyon için kısa (2-4 kelime) bir 'angle' etiketi yaz - bu bir hedef kitle DEĞİL, "
         "reklamın açısını/kancasını tanımlayan bir etiket olsun (ör. 'Fiyat Avantajı', 'Duygusal Bağ', "
         "'Sınırlı Fırsat', 'Sosyal Kanıt').\n"
         "Çıktını SADECE JSON formatında bir dizi olarak ver:\n"
         '[\n'
         '  {{"angle": "Kısa açı etiketi", "ad_copy": "Metin", "image_prompt": "English prompt"}}\n'
         ']'),
        ("user", "{context}\n\nStrateji Brief'i: {brief}"),
    ])
    chain = prompt | llm

    # LLM'e "3 farklı hedef kitle" dedik ama bu bir zorunluluk değil, bir istek -
    # bazen 1-2 tanesini döndürüyor. Kullanıcı en az 3 metin/görsel arasından
    # seçebilmeli, o yüzden eksik dönerse birkaç kez daha deneyip tamamlıyoruz.
    creatives_list = []
    for attempt in range(3):
        response = chain.invoke({"context": context, "brief": strategy_brief, "category_guidance": category_guidance})
        match = re.search(r'\[.*\]', response.content, re.DOTALL)
        try:
            creatives_list = json.loads(match.group(0)) if match else []
        except json.JSONDecodeError:
            creatives_list = []
        if len(creatives_list) >= 3:
            break
        print(f"⚠️ [Creative Agent] Beklenen 3 yerine {len(creatives_list)} kreatif döndü (deneme {attempt + 1}/3), tekrar deneniyor...")

    # "400-600 karakter" istedik ama bu bir talep, zorunluluk değil - LLM bazen çok
    # kısa (sloganlaşır) ya da çok uzun (Meta/Google'ın pratik sınırlarını zorlar)
    # yazabiliyor. Sert bir üst sınırla kırpıyoruz, kısa olanı reddetmiyoruz (yeniden
    # denemek ekstra LLM çağrısı demek) ama en azından logluyoruz.
    for creative in creatives_list:
        ad_copy = creative.get("ad_copy") or ""
        if len(ad_copy) > 900:
            creative["ad_copy"] = ad_copy[:900].rsplit(" ", 1)[0] + "..."
        elif len(ad_copy) < 150:
            print(f"⚠️ [Creative Agent] '{creative.get('angle')}' beklenenden kısa ({len(ad_copy)} karakter)")

    # 2. AŞAMA: Her kreatif için ayrı görsel üretimi (kullanıcı üçünden birini seçebilsin diye).
    # Kullanıcı kendi ürün görseli yüklediyse (video değil - edit API görsel ister),
    # sıfırdan hayal etmek yerine o gerçek görseli referans alıp düzenliyoruz.
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    reference_image = _download_reference_image(reference_urls[0]) if reference_urls else None
    if reference_image:
        print(f"🎨 [Creative Agent] Kullanıcının yüklediği görsel referans alınacak: {reference_urls[0]}")

    for creative in creatives_list:
        try:
            print(f"🎨 [Creative Agent] Görsel üretiliyor: {creative.get('angle')}...")
            if reference_image:
                reference_image.seek(0)
                image_response = client.images.edit(
                    model="gpt-image-1",
                    image=reference_image,
                    prompt=(
                        "Bu gerçek ürün/mekan görselini referans alarak, ürünün gerçek görünümünü koruyan "
                        f"profesyonel bir reklam görseline dönüştür: {creative['image_prompt']}"
                    ),
                    size="1024x1024",
                    n=1,
                )
            else:
                image_response = client.images.generate(
                    model="gpt-image-1",
                    prompt=creative["image_prompt"],
                    size="1024x1024",
                    n=1,
                )
            image_data = image_response.data[0]

            if getattr(image_data, "b64_json", None):
                # Dosyaya yazmak yerine data URI olarak state'e koyuyoruz:
                # worker kendi container'ında çalışıyor, dosya hiçbir yerden
                # erişilebilir olmazdı. Frontend bunu doğrudan <img src> olarak kullanabilir.
                creative["generated_image_url"] = f"data:image/png;base64,{image_data.b64_json}"
            elif getattr(image_data, "url", None):
                creative["generated_image_url"] = image_data.url
            else:
                creative["generated_image_url"] = None
        except Exception as e:
            print(f"⚠️ [Creative Agent] Görsel üretim hatası ({creative.get('angle')}): {e}")
            creative["generated_image_url"] = None

    print("🎨 [Creative Agent] Tüm metinler ve görseller hazır.")

    return {
        "creatives": creatives_list,
        "audit_log": current_logs + ["Creative Agent: Metinler ve görseller üretildi."],
    }


def media_agent(state: CampaignState):
    print(f"📊 [Media Agent] Hedefleme ve bütçe planlaması yapılıyor (bütçe: {state['daily_budget']})...")
    strategy_brief = state.get("strategy_brief", "")
    current_logs = state.get("audit_log", [])

    # Sadece gerçekten yayın yapabildiğimiz platformlar arasında dağıtım yap - kullanıcı
    # youtube/tiktok/x seçmiş olabilir ama bunlar için henüz publisher yok, dahil etmenin
    # anlamı yok. Kullanıcı hiç google_ads/instagram/facebook seçmediyse (veya platforms
    # bilgisi hiç gelmediyse) makul bir varsayılan olarak ikisine de eşit dağıt.
    campaign_platforms = state.get("platforms") or []
    wants_google = "google_ads" in campaign_platforms
    wants_meta = "instagram" in campaign_platforms or "facebook" in campaign_platforms
    if not wants_google and not wants_meta:
        wants_google = wants_meta = True
    active_platforms = [p for p, wants in [("google_ads", wants_google), ("meta", wants_meta)] if wants]

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Sen kıdemli bir Medya Planlama Uzmanısın. "
         "Sana verilecek strateji brief'ini ve günlük bütçeyi kullanarak SADECE şu platformlar "
         "arasında ({platforms}) bir dağıtım planı yap - başka platform ekleme, listede bir tek "
         "platform varsa ona %100 ver. "
         "age_range için gerçekçi bir sayısal aralık yaz (ör. '25-45'), metin değil. "
         "Çıktını SADECE aşağıdaki gibi bir JSON objesi olarak ver, platform anahtarlarını AYNEN "
         "verdiğim gibi (küçük harf, alt tire) kullan. Markdown veya açıklama ekleme:\n"
         "{{\n"
         '  "targeting": {{"age_range": "25-45", "interests": ["Gaming", "Technology"]}},\n'
         '  "budget_distribution": {{"google_ads": 60, "meta": 40}}\n'
         "}}"),
        ("user", "Brief: {brief}\nGünlük Bütçe: {budget} TL"),
    ])
    chain = prompt | llm
    response = chain.invoke({
        "brief": strategy_brief,
        "budget": state["daily_budget"],
        "platforms": ", ".join(active_platforms),
    })

    match = re.search(r'\{.*\}', response.content, re.DOTALL)
    try:
        media_plan = json.loads(match.group(0)) if match else {}
    except json.JSONDecodeError as e:
        print(f"⚠️ [Media Agent] JSON format hatası: {e}")
        media_plan = {}

    # Güvenlik ağı: LLM istenmeyen bir platform eklerse ya da yüzdeler toplamı 100 değilse
    # (ya da tek platform varsa payını unutursa), tek platform için her zaman %100'e,
    # iki platform için LLM'in oranını normalize ederek düzeltiyoruz - publisher'lar bu
    # yüzdeye göre kendi bütçe paylarını hesaplayacak, yanlış değer gerçek harcamayı bozar.
    raw_distribution = media_plan.get("budget_distribution", {})
    distribution = {p: float(raw_distribution.get(p) or 0) for p in active_platforms}
    total = sum(distribution.values())
    if total <= 0:
        distribution = {p: 100 / len(active_platforms) for p in active_platforms}
    elif total != 100:
        distribution = {p: (v / total) * 100 for p, v in distribution.items()}

    return {
        "targeting": media_plan.get("targeting", {}),
        "budget": distribution,
        "audit_log": current_logs + ["Media Agent: Hedefleme ve bütçe planlaması tamamlandı."],
    }
