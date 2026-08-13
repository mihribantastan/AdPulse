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
import { Chatbot } from './pages/Chatbot';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
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
          <Route path="/app/chatbot" element={<ProtectedRoute><Chatbot /></ProtectedRoute>} />
          <Route path="/app/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
