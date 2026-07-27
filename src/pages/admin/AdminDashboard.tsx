// ============================================================
// AgriSmart — Admin Dashboard
// ============================================================
import { DonutChart,ScoreGauge,SimpleBarChart,Sparkline } from '@/components/charts';
import { Badge,ButtonLink,Card,SectionHeader,StatCard,VerificationBadge } from '@/components/ui';
import { alertEvents,devices,disputes,payments,tradeAgreements,users } from '@/data/seed';
import { cn } from '@/lib/utils';
import { useAppStore,useCurrentUser } from '@/store';
import { motion } from 'framer-motion';
import {
Activity,
AlertTriangle,
ArrowRight,Building2,
CheckCircle2,Clock,
Cpu,Database,
FileText,
Radio,
Server,
ShieldCheck,
Sprout,UserCog,
Users,
Wallet
} from 'lucide-react';
import { useEffect,useMemo,useState } from 'react';

export function AdminDashboard() {
  const { lowBandwidth, reducedMotion } = useAppStore();
  const user = useCurrentUser();
  const [systemHealth, setSystemHealth] = useState(98);
  const sparkData = useMemo(() => Array.from({ length: 20 }, (_, i) => 82 + Math.sin(i / 3) * 8 + ((i * 3) % 5)), []);

  useEffect(() => {
    const interval = window.setInterval(() => setSystemHealth(95 + Math.floor(Math.random() * 5)), lowBandwidth ? 12_000 : reducedMotion ? 8_000 : 4_000);
    return () => window.clearInterval(interval);
  }, [lowBandwidth, reducedMotion]);


  if (!user) return null;

  const farmers = users.filter(u => u.role === 'farmer');
  const buyers = users.filter(u => u.role === 'buyer');
  const verifiers = users.filter(u => u.role === 'verifier');
  const verifiedUsers = users.filter(u => u.identityVerified === 'verified');
  const pendingVerifications = users.filter(u => u.identityVerified === 'pending');
  const activeContracts = tradeAgreements.filter(a => !['completed', 'cancelled'].includes(a.state));
  const completedTrades = tradeAgreements.filter(a => a.state === 'completed');
  const escrowValue = payments.filter(p => p.status === 'escrow_held').reduce((s, p) => s + p.amount, 0);
  const onlineDevices = devices.filter(d => d.connectivity === 'online').length;
  const anomalies = alertEvents.filter(a => a.type === 'sensor_anomaly' || a.type === 'signature_failure').length;
  const fraudAlerts = 2;

  const userDistribution = [
    { name: 'Farmers', value: farmers.length },
    { name: 'Buyers', value: buyers.length },
    { name: 'Verifiers', value: verifiers.length },
    { name: 'Admins', value: 1 },
  ];

  const contractStates = [
    { label: 'Active', value: activeContracts.length },
    { label: 'Completed', value: completedTrades.length },
    { label: 'Disputed', value: disputes.length },
    { label: 'Escrow', value: tradeAgreements.filter(a => a.state === 'escrow_funded').length },
  ];


  return (
    <div className="space-y-6">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-brand-text">🧠 Admin Dashboard</h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <VerificationBadge status="verified" />
              <Badge variant="primary" icon={<UserCog className="w-3 h-3" />}>Administrator</Badge>
              <Badge variant="success" icon={<span className="w-1.5 h-1.5 rounded-full bg-brand-success animate-pulse" />}>System Operational</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <ButtonLink to="/admin/users" size="sm" icon={<Users className="w-4 h-4" />}>Manage Users</ButtonLink>
            <ButtonLink to="/admin/system" variant="outline" size="sm" icon={<Server className="w-4 h-4" />}>System Health</ButtonLink>
          </div>
        </div>
      </motion.div>

      {/* Top stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total Farmers" value={farmers.length} icon={<Sprout className="w-5 h-5" />} accent="primary" trend={{ value: 2, positive: true }} />
        <StatCard label="Total Buyers" value={buyers.length} icon={<Building2 className="w-5 h-5" />} accent="saffron" />
        <StatCard label="Active Contracts" value={activeContracts.length} icon={<FileText className="w-5 h-5" />} accent="sky" />
        <StatCard label="Escrow Value" value={`₹${escrowValue.toLocaleString('en-IN')}`} icon={<Wallet className="w-5 h-5" />} accent="success" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Connected IoT Devices" value={`${onlineDevices}/${devices.length}`} icon={<Radio className="w-5 h-5" />} accent="primary" />
        <StatCard label="Completed Trades" value={completedTrades.length} icon={<CheckCircle2 className="w-5 h-5" />} accent="success" />
        <StatCard label="Active Disputes" value={disputes.length} icon={<AlertTriangle className="w-5 h-5" />} accent="error" />
        <StatCard label="Device Anomalies" value={anomalies} icon={<Activity className="w-5 h-5" />} accent="warning" />
      </div>

      {/* Main grid */}
      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left: Charts and activity */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* System Health */}
          <Card className="p-5">
            <SectionHeader title="System Health" icon={<Server className="w-5 h-5" />} action={<Badge variant={systemHealth >= 95 ? 'success' : 'warning'}>{systemHealth}% healthy</Badge>} />
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="text-center">
                <ScoreGauge score={systemHealth} label="Overall" height={130} />
              </div>
              <div className="space-y-3">
                {[
                  { label: 'API Response Time', value: '142ms', status: 'good', icon: <Activity className="w-4 h-4" /> },
                  { label: 'Database Connections', value: '24/50', status: 'good', icon: <Database className="w-4 h-4" /> },
                  { label: 'WebSocket Connections', value: '156', status: 'good', icon: <Cpu className="w-4 h-4" /> },
                  { label: 'Queue Status', value: '3 pending', status: 'good', icon: <Clock className="w-4 h-4" /> },
                  { label: 'Storage Usage', value: '34%', status: 'good', icon: <Server className="w-4 h-4" /> },
                  { label: 'Blockchain RPC', value: 'Connected', status: 'good', icon: <CheckCircle2 className="w-4 h-4" /> },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-brand-muted">{item.icon} {item.label}</div>
                    <span className="font-medium text-brand-text">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* User Distribution */}
          <Card className="p-5">
            <SectionHeader title="User Distribution" icon={<Users className="w-5 h-5" />} action={<ButtonLink to="/admin/users" variant="ghost" size="sm">View all <ArrowRight className="w-3.5 h-3.5" /></ButtonLink>} />
            <div className="grid sm:grid-cols-2 gap-4 items-center">
              <DonutChart data={userDistribution} height={180} />
              <div className="space-y-2">
                {userDistribution.map((u, i) => (
                  <div key={u.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ background: ['#124C35', '#C87B25', '#397EAC', '#18734B'][i] }} />
                      <span className="text-sm text-brand-text">{u.name}</span>
                    </div>
                    <span className="text-sm font-bold text-brand-text">{u.value}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-brand-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-brand-muted">Pending Verifications</span>
                    <Badge variant="warning">{pendingVerifications.length}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-brand-muted">Verified Users</span>
                    <Badge variant="success">{verifiedUsers.length}</Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Contract States */}
          <Card className="p-5">
            <SectionHeader title="Contract States" icon={<FileText className="w-5 h-5" />} action={<ButtonLink to="/admin/agreements" variant="ghost" size="sm">View all <ArrowRight className="w-3.5 h-3.5" /></ButtonLink>} />
            <SimpleBarChart data={contractStates} height={180} color="#124C35" />
          </Card>

          {/* Recent Activity */}
          <Card className="p-5">
            <SectionHeader title="Recent Activity" icon={<Activity className="w-5 h-5" />} />
            <div className="space-y-2">
              {[
                { type: 'payment', text: 'Escrow funded for agreement-1 · ₹45,000', time: '2h ago', icon: <Wallet className="w-4 h-4" />, color: 'text-brand-success' },
                { type: 'alert', text: 'Sensor anomaly detected on dev-006', time: '5h ago', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-brand-error' },
                { type: 'agreement', text: 'Agreement-3 moved to inspection_pending', time: '8h ago', icon: <FileText className="w-4 h-4" />, color: 'text-brand-warning' },
                { type: 'user', text: 'New buyer registered: NorthStar Traders', time: '1d ago', icon: <Users className="w-4 h-4" />, color: 'text-brand-sky' },
                { type: 'dispute', text: 'Dispute raised on agreement-8', time: '1d ago', icon: <AlertTriangle className="w-4 h-4" />, color: 'text-brand-error' },
              ].map((act, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-brand-soft/20">
                  <span className={cn('shrink-0', act.color)}>{act.icon}</span>
                  <p className="text-sm text-brand-text flex-1 min-w-0">{act.text}</p>
                  <span className="text-xs text-brand-muted shrink-0">{act.time}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4 sm:space-y-6">
          {/* Fraud alerts */}
          <Card className="p-5">
            <SectionHeader title="Fraud Alerts" icon={<ShieldCheck className="w-5 h-5" />} action={<Badge variant="error">{fraudAlerts}</Badge>} />
            <div className="space-y-2">
              {[
                { text: 'Data signature failure on dev-006 — potential tamper', severity: 'critical', time: '5h ago' },
                { text: 'Soil pH anomaly on dev-004 — calibration drift suspected', severity: 'warning', time: '1d ago' },
              ].map((alert, i) => (
                <div key={i} className={cn('p-3 rounded-lg border', alert.severity === 'critical' ? 'border-brand-error/30 bg-brand-error/5' : 'border-brand-warning/30 bg-brand-warning/5')}>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={cn('w-4 h-4 shrink-0 mt-0.5', alert.severity === 'critical' ? 'text-brand-error' : 'text-brand-warning')} />
                    <div><p className="text-xs font-medium text-brand-text">{alert.text}</p><p className="text-[10px] text-brand-muted mt-0.5">{alert.time}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* API Usage */}
          <Card className="p-5">
            <SectionHeader title="API Usage" icon={<Activity className="w-5 h-5" />} />
            <Sparkline data={sparkData} color="#397EAC" height={50} />
            <div className="mt-2 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-brand-muted">Requests today</span><span className="font-medium text-brand-text">12,847</span></div>
              <div className="flex justify-between"><span className="text-brand-muted">Rate limit hits</span><span className="font-medium text-brand-text">23</span></div>
              <div className="flex justify-between"><span className="text-brand-muted">Avg latency</span><span className="font-medium text-brand-text">142ms</span></div>
            </div>
          </Card>

          {/* Blockchain Status */}
          <Card className="p-5">
            <SectionHeader title="Blockchain Status" icon={<Cpu className="w-5 h-5" />} />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-brand-muted">Network</span><Badge variant="info">Polygon Amoy</Badge></div>
              <div className="flex justify-between"><span className="text-brand-muted">Block height</span><span className="font-medium text-brand-text">12,847,392</span></div>
              <div className="flex justify-between"><span className="text-brand-muted">Gas price</span><span className="font-medium text-brand-text">0.002 Gwei</span></div>
              <div className="flex justify-between"><span className="text-brand-muted">Contracts deployed</span><span className="font-medium text-brand-text">6</span></div>
              <div className="flex justify-between"><span className="text-brand-muted">Indexed events</span><span className="font-medium text-brand-text">1,247</span></div>
            </div>
          </Card>

          {/* Quick links */}
          <Card className="p-5">
            <SectionHeader title="Quick Actions" icon={<ArrowRight className="w-5 h-5" />} />
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Manage Users', path: '/admin/users', icon: <Users className="w-4 h-4" /> },
                { label: 'View Disputes', path: '/admin/disputes', icon: <AlertTriangle className="w-4 h-4" /> },
                { label: 'Audit Logs', path: '/admin/audit', icon: <FileText className="w-4 h-4" /> },
                { label: 'System', path: '/admin/system', icon: <Server className="w-4 h-4" /> },
              ].map(link => (
                <ButtonLink key={link.path} to={link.path} variant="outline" size="sm" className="w-full justify-start text-left" icon={link.icon}>
                  {link.label}
                </ButtonLink>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
