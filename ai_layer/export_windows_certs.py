"""Windows sertifika deposundaki guvenilen kok sertifikalari bir PEM dosyasina
aktarir - gRPC (Google Ads API'nin kullandigi) bu dosyayi GRPC_DEFAULT_SSL_ROOTS_FILE_PATH
ile kullanip kurumsal/antivirus TLS incelemesini guvenilir sayabilsin diye."""
import ssl
import certifi

out_path = "windows_roots.pem"

with open(out_path, "wb") as f:
    # Once certifi'nin bilinen genel kok sertifikalarini yaz (temel guven)
    with open(certifi.where(), "rb") as base:
        f.write(base.read())
    f.write(b"\n")
    # Sonra Windows'un ROOT deposundaki (kurumsal/antivirus dahil) sertifikalari ekle
    for cert_der, encoding, trust in ssl.enum_certificates("ROOT"):
        pem = ssl.DER_cert_to_PEM_cert(cert_der)
        f.write(pem.encode("ascii"))

print(f"Yazildi: {out_path}")
