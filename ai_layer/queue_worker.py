import os
import requests
try:
    import redis
except ImportError:
    raise ImportError("redis module is not installed. Install it with: pip install redis")

import json
import time
from graph import app  # LangGraph beynimizi buraya dahil ediyoruz
from publisher import publish_campaign

REDIS_HOST = os.environ.get("REDIS_HOST", "127.0.0.1")
REDIS_PORT = int(os.environ.get("REDIS_PORT", "6379"))
LARAVEL_URL = os.environ.get("LARAVEL_URL", "http://127.0.0.1:8000/api/campaigns/complete")
LARAVEL_PUBLISH_URL = os.environ.get(
    "LARAVEL_PUBLISH_URL", "http://127.0.0.1:8000/api/campaigns/publish-complete"
)

# decode_responses=True parametresi byte verisini direkt string'e çevirir
r = redis.Redis(host=REDIS_HOST, port=REDIS_PORT, db=0, decode_responses=True)

def handle_publish_job(message: str) -> None:
    payload = json.loads(message)
    campaign_id = payload.get("campaign_id")
    print(f"\n" + "="*50)
    print(f"📤 Yayın emri alındı: kampanya #{campaign_id}")
    print("🎯 Google Ads API'ye gerçek kampanya oluşturuluyor (PAUSED)...")

    result = publish_campaign(payload)

    if result["success"]:
        print(f"✅ Google Ads kampanyası oluşturuldu: {result['google_ads_campaign_id']}")
    else:
        print(f"❌ Google Ads yayını başarısız: {result['error']}")

    callback_payload = {
        "campaign_id": campaign_id,
        "status": "published" if result["success"] else "failed",
        "google_ads_campaign_id": result["google_ads_campaign_id"],
        "error": result["error"],
    }
    try:
        response = requests.post(LARAVEL_PUBLISH_URL, json=callback_payload)
        print(f"✅ Laravel'e yayın sonucu gönderildi: {response.json()}")
    except Exception as e:
        print(f"❌ Laravel'e yayın sonucu gönderirken hata oluştu: {e}")


def listen_for_campaigns():
    print("👂 Ajan köprüsü dinlemede... (Redis:adpulse_queue, adpulse_publish_queue)")
    while True:
        try:
            # Zaman aşımını 5 saniye tutuyoruz; iki kuyruğu birden dinliyoruz
            data = r.blpop(["adpulse_queue", "adpulse_publish_queue"], timeout=5)
            if data:
                queue_name, message = data

                if queue_name == "adpulse_publish_queue":
                    handle_publish_job(message)
                    continue

                campaign_data = json.loads(message)
                print(f"\n" + "="*50)
                print(f"📩 Yeni kampanya emri alındı: {campaign_data.get('campaign_id')}")
                print(f"🚀 {campaign_data.get('target_product')} için süreç başlatılıyor...")
                
                # LangGraph State'i için veriyi hazırlıyoruz
                # (strategy_brief burada YOK: Research Agent'ın kendisi üretiyor)
                initial_state = {
                    "campaign_id": campaign_data.get("campaign_id"),
                    "target_product": campaign_data.get("target_product"),
                    "target_audience": campaign_data.get("target_audience"),
                    "key_features": campaign_data.get("key_features"),
                    "brand_tone": campaign_data.get("brand_tone"),
                    "extra_notes": campaign_data.get("extra_notes"),
                    "campaign_goal": campaign_data.get("campaign_goal"),
                    "cta_preference": campaign_data.get("cta_preference"),
                    "daily_budget": float(campaign_data.get("daily_budget", 0)),
                    "status": "pending"
                }

                # Her kampanya için ayrı bir hafıza odası açıyoruz. Zaman damgası ekliyoruz ki
                # aynı campaign_id ileride tekrar kuyruğa düşerse (ör. tekrar deneme), LangGraph
                # eski/duraklamış bir checkpoint'ten değil sıfırdan başlasın.
                thread_id = f"campaign_{initial_state['campaign_id']}_{int(time.time())}"
                config = {"configurable": {"thread_id": thread_id}}
                
                # Ajanları çalıştır!
                state_after_creative = app.invoke(initial_state, config)
                
                print(f"⏸️ Kampanya #{initial_state['campaign_id']} Media planlaması öncesi duraklatıldı!")
                print("İnsan onayı bekleniyor... (Media Agent + gerçek Meta/Google Ads çağrıları onaydan sonra çalışacak)\n")

                # ==========================================
                # LARAVEL'E DÖNÜŞ KÖPRÜSÜ: research + creative sonuçları
                # ==========================================
                print("📦 Research ve Creative ajanları tamamlandı, sonuçlar Laravel'e gönderiliyor...")

                payload = {
                    "campaign_id": state_after_creative.get("campaign_id"),
                    "generated_content": {
                        "strategy_brief": state_after_creative.get("strategy_brief"),
                        "creatives": state_after_creative.get("creatives", []),
                    },
                }
                
                try:
                    response = requests.post(LARAVEL_URL, json=payload)
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