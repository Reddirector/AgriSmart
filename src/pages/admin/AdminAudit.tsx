// AgriSmart — Admin Audit Logs
import { Badge,Button,Card,EmptyState,Input,Select,StatCard,Tabs } from '@/components/ui';
import { cn,downloadCsv,timeAgo } from '@/lib/utils';
import { motion } from 'framer-motion';
import { AlertTriangle,Download,FileText,LogIn,Radio,Search,Settings,ShieldCheck,User,Wallet } from 'lucide-react';
import { useMemo,useState,type ReactNode } from 'react';

interface AuditEntry {
  id: string;
  userId: string;
  userName: string;
  action: string;
  category: 'auth' | 'user' | 'agreement' | 'payment' | 'iot' | 'admin' | 'security';
  resource: string;
  ipAddress: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}

const auditLogs: AuditEntry[] = [
  { id: 'log-001', userId: 'u-admin-1', userName: 'Platform Administrator', action: 'Approved farmer verification', category: 'admin', resource: 'u-farmer-6', ipAddress: '10.0.1.45', timestamp: '2026-07-25T11:30:00Z', severity: 'info' },
  { id: 'log-002', userId: 'u-farmer-1', userName: 'Rajesh Patel', action: 'Login via phone OTP', category: 'auth', resource: 'session-8921', ipAddress: '103.21.45.67', timestamp: '2026-07-25T08:15:00Z', severity: 'info' },
  { id: 'log-003', userId: 'u-buyer-1', userName: 'Anand Agro Industries', action: 'Funded escrow for agreement-1', category: 'payment', resource: 'agreement-1', ipAddress: '103.21.45.92', timestamp: '2026-07-25T07:00:00Z', severity: 'info' },
  { id: 'log-004', userId: 'u-farmer-3', userName: 'Lakshmi Reddy', action: 'Created produce listing', category: 'user', resource: 'listing-15', ipAddress: '106.51.32.14', timestamp: '2026-07-24T16:45:00Z', severity: 'info' },
  { id: 'log-005', userId: 'u-verifier-1', userName: 'Dr. Meena Krishnan', action: 'Completed crop inspection', category: 'agreement', resource: 'insp-1', ipAddress: '10.0.2.33', timestamp: '2026-07-24T14:20:00Z', severity: 'info' },
  { id: 'log-006', userId: 'u-farmer-6', userName: 'Karthik Iyer', action: 'Failed OTP verification (3 attempts)', category: 'auth', resource: 'session-8841', ipAddress: '157.32.21.88', timestamp: '2026-07-24T12:00:00Z', severity: 'warning' },
  { id: 'log-007', userId: 'system', userName: 'System Monitor', action: 'Data signature failure detected on dev-006', category: 'iot', resource: 'dev-006', ipAddress: '10.0.0.1', timestamp: '2026-07-24T18:30:00Z', severity: 'critical' },
  { id: 'log-008', userId: 'u-admin-1', userName: 'Platform Administrator', action: 'Suspended user account', category: 'admin', resource: 'u-buyer-4', ipAddress: '10.0.1.45', timestamp: '2026-07-23T15:00:00Z', severity: 'warning' },
  { id: 'log-009', userId: 'u-buyer-3', userName: 'Surya Rice Mills', action: 'Raised dispute on agreement-8', category: 'agreement', resource: 'dispute-1', ipAddress: '103.21.45.77', timestamp: '2026-07-20T16:00:00Z', severity: 'warning' },
  { id: 'log-010', userId: 'u-farmer-1', userName: 'Rajesh Patel', action: 'Updated farm details', category: 'user', resource: 'farm-1', ipAddress: '103.21.45.67', timestamp: '2026-07-22T10:30:00Z', severity: 'info' },
  { id: 'log-011', userId: 'u-farmer-9', userName: 'Mahesh Yadav', action: 'Connected IoT device dev-009', category: 'iot', resource: 'dev-009', ipAddress: '106.51.32.22', timestamp: '2026-07-21T09:15:00Z', severity: 'info' },
  { id: 'log-012', userId: 'u-admin-1', userName: 'Platform Administrator', action: 'Updated platform configuration', category: 'admin', resource: 'config/alert-rules', ipAddress: '10.0.1.45', timestamp: '2026-07-20T14:00:00Z', severity: 'info' },
];

const categoryIcons: Record<string, ReactNode> = {
  auth: <LogIn className="w-4 h-4" />,
  user: <User className="w-4 h-4" />,
  agreement: <FileText className="w-4 h-4" />,
  payment: <Wallet className="w-4 h-4" />,
  iot: <Radio className="w-4 h-4" />,
  admin: <Settings className="w-4 h-4" />,
  security: <ShieldCheck className="w-4 h-4" />,
};

export function AdminAudit() {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [tab, setTab] = useState('all');

  const filtered = useMemo(() => auditLogs.filter(l => {
    if (search && !l.userName.toLowerCase().includes(search.toLowerCase()) && !l.action.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterCategory && l.category !== filterCategory) return false;
    return true;
  }), [search, filterCategory]);

  const tabLogs = tab === 'critical' ? filtered.filter(l => l.severity === 'critical') : tab === 'warning' ? filtered.filter(l => l.severity === 'warning' || l.severity === 'critical') : filtered;

  const exportLogs = () => downloadCsv(
    `agrismart-audit-${tab}.csv`,
    ['ID', 'User', 'Action', 'Category', 'Resource', 'IP address', 'Timestamp', 'Severity'],
    tabLogs.map((log) => [log.id, log.userName, log.action, log.category, log.resource, log.ipAddress, log.timestamp, log.severity]),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-brand-text">🧾 Audit Logs</h1><p className="text-sm text-brand-muted">Complete activity log for compliance and security monitoring</p></div>
        <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={exportLogs}>Export Logs</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Events" value={auditLogs.length} icon={<FileText className="w-5 h-5" />} />
        <StatCard label="Critical" value={auditLogs.filter(l => l.severity === 'critical').length} icon={<AlertTriangle className="w-5 h-5" />} accent="error" />
        <StatCard label="Warnings" value={auditLogs.filter(l => l.severity === 'warning').length} icon={<AlertTriangle className="w-5 h-5" />} accent="warning" />
        <StatCard label="Info" value={auditLogs.filter(l => l.severity === 'info').length} icon={<FileText className="w-5 h-5" />} accent="success" />
      </div>

      <Card className="p-4">
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_11rem]">
          <div className="min-w-0"><Input aria-label="Search audit logs" placeholder="Search by user or action…" icon={<Search className="w-4 h-4" />} value={search} onChange={e => setSearch(e.target.value)} /></div>
          <div className="min-w-0"><Select aria-label="Filter audit category" options={[{value:'auth',label:'Authentication'},{value:'user',label:'User Actions'},{value:'agreement',label:'Agreements'},{value:'payment',label:'Payments'},{value:'iot',label:'IoT Devices'},{value:'admin',label:'Admin Actions'}]} placeholder="All Categories" value={filterCategory} onChange={e => setFilterCategory(e.target.value)} /></div>
        </div>
      </Card>

      <Tabs tabs={[{id:'all',label:'All Events',count:filtered.length},{id:'warning',label:'Warnings & Critical',count:filtered.filter(l => l.severity === 'warning' || l.severity === 'critical').length},{id:'critical',label:'Critical Only',count:filtered.filter(l => l.severity === 'critical').length}]} active={tab} onChange={setTab} />

      <div className="space-y-2">
        {tabLogs.map((log, i) => (
          <motion.div key={log.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className={cn('p-4 border-l-4', log.severity === 'critical' ? 'border-l-brand-error' : log.severity === 'warning' ? 'border-l-brand-warning' : 'border-l-brand-border')}>
              <div className="flex items-start gap-3">
                <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', log.severity === 'critical' ? 'bg-brand-error/10 text-brand-error' : log.severity === 'warning' ? 'bg-brand-warning/10 text-brand-warning' : 'bg-brand-soft text-brand-primary')}>
                  {categoryIcons[log.category]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-medium text-brand-text">{log.action}</p>
                    <Badge variant={log.severity === 'critical' ? 'error' : log.severity === 'warning' ? 'warning' : 'muted'}>{log.severity}</Badge>
                    <Badge variant="primary">{log.category}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-brand-muted flex-wrap">
                    <span>User: {log.userName}</span>
                    <span>Resource: {log.resource}</span>
                    <span>IP: {log.ipAddress}</span>
                    <span>{timeAgo(log.timestamp)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
        {tabLogs.length === 0 && <Card><EmptyState icon={<FileText className="w-8 h-8" />} title="No audit logs found" message="Try adjusting your filters." /></Card>}
      </div>
    </div>
  );
}
