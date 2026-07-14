try:
    import redis
except ImportError:
    raise ImportError("redis module is not installed. Install it with: pip install redis")

import json
import time

r = redis.Redis(host='localhost', port=6379, db=0)

def listen_for_campaigns():
    print("👂 Ajan köprüsü dinlemede... (Redis:adpulse_queue)")
    while True:
        try:
            # Zaman aşımını 5 saniye tutuyoruz
            data = r.blpop("adpulse_queue", timeout=5)
            if data:
                _, message = data
                campaign_data = json.loads(message)
                print(f"📩 Yeni kampanya emri alındı: {campaign_data['campaign_id']}")
                print(f"🚀 {campaign_data['target_product']} için süreç başlatılıyor...")
            else:
                continue
                
        except redis.exceptions.ConnectionError:
            print("⚠️ Redis bağlantısı koptu, 3 saniye sonra tekrar deneniyor...")
            time.sleep(3)
            
        # BURAYI EKLEDİK: 5 saniyelik normal zaman aşımında sessizce devam et
        except redis.exceptions.TimeoutError:
            continue
            
        except Exception as e:
            print(f"Bir hata oluştu: {e}")
            time.sleep(1)

if __name__ == "__main__":
    listen_for_campaigns()