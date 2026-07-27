import type { ReactNode } from 'react';
// ============================================================
// AgriSmart — Generic Public Pages (content-driven)
// ============================================================
import { AlertBanner,Badge,Button,ButtonLink,Card,Input,Textarea } from '@/components/ui';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
Activity,
ArrowRight,
BadgeCheck,
BarChart3,
CheckCircle2,
Cpu,
Database,Eye,
FileText,
Globe,
MapPin as LocationIcon,
Lock,
Mail,
MapPin,
Phone,
Radio,
Scale,
ShieldAlert,
ShieldCheck,
Smartphone,
Sprout,Store,
TrendingUp,
Users,
Wallet,
Zap
} from 'lucide-react';
import { useState,type FormEvent } from 'react';

interface PageContent {
  badge: string;
  title: string;
  subtitle: string;
  sections: { icon: ReactNode; title: string; desc: string; points?: string[] | string }[];
  cta?: { label: string; path: string };
}


const pageEmoji: Record<string, string> = {
  howItWorks: '🧭', farmerSolutions: '🌾', buyerSolutions: '🛒', iotMonitoring: '📡', securePayments: '💳',
  identityVerification: '🪪', trustValidation: '🛡️', languages: '🌐', pricing: '💰', about: '🌱', contact: '✉️',
};

const sectionAccents = [
  'border-t-brand-primary bg-brand-soft text-brand-primary',
  'border-t-brand-sky bg-brand-sky/10 text-brand-sky',
  'border-t-brand-purple bg-brand-purple/10 text-brand-purple',
  'border-t-brand-saffron bg-brand-saffron/10 text-brand-saffron',
  'border-t-brand-teal bg-brand-teal/10 text-brand-teal',
  'border-t-brand-rose bg-brand-rose/10 text-brand-rose',
];

const pageContents: Record<string, PageContent> = {
  howItWorks: {
    badge: 'How It Works',
    title: 'A complete trust infrastructure for agricultural trade',
    subtitle: 'From farmer registration to payment release — every step is designed around verification, accountability, and transparency.',
    sections: [
      { icon: <ShieldCheck className="w-6 h-6" />, title: '1. Identity Verification', desc: 'Farmers and buyers verify their identity through sandbox Aadhaar and KCC verification workflows. Verification tokens (not raw data) are stored with consent records.', points: ['Mock Aadhaar verification (sandbox)', 'KCC status check (sandbox)', 'Farm ownership verification', 'Business registration for buyers'] },
      { icon: <Radio className="w-6 h-6" />, title: '2. IoT Device Registration', desc: 'Certified sensors are registered with unique device identities, firmware versions, and cryptographic certificates. All telemetry is signed and validated.', points: ['Device certificate verification', 'MQTT topic-based telemetry ingestion', 'Signed sensor messages', 'Confidence scoring per reading'] },
      { icon: <Store className="w-6 h-6" />, title: '3. Marketplace & Offers', desc: 'Farmers list produce with sensor-backed crop data. Buyers search, filter, and submit offers with quality and delivery requirements.', points: ['Sensor-supported listings', 'Buyer offer negotiation', 'Quality grade filtering', 'Verification status filters'] },
      { icon: <FileText className="w-6 h-6" />, title: '4. Agreement Builder', desc: 'A guided workflow creates trade agreements with 14-state lifecycle, milestones, quality conditions, escrow terms, and dispute processes.', points: ['14-state agreement lifecycle', 'Milestone-based payments', 'Quality condition enforcement', 'On-chain agreement hash'] },
      { icon: <Wallet className="w-6 h-6" />, title: '5. Escrow & Payment', desc: 'Hybrid payment architecture: Polygon testnet escrow for development, regulated UPI/bank providers for production. No payment releases from a single unverified reading.', points: ['Escrow funding on-chain', 'Milestone-based release', 'Refund and penalty handling', 'Multi-source release verification'] },
      { icon: <Scale className="w-6 h-6" />, title: '6. Verification & Delivery', desc: 'Field verifiers inspect crops and deliveries with geo-tagged evidence, checklists, and digital signatures. Buyer confirms delivery before payment release.', points: ['Geo-tagged inspection photos', 'Digital verifier signatures', 'Delivery confirmation workflow', 'Dispute resolution process'] },
    ],
    cta: { label: 'Register as a Farmer', path: '/register' },
  },
  farmerSolutions: {
    badge: 'Farmer Solutions',
    title: 'Everything a farmer needs to grow, sell, and get paid reliably',
    subtitle: 'Real-time monitoring, verified identity, direct buyer access, and escrow-protected payments — all in one accessible platform.',
    sections: [
      { icon: <Radio className="w-6 h-6" />, title: 'IoT Farm Monitoring', desc: 'Monitor soil moisture, temperature, humidity, pH, NPK, and 12+ sensor types in real time with historical charts and threshold alerts.', points: ['17 sensor types supported', 'Real-time and historical charts', 'Threshold-based alert rules', 'Sensor confidence scoring'] },
      { icon: <ShieldCheck className="w-6 h-6" />, title: 'Identity & KCC Verification', desc: 'Complete sandbox Aadhaar and Kisan Credit Card verification. Build trust with buyers through verified farmer status.', points: ['Sandbox Aadhaar verification', 'KCC status verification', 'Farm ownership verification', 'Verification badge on listings'] },
      { icon: <Store className="w-6 h-6" />, title: 'Direct Marketplace Access', desc: 'List your produce with sensor-backed data. Receive offers directly from verified buyers — no middleman commissions.', points: ['Sensor-supported crop listings', 'Buyer offer negotiation', 'Quality grade certification', 'Saved searches and listings'] },
      { icon: <FileText className="w-6 h-6" />, title: 'Enforceable Trade Agreements', desc: 'Create guided agreements with clear quality conditions, delivery terms, milestone payments, and escrow protection.', points: '14-state agreement lifecycle with visual timeline' },
      { icon: <Wallet className="w-6 h-6" />, title: 'Escrow-Protected Payments', desc: 'Buyers fund escrow before delivery. Payment releases only after multi-source verification — no more delayed or missing payments.', points: ['Escrow funded before delivery', 'Milestone-based payment release', 'On-chain transaction proof', 'Refund and penalty handling'] },
      { icon: <Smartphone className="w-6 h-6" />, title: 'Offline & Low-Bandwidth Mode', desc: 'PWA with IndexedDB caching. Draft listings, view cached farm data, and queue uploads for when connectivity returns.', points: ['Offline dashboard access', 'Draft listings and agreements offline', 'Automatic sync on reconnect', 'Low-bandwidth text-first mode'] },
    ],
    cta: { label: 'Register as a Farmer', path: '/register' },
  },
  buyerSolutions: {
    badge: 'Buyer Solutions',
    title: 'Source verified produce with confidence and payment protection',
    subtitle: 'Access sensor-backed crop data, enforceable agreements, escrow protection, and field verifier inspections — all in one platform.',
    sections: [
      { icon: <Store className="w-6 h-6" />, title: 'Verified Supplier Marketplace', desc: 'Search and filter produce listings by crop, state, quality grade, price range, and verification status. Access sensor-supported crop data.', points: ['Filter by verification status', 'Sensor-backed crop data', 'Quality grade filtering', 'Saved searches and listings'] },
      { icon: <ShieldCheck className="w-6 h-6" />, title: 'Verified Farmer Identities', desc: 'Every farmer is identity-verified with sandbox Aadhaar and KCC checks. View verification status, farm details, and data reliability scores.', points: ['Identity-verified farmers only', 'Farm data reliability scores', 'KCC status visibility', 'Previous transaction history'] },
      { icon: <FileText className="w-6 h-6" />, title: 'Enforceable Agreements', desc: 'Build trade agreements with quality conditions, inspection requirements, delivery timelines, and penalty terms. Agreement hash recorded on-chain.', points: ['Guided agreement builder', '14-state lifecycle tracking', 'Milestone-based payments', 'On-chain agreement hash'] },
      { icon: <Wallet className="w-6 h-6" />, title: 'Escrow Payment Protection', desc: 'Your payment is held in escrow until delivery is confirmed and inspected. Release only after multi-source verification.', points: ['Escrow funds held securely', 'Release after delivery confirmation', 'Refund for non-delivery', 'Penalty enforcement for quality breaches'] },
      { icon: <Eye className="w-6 h-6" />, title: 'Field Verifier Inspections', desc: 'Independent agricultural officers inspect crops and deliveries with geo-tagged evidence, checklists, and digital signatures.', points: ['Crop inspection before delivery', 'Delivery inspection with photos', 'Geo-tagged evidence', 'Digital verifier signatures'] },
      { icon: <BarChart3 className="w-6 h-6" />, title: 'Supplier Performance Analytics', desc: 'Track supplier performance ratings, delivery history, quality consistency, and payment records across all transactions.', points: ['Supplier rating system', 'Transaction history', 'Quality consistency tracking', 'Delivery performance metrics'] },
    ],
    cta: { label: 'Register as a Buyer', path: '/register' },
  },
  iotMonitoring: {
    badge: 'IoT Monitoring',
    title: 'Real-time farm monitoring with 17 sensor types and confidence scoring',
    subtitle: 'Every sensor reading carries a device signature, firmware version, and confidence score. Anomaly detection and tamper alerts protect data integrity.',
    sections: [
      { icon: <Radio className="w-6 h-6" />, title: 'Supported Sensor Types', desc: 'Comprehensive sensor coverage for all critical farm parameters.', points: ['Soil moisture & temperature', 'Air temperature & humidity', 'Rainfall & water tank level', 'Soil pH & electrical conductivity', 'Nitrogen, Phosphorus, Potassium', 'Light intensity & leaf wetness', 'Irrigation flow & pump status', 'Device battery & connectivity'] },
      { icon: <Activity className="w-6 h-6" />, title: 'Real-time & Historical Charts', desc: 'View live sensor data and historical trends with custom date ranges, sensor comparison, and farm-zone comparison.', points: ['Real-time WebSocket updates', 'Historical charts with date ranges', 'Multi-sensor comparison views', 'Farm-zone comparison', 'CSV export and downloadable reports'] },
      { icon: <ShieldAlert className="w-6 h-6" />, title: 'Alert System', desc: 'Configurable threshold alerts for critical farm conditions with multi-channel notification.', points: ['Low soil moisture alerts', 'Extreme heat warnings', 'Water shortage notifications', 'Device offline detection', 'Sensor anomaly flagging', 'Pump failure alerts', 'Low battery warnings', 'Contract condition breaches'] },
      { icon: <MapPin className="w-6 h-6" />, title: 'Farm Map & Sensor Locations', desc: 'Interactive farm map showing sensor locations, device status, and zone boundaries.', points: 'Interactive Leaflet map with device markers' },
      { icon: <Cpu className="w-6 h-6" />, title: 'Device Management', desc: 'Register, calibrate, and monitor devices with firmware tracking and connectivity health.', points: ['Device registration workflow', 'Calibration records', 'Firmware version tracking', 'Last-seen monitoring', 'Sensor confidence scores'] },
      { icon: <Zap className="w-6 h-6" />, title: 'IoT Simulator', desc: 'Built-in simulator generates realistic sensor data for development and demo purposes via MQTT topics.', points: ['farms/{farmId}/devices/{deviceId}/telemetry', 'farms/{farmId}/devices/{deviceId}/status', 'farms/{farmId}/devices/{deviceId}/commands', 'Schema-validated payloads'] },
    ],
    cta: { label: 'Explore the Platform', path: '/login' },
  },
  securePayments: {
    badge: 'Secure Payments',
    title: 'Hybrid escrow architecture — testnet for dev, regulated providers for production',
    subtitle: 'Blockchain is used only where immutability, agreement records, escrow state, and transaction auditability provide practical value.',
    sections: [
      { icon: <Wallet className="w-6 h-6" />, title: 'Development Mode (Sandbox)', desc: 'Polygon Amoy testnet with mock ERC-20 payment tokens and faucet-based test balances. All balances clearly labeled as test funds.', points: ['Polygon Amoy testnet', 'Mock ERC-20 payment token', 'Faucet-based test balances', 'No real financial value'] },
      { icon: <Lock className="w-6 h-6" />, title: 'Production Architecture', desc: 'Regulated Indian payment providers with UPI and bank transfer integrations. Compliant escrow or nodal-account providers.', points: ['UPI integration', 'Bank transfer support', 'Compliant escrow provider', 'Provider webhook updates', 'Transaction proof on-chain', 'No claim that tokens = real rupees'] },
      { icon: <FileText className="w-6 h-6" />, title: 'Payment Types', desc: 'Complete payment lifecycle support with on-chain and off-chain tracking.', points: ['Escrow funding', 'Advance payment', 'Milestone release', 'Full payment release', 'Refund processing', 'Penalty deduction', 'Failed payment handling', 'Payment receipts'] },
      { icon: <ShieldCheck className="w-6 h-6" />, title: 'Release Rules', desc: 'Payment never releases from a single unverified sensor reading. Configurable multi-source verification required.', points: ['Verified delivery confirmation', 'Buyer approval required', 'Field verifier approval', 'Multiple trusted data sources', 'Inspection report validation', 'Time-based dispute window'] },
      { icon: <Database className="w-6 h-6" />, title: 'On-Chain Records', desc: 'Only agreement hashes, document hashes, transaction state, timestamps, and payment events are stored on-chain. No personal data.', points: ['Agreement hash', 'Document hash', 'Transaction state', 'Timestamps', 'Payment events', 'Verification attestations'] },
      { icon: <Scale className="w-6 h-6" />, title: 'Smart Contract Features', desc: 'OpenZeppelin-powered contracts with access control, pausable, reentrancy guard, and safe ERC-20 operations.', points: ['AccessControl role-based permissions', 'Pausable emergency stop', 'ReentrancyGuard protection', 'SafeERC20 token operations', 'Milestone-based payment release', 'Dispute state management'] },
    ],
    cta: { label: 'Explore the Platform', path: '/login' },
  },
  identityVerification: {
    badge: 'Identity Verification',
    title: 'Multi-layered verification with sandbox and production paths',
    subtitle: 'Verify farmer identity, buyer identity, business registration, bank accounts, KCC status, and farm ownership — with privacy-first data handling.',
    sections: [
      { icon: <ShieldCheck className="w-6 h-6" />, title: 'Sandbox Verification (Development)', desc: 'Mock verification flows clearly labeled as sandbox data. Never claims responses from UIDAI, banks, or government platforms.', points: ['Mock Aadhaar verification', 'Mock KCC verification', 'Clearly labeled sandbox data', 'No real identity data stored'] },
      { icon: <Lock className="w-6 h-6" />, title: 'Production Integration Path', desc: 'Support for authorized UIDAI-compatible verification providers and DigiLocker-based document retrieval.', points: ['UIDAI-compatible provider support', 'DigiLocker document retrieval', 'Authorized banking APIs', 'Government API integration'] },
      { icon: <Eye className="w-6 h-6" />, title: 'Privacy & Data Protection', desc: 'Only verification tokens and status are stored. Sensitive identity information is masked and encrypted.', points: ['No complete Aadhaar numbers stored', 'Masked sensitive identity information', 'Encrypted sensitive data fields', 'Consent records maintained', 'Data retention controls'] },
      { icon: <BadgeCheck className="w-6 h-6" />, title: 'Verification Types', desc: 'Comprehensive verification coverage for all platform participants.', points: ['Farmer identity verification', 'Buyer identity verification', 'Business registration verification', 'Bank account verification', 'KCC status verification', 'Farm ownership / cultivation rights', 'Field verifier approval'] },
    ],
    cta: { label: 'Register Now', path: '/register' },
  },
  trustValidation: {
    badge: 'Trust & Data Validation',
    title: '17-layer data trust system preventing oracle manipulation',
    subtitle: 'Every sensor record includes device ID, farm ID, sensor type, value, unit, timestamp, signature, firmware version, signal strength, battery, confidence score, and validation status.',
    sections: [
      { icon: <BadgeCheck className="w-6 h-6" />, title: 'Device Trust Layer', desc: 'Certified devices with unique identities, cryptographic certificates, and signed messages.', points: ['Device identity verification', 'Signed sensor messages', 'Device certificate validation', 'Secure device registration'] },
      { icon: <Activity className="w-6 h-6" />, title: 'Data Validation Layer', desc: 'Multi-source cross-validation prevents false or manipulated data from triggering contract execution.', points: ['Timestamp validation', 'Duplicate-data detection', 'Sensor calibration records', 'Tamper alerts', 'Multi-sensor comparison', 'Weather-data comparison', 'Satellite-data integration architecture'] },
      { icon: <Users className="w-6 h-6" />, title: 'Human Verification Layer', desc: 'Field verifier attestations, farmer-submitted evidence, and buyer inspection evidence provide human-grounded trust.', points: ['Field verifier attestations', 'Farmer-submitted evidence', 'Buyer inspection evidence', 'Digital signatures'] },
      { icon: <Cpu className="w-6 h-6" />, title: 'Anomaly Detection & Scoring', desc: 'Statistical anomaly detection and weighted confidence scoring produce a farm-level data reliability score.', points: ['Anomaly detection algorithms', 'Data confidence scoring', 'Farm data reliability calculation', 'Historical anomaly tracking', 'Data completeness metrics'] },
      { icon: <Scale className="w-6 h-6" />, title: 'Reliability Score Components', desc: 'The farm data reliability score considers device verification, signature validity, sensor consistency, calibration status, and more.', points: ['Device verification status', 'Signature validity', 'Sensor consistency', 'Calibration status', 'Historical anomalies', 'Weather comparison', 'Third-party verification', 'Data completeness', 'Device uptime', 'Manual evidence'] },
      { icon: <Lock className="w-6 h-6" />, title: 'Payment Release Rules', desc: 'Configurable rules ensure no smart contract releases payment based on a single unverified sensor reading.', points: ['Verified delivery confirmation required', 'Buyer approval required', 'Field verifier approval required', 'Multiple trusted data sources', 'Inspection report validation', 'Time-based dispute window'] },
    ],
    cta: { label: 'Explore the Platform', path: '/login' },
  },
  languages: {
    badge: 'Multilingual Access',
    title: '12 Indian languages with full interface translation',
    subtitle: 'Language selector during onboarding, persistent preferences, locale-aware dates and numbers, and layouts designed for longer translated text.',
    sections: [
      { icon: <Globe className="w-6 h-6" />, title: 'Supported Languages', desc: 'Complete translation for navigation, forms, validation errors, notifications, and dashboard labels.', points: ['English', 'हिन्दी (Hindi)', 'বাংলা (Bengali)', 'తెలుగు (Telugu)', 'मराठी (Marathi)', 'தமிழ் (Tamil)', 'ગુજરાતી (Gujarati)', 'ಕನ್ನಡ (Kannada)', 'മലയാളം (Malayalam)', 'ਪੰਜਾਬੀ (Punjabi)', 'ଓଡ଼ିଆ (Odia)', 'অসমীয়া (Assamese)'] },
      { icon: <CheckCircle2 className="w-6 h-6" />, title: 'Translation Scope', desc: 'Every interface element is translatable with no hardcoded text in components.', points: ['Navigation translated', 'Forms and validation errors translated', 'Notifications translated', 'Dashboard labels translated', 'Common crop and sensor terms translated', 'Locale-aware dates and numbers'] },
    ],
  },
  pricing: {
    badge: 'Pricing',
    title: 'Simple, transparent pricing for every type of user',
    subtitle: 'Start free in the sandbox. Scale with tiered plans designed for individual farmers, cooperatives, and enterprise buyers.',
    sections: [
      { icon: <Sprout className="w-6 h-6" />, title: 'Farmer Free', desc: 'Always free for individual farmers.', points: ['IoT dashboard access', 'Marketplace listings (up to 10)', 'Agreement creation', 'Identity verification (sandbox)', '1 farm location', 'Community support'] },
      { icon: <TrendingUp className="w-6 h-6" />, title: 'Farmer Pro', desc: '₹499/month per farm cluster.', points: ['Unlimited marketplace listings', 'Unlimited farm locations', 'Advanced sensor analytics', 'Priority verification queue', 'Weather forecast integration', 'Email & WhatsApp support'] },
      { icon: <Store className="w-6 h-6" />, title: 'Buyer Standard', desc: '₹2,999/month per buyer account.', points: ['Unlimited marketplace search', 'Unlimited offers & agreements', 'Supplier performance analytics', 'Field verifier requests', 'Export reports (PDF & CSV)', 'Priority support'] },
      { icon: <BarChart3 className="w-6 h-6" />, title: 'Enterprise', desc: 'Custom pricing for cooperatives and large buyers.', points: ['Multi-user accounts', 'API access', 'Custom integrations', 'Dedicated account manager', 'SLA guarantees', 'On-premise deployment options'] },
    ],
    cta: { label: 'Get Started Free', path: '/register' },
  },
  about: {
    badge: 'About AgriSmart',
    title: 'Building credible agricultural trust infrastructure for India',
    subtitle: 'AgriSmart combines IoT monitoring, verified identities, blockchain-backed agreements, and escrow payments into one accessible platform.',
    sections: [
      { icon: <Sprout className="w-6 h-6" />, title: 'Our Mission', desc: 'Reduce risk in agricultural trade by providing verification, accountability, transparent agreements, and reliable payments to every Indian farmer and buyer.' },
      { icon: <Scale className="w-6 h-6" />, title: 'Why Blockchain?', desc: 'We use blockchain only where it provides practical value: immutable agreement records, escrow state management, and transaction auditability. Not as a marketing gimmick.' },
      { icon: <Eye className="w-6 h-6" />, title: 'Why Oracle-Risk Mitigation?', desc: 'False or manipulated farm data can trigger undeserved payments. Our 17-layer trust system ensures no payment releases from a single unverified reading.' },
      { icon: <Smartphone className="w-6 h-6" />, title: 'Why Offline-First?', desc: 'Rural India has unreliable connectivity. Our PWA with IndexedDB caching lets farmers work offline and sync when connectivity returns.' },
      { icon: <Globe className="w-6 h-6" />, title: 'Why 12 Languages?', desc: 'India speaks many languages. Accessibility means meeting farmers in their language, not forcing them into English.' },
      { icon: <ShieldCheck className="w-6 h-6" />, title: 'Sandbox Disclaimer', desc: 'This is a development sandbox. Identity verification, KCC checks, and payment integrations use mock data. No real financial or government service connections exist in this demo.' },
    ],
    cta: { label: 'Get Started', path: '/register' },
  },
  contact: {
    badge: 'Contact Us',
    title: 'Get in touch with the AgriSmart team',
    subtitle: 'Questions about the platform, partnerships, or enterprise deployments? We are here to help.',
    sections: [
      { icon: <Mail className="w-6 h-6" />, title: 'Email', desc: 'hello@agrismart.demo — General inquiries and support.' },
      { icon: <Phone className="w-6 h-6" />, title: 'Phone', desc: '+91-70000-00001 — Mon–Fri, 9 AM – 6 PM IST.' },
      { icon: <LocationIcon className="w-6 h-6" />, title: 'Office', desc: 'AgriSmart Sandbox Demo — Bengaluru, Karnataka, India.' },
    ],
  },
};

export function GenericPage({ page }: { page: string }) {
  const content = pageContents[page];
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [contactError, setContactError] = useState('');
  const [contactSent, setContactSent] = useState(false);

  const submitContact = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setContactSent(false);
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.subject.trim() || !contactForm.message.trim()) {
      setContactError('Complete all fields before sending the demo message.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(contactForm.email)) {
      setContactError('Enter a valid email address.');
      return;
    }
    setContactError('');
    setContactSent(true);
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  if (!content) {
    return (
      <div className="section py-20 text-center">
        <h1 className="text-2xl font-bold text-brand-text">Page not found</h1>
        <ButtonLink to="/" className="mt-4 inline-block">Back to Home</ButtonLink>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-soft to-brand-cream py-12 sm:py-16">
        <div className="section text-center max-w-3xl mx-auto">
          <Badge variant="primary" className="mb-3">{pageEmoji[page] || '✨'} {content.badge}</Badge>
          <h1 className="text-2xl sm:text-4xl font-bold text-brand-text mb-3 text-balance">{content.title}</h1>
          <p className="text-base sm:text-lg text-brand-muted">{content.subtitle}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 sm:py-16">
        <div className="section">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {content.sections.map((s, i) => (
              <motion.div key={s.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}>
                <Card className={cn('group h-full border-t-4 p-6', sectionAccents[i % sectionAccents.length].split(' ')[0])}>
                  <div className={cn('mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-200 group-hover:rotate-3', sectionAccents[i % sectionAccents.length].split(' ').slice(1).join(' '))}>{s.icon}</div>
                  <h3 className="text-base font-semibold text-brand-text mb-2">{s.title}</h3>
                  <p className="text-sm text-brand-muted mb-3 leading-relaxed">{s.desc}</p>
                  {Array.isArray(s.points) && (
                    <ul className="space-y-1.5">
                      {s.points.map(p => (
                        <li key={p} className="flex items-start gap-2 text-xs text-brand-text">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-success shrink-0 mt-0.5" /> {p}
                        </li>
                      ))}
                    </ul>
                  )}
                  {typeof s.points === 'string' && (
                    <p className="text-xs text-brand-muted italic">{s.points}</p>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Contact form for contact page */}
          {page === 'contact' && (
            <Card className="mt-8 p-5 sm:p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-bold text-brand-text">Send us a message</h3>
              <p className="mt-1 mb-5 text-sm text-brand-muted">Use this form to test validation and success states. The sandbox does not send email.</p>
              <form className="space-y-4" onSubmit={submitContact} noValidate>
                {contactError && <AlertBanner type="error" title="Message not ready" message={contactError} onClose={() => setContactError('')} />}
                {contactSent && <AlertBanner type="success" title="Demo message captured" message="The form completed successfully in this browser. No external message was sent." onClose={() => setContactSent(false)} />}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Input label="Your Name" placeholder="Enter your name" autoComplete="name" value={contactForm.name} onChange={event => setContactForm(current => ({ ...current, name: event.target.value }))} />
                  <Input label="Email" type="email" placeholder="you@example.com" autoComplete="email" value={contactForm.email} onChange={event => setContactForm(current => ({ ...current, email: event.target.value }))} />
                </div>
                <Input label="Subject" placeholder="How can we help?" value={contactForm.subject} onChange={event => setContactForm(current => ({ ...current, subject: event.target.value }))} />
                <Textarea label="Message" className="min-h-[120px]" placeholder="Tell us more…" value={contactForm.message} onChange={event => setContactForm(current => ({ ...current, message: event.target.value }))} />
                <Button type="submit" className="w-full">Send Demo Message</Button>
                <p className="text-xs text-brand-muted text-center">Sandbox only. Connect an email or support API for production delivery.</p>
              </form>
            </Card>
          )}

          {content.cta && (
            <div className="text-center mt-10">
              <ButtonLink to={content.cta.path} size="lg" icon={<ArrowRight className="w-5 h-5" />}>{content.cta.label}</ButtonLink>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
