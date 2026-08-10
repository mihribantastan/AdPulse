import json
import os
import re

from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from openai import OpenAI

from state import CampaignState


def research_agent(state: CampaignState):
    print(f"🔍 [Research Agent] Analiz ediliyor: {state['target_product']}")
    current_logs = state.get("audit_log", [])

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Sen uzman bir pazar araştırmacısı ve dijital pazarlama stratejistisin. "
         "Verilen ürünü/hizmeti analiz et, hedef kitleyi belirle ve vurucu bir strateji brief'i yaz."),
        ("user", "Ürün/Hizmet: {product}\nLütfen strateji brief'ini oluştur."),
    ])
    chain = prompt | llm
    response = chain.invoke({"product": state["target_product"]})

    print("🔍 [Research Agent] Brief başarıyla oluşturuldu.")
    return {
        "strategy_brief": response.content,
        "audit_log": current_logs + ["Research Agent: Pazar araştırması tamamlandı."],
    }


def creative_agent(state: CampaignState):
    print("🎨 [Creative Agent] Reklam metinleri ve görselleri hazırlanıyor...")
    strategy_brief = state.get("strategy_brief", "")
    current_logs = state.get("audit_log", [])

    # 1. AŞAMA: Metin üretimi
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Sen ödüllü bir reklam yazarı ve sanat yönetmenisin. "
         "Sana verilen strateji brief'ine dayanarak 3 farklı hedef kitle için tam kapsamlı reklam metinleri "
         "ve görsel promptları hazırla. Her ad_copy KISA BİR SLOGAN OLMASIN: dikkat çeken bir açılış cümlesi, "
         "ürünün 2-3 somut faydasını anlatan bir gövde ve net bir harekete geçirici çağrı (CTA) içeren, "
         "Meta/Google Ads reklam metni olarak kullanılabilecek 4-6 cümlelik, doyurucu bir metin yaz "
         "(yaklaşık 400-600 karakter).\n"
         "Çıktını SADECE JSON formatında bir dizi olarak ver:\n"
         '[\n'
         '  {{"target_audience": "Kitle", "ad_copy": "Metin", "image_prompt": "English prompt"}}\n'
         ']'),
        ("user", "Brief: {brief}"),
    ])
    chain = prompt | llm
    response = chain.invoke({"brief": strategy_brief})

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
