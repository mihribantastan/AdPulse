from dotenv import load_dotenv
load_dotenv()

from agents.research_agent import research_node
from agents.creative_agent import creative_node
from agents.media_agent import media_node

# Sistemi test etmek için başlangıç verisi (Durum)
test_state = {
    "target_url_or_product": "Yüksek performanslı gürültü engelleyici oyuncu kulaklığı",
    "audit_log": []
}

print("🚀 Sistem başlatılıyor...")

# --- 1. ADIM: RESEARCH AGENT ---
print("\n--- 1. ADIM: RESEARCH AGENT ---")
state_after_research = research_node(test_state)

# --- 2. ADIM: CREATIVE AGENT ---
print("\n--- 2. ADIM: CREATIVE AGENT ---")
# Dikkat: state_after_creative değişkenine research'ün çıktısını güncelleyerek atıyoruz
state_after_creative = creative_node(state_after_research)

# --- 3. ADIM: MEDIA AGENT ---
print("\n--- 3. ADIM: MEDIA AGENT ---")
# 3. ajan, kreatif ajanla birleşmiş olan tüm state'i kullanıyor
final_state = media_node(state_after_creative)

# ==================================================
# ZAFER RAPORU VE SONUÇLARI KONTROL ETME
# ==================================================
print("\n==================================================")
print("🎯 BÜTÜN İŞLEMLER TAMAMLANDI! İşte Zafer Raporun: 🚀")
print("==================================================")

# Ajanların ürettiği kreatif içeriği state_after_creative içinden çekiyoruz
# Bu uyanık hamlemizle None kalmıyor!
creatives = state_after_creative.get("creatives", [])

if len(creatives) > 0:
    print(f"\n🗣️ Hedef Kitle: {creatives[0].get('target_audience')}")
    print(f"\n📝 Reklam Metni: {creatives[0].get('ad_copy')}")
    print(f"\n🎨 Görsel Linki: {creatives[0].get('generated_image_url')}")
else:
    print("⚠️ Kreatif içerik üretilemedi.")

# Medya planlama sonuçları final_state içinden geliyor (Artık tıkır tıkır dolacak!)
print(f"\n🌍 Platformlar ve Hedefleme: {final_state.get('targeting')}")
print(f"💰 Bütçe Dağılımı: {final_state.get('budget')}")

# Hata ayıklama: Ajanların ürettiği tüm ham veriyi gör
print("\n--- DEBUG: Ajanların ürettiği tüm veri ---")
print("Creatives:", creatives)
print("Final State:", final_state)