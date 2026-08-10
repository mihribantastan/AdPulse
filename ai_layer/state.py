from typing import TypedDict, List, Dict, Optional


class CampaignState(TypedDict):
    # Laravel'den (Redis kuyruğu üzerinden) gelen temel veriler
    campaign_id: int
    target_product: str
    daily_budget: float
    target_audience: Optional[str]
    key_features: Optional[str]
    brand_tone: Optional[str]
    extra_notes: Optional[str]

    # Research Agent çıktısı: sonraki ajanların temel aldığı strateji özeti
    strategy_brief: Optional[str]

    # Creative Agent çıktısı: [{"target_audience", "ad_copy", "image_prompt", "generated_image_url"}]
    creatives: Optional[List[Dict[str, str]]]

    # Media Agent çıktısı (insan onayından sonra devam eder)
    targeting: Optional[Dict]
    budget: Optional[Dict]

    # Sistem ve insan onayı takibi
    status: str  # "pending", "awaiting_approval", "completed"
    audit_log: List[str]
