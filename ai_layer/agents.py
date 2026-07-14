from state import CampaignState

def research_agent(state: CampaignState):
    print(f" Research Ajanı devrede... Analiz edilen ürün: {state['target_product']}")
    
    # İleride buraya LLM kodları gelecek. Şimdilik sistemi test etmek için statik veri dönüyoruz.
    return {"research_data": f"{state['target_product']} için rakip analizi ve pazar trendleri raporu."}

def creative_agent(state: CampaignState):
    print(" Creative Ajan devrede... Sloganlar üretiliyor.")
    
    # Eğer önceden gelen metinler varsa al, yoksa boş liste başlat
    current_texts = state.get("creative_texts") or []
    current_texts.append("Yepyeni bir heyecan, sınırları zorla!")
    
    return {"creative_texts": current_texts}

def media_agent(state: CampaignState):
    print(f" Media Ajanı devrede... Günlük bütçe planlanıyor: {state['daily_budget']} TL")
    
    return {"media_plan": "Bütçe %60 Google Ads, %40 Meta olacak şekilde optimize edildi."}