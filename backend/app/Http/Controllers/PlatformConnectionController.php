<?php

namespace App\Http\Controllers;

use App\Domains\Integration\Models\PlatformConnection;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class PlatformConnectionController extends Controller
{
    private const PLATFORMS = ['google_ads', 'meta'];

    // Kullanıcının bağlı olduğu platformları listeler (Ayarlar sayfası için) -
    // token'lar asla dışarı verilmez, sadece hesap adı/id ve tarih.
    public function index(Request $request)
    {
        $connections = $request->user()->platformConnections()
            ->get(['id', 'platform', 'external_account_id', 'external_account_name', 'created_at']);

        return response()->json($connections);
    }

    // Kullanıcıyı ilgili platformun OAuth onay ekranına yönlendirecek URL'i üretir.
    // Frontend bunu fetch ile çağırıp dönen url'e window.location.href ile gider
    // (bir fetch isteği harici bir OAuth redirect'ini takip edemez).
    public function redirect(Request $request, string $platform)
    {
        if (!in_array($platform, self::PLATFORMS, true)) {
            abort(404);
        }

        // state: hangi kullanıcının bağlandığını OAuth turu boyunca taşır - SPA'nın
        // backend ile paylaşılan bir session'ı yok (Bearer token bazlı), o yüzden
        // Socialite'ın normal state/session mekanizması burada işe yaramıyor.
        $state = Crypt::encryptString(json_encode([
            'user_id' => $request->user()->id,
            'platform' => $platform,
            'ts' => now()->timestamp,
        ]));

        $callbackUrl = url("/api/integrations/{$platform}/callback");

        $url = $platform === 'google_ads'
            ? $this->buildGoogleAdsAuthUrl($state, $callbackUrl)
            : $this->buildMetaAuthUrl($state, $callbackUrl);

        return response()->json(['url' => $url]);
    }

    // Google/Meta kullanıcıyı onaydan sonra buraya geri döndürür - tarayıcı
    // doğrudan geldiği için Bearer token taşımıyor, bu yüzden bu route
    // kimlik doğrulama dışında (routes/api.php) ve kimliği "state"ten çözüyoruz.
    public function callback(Request $request, string $platform)
    {
        if (!in_array($platform, self::PLATFORMS, true)) {
            abort(404);
        }

        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');

        if ($request->query('error')) {
            return redirect("{$frontendUrl}/app/settings?integration_error={$platform}");
        }

        try {
            $state = json_decode(Crypt::decryptString($request->query('state', '')), true);
        } catch (\Throwable $e) {
            return redirect("{$frontendUrl}/app/settings?integration_error={$platform}");
        }

        if (!$state || $state['platform'] !== $platform || now()->timestamp - $state['ts'] > 600) {
            return redirect("{$frontendUrl}/app/settings?integration_error={$platform}");
        }

        $callbackUrl = url("/api/integrations/{$platform}/callback");

        try {
            $connectionData = $platform === 'google_ads'
                ? $this->exchangeGoogleAdsCode($request->query('code'), $callbackUrl)
                : $this->exchangeMetaCode($request->query('code'), $callbackUrl);
        } catch (\Throwable $e) {
            Log::error("Platform bağlantısı başarısız ({$platform}): " . $e->getMessage(), [
                'user_id' => $state['user_id'],
            ]);
            return redirect("{$frontendUrl}/app/settings?integration_error={$platform}");
        }

        PlatformConnection::updateOrCreate(
            ['user_id' => $state['user_id'], 'platform' => $platform],
            $connectionData,
        );

        return redirect("{$frontendUrl}/app/settings?connected={$platform}");
    }

    // Bağlantıyı kaldırır
    public function destroy(Request $request, string $platform)
    {
        if (!in_array($platform, self::PLATFORMS, true)) {
            abort(404);
        }

        $request->user()->platformConnections()->where('platform', $platform)->delete();

        return response()->json(['message' => 'Bağlantı kaldırıldı.']);
    }

    private function buildGoogleAdsAuthUrl(string $state, string $callbackUrl): string
    {
        $params = http_build_query([
            'client_id' => config('services.google_ads.client_id'),
            'redirect_uri' => $callbackUrl,
            'response_type' => 'code',
            'scope' => 'https://www.googleapis.com/auth/adwords',
            'access_type' => 'offline',
            'prompt' => 'consent',
            'state' => $state,
        ]);

        return "https://accounts.google.com/o/oauth2/v2/auth?{$params}";
    }

    private function buildMetaAuthUrl(string $state, string $callbackUrl): string
    {
        $params = http_build_query([
            'client_id' => config('services.meta.client_id'),
            'redirect_uri' => $callbackUrl,
            'response_type' => 'code',
            'scope' => 'ads_management,ads_read,pages_show_list,business_management',
            'state' => $state,
        ]);

        return "https://www.facebook.com/v21.0/dialog/oauth?{$params}";
    }

    // Yetkilendirme kodunu refresh_token'a çevirir, kullanıcının erişebildiği
    // ilk Google Ads hesabını bulur. NOT: login_customer_id'yi şimdilik boş
    // bırakıyoruz - bu sadece bir Manager (MCC) hesabı adına client hesaplara
    // erişirken gerekiyor; doğrudan kullanıcı OAuth'unda gerekmiyor. Gerçek
    // yayın denemesinde developer token tier'ı izin vermezse burası netleşecek.
    private function exchangeGoogleAdsCode(string $code, string $callbackUrl): array
    {
        $tokenResponse = Http::asForm()->post('https://oauth2.googleapis.com/token', [
            'code' => $code,
            'client_id' => config('services.google_ads.client_id'),
            'client_secret' => config('services.google_ads.client_secret'),
            'redirect_uri' => $callbackUrl,
            'grant_type' => 'authorization_code',
        ])->throw()->json();

        if (empty($tokenResponse['refresh_token'])) {
            throw new \RuntimeException('Google refresh_token döndürmedi (prompt=consent olmasına rağmen).');
        }

        $accessToken = $tokenResponse['access_token'];

        $customersResponse = Http::withHeaders([
            'Authorization' => "Bearer {$accessToken}",
            'developer-token' => config('services.google_ads.developer_token'),
        ])->get('https://googleads.googleapis.com/v18/customers:listAccessibleCustomers')->throw()->json();

        $resourceNames = $customersResponse['resourceNames'] ?? [];
        $customerId = $resourceNames ? str_replace('customers/', '', $resourceNames[0]) : null;

        return [
            'access_token' => $accessToken,
            'refresh_token' => $tokenResponse['refresh_token'],
            'external_account_id' => $customerId,
            'external_account_name' => $customerId ? "Google Ads #{$customerId}" : null,
            'extra' => ['login_customer_id' => null],
            'expires_at' => isset($tokenResponse['expires_in'])
                ? Carbon::now()->addSeconds($tokenResponse['expires_in'])
                : null,
        ];
    }

    // Kısa ömürlü kodu önce kısa ömürlü, sonra 60 günlük uzun ömürlü kullanıcı
    // token'ına çevirir; ilk reklam hesabını ve ilk Sayfa'yı bulur.
    private function exchangeMetaCode(string $code, string $callbackUrl): array
    {
        $shortLived = Http::get('https://graph.facebook.com/v21.0/oauth/access_token', [
            'client_id' => config('services.meta.client_id'),
            'client_secret' => config('services.meta.client_secret'),
            'redirect_uri' => $callbackUrl,
            'code' => $code,
        ])->throw()->json();

        $longLived = Http::get('https://graph.facebook.com/v21.0/oauth/access_token', [
            'grant_type' => 'fb_exchange_token',
            'client_id' => config('services.meta.client_id'),
            'client_secret' => config('services.meta.client_secret'),
            'fb_exchange_token' => $shortLived['access_token'],
        ])->throw()->json();

        $accessToken = $longLived['access_token'];

        $adAccounts = Http::get('https://graph.facebook.com/v21.0/me/adaccounts', [
            'access_token' => $accessToken,
            'fields' => 'id,name',
        ])->throw()->json()['data'] ?? [];

        $pages = Http::get('https://graph.facebook.com/v21.0/me/accounts', [
            'access_token' => $accessToken,
            'fields' => 'id,name',
        ])->throw()->json()['data'] ?? [];

        $adAccount = $adAccounts[0] ?? null;
        $page = $pages[0] ?? null;

        if (!$adAccount) {
            throw new \RuntimeException('Bu Facebook hesabına bağlı bir reklam hesabı bulunamadı.');
        }

        return [
            'access_token' => $accessToken,
            'refresh_token' => null,
            'external_account_id' => $adAccount['id'],
            'external_account_name' => $adAccount['name'] ?? $adAccount['id'],
            'extra' => ['page_id' => $page['id'] ?? null, 'page_name' => $page['name'] ?? null],
            'expires_at' => isset($longLived['expires_in'])
                ? Carbon::now()->addSeconds($longLived['expires_in'])
                : Carbon::now()->addDays(60),
        ];
    }
}
