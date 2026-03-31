import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import LeadDetail from './pages/LeadDetail';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import SettingsMenu from './components/SettingsMenu';
import RecycleBin from './pages/RecycleBin';

// Protected layout: renders sidebar and topbar around the page
const ProtectedLayout = ({ children, title, subtitle }) => {
  const { admin, loading } = useAuth();

  if (loading) return <div className="loading-spinner">Loading…</div>;
  if (!admin) return <Navigate to="/login" replace />;

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-area">
        <TopBar title={title} subtitle={subtitle} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
};

// Redirect logged in users away from /login
const PublicRoute = ({ children }) => {
  const { admin, loading } = useAuth();
  if (loading) return null;
  return admin ? <Navigate to="/" replace /> : children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />

          <Route path="/" element={
            <ProtectedLayout title="Dashboard" subtitle="Overview of your lead pipeline">
              <Dashboard />
            </ProtectedLayout>
          } />

          <Route path="/leads" element={
            <ProtectedLayout title="Leads" subtitle="Manage and track all incoming leads">
              <Leads />
            </ProtectedLayout>
          } />

          <Route path="/leads/:id" element={
            <ProtectedLayout title="Lead Detail" subtitle="Full lead profile and follow-up notes">
              <LeadDetail />
            </ProtectedLayout>
          } />

          <Route path="/recycle-bin" element={
            <ProtectedLayout title="Recycle Bin" subtitle="List of deleted leads.">
              <RecycleBin />
            </ProtectedLayout>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
