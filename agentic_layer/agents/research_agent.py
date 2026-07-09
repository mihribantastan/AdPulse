import os
from langchain_core.prompts import ChatPromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from state.campaign_state import CampaignState

def research_node(state: CampaignState):
    """
    Kullanıcının girdiği ürünü analiz edip kampanya stratejisi (brief) çıkarır.
    """
    print("[Research Agent] Pazar araştırması ve hedef kitle analizi başlatılıyor...")
    
    # 1. Masadaki belgeden (State) girdiyi al
    target_input = state.get("target_url_or_product", "")
    current_logs = state.get("audit_log", [])
    
    # 2. Beyni (LLM) Tanımla (Test için Gemini 1.5 Pro kullanıyoruz)
    # Not: Çalışması için .env dosyasında GOOGLE_API_KEY tanımlı olmalıdır.
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", temperature=0.3)
    
    # 3. Ajanın Karakterini ve Görevini Belirle (Prompt Engineering)
    prompt = ChatPromptTemplate.from_messages([
        (
            "system", 
            "Sen uzman bir dijital pazarlama stratejistisin. "
            "Görevin, verilen ürün veya web sitesi için kısa, yapılandırılmış bir hedef kitle ve "
            "temel kampanya stratejisi (brief) oluşturmaktır. "
            "Lütfen çıktıyı net başlıklar halinde ver."
        ),
        ("user", "Ürün/Web Sitesi: {target}\nLütfen strateji brief'ini hazırla.")
    ])
    
    # 4. LLM'i çalıştır
    chain = prompt | llm
    response = chain.invoke({"target": target_input})
    
    print("[Research Agent] Brief başarıyla oluşturuldu.")
    
    # 5. Masadaki belgeyi (State) güncelle
    # LangGraph sadece return ettiğimiz alanları mevcut State'in üzerine yazar (update)
    return {
        "strategy_brief": response.content,
        "audit_log": current_logs + ["Research Agent: Hedef kitle ve kampanya stratejisi oluşturuldu."]
    }