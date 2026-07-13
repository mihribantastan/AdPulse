import json
import os
import re
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from state.campaign_state import CampaignState

def media_node(state: CampaignState):
    print("📊 [Media Agent] Hedef kitle optimizasyonu ve bütçe planlaması yapılıyor...")
    strategy_brief = state.get("strategy_brief", "")
    current_logs = state.get("audit_log", [])
    text_api_key = os.environ.get("OPENAI_API_KEYS")
    
    # Kelime uydurmasın diye sıcaklığı 0 yaptık
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0, api_key=text_api_key)
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Sen kıdemli bir Medya Planlama Uzmanısın. "
         "Çıktını SADECE aşağıdaki gibi bir JSON objesi olarak ver. Markdown (```json) kullanma, başka tek kelime açıklama yazma:\n"
         "{{\n"
         '  "targeting": {{"platforms": ["Meta", "Google Ads"], "age_range": "18-35", "interests": ["Gaming", "Technology"]}},\n'
         '  "budget_distribution": {{"Meta": "%60", "Google Ads": "%40"}}\n'
         "}}"),
        ("user", "Brief: {brief}")
    ])
    
    chain = prompt | llm
    response = chain.invoke({"brief": strategy_brief})
    
    # 🛡️ KURŞUN GEÇİRMEZ JSON ÇEKİCİ (Regex)
    raw_content = response.content
    match = re.search(r'\{.*\}', raw_content, re.DOTALL)
    
    if match:
        try:
            # Sadece süslü parantezlerin içini çekip çıkardık
            media_plan = json.loads(match.group(0))
        except Exception as e:
            print(f"⚠️ [Media Agent] JSON format hatası: {e}")
            media_plan = {"targeting": {"platforms": ["Hata"]}, "budget_distribution": {}}
    else:
        print("⚠️ [Media Agent] Metin içinde JSON bulunamadı!")
        media_plan = {"targeting": {"platforms": ["Hata"]}, "budget_distribution": {}}
    
    return {
        "targeting": media_plan.get("targeting", {}),
        "budget": media_plan.get("budget_distribution", {}),
        "audit_log": current_logs + ["Media Agent: Planlama yapıldı."]
    }