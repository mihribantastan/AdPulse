from dotenv import load_dotenv
load_dotenv()
from agents.research_agent import research_node
from agents.creative_agent import creative_node

# Sistemi test etmek için sahte başlangıç verimiz (State)
test_state = {
    "target_url_or_product": "Yüksek performanslı gürültü engelleyici oyuncu kulaklığı",
    "audit_log": []
}

print("🚀 Sistem başlatılıyor...")

# 1. ADIM: Araştırma Ajanı (Gemini) çalışır ve stratejiyi yazar
print("\n--- 1. ADIM: RESEARCH AGENT ---")
state_after_research = research_node(test_state)

# 2. ADIM: Kreatif Ajan (Gemini + DALL-E) devreye girer
print("\n--- 2. ADIM: CREATIVE AGENT ---")
final_state = creative_node(state_after_research)

# SONUÇLARI EKRANA YAZDIRMA
print("\n==================================================")
print("🎯 BÜTÜN İŞLEMLER TAMAMLANDI!")
print("==================================================")

creatives = final_state.get("creatives", [])
if len(creatives) > 0:
    print(f"\n🗣️ Hedef Kitle: {creatives[0].get('target_audience')}")
    print(f"📝 Reklam Metni: {creatives[0].get('ad_copy')}")
    print(f"🎨 DALL-E Prompt: {creatives[0].get('image_prompt')}")
    print(f"\n🖼️ İŞTE GÖRSEL LİNKİN (Tıklayıp tarayıcıda açabilirsin):")
    print(creatives[0].get('generated_image_url', 'Resim linki alınamadı.'))
else:
    print("⚠️ Kreatif içerik üretilemedi.")