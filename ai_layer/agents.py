import os
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from state import CampaignState

from dotenv import load_dotenv
load_dotenv()

# LLM Beynimiz
llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)

def research_agent(state: CampaignState):
    print(f"🔍 Research Ajanı devrede... Analiz edilen ürün: {state['target_product']}")
    
    system_prompt = """Sen uzman bir pazar araştırmacısısın. 
    Verilen ürün ve strateji brief'ine göre hedef kitle analizi, 
    rakip analizi ve pazarlama açıları (marketing angles) çıkarman gerekiyor.
    Kısa, net ve madde madde yanıt ver."""
    
    user_prompt = f"Ürün: {state['target_product']}\nStrateji Brief: {state['strategy_brief']}"
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt)
    ]
    
    # Gerçek LLM çağrısı
    response = llm.invoke(messages)
    
    return {"research_data": response.content}

def creative_agent(state: CampaignState):
    print("🎨 Creative Ajan devrede... Araştırma raporu okunuyor ve sloganlar üretiliyor.")
    
    system_prompt = """Sen yaratıcı ve tecrübeli bir dijital pazarlama yazarısın (Copywriter).
    Sana verilecek olan hedef kitle ve rakip analizi raporunu dikkatlice incele.
    Ürünün öne çıkan özelliklerini (marketing angles) kullanarak, kitleyi tıklamaya ve satın almaya ikna edecek 3 farklı ve çarpıcı reklam metni/sloganı üret.
    Yanıtında sadece ürettiğin metinler olsun. Metinleri alt alta yaz, başlarına numara, madde işareti veya tire koyma."""
    
    # Research ajanının ürettiği veriyi (research_data) prompt'a ekliyoruz
    user_prompt = f"Ürün: {state['target_product']}\n\nPazar Araştırması Raporu:\n{state.get('research_data', '')}"
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt)
    ]
    
    # LLM çağrısı yapıyoruz
    response = llm.invoke(messages)
    
    # LLM'den gelen alt alta yazılmış metinleri ayırıp bir Python listesine (List[str]) çeviriyoruz
    produced_texts = [text.strip() for text in response.content.split('\n') if text.strip()]
    
    return {"creative_texts": produced_texts}

def media_agent(state: CampaignState):
    print(f"📈 Media Ajanı devrede... Günlük bütçe ({state['daily_budget']} TL) planlanıyor.")
    
    system_prompt = """Sen kıdemli bir performans pazarlama ve medya planlama uzmanısın.
    Sana verilecek olan günlük bütçeyi, hedef kitle analizini ve ürün bilgilerini kullanarak bir medya dağıtım planı yap.
    Parayı hangi platformlara (Google Ads, Meta, TikTok, Twitch, YouTube vb.) yüzde kaç oranında ve neden ayırdığını kısa, net ve profesyonel bir dille açıkla."""
    
    # Araştırma verisini ve bütçeyi ajana gönderiyoruz
    user_prompt = f"Ürün: {state['target_product']}\nGünlük Bütçe: {state['daily_budget']} TL\n\nPazar Araştırması:\n{state.get('research_data', '')}"
    
    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=user_prompt)
    ]
    
    # LLM çağrısı
    response = llm.invoke(messages)
    
    return {"media_plan": response.content}