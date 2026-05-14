import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import SiteChatWidget from './components/SiteChatWidget';
import Home from './pages/Home';
import Company from './pages/Company';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import NewAudit from './pages/NewAudit';
import AuditReport from './pages/AuditReport';
import PublicReport from './pages/PublicReport';
import Pricing from './pages/Pricing';
import Security from './pages/Security';
import PolicyPage from './pages/PolicyPage';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/company" element={<Company />} />
          <Route path="/security" element={<Security />} />
          <Route path="/privacy" element={<PolicyPage type="privacy" />} />
          <Route path="/terms" element={<PolicyPage type="terms" />} />
          <Route path="/refunds" element={<PolicyPage type="refunds" />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/audits/new" element={<ProtectedRoute><NewAudit /></ProtectedRoute>} />
          <Route path="/audits/:id" element={<ProtectedRoute><AuditReport /></ProtectedRoute>} />
          <Route path="/reports/public/:token" element={<PublicReport />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
      <Footer />
      <SiteChatWidget />
    </div>
  );
}
