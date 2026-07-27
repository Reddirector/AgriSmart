// ============================================================
// AgriSmart — Farmer Dashboard
// ============================================================
import { ScoreGauge,Sparkline } from '@/components/charts';
import { Badge,ButtonLink,Card,EmptyState,ProgressBar,SectionHeader,StatCard,VerificationBadge } from '@/components/ui';
import { cropCycles,farmHealth,getUserData } from '@/data/seed';
import { translate } from '@/i18n';
import { calculateFarmDataTrustScore } from '@/lib/trustScore';
import { cn,formatDate,generateLiveReading,timeAgo } from '@/lib/utils';
import { useAppStore,useCurrentUser } from '@/store';
import { motion } from 'framer-motion';
import {
Activity,
AlertCircle,
ArrowRight,
Bell,
CheckCircle2,
ClipboardCheck,
Droplets,
FileText,
Gauge,
MapPin,
Plus,
Radio,
ShieldCheck,
Sprout,
Store,Tag,
TrendingUp,
Upload,
Wallet,
Wheat
} from 'lucide-react';
import { useEffect,useMemo,useState } from 'react';
import { Link } from 'react-router-dom';

export function FarmerDashboard() {
  const { locale, lowBandwidth, reducedMotion } = useAppStore();
  const user = useCurrentUser();
  const t = (k: string) => translate(k, locale);
  const data = user ? getUserData(user.id) : null;

  const [liveData, setLiveData] = useState({ soilMoisture: 42.3, temp: 31.5, humidity: 65.2, water: 78 });
  const sparkData = useMemo(() => Array.from({ length: 20 }, (_, i) => 35 + Math.sin(i / 3) * 8 + ((i * 7) % 5)), []);

  useEffect(() => {
    const interval = setInterval(() => {
      const sm = generateLiveReading('soil_moisture');
      const at = generateLiveReading('air_temperature');
      const hu = generateLiveReading('humidity');
      const wl = generateLiveReading('water_level');
      setLiveData({ soilMoisture: sm.value, temp: at.value, humidity: hu.value, water: wl.value });
    }, lowBandwidth ? 12_000 : reducedMotion ? 8_000 : 4_000);
    return () => clearInterval(interval);
  }, [lowBandwidth, reducedMotion]);

  if (!data || !user) return null;

  const health = farmHealth[0];
  const activeAgreements = data.agreements.filter(a => !['completed', 'cancelled'].includes(a.state));
  const pendingPayments = data.payments.filter(p => p.status === 'pending' || p.status === 'escrow_held');
  const completedPayments = data.payments.filter(p => p.status === 'released');
  const activeAlerts = data.alerts.filter(a => !a.acknowledged);
  const cycle = cropCycles[0];
  const trust = calculateFarmDataTrustScore(user, data.farms, data.devices);

  const quickActions = [
    { label: t('action.addCrop'), icon: <Wheat className="w-4 h-4" />, path: '/farmer/farms' },
    { label: t('action.addFarm'), icon: <MapPin className="w-4 h-4" />, path: '/farmer/farms' },
    { label: t('action.connectSensor'), icon: <Radio className="w-4 h-4" />, path: '/farmer/iot' },
    { label: t('action.createListing'), icon: <Store className="w-4 h-4" />, path: '/farmer/marketplace' },
    { label: t('action.reviewOffer'), icon: <Tag className="w-4 h-4" />, path: '/farmer/offers' },
    { label: t('action.createAgreement'), icon: <FileText className="w-4 h-4" />, path: '/farmer/agreements' },
    { label: t('action.uploadDocument'), icon: <Upload className="w-4 h-4" />, path: '/farmer/verification' },
    { label: t('action.requestVerification'), icon: <ShieldCheck className="w-4 h-4" />, path: '/farmer/verification' },
  ];

  const recommendedActions = [
    { text: 'Irrigate Zone A — soil moisture below threshold', priority: 'high', icon: <Droplets className="w-4 h-4" /> },
    { text: 'Review new buyer offer from Anand Agro Industries', priority: 'medium', icon: <Tag className="w-4 h-4" /> },
    { text: 'Schedule crop inspection for agreement #1', priority: 'medium', icon: <ClipboardCheck className="w-4 h-4" /> },
    { text: 'Update firmware on device dev-002', priority: 'low', icon: <Radio className="w-4 h-4" /> },
  ];


  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-brand-text">{t('dash.greeting')}, {user.name.split(' ')[0]} 👋</h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <VerificationBadge status={user.identityVerified} />
              <VerificationBadge status={user.kccStatus} />
              <Badge variant="primary" icon={<MapPin className="w-3 h-3" />}>{user.state}</Badge>
              <Badge variant="muted">{t('common.demoMode')}</Badge>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ButtonLink to="/farmer/marketplace" size="sm" icon={<Plus className="w-4 h-4" />}>{t('action.createListing')}</ButtonLink>
            <ButtonLink to="/farmer/iot" variant="outline" size="sm" icon={<Radio className="w-4 h-4" />}>{t('nav.iot')}</ButtonLink>
          </div>
        </div>
      </motion.div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label={t('dash.farmHealth')} value={health?.overallScore || 82} unit="/100" icon={<Gauge className="w-5 h-5" />} accent="success" trend={{ value: 4, positive: true }} />
        <StatCard label={t('dash.activeContracts')} value={activeAgreements.length} icon={<FileText className="w-5 h-5" />} accent="primary" />
        <StatCard label={t('dash.pendingPayments')} value={pendingPayments.length} icon={<Wallet className="w-5 h-5" />} accent="saffron" />
        <StatCard label={t('dash.activeAlerts')} value={activeAlerts.length} icon={<Bell className="w-5 h-5" />} accent="error" />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left column: Live sensors + crop cycle */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Live Farm Sensors */}
          <Card className="p-5">
            <SectionHeader title="Live Farm Sensors" subtitle="Patel Family Farm · Zone A" icon={<Activity className="w-5 h-5" />} action={<Badge variant="success" icon={<span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />}>Live</Badge>} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: t('dash.soilMoisture'), value: liveData.soilMoisture, unit: '%', icon: '💧', color: 'text-brand-sky' },
                { label: t('dash.temperature'), value: liveData.temp, unit: '°C', icon: '🌡️', color: 'text-brand-saffron' },
                { label: t('dash.humidity'), value: liveData.humidity, unit: '%', icon: '🌫️', color: 'text-brand-primary' },
                { label: t('dash.waterLevel'), value: liveData.water, unit: '%', icon: '🚰', color: 'text-brand-sky' },
              ].map(s => (
                <motion.div key={s.label} initial={{ opacity: 0.5 }} animate={{ opacity: 1 }} className="rounded-lg border border-brand-border p-3 bg-brand-cream/40">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-brand-muted">{s.label}</span>
                    <span className="text-base">{s.icon}</span>
                  </div>
                  <p className={cn('text-lg font-bold tabular-nums', s.color)}>{s.value}<span className="text-xs font-normal text-brand-muted ml-0.5">{s.unit}</span></p>
                </motion.div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-brand-border p-3 bg-brand-cream/40">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-brand-text">Soil Moisture — 7 Day Trend</span>
                <Badge variant="success" className="text-[10px]">↑ 3.2%</Badge>
              </div>
              <Sparkline data={sparkData} color="#124C35" height={50} />
            </div>
          </Card>

          {/* Current Crop Cycle */}
          <Card className="p-5">
            <SectionHeader title={t('dash.cropCycle')} icon={<Sprout className="w-5 h-5" />} action={<Badge variant="primary">{cycle?.stage}</Badge>} />
            {cycle && (
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-brand-soft text-brand-primary flex items-center justify-center text-2xl">🌾</div>
                    <div>
                      <p className="text-base font-semibold text-brand-text">{cycle.crop}</p>
                      <p className="text-sm text-brand-muted">{cycle.variety}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span className="text-brand-muted">Start Date</span><span className="font-medium text-brand-text">{formatDate(cycle.startDate)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-brand-muted">Expected Harvest</span><span className="font-medium text-brand-text">{formatDate(cycle.expectedHarvest)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-brand-muted">Area</span><span className="font-medium text-brand-text">{cycle.areaAcres} acres</span></div>
                  </div>
                </div>
                <div className="flex flex-col items-center justify-center">
                  <ScoreGauge score={cycle.healthScore} label="Health Score" height={140} />
                  <div className="mt-2 w-full">
                    <p className="text-xs text-brand-muted mb-1">Growth Progress</p>
                    <ProgressBar value={45} accent="primary" />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Active Agreements */}
          <Card className="p-5">
            <SectionHeader title={t('dash.activeContracts')} icon={<FileText className="w-5 h-5" />} action={<ButtonLink to="/farmer/agreements" variant="ghost" size="sm">{t('common.viewAll')} <ArrowRight className="w-3.5 h-3.5" /></ButtonLink>} />
            <div className="space-y-3">
              {activeAgreements.slice(0, 3).map(a => (
                <Link key={a.id} to="/farmer/agreements" className="block rounded-lg border border-brand-border p-4 hover:border-brand-primary hover:bg-brand-soft/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-brand-text">{a.crop} · {a.quantity} {a.unit}</span>
                      <Badge variant="primary">{a.state.replace(/_/g, ' ')}</Badge>
                    </div>
                    <span className="text-sm font-bold text-brand-text">₹{a.totalValue.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-xs text-brand-muted mb-2">Buyer: {a.buyerName} · Delivery: {a.deliveryDate}</p>
                  <ProgressBar value={a.milestones.length ? a.milestones.filter(m => m.completed).length / a.milestones.length * 100 : 0} accent="primary" className="h-1.5" />
                  <p className="text-[10px] text-brand-muted mt-1">{a.milestones.filter(m => m.completed).length}/{a.milestones.length} milestones completed</p>
                </Link>
              ))}
              {activeAgreements.length === 0 && <EmptyState icon={<FileText className="w-8 h-8" />} title="No active contracts" message="Create a listing to receive buyer offers." />}
            </div>
          </Card>
        </div>

        {/* Right column: Trust score, alerts, payments, actions */}
        <div className="space-y-4 sm:space-y-6">
          {/* Farm data reliability */}
          <Card className="overflow-hidden border-brand-purple/20">
            <div className="bg-gradient-to-br from-brand-purple/10 via-brand-card to-brand-sky/10 p-5">
              <SectionHeader title="Farm Data Reliability" subtitle="Stable, explainable score" icon={<ShieldCheck className="w-5 h-5" />} />
              <ScoreGauge score={trust.score} label={trust.level} height={148} />
              <p className="mx-auto max-w-sm text-sm leading-relaxed text-brand-muted">{trust.summary}</p>
              <div className="mt-3 rounded-lg border border-brand-purple/15 bg-white/65 px-3 py-2 text-left text-xs leading-relaxed text-brand-muted">
                💡 This measures the reliability of farm data. It is not a credit score or a judgment about the farmer.
              </div>
            </div>
            <div className="space-y-3 border-t border-brand-border bg-brand-card p-5 text-left">
              {trust.factors.map((factor) => (
                <div key={factor.id} className="group">
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                    <span className="flex min-w-0 items-center gap-1.5 font-medium text-brand-text" title={factor.explanation}>
                      <span aria-hidden="true">{factor.emoji}</span>
                      <span className="truncate">{factor.label}</span>
                      <span className="text-[10px] text-brand-muted">{factor.weight}%</span>
                    </span>
                    <span className="font-bold tabular-nums text-brand-text">{factor.score}/100</span>
                  </div>
                  <ProgressBar value={factor.score} accent={factor.score >= 85 ? 'success' : factor.score >= 70 ? 'sky' : 'warning'} className="h-1.5" />
                </div>
              ))}
            </div>
          </Card>

          {/* Active Alerts */}
          <Card className="p-5">
            <SectionHeader title={t('dash.activeAlerts')} icon={<Bell className="w-5 h-5" />} action={<Badge variant="error">{activeAlerts.length}</Badge>} />
            <div className="space-y-2">
              {activeAlerts.slice(0, 4).map(alert => (
                <div key={alert.id} className={cn('rounded-lg p-3 border', alert.severity === 'critical' ? 'border-brand-error/30 bg-brand-error/5' : alert.severity === 'warning' ? 'border-brand-warning/30 bg-brand-warning/5' : 'border-brand-sky/30 bg-brand-sky/5')}>
                  <div className="flex items-start gap-2">
                    <AlertCircle className={cn('w-4 h-4 shrink-0 mt-0.5', alert.severity === 'critical' ? 'text-brand-error' : 'text-brand-warning')} />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-brand-text">{alert.message.split('—')[0]}</p>
                      <p className="text-[10px] text-brand-muted mt-0.5">{timeAgo(alert.timestamp)}</p>
                    </div>
                  </div>
                </div>
              ))}
              {activeAlerts.length === 0 && <p className="text-sm text-brand-muted text-center py-4">No active alerts 🎉</p>}
              <Link to="/farmer/alerts" className="block text-center text-sm text-brand-primary font-medium mt-2 hover:underline">{t('common.viewAll')}</Link>
            </div>
          </Card>

          {/* Payment Status */}
          <Card className="p-5">
            <SectionHeader title="Payment Status" icon={<Wallet className="w-5 h-5" />} action={<ButtonLink to="/farmer/payments" variant="ghost" size="sm"><ArrowRight className="w-3.5 h-3.5" /></ButtonLink>} />
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-brand-success/5 border border-brand-success/20">
                <div><p className="text-xs text-brand-muted">{t('dash.completedPayments')}</p><p className="text-lg font-bold text-brand-success">₹{completedPayments.reduce((s, p) => s + p.amount, 0).toLocaleString('en-IN')}</p></div>
                <CheckCircle2 className="w-6 h-6 text-brand-success" />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-brand-saffron/5 border border-brand-saffron/20">
                <div><p className="text-xs text-brand-muted">{t('dash.pendingPayments')}</p><p className="text-lg font-bold text-brand-saffron">₹{pendingPayments.reduce((s, p) => s + p.amount, 0).toLocaleString('en-IN')}</p></div>
                <Wallet className="w-6 h-6 text-brand-saffron" />
              </div>
            </div>
          </Card>

          {/* Recommended Actions */}
          <Card className="p-5">
            <SectionHeader title={t('dash.recommendedActions')} icon={<TrendingUp className="w-5 h-5" />} />
            <div className="space-y-2">
              {recommendedActions.map((action, i) => (
                <div key={i} className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-brand-soft/30">
                  <div className={cn('shrink-0 mt-0.5', action.priority === 'high' ? 'text-brand-error' : action.priority === 'medium' ? 'text-brand-warning' : 'text-brand-muted')}>{action.icon}</div>
                  <p className="text-xs text-brand-text">{action.text}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-5">
            <SectionHeader title="Quick Actions" icon={<Plus className="w-5 h-5" />} />
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map(action => (
                <ButtonLink key={action.label} to={action.path} variant="outline" size="sm" className="w-full justify-start text-left" icon={action.icon}>
                  <span className="line-clamp-2">{action.label}</span>
                </ButtonLink>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
