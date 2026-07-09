from dotenv import load_dotenv
load_dotenv()  # Bu komut .env dosyasındaki şifreleri sisteme yükler

from state.campaign_state import CampaignState
from agents.research_agent import research_node

# Ajanın çalışıp çalışmadığını görmek için sahte bir veri (State) oluşturuyoruz
test_state = {
    "target_url_or_product": "Yüksek performanslı gürültü engelleyici oyuncu kulaklığı",
    "audit_log": []
}

print("🚀 Sistem başlatılıyor...")

# Ajanı çalıştırıp sonucunu alıyoruz
guncel_state = research_node(test_state)

print("\n--- AGENT'IN ÜRETTİĞİ STRATEJİ (BRIEF) ---")
print(guncel_state["strategy_brief"])