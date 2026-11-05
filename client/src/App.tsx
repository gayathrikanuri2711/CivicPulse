import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ComplaintProvider } from './context/ComplaintContext';
import { LanguageProvider } from './context/LanguageContext';
import { Header } from './components/Header';
import { CitizenBottomNav } from './components/CitizenBottomNav';
import { CitizenHome } from './pages/citizen/CitizenHome';
import { ReportIssue } from './pages/citizen/ReportIssue';
import { MyComplaints } from './pages/citizen/MyComplaints';
import { CitizenProfile } from './pages/citizen/CitizenProfile';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ContractorPortal } from './pages/contractor/ContractorPortal';
import { LoginPage } from './pages/auth/LoginPage';

const AppContent: React.FC = () => {
  const { role, isAuthenticated } = useAuth();

  // Not logged in — show login page
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Role-based routing — each role can ONLY access their own routes
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1">
        <Routes>
          {role === 'citizen' && (
            <>
              <Route path="/" element={<CitizenHome />} />
              <Route path="/complaints" element={<MyComplaints />} />
              <Route path="/report" element={<ReportIssue />} />
              <Route path="/profile" element={<CitizenProfile />} />
            </>
          )}

          {role === 'admin' && (
            <Route path="/admin" element={<AdminDashboard />} />
          )}

          {role === 'contractor' && (
            <Route path="/contractor" element={<ContractorPortal />} />
          )}

          {/* Login redirect when already authenticated */}
          <Route path="/login" element={
            <Navigate to={role === 'admin' ? '/admin' : role === 'contractor' ? '/contractor' : '/'} replace />
          } />

          {/* Fallback — redirect to user's home based on role */}
          <Route path="*" element={
            <Navigate to={role === 'admin' ? '/admin' : role === 'contractor' ? '/contractor' : '/'} replace />
          } />
        </Routes>
      </main>

      {/* Citizen Mobile Bottom Navigation (only on citizen role) */}
      {role === 'citizen' && <CitizenBottomNav />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ComplaintProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ComplaintProvider>
      </AuthProvider>
    </LanguageProvider>
  );
};

export default App;
