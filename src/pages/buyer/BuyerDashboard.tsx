// ============================================================
// AgriSmart — Buyer Dashboard
// ============================================================
import { ScoreGauge,SimpleBarChart,Sparkline } from '@/components/charts';
import { Badge,ButtonLink,Card,EmptyState,ProgressBar,SectionHeader,StatCard,VerificationBadge } from '@/components/ui';
import { buyerOffers,getUserData,payments,produceListings,tradeAgreements } from '@/data/seed';
import { translate } from '@/i18n';
import { useAppStore,useCurrentUser } from '@/store';
import { motion } from 'framer-motion';
import {
ArrowRight,
BarChart3,
Building2,
CheckCircle2,
FileText,
Search,
ShieldCheck,
Star,
Store,
Tag,
TrendingUp,
Users,
Wallet
} from 'lucide-react';
import { useMemo,useState } from 'react';
import { Link } from 'react-router-dom';

export function BuyerDashboard() {
  const { locale } = useAppStore();
  const user = useCurrentUser();
  const t = (k: string) => translate(k, locale);
  const data = user ? getUserData(user.id) : null;

  const [recentListings] = useState(produceListings.slice(0, 4));
  const sparkData = useMemo(() => Array.from({ length: 15 }, (_, i) => 21 + Math.sin(i / 2) * 5 + ((i * 2) % 3)), []);

  if (!data || !user) return null;

  const myOffers = buyerOffers.filter(o => o.buyerId === user.id);
  const myAgreements = tradeAgreements.filter(a => a.buyerId === user.id);
  const myPayments = payments.filter(p => myAgreements.some(a => a.id === p.agreementId));
  const activeAgreements = myAgreements.filter(a => !['completed', 'cancelled'].includes(a.state));
  const pendingOffers = myOffers.filter(o => o.status === 'pending' || o.status === 'negotiating');
  const escrowHeld = myPayments.filter(p => p.status === 'escrow_held').reduce((s, p) => s + p.amount, 0);
  const completedTrades = myAgreements.filter(a => a.state === 'completed').length;

  const supplierPerf = [
    { label: 'Rajesh P.', value: 92 },
    { label: 'Gurpreet S.', value: 88 },
    { label: 'Sunita D.', value: 85 },
    { label: 'Arun K.', value: 78 },
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
              <Badge variant="primary" icon={<Building2 className="w-3 h-3" />}>Business</Badge>
              <Badge variant="muted">{user.state}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <ButtonLink to="/buyer/marketplace" size="sm" icon={<Search className="w-4 h-4" />}>Browse Market</ButtonLink>
            <ButtonLink to="/buyer/offers" variant="outline" size="sm" icon={<Tag className="w-4 h-4" />}>My Offers</ButtonLink>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Active Offers" value={pendingOffers.length} icon={<Tag className="w-5 h-5" />} accent="saffron" />
        <StatCard label="Active Contracts" value={activeAgreements.length} icon={<FileText className="w-5 h-5" />} accent="primary" />
        <StatCard label="Escrow Held" value={`₹${escrowHeld.toLocaleString('en-IN')}`} icon={<Wallet className="w-5 h-5" />} accent="sky" />
        <StatCard label="Completed Trades" value={completedTrades} icon={<CheckCircle2 className="w-5 h-5" />} accent="success" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left: Active agreements + pending deliveries */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Active Contracts */}
          <Card className="p-5">
            <SectionHeader title="Active Contracts" icon={<FileText className="w-5 h-5" />} action={<ButtonLink to="/buyer/agreements" variant="ghost" size="sm">{t('common.viewAll')} <ArrowRight className="w-3.5 h-3.5" /></ButtonLink>} />
            <div className="space-y-3">
              {activeAgreements.slice(0, 3).map(a => (
                <Link key={a.id} to="/buyer/agreements" className="block rounded-lg border border-brand-border p-4 hover:border-brand-primary hover:bg-brand-soft/30 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-brand-text">{a.crop} · {a.quantity} {a.unit}</span>
                      <Badge variant="primary">{a.state.replace(/_/g, ' ')}</Badge>
                    </div>
                    <span className="text-sm font-bold text-brand-text">₹{a.totalValue.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="text-xs text-brand-muted mb-2">Farmer: {a.farmerName} · Delivery: {a.deliveryDate}</p>
                  <ProgressBar value={a.milestones.length ? a.milestones.filter(m => m.completed).length / a.milestones.length * 100 : 0} accent="primary" className="h-1.5" />
                  <p className="text-[10px] text-brand-muted mt-1">{a.milestones.filter(m => m.completed).length}/{a.milestones.length} milestones · Escrow: ₹{a.escrowAmount.toLocaleString('en-IN')}</p>
                </Link>
              ))}
              {activeAgreements.length === 0 && <EmptyState icon={<FileText className="w-8 h-8" />} title="No active contracts" message="Browse the marketplace and make offers to start trading." action={<ButtonLink to="/buyer/marketplace" size="sm" icon={<Store className="w-4 h-4" />}>Browse Market</ButtonLink>} />}
            </div>
          </Card>

          {/* Pending Offers */}
          <Card className="p-5">
            <SectionHeader title="Pending Offers" icon={<Tag className="w-5 h-5" />} action={<ButtonLink to="/buyer/offers" variant="ghost" size="sm">{t('common.viewAll')} <ArrowRight className="w-3.5 h-3.5" /></ButtonLink>} />
            <div className="space-y-2">
              {pendingOffers.slice(0, 3).map(o => (
                <div key={o.id} className="flex items-center justify-between p-3 rounded-lg border border-brand-border hover:bg-brand-soft/20">
                  <div>
                    <p className="text-sm font-medium text-brand-text">{o.buyerName}</p>
                    <p className="text-xs text-brand-muted">{o.quantity} quintal · {o.deliveryLocation}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-brand-primary">₹{o.offeredPrice.toLocaleString('en-IN')}</p>
                    <Badge variant="warning">{o.status}</Badge>
                  </div>
                </div>
              ))}
              {pendingOffers.length === 0 && <p className="text-sm text-brand-muted text-center py-4">No pending offers</p>}
            </div>
          </Card>

          {/* Recommended Verified Farmers */}
          <Card className="p-5">
            <SectionHeader title="Recommended Verified Farmers" icon={<Users className="w-5 h-5" />} />
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { name: 'Rajesh Patel', state: 'Gujarat', crop: 'Cotton', rating: 4.8, reliability: 87 },
                { name: 'Gurpreet Singh', state: 'Punjab', crop: 'Wheat', rating: 4.7, reliability: 92 },
                { name: 'Sunita Devi', state: 'U.P.', crop: 'Wheat', rating: 4.6, reliability: 84 },
                { name: 'Arun Kulkarni', state: 'Maharashtra', crop: 'Sugarcane', rating: 4.5, reliability: 81 },
              ].map((f, i) => (
                <Link key={i} to="/buyer/marketplace" className="flex items-center gap-3 p-3 rounded-lg border border-brand-border hover:border-brand-primary hover:bg-brand-soft/20 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-brand-soft text-brand-primary flex items-center justify-center text-sm font-bold">{f.name.charAt(0)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-brand-text truncate">{f.name}</p>
                      <VerificationBadge status="verified" />
                    </div>
                    <p className="text-xs text-brand-muted">{f.crop} · {f.state}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="flex items-center gap-0.5 text-xs"><Star className="w-3 h-3 text-brand-saffron fill-brand-saffron" />{f.rating}</div>
                    <p className="text-[10px] text-brand-muted">Data reliability: {f.reliability}/100</p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        </div>

        {/* Right: Verification, supplier performance, recent listings */}
        <div className="space-y-4 sm:space-y-6">
          {/* Business Verification */}
          <Card className="p-5 text-center">
            <SectionHeader title="Business Status" icon={<ShieldCheck className="w-5 h-5" />} />
            <ScoreGauge score={95} label="Verified" height={130} />
            <div className="mt-3 space-y-1.5 text-left">
              {[
                { label: 'Business Registration', val: 95 },
                { label: 'Bank Account', val: 90 },
                { label: 'Tax ID (GST)', val: 100 },
                { label: 'Trade History', val: 88 },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-0.5"><span className="text-brand-muted">{item.label}</span><span className="font-medium text-brand-text">{item.val}%</span></div>
                  <ProgressBar value={item.val} accent={item.val >= 90 ? 'success' : 'primary'} className="h-1" />
                </div>
              ))}
            </div>
          </Card>

          {/* Supplier Performance */}
          <Card className="p-5">
            <SectionHeader title="Supplier Performance" icon={<BarChart3 className="w-5 h-5" />} />
            <SimpleBarChart data={supplierPerf} height={160} />
          </Card>

          {/* Recent Listings */}
          <Card className="p-5">
            <SectionHeader title="Recent Listings" icon={<Store className="w-5 h-5" />} action={<ButtonLink to="/buyer/marketplace" variant="ghost" size="sm"><ArrowRight className="w-3.5 h-3.5" /></ButtonLink>} />
            <div className="space-y-2">
              {recentListings.map(l => (
                <Link key={l.id} to="/buyer/marketplace" className="block p-2.5 rounded-lg border border-brand-border hover:border-brand-primary hover:bg-brand-soft/20">
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-medium text-brand-text">{l.crop} · {l.quantity} {l.unit}</p><p className="text-xs text-brand-muted">{l.farmerName} · {l.farmerState}</p></div>
                    <div className="text-right"><p className="text-xs font-bold text-brand-primary">₹{l.minPrice}</p><VerificationBadge status={l.verified ? 'verified' : 'pending'} /></div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Sourcing Trend */}
          <Card className="p-5">
            <SectionHeader title="Sourcing Activity" icon={<TrendingUp className="w-5 h-5" />} />
            <Sparkline data={sparkData} color="#C87B25" height={50} />
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className="text-brand-muted">Last 30 days</span>
              <Badge variant="success">↑ 12% activity</Badge>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
