import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Login/Signup default export olduğu için süslü parantez YOK ve büyük harfle
import Login from './pages/Login';
import Signup from './pages/Signup';
import AuthCallback from './pages/AuthCallback';

// Diğerleri named export olduğu için süslü parantez VAR
import { Dashboard } from './pages/Dashboard';
import { Campaigns } from './pages/Campaigns';
import { CampaignDetail } from './pages/CampaignDetail';
import { NewCampaign } from './pages/NewCampaign';
import { Reports } from './pages/Report';
import { CampaignReport } from './pages/CampaignReport';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/auth/callback" element={<AuthCallback />} />

          <Route path="/app/statistics" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/app/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
          <Route path="/app/campaigns/new" element={<ProtectedRoute><NewCampaign /></ProtectedRoute>} />
          <Route path="/app/campaigns/:id" element={<ProtectedRoute><CampaignDetail /></ProtectedRoute>} />
          <Route path="/app/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
          <Route path="/app/reports/:id" element={<ProtectedRoute><CampaignReport /></ProtectedRoute>} />
          <Route path="/app/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
          <Route path="/app/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
