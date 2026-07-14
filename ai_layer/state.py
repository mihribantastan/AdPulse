from typing import TypedDict, List, Optional

class CampaignState(TypedDict):
    # API'den (Postgres'ten) gelecek temel veriler
    campaign_id: int
    target_product: str
    strategy_brief: str
    daily_budget: float
    
    # Ajanların adım adım dolduracağı veri alanları
    research_data: Optional[str]  # Research ajanı dolduracak
    creative_texts: List[str]     # Creative ajanı dolduracak
    media_plan: Optional[str]     # Media ajanı dolduracak
    
    # Grafın nerede duraklayacağını (Human-in-the-loop) kontrol etmek için
    status: str