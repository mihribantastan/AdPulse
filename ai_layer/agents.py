import json
import os
import re

from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from openai import OpenAI

from state import CampaignState


def _build_brief_context(state: CampaignState) -> str:
    """Kullanıcının formda verdiği somut bilgileri tek bir blokta toplar.
    Bunlar olmadan LLM ürünü/siteyi hiç bilmediği için jenerik, sektör
    klişesi metinler üretiyordu - burada verilen her şey ajanların
    kullanabileceği gerçek, somut girdi."""
    lines = [f"Ürün/Hizmet: {state['target_product']}"]
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

    print("🔍 [Research Agent] Brief başarıyla oluşturuldu.")
    return {
        "strategy_brief": response.content,
        "audit_log": current_logs + ["Research Agent: Pazar araştırması tamamlandı."],
    }


def creative_agent(state: CampaignState):
    print("🎨 [Creative Agent] Reklam metinleri ve görselleri hazırlanıyor...")
    strategy_brief = state.get("strategy_brief", "")
    current_logs = state.get("audit_log", [])
    context = _build_brief_context(state)

    # 1. AŞAMA: Metin üretimi
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Sen ödüllü bir reklam yazarı ve sanat yönetmenisin. "
         "Sana verilen strateji brief'ine VE kullanıcının verdiği somut ürün bilgilerine dayanarak "
         "3 farklı hedef kitle için tam kapsamlı reklam metinleri ve görsel promptları hazırla. "
         "ÖNEMLİ: ad_copy'lerde 'öne çıkan özellikler' varsa bunları GERÇEK ve SOMUT şekilde ("
         "genel geçer 'kaliteli', 'harika' gibi sıfatlar değil, verilen özelliklerin kendisi) kullan. "
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
         "Çıktını SADECE JSON formatında bir dizi olarak ver:\n"
         '[\n'
         '  {{"target_audience": "Kitle", "ad_copy": "Metin", "image_prompt": "English prompt"}}\n'
         ']'),
        ("user", "{context}\n\nStrateji Brief'i: {brief}"),
    ])
    chain = prompt | llm
    response = chain.invoke({"context": context, "brief": strategy_brief})

    match = re.search(r'\[.*\]', response.content, re.DOTALL)
    creatives_list = json.loads(match.group(0)) if match else []

    # 2. AŞAMA: Her kreatif için ayrı görsel üretimi (kullanıcı üçünden birini seçebilsin diye)
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    for creative in creatives_list:
        try:
            print(f"🎨 [Creative Agent] Görsel üretiliyor: {creative.get('target_audience')}...")
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
            print(f"⚠️ [Creative Agent] Görsel üretim hatası ({creative.get('target_audience')}): {e}")
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

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Sen kıdemli bir Medya Planlama Uzmanısın. "
         "Sana verilecek strateji brief'ini ve günlük bütçeyi kullanarak Meta (Facebook/Instagram) ve "
         "Google Ads arasında bir dağıtım planı yap. "
         "Çıktını SADECE aşağıdaki gibi bir JSON objesi olarak ver. Markdown veya açıklama ekleme:\n"
         "{{\n"
         '  "targeting": {{"platforms": ["Meta", "Google Ads"], "age_range": "18-35", "interests": ["Gaming", "Technology"]}},\n'
         '  "budget_distribution": {{"Meta": "%60", "Google Ads": "%40"}}\n'
         "}}"),
        ("user", "Brief: {brief}\nGünlük Bütçe: {budget} TL"),
    ])
    chain = prompt | llm
    response = chain.invoke({"brief": strategy_brief, "budget": state["daily_budget"]})

    match = re.search(r'\{.*\}', response.content, re.DOTALL)
    try:
        media_plan = json.loads(match.group(0)) if match else {}
    except json.JSONDecodeError as e:
        print(f"⚠️ [Media Agent] JSON format hatası: {e}")
        media_plan = {}

    return {
        "targeting": media_plan.get("targeting", {}),
        "budget": media_plan.get("budget_distribution", {}),
        "audit_log": current_logs + ["Media Agent: Hedefleme ve bütçe planlaması tamamlandı."],
    }
