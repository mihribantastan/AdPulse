"""Onaylanan reklamı gerçek Meta Marketing API çağrısıyla (Facebook/Instagram)
kampanya sahibinin KENDİ bağlı reklam hesabında yayınlar (bkz.
PlatformConnectionController - kullanıcı Ayarlar'dan kendi hesabını bağlar).

publisher.py (Google Ads) ile aynı güvenlik deseni: kampanya PAUSED olarak
oluşturulur, gerçekten yayına almak isteyen kullanıcı bunu Meta Ads Manager
panelinden kendisi yapar - API üzerinden yanlışlıkla gerçek harcama başlamaz.

app_id/app_secret uygulamaya ait paylaşılan sırlar (AdPulse'ın Meta App'i);
access_token/ad_account_id/page_id kampanya sahibine ait. Uygulama "Development
Mode"dayken sadece App'e Admin/Tester olarak eklenmiş hesaplar bağlanabilir -
başkalarının kendi hesabını bağlayabilmesi Meta'nın "App Review" onayını gerektirir.
"""
import base64
import re
from urllib.parse import urlparse

import requests

from facebook_business.api import FacebookAdsApi
from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.adimage import AdImage
from facebook_business.exceptions import FacebookRequestError


def _parse_age_range(age_range: str | None) -> tuple[int | None, int | None]:
    """Media Agent'ın ürettiği '25-45' gibi bir string'i Meta'nın kabul ettiği
    age_min/age_max (13-65 arası, tam sayı) değerlerine çevirir."""
    if not age_range:
        return None, None
    match = re.match(r"\s*(\d+)\s*-\s*(\d+)\s*", age_range)
    if not match:
        return None, None
    low, high = int(match.group(1)), int(match.group(2))
    return max(13, min(low, 65)), max(13, min(high, 65))


def _looks_like_url(value: str) -> bool:
    parsed = urlparse(value or "")
    return parsed.scheme in ("http", "https") and bool(parsed.netloc)


def _load_image_bytes(generated_image_url: str) -> bytes | None:
    """generated_image_url ya bir data URI (base64) ya da gerçek bir görsel
    linki olabilir - Creative Agent'ın ürettiği format buna göre değişir."""
    if not generated_image_url:
        return None
    if generated_image_url.startswith("data:"):
        match = re.match(r"data:image/\w+;base64,(.+)", generated_image_url)
        return base64.b64decode(match.group(1)) if match else None
    try:
        response = requests.get(generated_image_url, timeout=10)
        response.raise_for_status()
        return response.content
    except requests.RequestException:
        return None


def publish_to_meta(payload: dict) -> dict:
    """payload: campaign_id, target_url_or_product, daily_budget, selected_creative, platforms,
    meta_credentials {access_token, ad_account_id, page_id}.
    Dönüş: {"success": bool, "campaign_id": str|None, "error": str|None}"""
    import os

    campaign_id = payload.get("campaign_id")
    target_product = payload.get("target_url_or_product") or ""
    daily_budget = float(payload.get("daily_budget") or 0)
    creative = payload.get("selected_creative") or {}
    ad_copy = creative.get("ad_copy") or target_product
    platforms = payload.get("platforms") or []
    credentials = payload.get("meta_credentials") or {}

    if not _looks_like_url(target_product):
        return {
            "success": False,
            "campaign_id": None,
            "error": (
                "Meta'da gerçek bir reklam yayınlamak için 'Hedef URL veya Ürün' alanının "
                "geçerli bir http(s) linki olması gerekiyor (şu an: "
                f"'{target_product}'). Lütfen kampanyayı gerçek bir ürün/site linkiyle tekrar oluşturun."
            ),
        }

    image_bytes = _load_image_bytes(creative.get("generated_image_url"))
    if not image_bytes:
        return {
            "success": False,
            "campaign_id": None,
            "error": "Meta (Facebook/Instagram) reklamları görsel gerektirir; seçilen kreatifin görseli yok.",
        }

    if not credentials.get("access_token") or not credentials.get("ad_account_id"):
        return {
            "success": False,
            "campaign_id": None,
            "error": "Meta hesabı bağlı değil. Lütfen Ayarlar'dan Meta hesabını bağla.",
        }

    try:
        # app_id/app_secret uygulamaya ait paylaşılan sırlar (Meta for Developers'daki
        # App); access_token/ad_account_id/page_id ise kampanyayı onaylayan
        # KULLANICIYA ait - Ayarlar'dan bağladığı kendi Meta hesabından geliyor.
        app_id = os.environ["META_APP_ID"]
        app_secret = os.environ["META_APP_SECRET"]
        access_token = credentials["access_token"]
        ad_account_id = credentials["ad_account_id"]
        page_id = credentials.get("page_id")

        if not page_id:
            return {
                "success": False,
                "campaign_id": None,
                "error": "Bağlı Meta hesabına ait bir Facebook Sayfası bulunamadı; reklam bir Sayfa'ya bağlı olmak zorunda.",
            }

        FacebookAdsApi.init(app_id, app_secret, access_token)
        account = AdAccount(ad_account_id)

        unique_suffix = f"{campaign_id}"

        # 1. Kampanya (PAUSED)
        campaign = account.create_campaign(params={
            "name": f"AdPulse - {target_product[:60]} #{unique_suffix}",
            "objective": "OUTCOME_TRAFFIC",
            "status": "PAUSED",
            "special_ad_categories": [],
        })
        meta_campaign_id = campaign["id"]

        # 2. Reklam Seti
        publisher_platforms = []
        if "facebook" in platforms:
            publisher_platforms.append("facebook")
        if "instagram" in platforms:
            publisher_platforms.append("instagram")

        # Kampanya hem Google Ads hem Meta'ya birden yayınlanıyorsa, her ikisi de TAM
        # günlük bütçeyi kullanırsa kullanıcının ayarladığından fazla harcama niyeti
        # oluşur - Media Agent'ın belirlediği yüzdeye göre bu platformun payını al.
        budget_share = (payload.get("budget_distribution") or {}).get("meta", 100)
        effective_daily_budget = daily_budget * (float(budget_share) / 100)

        targeting = {
            "geo_locations": {"countries": ["TR"]},
            "publisher_platforms": publisher_platforms or ["facebook", "instagram"],
        }
        age_min, age_max = _parse_age_range((payload.get("targeting") or {}).get("age_range"))
        if age_min is not None:
            targeting["age_min"] = age_min
            targeting["age_max"] = age_max

        ad_set = account.create_ad_set(params={
            "name": f"AdPulse Reklam Seti #{unique_suffix}",
            "campaign_id": meta_campaign_id,
            # Meta çoğu para birimi için bütçeyi en küçük birimle (kuruş) ister
            "daily_budget": max(int(effective_daily_budget * 100), 100),
            "billing_event": "IMPRESSIONS",
            "optimization_goal": "LINK_CLICKS",
            "bid_strategy": "LOWEST_COST_WITHOUT_CAP",
            "status": "PAUSED",
            "targeting": targeting,
        })
        ad_set_id = ad_set["id"]

        # 3. Görseli hesaba yükle (base64/URL -> Meta'nın kendi image_hash'i)
        ad_image = AdImage(parent_id=ad_account_id)
        ad_image[AdImage.Field.bytes] = base64.b64encode(image_bytes).decode("utf-8")
        ad_image.remote_create()
        image_hash = ad_image[AdImage.Field.hash]

        # 4. Reklam Kreatifi
        ad_creative = account.create_ad_creative(params={
            "name": f"AdPulse Kreatif #{unique_suffix}",
            "object_story_spec": {
                "page_id": page_id,
                "link_data": {
                    "message": ad_copy,
                    "link": target_product,
                    "image_hash": image_hash,
                },
            },
        })

        # 5. Reklam (PAUSED - kullanıcı Meta Ads Manager panelinden kendisi etkinleştirir)
        account.create_ad(params={
            "name": f"AdPulse Reklam #{unique_suffix}",
            "adset_id": ad_set_id,
            "creative": {"creative_id": ad_creative["id"]},
            "status": "PAUSED",
        })

        return {"success": True, "campaign_id": meta_campaign_id, "error": None}

    except FacebookRequestError as ex:
        return {"success": False, "campaign_id": None, "error": f"Meta API hatası: {ex.api_error_message()}"}
    except Exception as e:
        return {"success": False, "campaign_id": None, "error": f"Beklenmeyen hata: {e}"}
