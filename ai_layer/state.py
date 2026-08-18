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
    campaign_goal: Optional[str]
    cta_preference: Optional[str]

    # Kullanıcının kampanyaya yüklediği gerçek görsellerin worker'ın erişebileceği URL'leri
    # (Creative Agent görsel üretirken referans olarak kullanır)
    reference_image_urls: Optional[List[str]]

    # Research Agent çıktısı: sonraki ajanların temel aldığı strateji özeti
    strategy_brief: Optional[str]

    # Research Agent çıktısı: Creative Agent'ın prompt'unu ona göre özelleştirdiği ürün kategorisi
    product_category: Optional[str]

    # Creative Agent çıktısı: [{"angle", "ad_copy", "image_prompt", "generated_image_url"}]
    creatives: Optional[List[Dict[str, str]]]

    # Media Agent çıktısı (insan onayından sonra devam eder)
    targeting: Optional[Dict]
    budget: Optional[Dict]

    # Sistem ve insan onayı takibi
    status: str  # "pending", "awaiting_approval", "completed"
    audit_log: List[str]
