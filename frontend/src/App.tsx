import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Megaphone, Loader2, CheckCircle, Clock, Eye, X, ArrowRight } from 'lucide-react';

// --- 1. YENİ KAMPANYA (SİHİRBAZ) ---
const NewCampaign = ({ onAddCampaign }: { onAddCampaign: any }) => {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [formData, setFormData] = useState({ productName: '', budget: '', platform: 'Google Ads' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAnalyzing(true);

    setTimeout(() => {
      onAddCampaign({
        id: Date.now(),
        ...formData,
        status: 'pending',
        aiGenerated: {
          headline: `${formData.productName || 'Ürün'} İçin İnanılmaz Fırsat!`,
          description: "Yapay zeka tarafından optimize edilmiş, dönüşüm oranı yüksek reklam metni taslağı. Tıklama oranını %40 artırması öngörülüyor.",
          targetAudience: "Türkiye Geneli, 18-45 Yaş, Online Alışveriş Yapanlar",
          imagePlaceholder: "https://via.placeholder.com/800x400/0f172a/ffffff?text=Yapay+Zeka+Görseli"
        }
      });
      setIsAnalyzing(false);
      navigate('/');
    }, 3000);
  };

  if (isAnalyzing) return (
    <div className="flex flex-col items-center justify-center h-full space-y-6">
      <Loader2 size={48} className="animate-spin text-blue-600" />
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Ajanlar İçerik Üretiyor...</h2>
        <p className="text-gray-500">Reklam metinleri yazılıyor, görseller hazırlanıyor.</p>
      </div>
    </div>
  );

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-8">Yeni Kampanya Başlat</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Ürün/Hizmet Adı veya Linki</label>
          <input type="text" required className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.productName} onChange={(e) => setFormData({...formData, productName: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Günlük Bütçe (TL)</label>
          <input type="number" required min="100" className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.budget} onChange={(e) => setFormData({...formData, budget: e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Yayın Platformu</label>
          <select className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" value={formData.platform} onChange={(e) => setFormData({...formData, platform: e.target.value})}>
            <option>Google Ads</option>
            <option>Meta (Instagram/Facebook)</option>
          </select>
        </div>
        <button type="submit" className="w-full bg-slate-900 text-white font-bold text-lg p-4 rounded-xl hover:bg-slate-800 transition-all flex justify-center items-center gap-2">
          Ajanları Tetikle <ArrowRight size={20} />
        </button>
      </form>
    </div>
  );
};

// --- 2. ANA PANEL (JİLET GİBİ SAĞ ÇEKMECE İLE) ---
const Dashboard = ({ campaigns, onApprove }: { campaigns: any[], onApprove: any }) => {
  const [reviewingCampaign, setReviewingCampaign] = useState<any>(null);

  return (
    <div className="p-8 relative">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">İnsan Onayı Merkezi</h1>
      <p className="text-gray-500 mb-8 text-lg">Yapay zekanın hazırladığı kampanyaları inceleyin ve onaylayın.</p>

      {campaigns.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center">
          <p className="text-gray-500 text-lg">Bekleyen veya aktif kampanya yok.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns.map((camp) => (
            <div key={camp.id} className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{camp.productName}</h3>
                <p className="text-gray-500 font-medium">{camp.platform} • Günlük {camp.budget} TL</p>
              </div>
              
              {camp.status === 'pending' ? (
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-4 py-2 rounded-full text-sm font-bold">
                    <Clock size={18} /> Onay Bekliyor
                  </span>
                  <button onClick={() => setReviewingCampaign(camp)} className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-slate-800 transition-colors">
                    <Eye size={18} /> İncele
                  </button>
                </div>
              ) : (
                <span className="flex items-center gap-1.5 text-green-600 bg-green-50 px-4 py-2 rounded-full text-sm font-bold">
                  <CheckCircle size={18} /> Yayında
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ZARİF SAĞ ÇEKMECE (SLIDE-OVER DRAWER) */}
      {reviewingCampaign && (
        <>
          {/* Arka plan bulanıklığı */}
          <div 
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-40 transition-opacity"
            onClick={() => setReviewingCampaign(null)}
          ></div>
          
          {/* Sağdan kayan panel */}
          <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[600px] bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
            {/* Çekmece Üst Barı */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-white">
              <h2 className="text-2xl font-extrabold text-gray-900">Kampanya Önizlemesi</h2>
              <button onClick={() => setReviewingCampaign(null)} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {/* Çekmece İçeriği (Kaydırılabilir alan) */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-6 shadow-sm">
                <img src={reviewingCampaign.aiGenerated.imagePlaceholder} alt="AI Görsel" className="w-full object-cover" />
                <div className="p-6">
                  <p className="text-xs font-black text-blue-600 tracking-wider mb-2">SPONSORLU YAYIN</p>
                  <h3 className="font-extrabold text-2xl text-gray-900 mb-3">{reviewingCampaign.aiGenerated.headline}</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">{reviewingCampaign.aiGenerated.description}</p>
                </div>
              </div>

              <div className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm space-y-4">
                <h4 className="font-bold text-gray-900 border-b pb-2">Kampanya Detayları</h4>
                <div>
                  <span className="block text-sm text-gray-500 font-medium">Yapay Zeka Hedef Kitlesi</span>
                  <span className="block text-gray-900 font-semibold">{reviewingCampaign.aiGenerated.targetAudience}</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-50">
                  <div>
                    <span className="block text-sm text-gray-500 font-medium">Platform</span>
                    <span className="block text-gray-900 font-semibold">{reviewingCampaign.platform}</span>
                  </div>
                  <div>
                    <span className="block text-sm text-gray-500 font-medium">Günlük Bütçe</span>
                    <span className="block text-gray-900 font-semibold">{reviewingCampaign.budget} TL</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Çekmece Alt Barı (Sabit Butonlar) */}
            <div className="p-6 border-t border-gray-100 bg-white flex gap-4">
              <button onClick={() => setReviewingCampaign(null)} className="flex-1 py-4 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                Kapat
              </button>
              <button 
                onClick={() => {
                  onApprove(reviewingCampaign.id);
                  setReviewingCampaign(null);
                }} 
                className="flex-[2] py-4 bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-600/20 hover:bg-green-700 hover:shadow-green-600/40 transition-all"
              >
                Onayla ve Yayına Al
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// --- SOL MENÜ VE APP İSKELETİ ---
const Sidebar = () => {
  const location = useLocation();
  return (
    <div className="w-72 bg-slate-950 text-slate-300 min-h-screen flex flex-col border-r border-slate-900">
      <div className="p-8 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-xl font-bold text-xl">A</div>
        <span className="text-2xl font-extrabold text-white tracking-wide">AdPulse</span>
      </div>
      <nav className="flex-1 p-6 space-y-3">
        <Link to="/" className={`flex items-center gap-4 px-5 py-4 rounded-xl font-semibold transition-all ${location.pathname === '/' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-slate-900 hover:text-white'}`}><LayoutDashboard size={22} /> Dashboard</Link>
        <Link to="/yeni" className={`flex items-center gap-4 px-5 py-4 rounded-xl font-semibold transition-all ${location.pathname === '/yeni' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'hover:bg-slate-900 hover:text-white'}`}><Megaphone size={22} /> Yeni Kampanya</Link>
      </nav>
    </div>
  );
};

export default function App() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const handleAddCampaign = (newCamp: any) => setCampaigns([newCamp, ...campaigns]);
  const handleApprove = (id: number) => setCampaigns(campaigns.map(c => c.id === id ? { ...c, status: 'active' } : c));

  return (
    <Router>
      <div className="flex min-h-screen bg-slate-50 font-sans selection:bg-blue-100">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard campaigns={campaigns} onApprove={handleApprove} />} />
            <Route path="/yeni" element={<NewCampaign onAddCampaign={handleAddCampaign} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}