// ============================================================
// AgriSmart — Farmer Payments Page
// ============================================================
import { Badge,Button,Card,EmptyState,StatCard,Tabs } from '@/components/ui';
import { getUserData } from '@/data/seed';
import { cn,downloadCsv,formatDate,truncateHash } from '@/lib/utils';
import { useCurrentUser } from '@/store';
import { motion } from 'framer-motion';
import { AlertCircle,ArrowDownToLine,ArrowUpFromLine,CheckCircle2,Clock,Download,Link2,Wallet } from 'lucide-react';
import { useState } from 'react';

export function FarmerPayments() {
  const user = useCurrentUser();
  const data = user ? getUserData(user.id) : null;
  const [tab, setTab] = useState('all');

  if (!data) return null;
  const payments = data.payments;
  const escrow = payments.filter(p => p.status === 'escrow_held');
  const released = payments.filter(p => p.status === 'released');
  const pending = payments.filter(p => p.status === 'pending');
  const failed = payments.filter(p => p.status === 'failed');

  const tabPayments = tab === 'escrow' ? escrow : tab === 'released' ? released : tab === 'pending' ? pending : tab === 'failed' ? failed : payments;

  const totalReceived = released.reduce((s, p) => s + p.amount, 0);
  const totalEscrow = escrow.reduce((s, p) => s + p.amount, 0);
  const exportPayments = () => downloadCsv(
    `agrismart-farmer-payments-${tab}.csv`,
    ['Payment ID', 'Agreement ID', 'Type', 'Status', 'Amount INR', 'Method', 'Date', 'Transaction Hash', 'Provider Reference'],
    tabPayments.map(payment => [payment.id, payment.agreementId, payment.type, payment.status, payment.amount, payment.method, payment.timestamp, payment.txHash || '', payment.providerRef || '']),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-brand-text">💳 Payments</h1><p className="text-sm text-brand-muted">Escrow, milestones, and transaction history</p></div>
        <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={exportPayments}>Export CSV</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Received" value={`₹${totalReceived.toLocaleString('en-IN')}`} icon={<CheckCircle2 className="w-5 h-5" />} accent="success" />
        <StatCard label="In Escrow" value={`₹${totalEscrow.toLocaleString('en-IN')}`} icon={<Wallet className="w-5 h-5" />} accent="saffron" />
        <StatCard label="Pending" value={pending.length} icon={<Clock className="w-5 h-5" />} accent="sky" />
        <StatCard label="Failed" value={failed.length} icon={<AlertCircle className="w-5 h-5" />} accent="error" />
      </div>

      {/* Hybrid payment notice */}
      <Card className="p-4 bg-brand-sky/5 border-brand-sky/20">
        <div className="flex items-start gap-3">
          <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brand-sky/10 text-brand-sky shrink-0"><Link2 className="w-5 h-5" /></div>
          <div>
            <p className="text-sm font-semibold text-brand-text">Hybrid Payment Architecture</p>
            <p className="text-xs text-brand-muted mt-0.5">Sandbox: Polygon Amoy testnet with mock ERC-20 tokens. Production: regulated UPI/bank transfer via compliant escrow providers. Blockchain tokens do not represent real Indian rupees.</p>
          </div>
        </div>
      </Card>

      <Tabs tabs={[
        {id:'all',label:'All',count:payments.length},
        {id:'escrow',label:'Escrow Held',count:escrow.length},
        {id:'released',label:'Released',count:released.length},
        {id:'pending',label:'Pending',count:pending.length},
      ]} active={tab} onChange={setTab} />

      <div className="space-y-3">
        {tabPayments.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', p.type === 'escrow_funding' ? 'bg-brand-sky/10 text-brand-sky' : p.type === 'final_release' || p.type === 'advance' ? 'bg-brand-success/10 text-brand-success' : p.type === 'refund' ? 'bg-brand-warning/10 text-brand-warning' : 'bg-brand-error/10 text-brand-error')}>
                    {p.type === 'refund' ? <ArrowDownToLine className="w-5 h-5" /> : <ArrowUpFromLine className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-text capitalize">{p.type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-brand-muted">Agreement: {p.agreementId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-brand-text">₹{p.amount.toLocaleString('en-IN')}</p>
                  <Badge variant={p.status === 'released' ? 'success' : p.status === 'escrow_held' ? 'info' : p.status === 'failed' ? 'error' : 'warning'}>{p.status.replace(/_/g, ' ')}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-brand-muted pt-2 border-t border-brand-border/50">
                <span>Method: <span className="font-medium text-brand-text capitalize">{p.method.replace(/_/g, ' ')}</span></span>
                <span>Date: {formatDate(p.timestamp)}</span>
                {p.txHash && <span className="font-mono">TX: {truncateHash(p.txHash)}</span>}
                {p.providerRef && <span>Ref: {p.providerRef}</span>}
              </div>
            </Card>
          </motion.div>
        ))}
        {tabPayments.length === 0 && <Card><EmptyState icon={<Wallet className="w-8 h-8" />} title="No payments" message="Payment records will appear here once agreements are active." /></Card>}
      </div>
    </div>
  );
}
