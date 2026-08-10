import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Login default export olduğu için süslü parantez YOK ve büyük harfle
import Login from './pages/Login'; 

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
          
          <Route path="/app/statistics" element={<Dashboard />} />
          <Route path="/app/campaigns" element={<Campaigns />} />
          <Route path="/app/campaigns/new" element={<NewCampaign />} />
          <Route path="/app/campaigns/:id" element={<CampaignDetail />} />
          <Route path="/app/reports" element={<Reports />} />
          <Route path="/app/chatbot" element={<Chatbot />} />
          <Route path="/app/settings" element={<Settings />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}