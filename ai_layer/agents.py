import io
import json
import os
import re
import html as html_lib
from typing import Literal, Optional

import requests
from pydantic import BaseModel, Field

from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI
from openai import OpenAI

from state import CampaignState

# Extra guidance appended to the Creative Agent's prompt per category, instead of one
# generic prompt for everything - so copy structure and image composition actually
# change based on what the campaign really is (physical product vs SaaS vs local
# business...).
CATEGORY_GUIDANCE = {
    "e_ticaret_urun": (
        "This is an e-commerce/physical product campaign. In ad_copy, lean on concrete urgency "
        "elements like price advantage, shipping speed, limited stock. image_prompts should show "
        "the product clearly and appealingly, in clean e-commerce-ad compositions."
    ),
    "dijital_hizmet_saas": (
        "This is a software/SaaS/digital service campaign. In ad_copy, emphasize concrete time/money "
        "savings, free trial offers. image_prompts should feel like an interface/screen, or use "
        "abstract, modern, tech-forward compositions."
    ),
    "mobil_uygulama": (
        "This is a mobile app campaign. In ad_copy, emphasize 'download now', convenience, and "
        "instant benefit. image_prompts should imply the moment of using the app on a phone screen."
    ),
    "yerel_hizmet_isletme": (
        "This is a local business/service campaign. In ad_copy, emphasize trust, proximity, and ease "
        "of booking/contact. image_prompts should feel warm, realistic, and genuine - real "
        "place/people feel."
    ),
    "etkinlik_organizasyon": (
        "This is an event/organization campaign. In ad_copy, emphasize date urgency and the experience "
        "itself. image_prompts should carry an energetic, inviting event atmosphere."
    ),
}

_CATEGORY_KEYS = list(CATEGORY_GUIDANCE.keys())


class _CategoryClassification(BaseModel):
    category: Literal[
        "e_ticaret_urun", "dijital_hizmet_saas", "mobil_uygulama",
        "yerel_hizmet_isletme", "etkinlik_organizasyon", "genel",
    ] = Field(description="The single category that best fits the campaign")


def _classify_product_category(context: str) -> str | None:
    """Detects the campaign's real type (e-commerce, SaaS, local service, etc).
    We ask an LLM instead of using a fixed keyword dictionary because real-world
    inputs vary too much for keywords to reliably classify - a semantic read is
    far more robust."""
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0).with_structured_output(_CategoryClassification)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "Read the following campaign information and classify it into exactly one category."),
        ("user", "{context}"),
    ])
    try:
        chain = prompt | llm
        result: _CategoryClassification = chain.invoke({"context": context})
        return result.category if result.category in _CATEGORY_KEYS else None
    except Exception as e:
        print(f"⚠️ [Research Agent] Kategori sınıflandırma başarısız: {e}")
        return None


def _fetch_site_context(url: str) -> str | None:
    """If target_product is a URL, fetches the real page and extracts its raw text.
    When the user leaves 'key features' etc. blank, the agents previously had nothing
    but the product name to work with - this was the real cause of generic output.
    Here we fetch the page's real title/description/body text and give it to the
    agents as concrete material. Uses crude-but-sufficient regex extraction instead
    of a dependency like BeautifulSoup - the text fed to the LLM doesn't need to be
    perfectly clean.
    """
    if not url.strip().lower().startswith(("http://", "https://")):
        return None

    try:
        response = requests.get(
            url,
            timeout=8,
            headers={"User-Agent": "Mozilla/5.0 (compatible; AdPulseBot/1.0)"},
        )
        response.raise_for_status()
        raw = response.text
    except requests.RequestException as e:
        print(f"⚠️ [Research Agent] Site içeriği çekilemedi ({url}): {e}")
        return None

    title_match = re.search(r"<title[^>]*>(.*?)</title>", raw, re.IGNORECASE | re.DOTALL)
    desc_match = re.search(
        r'<meta[^>]+name=["\']description["\'][^>]+content=["\'](.*?)["\']',
        raw, re.IGNORECASE,
    )

    # On client-side rendered sites (React/Vue), the raw HTML body arrives nearly
    # empty (content fills in later via JS) - but for SEO, most modern e-commerce
    # sites still embed structured data (JSON-LD) server-side, right in the raw
    # HTML. So before the body text, we also extract product name/description/price
    # from any JSON-LD - this is usually present even when JS isn't rendered.
    ld_json_parts = []
    for ld_match in re.finditer(
        r'<script[^>]+type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',
        raw, re.IGNORECASE | re.DOTALL,
    ):
        try:
            data = json.loads(ld_match.group(1).strip())
        except (json.JSONDecodeError, ValueError):
            continue
        for entry in (data if isinstance(data, list) else [data]):
            if not isinstance(entry, dict):
                continue
            name = entry.get("name")
            description = entry.get("description")
            offers = entry.get("offers")
            price = offers.get("price") if isinstance(offers, dict) else None
            currency = offers.get("priceCurrency") if isinstance(offers, dict) else None
            if name:
                ld_json_parts.append(f"Product name (structured data): {name}")
            if description:
                ld_json_parts.append(f"Product description (structured data): {description}")
            if price:
                ld_json_parts.append(f"Price (structured data): {price} {currency or ''}".strip())

    body = re.sub(r"<(script|style|nav|footer|header)[^>]*>.*?</\1>", " ", raw, flags=re.IGNORECASE | re.DOTALL)
    body = re.sub(r"<[^>]+>", " ", body)
    body = html_lib.unescape(body)
    body = re.sub(r"\s+", " ", body).strip()

    parts = []
    if title_match:
        parts.append(f"Page title: {html_lib.unescape(title_match.group(1)).strip()}")
    if desc_match:
        parts.append(f"Page description: {html_lib.unescape(desc_match.group(1)).strip()}")
    parts.extend(ld_json_parts[:6])  # cap so pages with many product schemas don't flood the context
    if body:
        parts.append(f"Excerpt from page content: {body[:2500]}")

    return "\n".join(parts) if parts else None


def _build_brief_context(state: CampaignState) -> str:
    """Collects everything concrete the user gave in the form into one block.
    Without this the LLM knows nothing about the actual product/site and produces
    generic, industry-cliché text - everything gathered here is real, concrete
    input the agents can actually use."""
    lines = [f"Product/service: {state['target_product']}"]

    site_context = _fetch_site_context(state["target_product"])
    if site_context:
        lines.append(f"\nReal content auto-fetched from the target page (use this verbatim, don't invent):\n{site_context}")

    if state.get("target_audience"):
        lines.append(f"Target audience specified by the user: {state['target_audience']}")
    if state.get("key_features"):
        lines.append(f"Product's key features / selling points: {state['key_features']}")
    if state.get("brand_tone"):
        lines.append(f"Requested brand tone: {state['brand_tone']}")
    if state.get("campaign_goal"):
        lines.append(f"Campaign goal: {state['campaign_goal']}")
    if state.get("cta_preference"):
        lines.append(f"Requested call to action (CTA): {state['cta_preference']}")
    if state.get("extra_notes"):
        lines.append(f"User's extra requests/instructions: {state['extra_notes']}")
    return "\n".join(lines)


def research_agent(state: CampaignState):
    print(f"🔍 [Research Agent] Analiz ediliyor: {state['target_product']}")
    current_logs = state.get("audit_log", [])
    context = _build_brief_context(state)

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.3)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert market researcher and digital marketing strategist. "
         "Based on the CONCRETE information given to you (especially 'key features' and 'extra requests' "
         "if present), write a strategy brief. Avoid generic, industry-cliché phrasing; reflect the given "
         "features, the user's stated audience, and brand tone directly. If no key features were given, "
         "make a reasonable inference from the product name/URL but explicitly mark it as an assumption. "
         "Write the ENTIRE brief in Turkish - the audience and the business are Turkish."),
        ("user", "{context}\n\nPlease produce the strategy brief."),
    ])
    chain = prompt | llm
    response = chain.invoke({"context": context})

    product_category = _classify_product_category(context)
    print(f"🔍 [Research Agent] Brief başarıyla oluşturuldu. Kategori: {product_category or 'genel'}")

    return {
        "strategy_brief": response.content,
        "product_category": product_category,
        "audit_log": current_logs + ["Research Agent: Pazar araştırması tamamlandı."],
    }


def _download_reference_image(url: str) -> io.BytesIO | None:
    """Downloads the user's real product image (uploaded to the campaign) from the
    internal URL the worker can reach (see CampaignController::dispatchToAgentQueue)."""
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        buffer = io.BytesIO(response.content)
        buffer.name = "reference.png"  # the OpenAI SDK infers file type from the name
        return buffer
    except requests.RequestException as e:
        print(f"⚠️ [Creative Agent] Referans görsel indirilemedi ({url}): {e}")
        return None


class _Creative(BaseModel):
    angle: str = Field(description="A short (2-4 word) label for this variation's angle/hook - NOT an "
                                    "audience, e.g. 'Price Advantage', 'Emotional Connection', 'Limited Offer'")
    ad_copy: str = Field(description="The Turkish ad copy itself, 4-6 sentences, ~400-600 characters")
    image_prompt: str = Field(description="An English image-generation prompt for this variation")


class _CreativeSet(BaseModel):
    creatives: list[_Creative] = Field(description="Exactly 3 variations, all for the SAME target audience, "
                                                     "each with a distinctly different angle")


def creative_agent(state: CampaignState):
    print("🎨 [Creative Agent] Reklam metinleri ve görselleri hazırlanıyor...")
    strategy_brief = state.get("strategy_brief", "")
    current_logs = state.get("audit_log", [])
    context = _build_brief_context(state)
    category_guidance = CATEGORY_GUIDANCE.get(state.get("product_category") or "", "")
    reference_urls = state.get("reference_image_urls") or []

    # STAGE 1: copy generation
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7).with_structured_output(_CreativeSet)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an award-winning copywriter and art director. "
         "Based on the strategy brief AND the concrete product information you're given, prepare 3 "
         "different AD ANGLES for the SAME target audience - 3 separate ad copies and image prompts. "
         "Keep the audience FIXED as stated by the user/brief - do not invent 3 different audiences, "
         "only vary the message's angle/hook. For example: one leads with a concrete feature/benefit, "
         "one with an emotional/story angle, one with urgency/limited-offer - make them distinctly "
         "different approaches, not the same thing said in different words. "
         "IMPORTANT: if 'key features' are given, use them literally and concretely in ad_copy (not "
         "generic adjectives like 'high quality' or 'amazing' - the actual features themselves). "
         "NEVER INVENT NUMBERS: do not write any concrete figure/percentage/quantity that wasn't given "
         "to you - '20% off', 'first 100 customers', 'only 5 left in stock', a specific price - use "
         "these ONLY if that exact information was actually provided in the context (features, site "
         "content, extra requests). If not provided, use honest general urgency/benefit language instead "
         "of a concrete promise (don't invent a real-sounding number for 'limited offer'). This will be "
         "published with real ad spend; a false/invented promise is a legal and trust risk. "
         "Strictly follow the user's requested brand tone (e.g. warm, luxury, playful, professional) "
         "and apply any extra requests/instructions if given. "
         "If a campaign goal is given, structure the message around it: 'Brand Awareness' -> "
         "storytelling/brand narrative, 'Sales/Conversion' -> urgency and concrete benefit, 'Website "
         "Traffic' -> curiosity, 'Lead Generation' -> trust/clarity of offer, 'App Installs' -> "
         "convenience/instant benefit. If a CTA preference is given, the LAST sentence of ad_copy must "
         "include that exact call to action or something very close to it (e.g. 'Buy Now', 'Try Free'). "
         "Each ad_copy must NOT be a short slogan: write a full, satisfying ad text usable directly on "
         "Meta/Google Ads - an attention-grabbing opening line, a body grounded in the product's concrete "
         "features, and a clear CTA, 4-6 sentences (~400-600 characters). "
         "image_prompt should not be generic stock-photo style either; it should visually reflect the "
         "product/service's concrete features and the requested brand tone.\n"
         "{category_guidance}\n"
         "Write ad_copy and angle in TURKISH (the audience and business are Turkish). Write image_prompt "
         "in ENGLISH (for the image model)."),
        ("user", "{context}\n\nStrategy brief: {brief}"),
    ])
    chain = prompt | llm

    # We asked the LLM for "3 variations" but that's a request, not a guarantee - it
    # sometimes returns 1-2. The user needs to choose among at least 3 copies/images,
    # so if it comes back short we retry a few times to fill it out.
    creatives_list: list[dict] = []
    for attempt in range(3):
        try:
            result: _CreativeSet = chain.invoke({
                "context": context, "brief": strategy_brief, "category_guidance": category_guidance,
            })
            creatives_list = [c.model_dump() for c in result.creatives]
        except Exception as e:
            print(f"⚠️ [Creative Agent] Yapılandırılmış çıktı hatası (deneme {attempt + 1}/3): {e}")
            creatives_list = []
        if len(creatives_list) >= 3:
            break
        print(f"⚠️ [Creative Agent] Beklenen 3 yerine {len(creatives_list)} kreatif döndü (deneme {attempt + 1}/3), tekrar deneniyor...")

    # We asked for "400-600 characters" but that's a request, not a guarantee - the
    # LLM sometimes writes too short (turns into a slogan) or too long (pushes past
    # Meta/Google's practical limits). We hard-cap the long ones instead of rejecting
    # short ones (retrying costs an extra LLM call), but at least log it.
    for creative in creatives_list:
        ad_copy = creative.get("ad_copy") or ""
        if len(ad_copy) > 900:
            creative["ad_copy"] = ad_copy[:900].rsplit(" ", 1)[0] + "..."
        elif len(ad_copy) < 150:
            print(f"⚠️ [Creative Agent] '{creative.get('angle')}' beklenenden kısa ({len(ad_copy)} karakter)")

    # STAGE 2: separate image generation per creative (so the user can pick among the 3).
    # If the user uploaded their own product image (not video - the edit API needs an
    # image), ground the generation in that real photo instead of imagining from scratch.
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
    reference_image = _download_reference_image(reference_urls[0]) if reference_urls else None
    if reference_image:
        print(f"🎨 [Creative Agent] Kullanıcının yüklediği görsel referans alınacak: {reference_urls[0]}")

    for creative in creatives_list:
        try:
            print(f"🎨 [Creative Agent] Görsel üretiliyor: {creative.get('angle')}...")
            if reference_image:
                reference_image.seek(0)
                image_response = client.images.edit(
                    model="gpt-image-1",
                    image=reference_image,
                    prompt=(
                        "Using this real product/venue photo as reference, transform it into a "
                        f"professional ad image that preserves the product's real appearance: {creative['image_prompt']}"
                    ),
                    size="1024x1024",
                    n=1,
                )
            else:
                image_response = client.images.generate(
                    model="gpt-image-1",
                    prompt=creative["image_prompt"],
                    size="1024x1024",
                    n=1,
                )
            image_data = image_response.data[0]

            if getattr(image_data, "b64_json", None):
                # Stored as a data URI in state instead of a file: the worker runs in
                # its own container, a file wouldn't be reachable from anywhere.
                # The frontend can use this directly as an <img src>.
                creative["generated_image_url"] = f"data:image/png;base64,{image_data.b64_json}"
            elif getattr(image_data, "url", None):
                creative["generated_image_url"] = image_data.url
            else:
                creative["generated_image_url"] = None
        except Exception as e:
            print(f"⚠️ [Creative Agent] Görsel üretim hatası ({creative.get('angle')}): {e}")
            creative["generated_image_url"] = None

    print("🎨 [Creative Agent] Tüm metinler ve görseller hazır.")

    return {
        "creatives": creatives_list,
        "audit_log": current_logs + ["Creative Agent: Metinler ve görseller üretildi."],
    }


class _Targeting(BaseModel):
    age_range: str = Field(description="A realistic numeric age range, e.g. '25-45' (not free text)")
    interests: list[str] = Field(default_factory=list, description="A short list of relevant interest categories")


class _MediaPlan(BaseModel):
    targeting: _Targeting
    budget_distribution: dict[str, float] = Field(
        description="Maps EACH platform key given in the prompt to its percentage share (summing to ~100)")


def media_agent(state: CampaignState):
    print(f"📊 [Media Agent] Hedefleme ve bütçe planlaması yapılıyor (bütçe: {state['daily_budget']})...")
    strategy_brief = state.get("strategy_brief", "")
    current_logs = state.get("audit_log", [])

    # Only distribute across platforms we can actually publish to - the user may have
    # picked youtube/tiktok/x but there's no publisher for those yet, no point including
    # them. If the user picked neither google_ads nor instagram/facebook (or platform
    # info never arrived), fall back to a reasonable default: split evenly across both.
    campaign_platforms = state.get("platforms") or []
    wants_google = "google_ads" in campaign_platforms
    wants_meta = "instagram" in campaign_platforms or "facebook" in campaign_platforms
    if not wants_google and not wants_meta:
        wants_google = wants_meta = True
    active_platforms = [p for p, wants in [("google_ads", wants_google), ("meta", wants_meta)] if wants]

    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.0).with_structured_output(_MediaPlan)
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a senior Media Planning specialist. "
         "Using the strategy brief and daily budget you're given, produce a distribution plan across "
         "ONLY these platforms: {platforms} - do not add any other platform; if only one platform is "
         "listed, give it 100%. interests should be in English; age_range should be a realistic numeric "
         "range."),
        ("user", "Brief: {brief}\nDaily budget: {budget} TRY"),
    ])
    chain = prompt | llm
    try:
        result: _MediaPlan = chain.invoke({
            "brief": strategy_brief,
            "budget": state["daily_budget"],
            "platforms": ", ".join(active_platforms),
        })
        media_plan = result.model_dump()
    except Exception as e:
        print(f"⚠️ [Media Agent] Yapılandırılmış çıktı hatası: {e}")
        media_plan = {}

    # Safety net: if the LLM adds an unwanted platform, or the percentages don't sum to
    # 100 (or it forgets a single platform's share entirely), we always force a single
    # platform to 100%, and normalize the LLM's ratio for two platforms - publishers
    # compute their own budget share from this, a wrong value distorts real spend.
    raw_distribution = media_plan.get("budget_distribution", {})
    distribution = {p: float(raw_distribution.get(p) or 0) for p in active_platforms}
    total = sum(distribution.values())
    if total <= 0:
        distribution = {p: 100 / len(active_platforms) for p in active_platforms}
    elif total != 100:
        distribution = {p: (v / total) * 100 for p, v in distribution.items()}

    return {
        "targeting": media_plan.get("targeting", {}),
        "budget": distribution,
        "audit_log": current_logs + ["Media Agent: Hedefleme ve bütçe planlaması tamamlandı."],
    }
