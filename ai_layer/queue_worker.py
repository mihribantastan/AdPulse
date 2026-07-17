import requests
try:
    import redis
except ImportError:
    raise ImportError("redis module is not installed. Install it with: pip install redis")

import json
import time
from graph import app  # LangGraph beynimizi buraya dahil ediyoruz

# decode_responses=True parametresi byte verisini direkt string'e çevirir
r = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

def listen_for_campaigns():
    print("👂 Ajan köprüsü dinlemede... (Redis:adpulse_queue)")
    while True:
        try:
            # Zaman aşımını 5 saniye tutuyoruz
            data = r.blpop("adpulse_queue", timeout=5)
            if data:
                _, message = data
                campaign_data = json.loads(message)
                print(f"\n" + "="*50)
                print(f"📩 Yeni kampanya emri alındı: {campaign_data.get('campaign_id')}")
                print(f"🚀 {campaign_data.get('target_product')} için süreç başlatılıyor...")
                
                # LangGraph State'i için veriyi hazırlıyoruz
                initial_state = {
                    "campaign_id": campaign_data.get("campaign_id"),
                    "target_product": campaign_data.get("target_product"),
                    "strategy_brief": campaign_data.get("strategy_brief"),
                    "daily_budget": float(campaign_data.get("daily_budget", 0)),
                    "status": "pending"
                }
                
                # Her kampanya için ayrı bir hafıza odası açıyoruz
                thread_id = f"campaign_{initial_state['campaign_id']}"
                config = {"configurable": {"thread_id": thread_id}}
                
                # Ajanları çalıştır!
                state_after_creative = app.invoke(initial_state, config)
                
                print(f"⏸️ Kampanya #{initial_state['campaign_id']} Media planlaması öncesi duraklatıldı!")
                print("İnsan onayı bekleniyor...\n")
                
                # ==========================================
                # YENİ EKLENEN KISIM: LARAVEL'E DÖNÜŞ KÖPRÜSÜ
                # ==========================================
                print("📦 Ajanlar işi bitirdi, AdPulse sonuçları Laravel'e gönderiliyor...")
                
                laravel_url = "http://localhost:8000/api/campaigns/complete"
                
                # Yapay zekanın state içindeki sonuçlarını paketliyoruz
                payload = {
                    "campaign_id": state_after_creative.get("campaign_id"),
                    "target_product": state_after_creative.get("target_product"),
                    "generated_content": state_after_creative.get("ad_copy", "Metin başarıyla üretildi!") 
                }
                
                try:
                    response = requests.post(laravel_url, json=payload)
                    print(f"✅ Laravel'den gelen cevap: {response.json()}")
                except Exception as e:
                    print(f"❌ Laravel'e gönderirken hata oluştu: {e}")
                # ==========================================
                
            else:
                continue
                
        except redis.exceptions.ConnectionError:
            print("⚠️ Redis bağlantısı koptu, 3 saniye sonra tekrar deneniyor...")
            time.sleep(3)
            
        # 5 saniyelik normal zaman aşımında sessizce devam et
        except redis.exceptions.TimeoutError:
            continue
            
        except Exception as e:
            print(f"❌ Bir hata oluştu: {e}")
            time.sleep(1)

if __name__ == "__main__":
    listen_for_campaigns()