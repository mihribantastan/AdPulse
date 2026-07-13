# GEREKLİ İMPORTLARIN OLDUĞUNDAN EMİN OL:
import json
import os
import re
import base64  # Base64 kodunu resme çevirmek için ekledik
import time    # Dosya ismine zaman damgası eklemek için
from langchain_openai import ChatOpenAI
from openai import OpenAI
from state.campaign_state import CampaignState
from langchain_core.prompts import ChatPromptTemplate

def creative_node(state: CampaignState):
    print("🎨 [Creative Agent] GPT-4o-mini ile reklam metinleri hazırlanıyor...")
    strategy_brief = state.get("strategy_brief", "")
    current_logs = state.get("audit_log", [])
    
    # 1. AŞAMA: Metin Üretimi (Kusursuz çalışan kısım, dokunmuyoruz)
    text_api_key = os.environ.get("OPENAI_API_KEYS")
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7, api_key=text_api_key)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Sen ödüllü bir reklam yazarı ve sanat yönetmenisin. "
         "Sana verilen strateji brief'ine dayanarak 3 farklı hedef kitle için reklam metinleri ve görsel promptları hazırla. "
         "Çıktını SADECE JSON formatında bir dizi olarak ver:\n"
         '[\n'
         '  {{"target_audience": "Kitle", "ad_copy": "Metin", "image_prompt": "English prompt"}}\n'
         ']'),
        ("user", "Brief: {brief}")
    ])
    chain = prompt | llm
    response = chain.invoke({"brief": strategy_brief})
    
    # 🛡️ KURŞUN GEÇİRMEZ JSON ÇEKİCİ (Dokunmuyoruz)
    raw_content = response.content
    match = re.search(r'\[.*\]', raw_content, re.DOTALL)
    creatives_list = json.loads(match.group(0)) if match else []

    # 2. AŞAMA: Görsel Üretimi (BURADAN İTİBAREN DÜZELTİYORUZ)
    if len(creatives_list) > 0:
        first_creative = creatives_list[0]
        client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        try:
            print(f"🎨 [Creative Agent] 'gpt-image-2' ile görsel çiziliyor...")
            # Kanka, parameter listesini temizledik, response_format'ı KALDIRDIK.
            response = client.images.generate(
                model="gpt-image-2", 
                prompt=first_creative["image_prompt"],
                size="1024x1024",     
                n=1,
                # DİKKAT: response_format BURADA OLMAYACAK!
            )
            
            image_data = response.data[0]
            
            # Kanka proxy'nin bize ne döndüğünü (b64_json) zaten biliyoruz,
            # şimdi o veriyi dosyaya çevirelim.
            if hasattr(image_data, 'b64_json') and image_data.b64_json:
                # RESMİ BİLGİSAYARA KAYDETME İŞLEMİ
                file_name = f"reklam_gorseli_{int(time.time())}.png"
                with open(file_name, "wb") as f:
                    f.write(base64.b64decode(image_data.b64_json))
                
                # Rapor için dosya yolunu paslıyoruz
                image_url = f"📂 DOSYA OLARAK KAYDEDİLDİ: {file_name}"
            
            # Eğer proxy bazen URL dönerse (standard OpenAI gibi) onu da kapsıyoruz
            elif hasattr(image_data, 'url') and image_data.url:
                image_url = image_data.url
            elif isinstance(image_data, dict) and 'url' in image_data:
                image_url = image_data['url']
            else:
                image_url = "URL veya Resim Verisi Çözülemedi (Proxy hatası)."
            
            # Sonuç verisini JSON'a paslıyoruz
            first_creative["generated_image_url"] = image_url
            print("🎉 Görüntü başarıyla üretildi ve işlendi!")
            
        except Exception as e:
            # Hatanın ne olduğunu buraya yazdırıyoruz (ValueError, Invalid Size vb.)
            print(f"❌ Görsel çizim hatası: {e}")
            first_creative["generated_image_url"] = f"HATA OLUSTU: {e}"
    
    return {
        "creatives": creatives_list,
        "audit_log": current_logs + ["Creative Agent: Metinler GPT-4o, Görsel üretildi."]
    }