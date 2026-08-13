"""Google Ads API kimlik bilgilerinin gerçekten çalıştığını doğrular."""
import os
from dotenv import load_dotenv
from google.ads.googleads.client import GoogleAdsClient

load_dotenv()

config = {
    "developer_token": os.environ["GOOGLE_ADS_DEVELOPER_TOKEN"],
    "client_id": os.environ["GOOGLE_ADS_CLIENT_ID"],
    "client_secret": os.environ["GOOGLE_ADS_CLIENT_SECRET"],
    "refresh_token": os.environ["GOOGLE_ADS_REFRESH_TOKEN"],
    "login_customer_id": os.environ["GOOGLE_ADS_LOGIN_CUSTOMER_ID"],
    "use_proto_plus": True,
}

client = GoogleAdsClient.load_from_dict(config)
customer_service = client.get_service("CustomerService")

response = customer_service.list_accessible_customers()
print("Erisilebilir hesaplar:")
for resource_name in response.resource_names:
    print(" -", resource_name)
