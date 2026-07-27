// ============================================================
// AgriSmart — App Root & Router
// ============================================================
import { useAppStore,useCurrentUser } from '@/store';
import { Component,useEffect,type ErrorInfo,type ReactNode } from 'react';
import { Link,Navigate,Route,Routes,useLocation } from 'react-router-dom';

// Layouts
import { AgriAssistant } from '@/components/assistant/AgriAssistant';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PublicFooter } from '@/components/layout/PublicFooter';
import { PublicHeader } from '@/components/layout/PublicHeader';

// Public Pages
import { GenericPage } from '@/pages/public/GenericPage';
import { HomePage } from '@/pages/public/HomePage';
import { LegalPage } from '@/pages/public/LegalPage';

// Auth
import { LoginPage } from '@/pages/auth/LoginPage';
import { OnboardingPage } from '@/pages/auth/OnboardingPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

// Farmer
import { FarmerAgreements } from '@/pages/farmer/FarmerAgreements';
import { FarmerAlerts } from '@/pages/farmer/FarmerAlerts';
import { FarmerCropHealth } from '@/pages/farmer/FarmerCropHealth';
import { FarmerDashboard } from '@/pages/farmer/FarmerDashboard';
import { FarmerDrones } from '@/pages/farmer/FarmerDrones';
import { FarmerFarms } from '@/pages/farmer/FarmerFarms';
import { FarmerIoT } from '@/pages/farmer/FarmerIoT';
import { FarmerMarketplace } from '@/pages/farmer/FarmerMarketplace';
import { FarmerOffers } from '@/pages/farmer/FarmerOffers';
import { FarmerPayments } from '@/pages/farmer/FarmerPayments';
import { FarmerVerification } from '@/pages/farmer/FarmerVerification';

// Buyer
import { BuyerAgreements } from '@/pages/buyer/BuyerAgreements';
import { BuyerDashboard } from '@/pages/buyer/BuyerDashboard';
import { BuyerMarketplace } from '@/pages/buyer/BuyerMarketplace';
import { BuyerOffers } from '@/pages/buyer/BuyerOffers';
import { BuyerPayments } from '@/pages/buyer/BuyerPayments';
import { BuyerVerification } from '@/pages/buyer/BuyerVerification';

// Verifier
import { VerifierDashboard } from '@/pages/verifier/VerifierDashboard';
import { VerifierFarms } from '@/pages/verifier/VerifierFarms';
import { VerifierInspections } from '@/pages/verifier/VerifierInspections';

// Admin
import { AdminAgreements } from '@/pages/admin/AdminAgreements';
import { AdminAudit } from '@/pages/admin/AdminAudit';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminDisputes } from '@/pages/admin/AdminDisputes';
import { AdminSystem } from '@/pages/admin/AdminSystem';
import { AdminUsers } from '@/pages/admin/AdminUsers';



class AppErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, { hasError: boolean }> {
  state = { hasError: false };

  componentDidUpdate(previousProps: Readonly<{ children: ReactNode; resetKey: string }>) {
    if (this.state.hasError && previousProps.resetKey !== this.props.resetKey) {
      this.setState({ hasError: false });
    }
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('AgriSmart render failure', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="min-h-screen bg-brand-cream px-4 py-16">
        <div className="card mx-auto max-w-lg p-6 text-center">
          <h1 className="text-xl font-bold text-brand-text">This screen could not load</h1>
          <p className="mt-2 text-sm leading-relaxed text-brand-muted">This route hit a recoverable rendering error. You can retry the screen or move to another page without refreshing the whole application.</p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <button type="button" className="btn-primary px-4 py-2.5" onClick={() => this.setState({ hasError: false })}>Try this screen again</button>
            <Link className="btn-outline px-4 py-2.5" to="/">Go to home</Link>
          </div>
        </div>
      </main>
    );
  }
}

function ProtectedRoute({ children, roles }: { children: ReactNode; roles: string[] }) {
  const { isAuthenticated, role } = useAppStore();
  const currentUser = useCurrentUser();
  const validSession = Boolean(isAuthenticated && role && currentUser && currentUser.role === role && roles.includes(role));

  if (!validSession) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicLayout({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <div key={location.key || location.pathname} className="route-progress" aria-hidden="true" />
      <PublicHeader />
      <main className="flex-1 animate-fade-in" id="main-content">{children}</main>
      <PublicFooter />
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const { reducedMotion, highContrast, largeText } = useAppStore();

  // Apply accessibility classes to root
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('reduce-motion', reducedMotion);
    root.classList.toggle('high-contrast', highContrast);
    root.classList.toggle('large-text', largeText);
  }, [reducedMotion, highContrast, largeText]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [location.pathname, reducedMotion]);

  return (
    <AppErrorBoundary resetKey={location.pathname}>
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <Routes>
        {/* Public */}
        <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
        <Route path="/how-it-works" element={<PublicLayout><GenericPage page="howItWorks" /></PublicLayout>} />
        <Route path="/farmer-solutions" element={<PublicLayout><GenericPage page="farmerSolutions" /></PublicLayout>} />
        <Route path="/buyer-solutions" element={<PublicLayout><GenericPage page="buyerSolutions" /></PublicLayout>} />
        <Route path="/iot-monitoring" element={<PublicLayout><GenericPage page="iotMonitoring" /></PublicLayout>} />
        <Route path="/secure-payments" element={<PublicLayout><GenericPage page="securePayments" /></PublicLayout>} />
        <Route path="/identity-verification" element={<PublicLayout><GenericPage page="identityVerification" /></PublicLayout>} />
        <Route path="/trust-validation" element={<PublicLayout><GenericPage page="trustValidation" /></PublicLayout>} />
        <Route path="/languages" element={<PublicLayout><GenericPage page="languages" /></PublicLayout>} />
        <Route path="/pricing" element={<PublicLayout><GenericPage page="pricing" /></PublicLayout>} />
        <Route path="/about" element={<PublicLayout><GenericPage page="about" /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><GenericPage page="contact" /></PublicLayout>} />
        <Route path="/privacy" element={<PublicLayout><LegalPage type="privacy" /></PublicLayout>} />
        <Route path="/terms" element={<PublicLayout><LegalPage type="terms" /></PublicLayout>} />

        {/* Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />

        {/* Farmer */}
        <Route path="/farmer" element={<ProtectedRoute roles={['farmer']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<FarmerDashboard />} />
          <Route path="farms" element={<FarmerFarms />} />
          <Route path="iot" element={<FarmerIoT />} />
          <Route path="crop-health" element={<FarmerCropHealth />} />
          <Route path="drones" element={<FarmerDrones />} />
          <Route path="marketplace" element={<FarmerMarketplace />} />
          <Route path="offers" element={<FarmerOffers />} />
          <Route path="agreements" element={<FarmerAgreements />} />
          <Route path="payments" element={<FarmerPayments />} />
          <Route path="verification" element={<FarmerVerification />} />
          <Route path="alerts" element={<FarmerAlerts />} />
        </Route>

        {/* Buyer */}
        <Route path="/buyer" element={<ProtectedRoute roles={['buyer']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<BuyerDashboard />} />
          <Route path="marketplace" element={<BuyerMarketplace />} />
          <Route path="offers" element={<BuyerOffers />} />
          <Route path="agreements" element={<BuyerAgreements />} />
          <Route path="payments" element={<BuyerPayments />} />
          <Route path="verification" element={<BuyerVerification />} />
        </Route>

        {/* Verifier */}
        <Route path="/verifier" element={<ProtectedRoute roles={['verifier']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<VerifierDashboard />} />
          <Route path="inspections" element={<VerifierInspections />} />
          <Route path="farms" element={<VerifierFarms />} />
          <Route path="verification" element={<VerifierDashboard />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="agreements" element={<AdminAgreements />} />
          <Route path="disputes" element={<AdminDisputes />} />
          <Route path="system" element={<AdminSystem />} />
          <Route path="audit" element={<AdminAudit />} />
        </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <AgriAssistant />
    </AppErrorBoundary>
  );
}
