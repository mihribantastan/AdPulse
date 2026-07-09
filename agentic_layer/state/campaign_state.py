from typing import TypedDict, List, Dict, Optional

class CampaignState(TypedDict):
    # 1. Kullanıcı Girdisi
    target_url_or_product: str
    
    # 2. Research Agent Çıktısı
    strategy_brief: Optional[str]
    
    # 3. Creative Agent Çıktısı (Örn: [{"copy": "Metin 1", "prompt": "Görsel 1 promptu"}])
    creatives: Optional[List[Dict[str, str]]]
    
    # 4. Media Agent Çıktısı
    targeting_and_budget: Optional[Dict[str, str]]
    
    # 5. Sistem ve İnsan Onayı (Kritik Eşik)
    approval_status: str  # "draft", "pending_approval", "approved"
    audit_log: List[str]  # İşlem adımlarını takip etmek için loglar