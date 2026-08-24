"""Onaylanan reklamı gerçek Google Ads API çağrısıyla test hesabında yayınlar.

Kampanya PAUSED (duraklatılmış) olarak oluşturulur: gerçekten yayına almak
(ENABLED) isteyen kullanıcı bunu Google Ads panelinden kendisi yapar - böylece
API üzerinden yanlışlıkla gerçek harcama başlamaz.
"""
import json
import re
import uuid
from urllib.parse import urlparse

from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI

from google.ads.googleads.client import GoogleAdsClient
from google.ads.googleads.errors import GoogleAdsException


def _looks_like_url(value: str) -> bool:
    parsed = urlparse(value or "")
    return parsed.scheme in ("http", "https") and bool(parsed.netloc)


_GOOGLE_AGE_BUCKETS = [
    (18, 24, "AGE_RANGE_18_24"),
    (25, 34, "AGE_RANGE_25_34"),
    (35, 44, "AGE_RANGE_35_44"),
    (45, 54, "AGE_RANGE_45_54"),
    (55, 64, "AGE_RANGE_55_64"),
    (65, 200, "AGE_RANGE_65_UP"),
]


def _age_range_to_google_buckets(age_range: str | None) -> list[str]:
    """Google Ads yaş hedeflemesi sabit demet (bucket) kabul ediyor, serbest metin
    aralık değil - Media Agent'ın ürettiği '25-45' gibi bir string'i bunu kapsayan
    demetlere çeviriyoruz. Ayrıştırılamazsa boş döner (hedefleme atlanır, hata değil)."""
    if not age_range:
        return []
    match = re.match(r"\s*(\d+)\s*-\s*(\d+)\s*", age_range)
    if not match:
        return []
    low, high = int(match.group(1)), int(match.group(2))
    return [name for bucket_low, bucket_high, name in _GOOGLE_AGE_BUCKETS if bucket_low <= high and bucket_high >= low]


def _derive_keyword(target_product: str) -> str:
    """URL verilmişse alan adından, değilse ürün adından kısa bir anahtar kelime türetir."""
    if _looks_like_url(target_product):
        host = urlparse(target_product).netloc
        host = re.sub(r"^www\.", "", host)
        host = host.split(".")[0]
        return re.sub(r"[-_]", " ", host).strip().title() or "Reklam"
    words = re.sub(r"[^\w\sÇĞİÖŞÜçğıöşü]", " ", target_product).split()
    return " ".join(words[:5]).strip() or "Reklam"


def _generate_rsa_assets(ad_copy: str, target_product: str, strategy_brief: str | None) -> dict:
    """Uzun (400-600 karakter) reklam metnini Google Ads'in izin verdiği kısa
    başlıklara (<=30 karakter) ve açıklamalara (<=90 karakter) dönüştürür."""
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.4)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Sen bir Google Ads Duyarlı Arama Ağı Reklamı (Responsive Search Ad) uzmanısın. "
         "Sana verilen uzun reklam metnine dayanarak Google Ads kısıtlarına birebir uyan varlıklar üret:\n"
         "- 5 adet başlık (headline), HER BİRİ EN FAZLA 30 KARAKTER\n"
         "- 3 adet açıklama (description), HER BİRİ EN FAZLA 90 KARAKTER\n"
         "Başlıklar birbirinden farklı açılardan (ürün özelliği, CTA, marka/güven, aciliyet, fayda) olsun. "
         "Karakter sınırlarını KESİNLİKLE aşma. Emoji kullanma. "
         "Çıktını SADECE şu JSON formatında ver:\n"
         '{{"headlines": ["...", "...", "...", "...", "..."], "descriptions": ["...", "...", "..."]}}'),
        ("user", "Ürün: {product}\nStrateji: {brief}\nReklam Metni: {ad_copy}"),
    ])
    chain = prompt | llm
    response = chain.invoke({
        "product": target_product,
        "brief": (strategy_brief or "")[:800],
        "ad_copy": ad_copy,
    })
    match = re.search(r"\{.*\}", response.content, re.DOTALL)
    data = json.loads(match.group(0)) if match else {}

    # LLM karakter sınırına uysa da son bir güvenlik ağı olarak sert kırpma uyguluyoruz
    headlines = [h[:30] for h in data.get("headlines", []) if h][:5]
    descriptions = [d[:90] for d in data.get("descriptions", []) if d][:3]

    # Google Ads en az 3 başlık ve 2 açıklama ister; LLM eksik dönerse ürün adından tamamla
    while len(headlines) < 3:
        headlines.append(target_product[:30] or f"Reklam {len(headlines) + 1}")
    while len(descriptions) < 2:
        descriptions.append((strategy_brief or target_product or "Detaylar için tıklayın.")[:90])

    return {"headlines": headlines, "descriptions": descriptions}


def _load_client(refresh_token: str, login_customer_id: str | None) -> GoogleAdsClient:
    """client_id/client_secret/developer_token uygulamaya ait paylaşılan sırlar
    (Google Cloud'daki OAuth client + Ads geliştirici token'ı); refresh_token ve
    login_customer_id ise kampanyayı onaylayan KULLANICIYA ait - Ayarlar'dan
    bağladığı kendi Google Ads hesabından geliyor (bkz. PlatformConnectionController)."""
    import os
    config = {
        "developer_token": os.environ["GOOGLE_ADS_DEVELOPER_TOKEN"],
        "client_id": os.environ["GOOGLE_ADS_CLIENT_ID"],
        "client_secret": os.environ["GOOGLE_ADS_CLIENT_SECRET"],
        "refresh_token": refresh_token,
        "use_proto_plus": True,
    }
    if login_customer_id:
        config["login_customer_id"] = login_customer_id
    return GoogleAdsClient.load_from_dict(config)


def publish_campaign(payload: dict) -> dict:
    """payload: campaign_id, target_url_or_product, daily_budget, strategy_brief,
    selected_creative, google_ads_credentials {refresh_token, customer_id, login_customer_id}.
    Dönüş: {"success": bool, "campaign_id": str|None, "error": str|None}"""
    campaign_id = payload.get("campaign_id")
    target_product = payload.get("target_url_or_product") or ""
    daily_budget = float(payload.get("daily_budget") or 0)
    strategy_brief = payload.get("strategy_brief")
    creative = payload.get("selected_creative") or {}
    ad_copy = creative.get("ad_copy") or target_product
    credentials = payload.get("google_ads_credentials") or {}

    if not _looks_like_url(target_product):
        return {
            "success": False,
            "campaign_id": None,
            "error": (
                "Google Ads'de gerçek bir reklam yayınlamak için 'Hedef URL veya Ürün' alanının "
                "geçerli bir http(s) linki olması gerekiyor (şu an: "
                f"'{target_product}'). Lütfen kampanyayı gerçek bir ürün/site linkiyle tekrar oluşturun."
            ),
        }

    if not credentials.get("refresh_token") or not credentials.get("customer_id"):
        return {
            "success": False,
            "campaign_id": None,
            "error": "Google Ads hesabı bağlı değil. Lütfen Ayarlar'dan Google Ads hesabını bağla.",
        }

    try:
        client = _load_client(credentials["refresh_token"], credentials.get("login_customer_id"))
        customer_id = credentials["customer_id"]

        assets = _generate_rsa_assets(ad_copy, target_product, strategy_brief)

        # Kampanya hem Google Ads hem Meta'ya birden yayınlanıyorsa, her ikisi de TAM
        # günlük bütçeyi kullanırsa kullanıcının ayarladığından fazla harcama niyeti
        # oluşur - Media Agent'ın belirlediği yüzdeye göre bu platformun payını al.
        budget_share = (payload.get("budget_distribution") or {}).get("google_ads", 100)
        effective_daily_budget = daily_budget * (float(budget_share) / 100)

        unique_suffix = f"{campaign_id}-{uuid.uuid4().hex[:8]}"
        budget_micros = max(int(effective_daily_budget * 1_000_000), 10_000_000)  # en az 10 birim/gün

        # 1. Kampanya Bütçesi
        budget_service = client.get_service("CampaignBudgetService")
        budget_operation = client.get_type("CampaignBudgetOperation")
        budget = budget_operation.create
        budget.name = f"AdPulse Bütçe #{unique_suffix}"
        budget.delivery_method = client.enums.BudgetDeliveryMethodEnum.STANDARD
        budget.amount_micros = budget_micros
        budget_response = budget_service.mutate_campaign_budgets(
            customer_id=customer_id, operations=[budget_operation]
        )
        budget_resource_name = budget_response.results[0].resource_name

        # 2. Kampanya (PAUSED - kullanıcı Google Ads panelinden kendisi etkinleştirir)
        campaign_service = client.get_service("CampaignService")
        campaign_operation = client.get_type("CampaignOperation")
        campaign = campaign_operation.create
        campaign.name = f"AdPulse - {target_product[:60]} #{unique_suffix}"
        campaign.advertising_channel_type = client.enums.AdvertisingChannelTypeEnum.SEARCH
        campaign.status = client.enums.CampaignStatusEnum.PAUSED
        campaign.contains_eu_political_advertising = (
            client.enums.EuPoliticalAdvertisingStatusEnum.DOES_NOT_CONTAIN_EU_POLITICAL_ADVERTISING
        )
        campaign.manual_cpc.enhanced_cpc_enabled = False
        campaign.campaign_budget = budget_resource_name
        campaign.network_settings.target_google_search = True
        campaign.network_settings.target_search_network = True
        campaign.network_settings.target_content_network = False
        campaign.network_settings.target_partner_search_network = False
        campaign_response = campaign_service.mutate_campaigns(
            customer_id=customer_id, operations=[campaign_operation]
        )
        campaign_resource_name = campaign_response.results[0].resource_name

        # 3. Reklam Grubu
        ad_group_service = client.get_service("AdGroupService")
        ad_group_operation = client.get_type("AdGroupOperation")
        ad_group = ad_group_operation.create
        ad_group.name = f"AdPulse Reklam Grubu #{unique_suffix}"
        ad_group.campaign = campaign_resource_name
        ad_group.status = client.enums.AdGroupStatusEnum.ENABLED
        ad_group.type_ = client.enums.AdGroupTypeEnum.SEARCH_STANDARD
        ad_group.cpc_bid_micros = min(budget_micros // 20, 5_000_000)
        ad_group_response = ad_group_service.mutate_ad_groups(
            customer_id=customer_id, operations=[ad_group_operation]
        )
        ad_group_resource_name = ad_group_response.results[0].resource_name

        # 4. Anahtar Kelime
        criterion_service = client.get_service("AdGroupCriterionService")
        criterion_operation = client.get_type("AdGroupCriterionOperation")
        criterion = criterion_operation.create
        criterion.ad_group = ad_group_resource_name
        criterion.status = client.enums.AdGroupCriterionStatusEnum.ENABLED
        criterion.keyword.text = _derive_keyword(target_product)
        criterion.keyword.match_type = client.enums.KeywordMatchTypeEnum.BROAD
        criterion_service.mutate_ad_group_criteria(
            customer_id=customer_id, operations=[criterion_operation]
        )

        # 4b. Yaş Hedeflemesi (Media Agent bir yaş aralığı belirlediyse)
        age_buckets = _age_range_to_google_buckets((payload.get("targeting") or {}).get("age_range"))
        if age_buckets:
            age_operations = []
            for bucket_name in age_buckets:
                age_operation = client.get_type("AdGroupCriterionOperation")
                age_criterion = age_operation.create
                age_criterion.ad_group = ad_group_resource_name
                age_criterion.age_range.type_ = getattr(client.enums.AgeRangeTypeEnum, bucket_name)
                age_operations.append(age_operation)
            criterion_service.mutate_ad_group_criteria(customer_id=customer_id, operations=age_operations)

        # 5. Duyarlı Arama Ağı Reklamı (Responsive Search Ad)
        ad_group_ad_service = client.get_service("AdGroupAdService")
        ad_group_ad_operation = client.get_type("AdGroupAdOperation")
        ad_group_ad = ad_group_ad_operation.create
        ad_group_ad.ad_group = ad_group_resource_name
        ad_group_ad.status = client.enums.AdGroupAdStatusEnum.PAUSED
        ad_group_ad.ad.final_urls.append(target_product)
        for headline_text in assets["headlines"]:
            headline = client.get_type("AdTextAsset")
            headline.text = headline_text
            ad_group_ad.ad.responsive_search_ad.headlines.append(headline)
        for description_text in assets["descriptions"]:
            description = client.get_type("AdTextAsset")
            description.text = description_text
            ad_group_ad.ad.responsive_search_ad.descriptions.append(description)
        ad_group_ad_service.mutate_ad_group_ads(
            customer_id=customer_id, operations=[ad_group_ad_operation]
        )

        google_ads_campaign_ref = campaign_resource_name.split("/")[-1]
        return {"success": True, "campaign_id": google_ads_campaign_ref, "error": None}

    except GoogleAdsException as ex:
        messages = "; ".join(error.message for error in ex.failure.errors)
        return {"success": False, "campaign_id": None, "error": f"Google Ads API hatası: {messages}"}
    except Exception as e:
        return {"success": False, "campaign_id": None, "error": f"Beklenmeyen hata: {e}"}
