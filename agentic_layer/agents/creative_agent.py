import json
import os
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from openai import OpenAI
from state.campaign_state import CampaignState

def creative_node(state: CampaignState):
    """
    Research Agent'ın ürettiği brief'i alıp Gemini ile reklam metinleri üretir.
    Ardından üretilen prompt'u OpenAI DALL-E API'sine göndererek görsel çizer.
    """
    print("🎨 [Creative Agent] Gemini ile reklam metinleri ve görsel promptları hazırlanıyor...")
    
    strategy_brief = state.get("strategy_brief", "")
    current_logs = state.get("audit_log", [])
    
    # 1. Aşama: Metin ve Prompt Üretimi (Gemini)
    # Çalıştığını teyit ettiğimiz modeli kullanıyoruz
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", temperature=0.7)
    
    prompt = ChatPromptTemplate.from_messages([
        (
            "system", 
            "Sen ödüllü bir reklam yazarı ve sanat yönetmenisin. "
            "Sana verilen strateji brief'ine dayanarak 3 farklı hedef kitle için yaratıcı reklam metinleri ve bu metinlere uygun görsel üretim komutları (image prompts) hazırla. "
            "Görsel promptları detaylı ve İngilizce olmalıdır (DALL-E için). "
            "Çıktını SADECE aşağıdaki formatta geçerli bir JSON dizisi (array) olarak ver. Ekstra hiçbir açıklama yazma:\n"
            '[\n'
            '  {{"target_audience": "Kitle 1", "ad_copy": "Reklam Metni", "image_prompt": "English image prompt"}}\n'
            ']'
        ),
        ("user", "İşte Strateji Brief'i:\n{brief}\nLütfen JSON çıktısını üret.")
    ])
    
    chain = prompt | llm
    response = chain.invoke({"brief": strategy_brief})
    
    # JSON temizleme işlemi
    raw_content = response.content.strip()
    if raw_content.startswith("```json"):
        raw_content = raw_content[7:]
    if raw_content.endswith("```"):
        raw_content = raw_content[:-3]
        
    try:
        creatives_list = json.loads(raw_content.strip())
    except json.JSONDecodeError:
        print("⚠️ [Creative Agent] JSON parse hatası, format bozuk geldi!")
        creatives_list = []

    print("✅ [Creative Agent] Gemini metinleri yazdı. Şimdi DALL-E ile 1 test görseli çiziliyor...")
    
    # 2. Aşama: Görsel Üretimi (OpenAI DALL-E)
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    
    # Bütçeyi korumak için sadece ilk hedef kitlenin görselini çizdiriyoruz
    if len(creatives_list) > 0:
        first_creative = creatives_list[0]
        try:
            # Test için ucuz model dall-e-2 kullanıyoruz
            dalle_response = client.images.generate(
                model="gpt-image-2", 
                prompt=first_creative["image_prompt"],
                size="1024x1024",
                quality="high",
                n=1,
            )
            # DALL-E'den dönen URL'i JSON'a ekliyoruz
            first_creative["generated_image_url"] = dalle_response.data[0].url
            print("🎉 [Creative Agent] İlk görsel başarıyla çizildi!")
        except Exception as e:
            print(f"❌ [Creative Agent] Görsel çizim hatası: {e}")
            first_creative["generated_image_url"] = "Error"
    
    return {
        "creatives": creatives_list,
        "audit_log": current_logs + ["Creative Agent: Metinler Gemini ile yazıldı, 1 test görseli DALL-E ile çizildi."]
    }