// ============================================================
// AgriSmart — Homepage with Hero, Dashboard Preview & Sections
// ============================================================
import { Sparkline } from '@/components/charts';
import { Badge,ButtonLink,Card,ProgressBar,VerificationBadge } from '@/components/ui';
import { translate } from '@/i18n';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store';
import { motion } from 'framer-motion';
import {
ArrowRight,
BadgeCheck,
BarChart3,
CheckCircle2,
CloudRain,
Database,
Eye,
FileText,
Globe,
Layers,
Lock,
Radio,
Scale,
ShieldAlert,
ShieldCheck,
Sprout,
Users,
Wallet,
Zap
} from 'lucide-react';
import { useEffect,useMemo,useState } from 'react';
import { Link } from 'react-router-dom';

export function HomePage() {
  const { locale, lowBandwidth, reducedMotion } = useAppStore();
  const t = (k: string) => translate(k, locale);

  // Live dashboard preview data
  const [previewData, setPreviewData] = useState({
    soilMoisture: 42.3, temperature: 31.5, humidity: 65.2, waterLevel: 78,
  });

  useEffect(() => {
    if (reducedMotion) return undefined;

    const interval = window.setInterval(() => {
      setPreviewData({
        soilMoisture: parseFloat((38 + Math.random() * 12).toFixed(1)),
        temperature: parseFloat((28 + Math.random() * 8).toFixed(1)),
        humidity: parseFloat((55 + Math.random() * 20).toFixed(1)),
        waterLevel: Math.round(70 + Math.random() * 25),
      });
    }, lowBandwidth ? 9000 : 3000);

    return () => window.clearInterval(interval);
  }, [lowBandwidth, reducedMotion]);

  const sparkData = useMemo(() => Array.from({ length: 20 }, (_, i) => 37 + Math.sin(i / 3) * 8 + ((i * 7) % 5)), []);

  const trustProblems = [
    { icon: <ShieldAlert className="w-5 h-5" />, title: 'Unverified Farm Data', desc: 'Buyers cannot trust sensor readings without device identity, signatures, and cross-validation.' },
    { icon: <FileText className="w-5 h-5" />, title: 'Unenforceable Agreements', desc: 'Verbal or paper contracts lead to disputes over quality, delivery, and payment terms.' },
    { icon: <Wallet className="w-5 h-5" />, title: 'Payment Failures', desc: 'Farmers face delayed or missing payments after delivering produce.' },
    { icon: <Eye className="w-5 h-5" />, title: 'No Transparency', desc: 'Neither party has a shared, auditable record of agreements and conditions.' },
  ];

  const workflow = [
    { step: '01', title: 'Register & Verify', desc: 'Farmers and buyers complete identity verification with sandbox Aadhaar and KCC checks.', icon: <ShieldCheck className="w-6 h-6" /> },
    { step: '02', title: 'Connect IoT Sensors', desc: 'Deploy certified devices to stream signed, real-time soil and weather data.', icon: <Radio className="w-6 h-6" /> },
    { step: '03', title: 'List & Negotiate', desc: 'Farmers list produce with sensor-backed data. Buyers submit offers and negotiate terms.', icon: <Store className="w-5 h-5" /> },
    { step: '04', title: 'Create Agreement', desc: 'Build a guided trade agreement with quality conditions, milestones, and escrow terms.', icon: <FileText className="w-6 h-6" /> },
    { step: '05', title: 'Fund Escrow', desc: 'Buyer funds escrow on Polygon testnet or via regulated payment provider.', icon: <Wallet className="w-6 h-6" /> },
    { step: '06', title: 'Inspect & Deliver', desc: 'Field verifier inspects crop. Delivery confirmed with geo-tagged evidence.', icon: <CheckCircle2 className="w-6 h-6" /> },
    { step: '07', title: 'Release Payment', desc: 'Multi-source verification triggers escrow release. No single unverified reading.', icon: <Zap className="w-6 h-6" /> },
  ];

  const features = [
    { icon: <Radio className="w-6 h-6" />, title: t('nav.iotMonitoring'), desc: 'Real-time soil moisture, temperature, humidity, pH, NPK, and 12+ sensor types with confidence scoring.', path: '/iot-monitoring' },
    { icon: <ShieldCheck className="w-6 h-6" />, title: t('nav.identityVerification'), desc: 'Sandbox Aadhaar & KCC verification, farm ownership checks, and field verifier attestations.', path: '/identity-verification' },
    { icon: <FileText className="w-6 h-6" />, title: 'Secure Agreements', desc: 'Guided agreement builder with 14-state lifecycle, milestones, and on-chain agreement hashes.', path: '/how-it-works' },
    { icon: <Wallet className="w-6 h-6" />, title: t('nav.securePayments'), desc: 'Hybrid escrow architecture — Polygon testnet for dev, regulated UPI/bank providers for production.', path: '/secure-payments' },
    { icon: <Scale className="w-6 h-6" />, title: t('nav.trustValidation'), desc: '17-layer data trust system preventing oracle manipulation and false sensor readings.', path: '/trust-validation' },
    { icon: <Globe className="w-6 h-6" />, title: t('nav.languages'), desc: '12 Indian languages with locale-aware dates, numbers, and agricultural terminology.', path: '/languages' },
  ];

  const metrics = [
    { label: 'Demo Farmers', value: '10', icon: <Sprout className="w-4 h-4" /> },
    { label: 'IoT Devices', value: '40', icon: <Radio className="w-4 h-4" /> },
    { label: 'Active Contracts', value: '8', icon: <FileText className="w-4 h-4" /> },
    { label: 'Languages', value: '12', icon: <Globe className="w-4 h-4" /> },
  ];

  const buyerBenefits = [
    'Access to sensor-verified crop data before purchase',
    'Enforceable agreements with milestone-based payments',
    'Escrow protection against non-delivery or quality issues',
    'Field verifier inspections for quality assurance',
    'Supplier performance ratings and transaction history',
    'Multi-sensor cross-validation to prevent data fraud',
  ];

  const farmerBenefits = [
    'Real-time farm monitoring with 17+ sensor types',
    'Guaranteed payment through escrow protection',
    'Direct buyer access — no middleman commissions',
    'KCC verification for credit access',
    'Offline-capable PWA for low-connectivity areas',
    'Multilingual interface in your preferred language',
  ];

  return (
    <div className="animate-fade-in">
      {/* ════════════════ HERO ════════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-soft via-brand-cream to-brand-soft pt-12 pb-16 sm:pt-16 sm:pb-20">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cpath d=%22M30 5 L55 55 L5 55 Z%22 fill=%22%23176B47%22/%3E%3C/svg%3E")', backgroundSize: '80px 80px' }} />
        <div className="section relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Copy */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge variant="primary" icon={<Sprout className="w-3 h-3" />} className="mb-4">Smart Farming · Trust Infrastructure</Badge>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-brand-text leading-tight text-balance mb-4">
                {t('hero.headline')}
              </h1>
              <p className="text-base sm:text-lg text-brand-muted leading-relaxed mb-6 max-w-xl">
                {t('hero.subhead')}
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <ButtonLink to="/register" size="lg" icon={<Sprout className="w-5 h-5" />}>{t('hero.ctaPrimary')}</ButtonLink>
                <ButtonLink to="/how-it-works" variant="outline" size="lg" icon={<ArrowRight className="w-5 h-5" />}>{t('hero.ctaSecondary')}</ButtonLink>
              </div>
              {/* Quick metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
                {metrics.map(m => (
                  <div key={m.label} className="text-center">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-primary/10 text-brand-primary mx-auto mb-1">{m.icon}</div>
                    <p className="text-lg font-bold text-brand-text">{m.value}</p>
                    <p className="text-[10px] text-brand-muted">{m.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right: Dashboard Preview */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.15 }} className="relative">
              <Card className="p-5 shadow-lift overflow-hidden">
                {/* Preview header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-primary text-white flex items-center justify-center text-sm font-bold">R</div>
                    <div>
                      <p className="text-sm font-semibold text-brand-text">Rajesh Patel</p>
                      <div className="flex items-center gap-1"><VerificationBadge status="verified" /></div>
                    </div>
                  </div>
                  <Badge variant="success" icon={<span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />}>Live</Badge>
                </div>

                {/* Sensor grid */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: 'Soil Moisture', value: previewData.soilMoisture, unit: '%', icon: '💧', color: 'text-brand-sky' },
                    { label: 'Temperature', value: previewData.temperature, unit: '°C', icon: '🌡️', color: 'text-brand-saffron' },
                    { label: 'Humidity', value: previewData.humidity, unit: '%', icon: '🌫️', color: 'text-brand-primary' },
                    { label: 'Water Level', value: previewData.waterLevel, unit: '%', icon: '🚰', color: 'text-brand-sky' },
                  ].map(s => (
                    <div key={s.label} className="rounded-lg border border-brand-border p-3 bg-brand-cream/50">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-brand-muted">{s.label}</span>
                        <span className="text-base">{s.icon}</span>
                      </div>
                      <motion.p key={s.value} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className={cn('text-lg font-bold tabular-nums', s.color)}>
                        {s.value}<span className="text-xs font-normal text-brand-muted ml-0.5">{s.unit}</span>
                      </motion.p>
                    </div>
                  ))}
                </div>

                {/* Sparkline */}
                <div className="rounded-lg border border-brand-border p-3 bg-brand-cream/50 mb-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-brand-text">Soil Moisture — 7 Day Trend</span>
                    <Badge variant="success" className="text-[10px]">↑ 3.2%</Badge>
                  </div>
                  <Sparkline data={sparkData} color="#124C35" height={50} />
                </div>

                {/* Active agreement + payment */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-brand-border p-3 bg-brand-cream/50">
                    <div className="flex items-center gap-1.5 mb-1">
                      <FileText className="w-3.5 h-3.5 text-brand-primary" />
                      <span className="text-xs text-brand-muted">Active Agreement</span>
                    </div>
                    <p className="text-sm font-semibold text-brand-text">Wheat · 25 qt</p>
                    <p className="text-xs text-brand-muted">Anand Agro Industries</p>
                    <div className="mt-2"><ProgressBar value={60} accent="primary" className="h-1.5" /></div>
                    <p className="text-[10px] text-brand-muted mt-1">Escrow Funded · Milestone 2/4</p>
                  </div>
                  <div className="rounded-lg border border-brand-border p-3 bg-brand-cream/50">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Wallet className="w-3.5 h-3.5 text-brand-success" />
                      <span className="text-xs text-brand-muted">Payment Status</span>
                    </div>
                    <p className="text-sm font-semibold text-brand-success">₹45,000</p>
                    <p className="text-xs text-brand-muted">Escrow held (on-chain)</p>
                    <Badge variant="info" className="mt-2 text-[10px]">Polygon Amoy</Badge>
                  </div>
                </div>
              </Card>
              {/* Floating badge */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="absolute -bottom-3 -left-3 hidden sm:block">
                <Card className="px-3 py-2 shadow-lift flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-brand-success" />
                  <span className="text-xs font-medium text-brand-text">Data reliability: 87/100</span>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════ TRUST PROBLEMS ════════════════ */}
      <section className="py-16 sm:py-20">
        <div className="section">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="error" className="mb-3">The Problem</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-text mb-3">Why agricultural trade breaks down</h2>
            <p className="text-brand-muted">Without verification, enforceable agreements, and reliable payments, both farmers and buyers face systemic risks.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {trustProblems.map((p, i) => (
              <motion.div key={p.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <Card className="p-5 h-full">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-error/10 text-brand-error mb-3">{p.icon}</div>
                  <h3 className="text-sm font-semibold text-brand-text mb-1.5">{p.title}</h3>
                  <p className="text-xs text-brand-muted leading-relaxed">{p.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ WORKFLOW ════════════════ */}
      <section className="py-16 sm:py-20 bg-brand-soft/40">
        <div className="section">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="primary" className="mb-3">Platform Workflow</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-text mb-3">From registration to payment — in 7 steps</h2>
            <p className="text-brand-muted">Every stage is designed around verification, transparency, and enforceability.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workflow.map((w, i) => (
              <motion.div key={w.step} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Card className="p-5 h-full relative overflow-hidden">
                  <span className="absolute top-2 right-3 text-3xl font-bold text-brand-primary/10">{w.step}</span>
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-brand-primary text-white mb-3">{w.icon}</div>
                  <h3 className="text-sm font-semibold text-brand-text mb-1.5">{w.title}</h3>
                  <p className="text-xs text-brand-muted leading-relaxed">{w.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FEATURES GRID ════════════════ */}
      <section className="py-16 sm:py-20">
        <div className="section">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="primary" className="mb-3">Core Features</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-text mb-3">Everything built around trust</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Link to={f.path}>
                  <Card hover className="p-5 h-full group">
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-soft text-brand-primary mb-3 group-hover:scale-110 transition-transform">{f.icon}</div>
                    <h3 className="text-base font-semibold text-brand-text mb-1.5">{f.title}</h3>
                    <p className="text-sm text-brand-muted leading-relaxed mb-3">{f.desc}</p>
                    <span className="text-xs font-medium text-brand-primary flex items-center gap-1">Learn more <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" /></span>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ IoT PREVIEW ════════════════ */}
      <section className="py-16 sm:py-20 bg-brand-dark text-white">
        <div className="section">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-white/10 text-white mb-3">IoT Monitoring</Badge>
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">17 sensor types. Real-time confidence scoring.</h2>
              <p className="text-white/70 mb-6 leading-relaxed">
                Every sensor reading carries a device signature, firmware version, signal strength, and confidence score.
                Anomalous readings trigger tamper alerts. Multi-sensor cross-validation prevents oracle manipulation.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {['Soil Moisture', 'Soil Temperature', 'Air Temperature', 'Humidity', 'Rainfall', 'Water Level', 'Soil pH', 'NPK Levels', 'EC', 'Light Intensity', 'Leaf Wetness', 'Irrigation Flow'].map(s => (
                  <div key={s} className="flex items-center gap-2 text-sm text-white/80">
                    <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0" /> {s}
                  </div>
                ))}
              </div>
              <ButtonLink to="/iot-monitoring" variant="secondary" icon={<ArrowRight className="w-4 h-4" />}>Explore IoT Dashboard</ButtonLink>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Soil Moisture', val: '42.3%', icon: '💧', color: 'bg-brand-sky/20 text-brand-sky' },
                { label: 'Air Temp', val: '31.5°C', icon: '🌡️', color: 'bg-brand-saffron/20 text-brand-saffron' },
                { label: 'Humidity', val: '65.2%', icon: '🌫️', color: 'bg-white/10 text-white' },
                { label: 'Soil pH', val: '6.8', icon: '⚗️', color: 'bg-brand-success/20 text-brand-success' },
                { label: 'Nitrogen', val: '165 kg/ha', icon: '🌱', color: 'bg-brand-primary/30 text-white' },
                { label: 'Confidence', val: '94%', icon: '✓', color: 'bg-brand-success/20 text-brand-success' },
              ].map(s => (
                <Card key={s.label} className="p-4 bg-white/5 border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-white/60">{s.label}</span>
                    <span className="text-lg">{s.icon}</span>
                  </div>
                  <p className="text-xl font-bold">{s.val}</p>
                  <div className={cn('mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px]', s.color)}>Validated</div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ ORACLE RISK ════════════════ */}
      <section className="py-16 sm:py-20">
        <div className="section">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Badge variant="warning" className="mb-3">Oracle-Risk Mitigation</Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-brand-text mb-3">No payment from a single unverified reading</h2>
            <p className="text-brand-muted">A 17-layer data trust system prevents manipulated sensor data from triggering contract execution.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { icon: <BadgeCheck className="w-5 h-5" />, title: 'Device Identity', desc: 'Certified devices with unique cryptographic keys' },
              { icon: <Lock className="w-5 h-5" />, title: 'Signed Messages', desc: 'Every reading carries a device signature' },
              { icon: <Layers className="w-5 h-5" />, title: 'Multi-Sensor Check', desc: 'Cross-validation across sensor types' },
              { icon: <CloudRain className="w-5 h-5" />, title: 'Weather Comparison', desc: 'External weather data cross-reference' },
              { icon: <Eye className="w-5 h-5" />, title: 'Anomaly Detection', desc: 'Statistical outlier flagging' },
              { icon: <Users className="w-5 h-5" />, title: 'Verifier Attestation', desc: 'Human field inspection confirmation' },
              { icon: <Database className="w-5 h-5" />, title: 'Confidence Score', desc: 'Weighted reliability score per data point' },
              { icon: <Scale className="w-5 h-5" />, title: 'Dispute Resolution', desc: 'Multi-party evidence-based resolution' },
            ].map((item, i) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                <Card className="p-4 h-full">
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-soft text-brand-primary mb-2">{item.icon}</div>
                  <h3 className="text-sm font-semibold text-brand-text mb-1">{item.title}</h3>
                  <p className="text-xs text-brand-muted">{item.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FARMER / BUYER BENEFITS ════════════════ */}
      <section className="py-16 sm:py-20 bg-brand-soft/40">
        <div className="section">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Farmer */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-primary text-white"><Sprout className="w-6 h-6" /></div>
                <div><h3 className="text-lg font-bold text-brand-text">For Farmers</h3><p className="text-sm text-brand-muted">Grow with confidence</p></div>
              </div>
              <ul className="space-y-3">
                {farmerBenefits.map(b => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-brand-text">
                    <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0 mt-0.5" /> {b}
                  </li>
                ))}
              </ul>
              <ButtonLink to="/farmer-solutions" className="mt-5" variant="secondary" icon={<ArrowRight className="w-4 h-4" />}>Farmer Solutions</ButtonLink>
            </Card>
            {/* Buyer */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-brand-saffron text-white"><Store className="w-6 h-6" /></div>
                <div><h3 className="text-lg font-bold text-brand-text">For Buyers</h3><p className="text-sm text-brand-muted">Source with trust</p></div>
              </div>
              <ul className="space-y-3">
                {buyerBenefits.map(b => (
                  <li key={b} className="flex items-start gap-2.5 text-sm text-brand-text">
                    <CheckCircle2 className="w-4 h-4 text-brand-success shrink-0 mt-0.5" /> {b}
                  </li>
                ))}
              </ul>
              <ButtonLink to="/buyer-solutions" className="mt-5" variant="secondary" icon={<ArrowRight className="w-4 h-4" />}>Buyer Solutions</ButtonLink>
            </Card>
          </div>
        </div>
      </section>

      {/* ════════════════ MULTILINGUAL ════════════════ */}
      <section className="py-16 sm:py-20">
        <div className="section text-center">
          <Badge variant="info" className="mb-3">Multilingual Access</Badge>
          <h2 className="text-2xl sm:text-3xl font-bold text-brand-text mb-3">Built for every Indian farmer</h2>
          <p className="text-brand-muted mb-8 max-w-xl mx-auto">12 languages with locale-aware dates, numbers, and agricultural terminology.</p>
          <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
            {[
              { native: 'English', name: 'English' }, { native: 'हिन्दी', name: 'Hindi' }, { native: 'বাংলা', name: 'Bengali' },
              { native: 'తెలుగు', name: 'Telugu' }, { native: 'मराठी', name: 'Marathi' }, { native: 'தமிழ்', name: 'Tamil' },
              { native: 'ગુજરાતી', name: 'Gujarati' }, { native: 'ಕನ್ನಡ', name: 'Kannada' }, { native: 'മലയാളം', name: 'Malayalam' },
              { native: 'ਪੰਜਾਬੀ', name: 'Punjabi' }, { native: 'ଓଡ଼ିଆ', name: 'Odia' }, { native: 'অসমীয়া', name: 'Assamese' },
            ].map(l => (
              <span key={l.name} className="badge-primary px-3 py-1.5 text-sm">{l.native}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════ FINAL CTA ════════════════ */}
      <section className="py-16 sm:py-20">
        <div className="section">
          <Card className="p-8 sm:p-12 bg-gradient-to-br from-brand-primary to-brand-dark text-white text-center overflow-hidden relative">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=%2240%22 height=%2240%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Ccircle cx=%2220%22 cy=%2220%22 r=%222%22 fill=%22white%22/%3E%3C/svg%3E")' }} />
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Start your trusted farming journey today</h2>
              <p className="text-white/80 mb-6 max-w-lg mx-auto">Join the sandbox demo — explore verified farms, IoT monitoring, secure agreements, and escrow payments.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <ButtonLink to="/register" variant="saffron" size="lg" icon={<Sprout className="w-5 h-5" />}>{t('hero.ctaPrimary')}</ButtonLink>
                <ButtonLink to="/login" variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white">{t('hero.ctaSecondary')}</ButtonLink>
              </div>
              <p className="text-white/50 text-xs mt-4">Sandbox demo · No real financial transactions · Polygon Amoy testnet</p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}

// Store icon used in workflow
function Store({ className }: { className?: string }) {
  return <BarChart3 className={className} />;
}
