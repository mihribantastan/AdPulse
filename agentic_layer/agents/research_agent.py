import os
from openai import OpenAI
from state.campaign_state import CampaignState

def research_node(state: CampaignState):
    print(" [Research Agent] Pazar araştırması saf OpenAI (Özel Anahtar) ile başlatılıyor...") 
    target_input = state.get("target_url_or_product", "")
    current_logs = state.get("audit_log", [])
    
    # .env dosyasından senin belirlediğin o özel anahtarı çekiyoruz
    custom_api_key = os.environ.get("OPENAI_API_KEYS")
    
    # LangChain yerine doğrudan OpenAI istemcisini kuruyoruz
    client = OpenAI(api_key=custom_api_key)
    
    # Saf OpenAI Chat Completions API'sine istek atıyoruz
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        temperature=0.3,
        messages=[
            {
                "role": "system", 
                "content": "Sen uzman bir pazar araştırmacısı ve dijital pazarlama stratejistisin. Verilen ürünü/hizmeti analiz et, hedef kitleyi belirle ve vurucu bir strateji brief'i yaz."
            },
            {
                "role": "user", 
                "content": f"Ürün/Hizmet: {target_input}\nLütfen strateji brief'ini oluştur."
            }
        ]
    )
    
    # OpenAI'ın JSON formatındaki yanıtından sadece metni (content) çekiyoruz
    brief_content = response.choices[0].message.content
    
    print(" [Research Agent] Brief başarıyla oluşturuldu.")
    return {
        "strategy_brief": brief_content,
        "audit_log": current_logs + ["Research Agent: Pazar araştırması saf OpenAI istemcisi ile tamamlandı."]
    }