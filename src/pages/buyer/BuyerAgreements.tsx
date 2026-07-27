import { AlertBanner,Badge,Button,Card,EmptyState,Tabs } from '@/components/ui';
import { tradeAgreements } from '@/data/seed';
import { cn,stateColor,truncateHash } from '@/lib/utils';
import { useCurrentUser } from '@/store';
import type { AgreementState,TradeAgreement } from '@/types';
import { AnimatePresence,motion } from 'framer-motion';
import { CheckCircle2,ChevronDown,ChevronUp,Clock,FileText,Link2,ShieldCheck,Wallet } from 'lucide-react';
import { useState } from 'react';

const progressStates: AgreementState[] = [
  'draft', 'sent_for_review', 'negotiation', 'farmer_approved', 'buyer_approved',
  'escrow_funded', 'active', 'produce_ready', 'inspection_pending',
  'delivery_confirmed', 'payment_released', 'completed',
];

export function BuyerAgreements() {
  const user = useCurrentUser();
  const [tab, setTab] = useState('active');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [records, setRecords] = useState<TradeAgreement[]>(() => tradeAgreements.map((agreement) => ({ ...agreement, milestones: agreement.milestones.map((milestone) => ({ ...milestone })) })));
  const [message, setMessage] = useState('');
  if (!user) return null;

  const agreements = records.filter((agreement) => agreement.buyerId === user.id);
  const active = agreements.filter((agreement) => !['completed', 'cancelled', 'disputed'].includes(agreement.state));
  const completed = agreements.filter((agreement) => agreement.state === 'completed');
  const tabAgreements = tab === 'active' ? active : completed;

  const updateAgreement = (agreement: TradeAgreement, nextState: AgreementState, actionLabel: string) => {
    const now = new Date().toISOString();
    setRecords((current) => current.map((item) => item.id === agreement.id ? {
      ...item,
      state: nextState,
      updatedAt: now,
      escrowAmount: nextState === 'escrow_funded' ? item.totalValue : item.escrowAmount,
      txHash: nextState === 'escrow_funded' && !item.txHash ? `0x${item.id.replace(/[^a-z0-9]/gi, '').padEnd(62, '0')}` : item.txHash,
    } : item));
    setMessage(`${actionLabel} completed for ${agreement.crop} agreement.`);
  };

  const counts = { active: active.length, completed: completed.length };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="page-heading">📄 Trade Agreements</h1>
        <p className="page-subtitle">Review contract terms, fund escrow, and confirm completed deliveries.</p>
      </div>

      {message && <AlertBanner type="success" title="Agreement updated" message={message} onClose={() => setMessage('')} />}

      <Tabs tabs={[{ id: 'active', label: 'Active', count: counts.active }, { id: 'completed', label: 'Completed', count: counts.completed }]} active={tab} onChange={setTab} />

      <div className="space-y-3">
        {tabAgreements.map((agreement, index) => {
          const state = stateColor(agreement.state);
          const expanded = selectedId === agreement.id;
          const currentIndex = progressStates.indexOf(agreement.state);
          return (
            <motion.div key={agreement.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
              <Card hover className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-primary"><FileText className="h-5 w-5" /></div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-brand-text">{agreement.crop} · {agreement.quantity} {agreement.unit}</p>
                      <p className="mt-0.5 text-xs text-brand-muted">Farmer: {agreement.farmerName}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <Badge className={`${state.bg} ${state.text}`}>{state.label}</Badge>
                    <span className="text-lg font-bold tabular-nums text-brand-text">₹{agreement.totalValue.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="my-4 flex items-center gap-1" aria-label={`Agreement progress: ${state.label}`}>
                  {progressStates.map((progressState, progressIndex) => (
                    <div key={progressState} className={cn('h-1.5 flex-1 rounded-full', progressIndex <= currentIndex ? 'bg-brand-primary' : 'bg-brand-border')} />
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-between sm:w-auto"
                  onClick={() => setSelectedId(expanded ? null : agreement.id)}
                  aria-expanded={expanded}
                  icon={expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                >
                  {expanded ? 'Hide details' : 'View details'}
                </Button>

                <AnimatePresence initial={false}>
                  {expanded && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="mt-4 space-y-4 border-t border-brand-border pt-4">
                        <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                          <div><p className="text-brand-muted">Price per unit</p><p className="mt-1 font-semibold text-brand-text">₹{agreement.pricePerUnit.toLocaleString('en-IN')}</p></div>
                          <div><p className="text-brand-muted">Escrow</p><p className="mt-1 font-semibold text-brand-text">₹{agreement.escrowAmount.toLocaleString('en-IN')}</p></div>
                          <div><p className="text-brand-muted">Advance</p><p className="mt-1 font-semibold text-brand-text">{agreement.advancePercent}%</p></div>
                          <div><p className="text-brand-muted">Delivery</p><p className="mt-1 font-semibold text-brand-text">{agreement.deliveryDate}</p></div>
                        </div>

                        <div className="space-y-2">
                          <p className="text-xs font-semibold text-brand-text">Milestones</p>
                          {agreement.milestones.map((milestone) => (
                            <div key={milestone.id} className="flex items-center gap-2 rounded-lg bg-brand-cream/60 p-2.5 text-xs">
                              {milestone.completed ? <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-success" /> : <Clock className="h-4 w-4 shrink-0 text-brand-muted" />}
                              <span className={milestone.completed ? 'text-brand-text' : 'text-brand-muted'}>{milestone.title}</span>
                              {milestone.paymentAmount && <Badge variant="success" className="ml-auto">₹{milestone.paymentAmount.toLocaleString('en-IN')}</Badge>}
                            </div>
                          ))}
                        </div>

                        <div className="rounded-lg border border-brand-border bg-brand-cream/50 p-3">
                          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-brand-text"><Link2 className="h-3.5 w-3.5 text-brand-primary" /> Blockchain record</p>
                          <p className="break-all text-xs text-brand-muted">Hash: <span className="font-mono text-brand-text">{truncateHash(agreement.agreementHash)}</span></p>
                          {agreement.txHash && <p className="mt-1 break-all text-xs text-brand-muted">TX: <span className="font-mono text-brand-text">{truncateHash(agreement.txHash)}</span></p>}
                          <Badge variant="info" className="mt-2">Polygon Amoy · Sandbox</Badge>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {agreement.state === 'negotiation' && <Button size="sm" icon={<CheckCircle2 className="h-4 w-4" />} onClick={() => updateAgreement(agreement, 'buyer_approved', 'Buyer approval')}>Approve terms</Button>}
                          {agreement.state === 'buyer_approved' && <Button size="sm" icon={<Wallet className="h-4 w-4" />} onClick={() => updateAgreement(agreement, 'escrow_funded', 'Escrow funding')}>Fund escrow</Button>}
                          {agreement.state === 'delivery_confirmed' && <Button size="sm" variant="outline" icon={<ShieldCheck className="h-4 w-4" />} onClick={() => updateAgreement(agreement, 'completed', 'Delivery confirmation')}>Confirm and complete</Button>}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
        {tabAgreements.length === 0 && <Card><EmptyState icon={<FileText className="h-8 w-8" />} title={`No ${tab} agreements`} message="Agreements will appear here after both parties approve the terms." /></Card>}
      </div>
    </div>
  );
}
