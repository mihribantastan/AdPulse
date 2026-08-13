"""
Google Ads API için refresh token üretir.
Tarayıcı açılacak, Manager hesabına (adpulse25@gmail.com) eriştiğin Google
hesabıyla giriş yapıp izin ver - script otomatik yakalayıp token'ı basacak.
"""
import os
from dotenv import load_dotenv
from google_auth_oauthlib.flow import InstalledAppFlow

load_dotenv()

SCOPES = ["https://www.googleapis.com/auth/adwords"]

client_config = {
    "installed": {
        "client_id": os.environ["GOOGLE_ADS_CLIENT_ID"],
        "client_secret": os.environ["GOOGLE_ADS_CLIENT_SECRET"],
        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
        "token_uri": "https://oauth2.googleapis.com/token",
        "redirect_uris": ["http://localhost"],
    }
}

flow = InstalledAppFlow.from_client_config(client_config, scopes=SCOPES)
credentials = flow.run_local_server(port=0, prompt="select_account consent")

print("\n" + "=" * 60)
print("REFRESH TOKEN:")
print(credentials.refresh_token)
print("=" * 60)
print("\nBunu ai_layer/.env dosyasindaki GOOGLE_ADS_REFRESH_TOKEN'a ekleyecegim.")
