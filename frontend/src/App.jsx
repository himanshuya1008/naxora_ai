import { Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth.js';
import { useVisitorAuth } from './hooks/useVisitorAuth.js';
import ProtectedRoute from './routes/ProtectedRoute.jsx';
import ProtectedVisitorRoute from './routes/ProtectedVisitorRoute.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import VisitorDashboardLayout from './layouts/VisitorDashboardLayout.jsx';
import AuthLayout from './layouts/AuthLayout.jsx';
import MarketingLayout from './layouts/MarketingLayout.jsx';
import ToastContainer from './components/common/ToastContainer.jsx';

import Home from './pages/Home/Home.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import VisitorDetailPage from './pages/VisitorDetailPage.jsx';
import ConversationPage from './pages/ConversationPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import LeadsPage from './pages/LeadsPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import ReportDetailPage from './pages/ReportDetailPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import ApiKeysPage from './pages/ApiKeysPage.jsx';
import VoiceConfigPage from './pages/VoiceConfigPage.jsx';
import CustomerDnaPage from './pages/CustomerDnaPage.jsx';
import CustomersPage from './pages/CustomersPage.jsx';
import SalesFunnelPage from './pages/SalesFunnelPage.jsx';
import RevenueAnalyticsPage from './pages/RevenueAnalyticsPage.jsx';
import Profile from './pages/Profile/Profile.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

import Services from './pages/Services/Services.jsx';
import ServiceDetail from './pages/ServiceDetail/ServiceDetail.jsx';
import Pricing from './pages/Pricing/Pricing.jsx';
import Contact from './pages/Contact/Contact.jsx';
import BookDemo from './pages/BookDemo/BookDemo.jsx';
import AIConsultant from './pages/AIConsultant/AIConsultant.jsx';
import Industries from './pages/Industries/Industries.jsx';
import CaseStudies from './pages/CaseStudies/CaseStudies.jsx';
import Blog from './pages/Blog/Blog.jsx';
import About from './pages/About/About.jsx';

import VisitorLoginPage from './pages/visitor/VisitorLoginPage.jsx';
import VisitorRegisterPage from './pages/visitor/VisitorRegisterPage.jsx';
import VisitorForgotPasswordPage from './pages/visitor/VisitorForgotPasswordPage.jsx';
import VisitorDashboardPage from './pages/visitor/VisitorDashboardPage.jsx';
import VisitorConversationsPage from './pages/visitor/VisitorConversationsPage.jsx';
import VisitorConversationDetailPage from './pages/visitor/VisitorConversationDetailPage.jsx';
import VisitorRequestsPage from './pages/visitor/VisitorRequestsPage.jsx';
import VisitorProfilePage from './pages/visitor/VisitorProfilePage.jsx';
import VisitorSettingsPage from './pages/visitor/VisitorSettingsPage.jsx';

export default function App() {
  // Bootstraps the auth session (silent refresh via the httpOnly cookie) once
  // at the app root so every route — protected or not — sees the resolved state.
  useAuth();
  // Same bootstrap for the separate Visitor session — independent of the
  // admin one above (see visitorAuthStore/visitorHttpClient for why they
  // don't share state).
  useVisitorAuth();

  return (
    <>
      <Routes>
        <Route element={<MarketingLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/services/:slug" element={<ServiceDetail />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/book-demo" element={<BookDemo />} />
          <Route path="/ai-consultant" element={<AIConsultant />} />
          <Route path="/industries" element={<Industries />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/about" element={<About />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/visitor/login" element={<VisitorLoginPage />} />
          <Route path="/visitor/register" element={<VisitorRegisterPage />} />
          <Route path="/visitor/forgot-password" element={<VisitorForgotPasswordPage />} />
        </Route>

        <Route element={<ProtectedVisitorRoute />}>
          <Route path="/visitor" element={<VisitorDashboardLayout />}>
            <Route index element={<VisitorDashboardPage />} />
            <Route path="conversations" element={<VisitorConversationsPage />} />
            <Route path="conversations/:id" element={<VisitorConversationDetailPage />} />
            <Route path="requests" element={<VisitorRequestsPage />} />
            <Route path="profile" element={<VisitorProfilePage />} />
            <Route path="settings" element={<VisitorSettingsPage />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="visitors/:id" element={<VisitorDetailPage />} />
            <Route path="conversation" element={<ConversationPage />} />
            <Route path="conversation/:visitorId" element={<ConversationPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="leads" element={<LeadsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="sales-funnel" element={<SalesFunnelPage />} />
            <Route path="customer-dna" element={<CustomerDnaPage />} />
            <Route path="revenue" element={<RevenueAnalyticsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="reports/:conversationId" element={<ReportDetailPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="api-keys" element={<ApiKeysPage />} />
            <Route path="voice-configuration" element={<VoiceConfigPage />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <ToastContainer />
    </>
  );
}
