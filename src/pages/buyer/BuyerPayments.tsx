// AgriSmart — Buyer Payments
import { Badge,Button,Card,EmptyState,StatCard,Tabs } from '@/components/ui';
import { payments,tradeAgreements } from '@/data/seed';
import { cn,downloadCsv,formatDate,truncateHash } from '@/lib/utils';
import { useCurrentUser } from '@/store';
import { motion } from 'framer-motion';
import { ArrowDownToLine,ArrowUpFromLine,CheckCircle2,Clock,Download,Link2,Wallet } from 'lucide-react';
import { useState } from 'react';

export function BuyerPayments() {
  const user = useCurrentUser();
  const [tab, setTab] = useState('all');
  if (!user) return null;
  const myAgreements = tradeAgreements.filter(a => a.buyerId === user.id);
  const myPayments = payments.filter(p => myAgreements.some(a => a.id === p.agreementId));
  const escrow = myPayments.filter(p => p.status === 'escrow_held');
  const released = myPayments.filter(p => p.status === 'released');
  const tabPayments = tab === 'escrow' ? escrow : tab === 'released' ? released : myPayments;
  const totalPaid = released.reduce((s, p) => s + p.amount, 0);
  const totalEscrow = escrow.reduce((s, p) => s + p.amount, 0);
  const exportPayments = () => downloadCsv(
    `agrismart-buyer-payments-${tab}.csv`,
    ['Payment ID', 'Agreement ID', 'Type', 'Status', 'Amount INR', 'Method', 'Date', 'Transaction Hash', 'Provider Reference'],
    tabPayments.map(payment => [payment.id, payment.agreementId, payment.type, payment.status, payment.amount, payment.method, payment.timestamp, payment.txHash || '', payment.providerRef || '']),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div><h1 className="text-xl font-bold text-brand-text">💳 Payments</h1><p className="text-sm text-brand-muted">Escrow funding, releases, and transaction history</p></div>
        <Button variant="outline" size="sm" icon={<Download className="w-4 h-4" />} onClick={exportPayments}>Export CSV</Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Paid" value={`₹${totalPaid.toLocaleString('en-IN')}`} icon={<CheckCircle2 className="w-5 h-5" />} accent="success" />
        <StatCard label="In Escrow" value={`₹${totalEscrow.toLocaleString('en-IN')}`} icon={<Wallet className="w-5 h-5" />} accent="saffron" />
        <StatCard label="Transactions" value={myPayments.length} icon={<Link2 className="w-5 h-5" />} accent="sky" />
        <StatCard label="Pending" value={myPayments.filter(p => p.status === 'pending').length} icon={<Clock className="w-5 h-5" />} accent="error" />
      </div>
      <Card className="p-4 bg-brand-sky/5 border-brand-sky/20">
        <div className="flex items-start gap-3">
          <Link2 className="w-5 h-5 text-brand-sky shrink-0 mt-0.5" />
          <div><p className="text-sm font-semibold text-brand-text">Hybrid Payment Architecture</p><p className="text-xs text-brand-muted mt-0.5">Sandbox: Polygon Amoy testnet with mock ERC-20 tokens. Production: regulated UPI/bank transfer via compliant escrow. Tokens do not represent real Indian rupees.</p></div>
        </div>
      </Card>
      <Tabs tabs={[{id:'all',label:'All',count:myPayments.length},{id:'escrow',label:'Escrow',count:escrow.length},{id:'released',label:'Released',count:released.length}]} active={tab} onChange={setTab} />
      <div className="space-y-3">
        {tabPayments.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-4">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-3">
                  <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', p.type === 'refund' ? 'bg-brand-warning/10 text-brand-warning' : 'bg-brand-success/10 text-brand-success')}>
                    {p.type === 'refund' ? <ArrowDownToLine className="w-5 h-5" /> : <ArrowUpFromLine className="w-5 h-5" />}
                  </div>
                  <div><p className="text-sm font-semibold text-brand-text capitalize">{p.type.replace(/_/g, ' ')}</p><p className="text-xs text-brand-muted">{p.agreementId}</p></div>
                </div>
                <div className="text-right"><p className="text-lg font-bold text-brand-text">₹{p.amount.toLocaleString('en-IN')}</p><Badge variant={p.status === 'released' ? 'success' : 'info'}>{p.status.replace(/_/g, ' ')}</Badge></div>
              </div>
              <div className="flex items-center gap-3 text-xs text-brand-muted pt-2 border-t border-brand-border/50">
                <span className="capitalize">{p.method.replace(/_/g, ' ')}</span><span>{formatDate(p.timestamp)}</span>{p.txHash && <span className="font-mono">TX: {truncateHash(p.txHash)}</span>}{p.providerRef && <span>Ref: {p.providerRef}</span>}
              </div>
            </Card>
          </motion.div>
        ))}
        {tabPayments.length === 0 && <Card><EmptyState icon={<Wallet className="w-8 h-8" />} title="No payments" /></Card>}
      </div>
    </div>
  );
}
