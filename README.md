# AdPulse

AdPulse, kullanıcıların ürün/hizmet bilgisi girerek yapay zeka destekli reklam
kampanyaları oluşturup kendi Google Ads ve Meta (Facebook/Instagram) hesaplarına
doğrudan yayınlayabildiği bir SaaS platformudur. Her kullanıcı kendi reklam
hesabını OAuth ile bağlar; kampanyalar AdPulse'ın değil, kullanıcının kendi
hesabında oluşur.

## Özellikler

- **AI destekli kampanya üretimi** — bir ürün/site linki verildiğinde çok
  aşamalı bir LangGraph ajanı (research → creative → media) siteyi analiz eder,
  ürün kategorisini sınıflandırır, birden fazla reklam metni/görsel varyasyonu
  üretir ve platformlar arası bütçe dağılımı önerir.
- **Kendi görselini kullanma** — kullanıcı isterse AI'ın ürettiği görseller
  yerine kendi yüklediği görseli reklamda kullanabilir.
- **Çoklu platform yayını** — onaylanan kampanyalar Google Ads (Arama/RSA) ve
  Meta (Facebook/Instagram) üzerinde, kullanıcının kendi bağlı hesabından
  yayınlanır.
- **Kullanıcı bazlı hesap bağlantısı** — Google Ads ve Meta hesapları OAuth2 ile
  bağlanır, erişim/yenileme token'ları veritabanında şifreli (`encrypted` cast)
  tutulur.
- **Kampanya onay akışı** — AI'ın hazırladığı kampanya taslağı, yayınlanmadan
  önce kullanıcı tarafından gözden geçirilip onaylanır.

## Mimari

Docker Compose ile ayağa kalkan servisler:

| Servis   | Görev |
|----------|-------|
| `app`    | Laravel 11 + Octane (Swoole) API, kimlik doğrulama, kampanya yönetimi, platform bağlantı OAuth akışı |
| `worker` | Python/LangGraph ajan hattı — Redis kuyruğundan kampanya işi alır, AI ile içerik üretir, onaylanınca Google Ads/Meta'ya yayınlar |
| `db`     | PostgreSQL 16 |
| `redis`  | Redis 7 — kuyruk ve önbellek |
| `backup` | Postgres'i günde bir kez `adpulse/backups/` altına yedekler, 14 günden eski yedekleri temizler |

```
Frontend (React/Vite) ──► Laravel API (app) ──► Redis kuyruğu ──► Python worker
                                │                                      │
                                └────────── PostgreSQL (db) ◄──────────┘
```

## Teknoloji

- **Backend:** PHP 8.4, Laravel 11, Laravel Octane (Swoole), PostgreSQL, Redis, Sanctum
- **AI katmanı:** Python, LangGraph, LangChain (structured output), OpenAI
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, React Router v7
- **Altyapı:** Docker / Docker Compose (yerel), Render (canlı backend + worker, tek imaj)

## Proje yapısı

```
backend/    Laravel API (Domains/Campaign, Domains/Integration, Domains/Agent)
ai_layer/   LangGraph ajanları, kuyruk dinleyicisi, Google Ads/Meta publisher'ları
frontend/   React SPA
docker/     Render imajı için supervisord + entrypoint betikleri
adpulse/    Yerel Docker verisi: .env, db (Postgres volume referansı), assets, backups
```

## Yerel geliştirme

Gereksinim: Docker Desktop.

1. `adpulse/.env` dosyasını oluşturup gerekli değişkenleri doldurun (aşağıya bakın).
2. Servisleri başlatın:

   ```bash
   docker compose up -d
   ```

   İlk açılışta `app` servisi bağımlılıkları kurar, migration'ları çalıştırır ve
   Octane sunucusunu ayağa kaldırır; `backup` servisi günlük Postgres yedeğini
   `adpulse/backups/` altına almaya başlar.

3. Frontend'i ayrıca çalıştırın:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

API varsayılan olarak `http://localhost:8000`, frontend `http://localhost:5173`
üzerinden servis edilir.

### Ortam değişkenleri (`adpulse/.env`)

Tüm servisler (`app`, `db`, `worker`, `backup`) aynı `adpulse/.env` dosyasını
paylaşır. Başlıca değişkenler:

- `APP_KEY`, `APP_URL`, `FRONTEND_URL`
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `OPENAI_API_KEY`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — hem kullanıcı girişi hem Google Ads hesap bağlama için
- `GOOGLE_ADS_DEVELOPER_TOKEN`
- `META_APP_ID`, `META_APP_SECRET`

Kullanıcıya özel `refresh_token`/`access_token` değerleri artık `.env`'de
tutulmaz; her kullanıcı Ayarlar sayfasından kendi hesabını bağladıkça
veritabanında şifreli olarak saklanır.

## Dağıtım (Render)

`Dockerfile.render`, Laravel/Octane API'sini ve Python worker'ı `supervisord`
ile tek imaj içinde iki ayrı process olarak çalıştıran çok aşamalı
(multi-stage) bir build tanımlar — Render'ın ücretsiz planı tek "Web Service"
içerdiği için ayrı bir arka plan worker servisi kullanılmaz.

`render.yaml`, servis tanımını ve Render panelinde elle doldurulması gereken
gizli ortam değişkenlerinin listesini içerir.

## Lisans

Bu proje henüz bir açık kaynak lisansı altında yayınlanmamıştır.
