import { AlertBanner,Badge,Button,ButtonLink,Card,EmptyState,Input,SectionHeader,Select,Tabs,Textarea } from '@/components/ui';
import { getUserData,users } from '@/data/seed';
import { cn,stateColor,toDateInputValue,truncateHash } from '@/lib/utils';
import { useCurrentUser } from '@/store';
import type { AgreementState,TradeAgreement } from '@/types';
import { AnimatePresence,motion } from 'framer-motion';
import { ArrowLeft,ArrowRight,CheckCircle2,ChevronDown,ChevronUp,FileText,Link2,Plus,Scale,ShieldCheck,Wallet,X } from 'lucide-react';
import { useState } from 'react';

const agreementStates: AgreementState[] = ['draft','sent_for_review','negotiation','farmer_approved','buyer_approved','escrow_funded','active','produce_ready','inspection_pending','delivery_confirmed','payment_released','completed'];
const emptyDraft = { buyerId: '', crop: '', variety: '', quantity: '', unit: '', pricePerUnit: '', deliveryLocation: '', deliveryDate: '', qualityConditions: '', inspectionProcess: '' };

export function FarmerAgreements() {
  const user = useCurrentUser();
  const data = user ? getUserData(user.id) : null;
  const [tab, setTab] = useState('active');
  const [showBuilder, setShowBuilder] = useState(false);
  const [builderStep, setBuilderStep] = useState(0);
  const [selectedAgreementId, setSelectedAgreementId] = useState<string | null>(null);
  const [records, setRecords] = useState<TradeAgreement[]>(() => data?.agreements.map((agreement) => ({ ...agreement, milestones: agreement.milestones.map((milestone) => ({ ...milestone })) })) || []);
  const [draft, setDraft] = useState(emptyDraft);
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState('');

  if (!data || !user) return null;
  const buyers = users.filter((candidate) => candidate.role === 'buyer');
  const active = records.filter((agreement) => !['completed', 'cancelled', 'disputed'].includes(agreement.state));
  const completed = records.filter((agreement) => agreement.state === 'completed');
  const disputed = records.filter((agreement) => agreement.state === 'disputed');
  const tabAgreements = tab === 'active' ? active : tab === 'completed' ? completed : disputed;
  const totalValue = Number(draft.quantity || 0) * Number(draft.pricePerUnit || 0);
  const today = toDateInputValue();

  const validateStep = () => {
    if (builderStep === 0 && (!draft.buyerId || !draft.crop || !draft.variety.trim())) return 'Select a buyer, crop, and variety.';
    if (builderStep === 1 && (!draft.unit || Number(draft.quantity) <= 0 || Number(draft.pricePerUnit) <= 0)) return 'Enter a valid quantity, unit, and price.';
    if (builderStep === 2 && (!draft.deliveryLocation.trim() || !draft.deliveryDate || draft.qualityConditions.trim().length < 5)) return 'Add delivery details and clear quality conditions.';
    if (builderStep === 2 && draft.deliveryDate < today) return 'Delivery date cannot be in the past.';
    return '';
  };

  const nextStep = () => {
    const error = validateStep();
    if (error) { setFormError(error); return; }
    setFormError('');
    setBuilderStep((step) => Math.min(2, step + 1));
  };

  const createAgreement = () => {
    const error = validateStep();
    if (error) { setFormError(error); return; }
    const buyer = buyers.find((candidate) => candidate.id === draft.buyerId);
    if (!buyer) { setFormError('Select a valid buyer.'); return; }
    const now = new Date().toISOString();
    const value = Number(draft.quantity) * Number(draft.pricePerUnit);
    const agreement: TradeAgreement = {
      id: `agreement-demo-${Date.now()}`,
      farmerId: user.id,
      farmerName: user.name,
      buyerId: buyer.id,
      buyerName: buyer.name,
      crop: draft.crop,
      variety: draft.variety.trim(),
      quantity: Number(draft.quantity),
      unit: draft.unit,
      pricePerUnit: Number(draft.pricePerUnit),
      totalValue: value,
      state: 'sent_for_review',
      escrowAmount: 0,
      advancePercent: 20,
      deliveryDate: draft.deliveryDate,
      deliveryLocation: draft.deliveryLocation.trim(),
      qualityConditions: draft.qualityConditions.trim(),
      inspectionProcess: draft.inspectionProcess.trim() || 'Verifier inspection before delivery',
      cancellationTerms: 'Seven-day notice required before cancellation.',
      penaltyTerms: 'Late delivery penalties require evidence and review.',
      agreementHash: `0x${Date.now().toString(16).padEnd(64, '0')}`,
      milestones: [
        { id: `milestone-${Date.now()}-1`, title: 'Terms approved', description: 'Both parties approve the draft', dueDate: today, completed: false },
        { id: `milestone-${Date.now()}-2`, title: 'Delivery completed', description: 'Produce reaches the agreed location', dueDate: draft.deliveryDate, completed: false, paymentAmount: value },
      ],
      createdAt: now,
      updatedAt: now,
    };
    setRecords((current) => [agreement, ...current]);
    setDraft(emptyDraft);
    setBuilderStep(0);
    setFormError('');
    setShowBuilder(false);
    setSelectedAgreementId(agreement.id);
    setMessage(`Agreement sent to ${buyer.name} for review.`);
    setTab('active');
  };

  const updateState = (agreement: TradeAgreement, state: AgreementState, label: string) => {
    setRecords((current) => current.map((item) => item.id === agreement.id ? { ...item, state, updatedAt: new Date().toISOString() } : item));
    setMessage(`${label} recorded for ${agreement.crop} agreement.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="page-heading">📄 Trade Agreements</h1><p className="page-subtitle">Create contracts, track approvals, and review escrow and delivery milestones.</p></div><Button icon={<Plus className="h-4 w-4" />} onClick={() => setShowBuilder((open) => !open)}>{showBuilder ? 'Close builder' : 'Create draft'}</Button></div>
      {message && <AlertBanner type="success" title="Agreement updated" message={message} onClose={() => setMessage('')} />}

      <AnimatePresence>
        {showBuilder && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Card className="overflow-hidden p-4 sm:p-5">
              <SectionHeader title="Agreement builder" subtitle={`Step ${builderStep + 1} of 3`} icon={<FileText className="h-5 w-5" />} action={<Button variant="ghost" size="sm" onClick={() => setShowBuilder(false)} aria-label="Close agreement builder" icon={<X className="h-4 w-4" />} />} />
              <div className="mb-5 flex gap-1">{[0, 1, 2].map((step) => <div key={step} className={cn('h-1.5 flex-1 rounded-full', step <= builderStep ? 'bg-brand-primary' : 'bg-brand-border')} />)}</div>
              {formError && <div className="mb-4"><AlertBanner type="error" title="Agreement incomplete" message={formError} /></div>}

              {builderStep === 0 && <div className="grid gap-4 sm:grid-cols-2"><Input label="Farmer" value={user.name} disabled /><Select label="Buyer" value={draft.buyerId} onChange={(event) => setDraft((current) => ({ ...current, buyerId: event.target.value }))} options={buyers.map((buyer) => ({ value: buyer.id, label: buyer.name }))} placeholder="Select buyer" /><Select label="Crop" value={draft.crop} onChange={(event) => setDraft((current) => ({ ...current, crop: event.target.value }))} options={['Wheat','Rice','Cotton','Sugarcane','Mustard','Maize'].map((crop) => ({ value: crop, label: crop }))} placeholder="Select crop" /><Input label="Variety" value={draft.variety} onChange={(event) => setDraft((current) => ({ ...current, variety: event.target.value }))} placeholder="HD 2967" /></div>}
              {builderStep === 1 && <div className="grid gap-4 sm:grid-cols-3"><Input label="Quantity" type="number" min="0.1" value={draft.quantity} onChange={(event) => setDraft((current) => ({ ...current, quantity: event.target.value }))} /><Select label="Unit" value={draft.unit} onChange={(event) => setDraft((current) => ({ ...current, unit: event.target.value }))} options={[{ value: 'quintal', label: 'Quintal' }, { value: 'kg', label: 'Kilogram' }, { value: 'ton', label: 'Ton' }]} placeholder="Select unit" /><Input label="Price per unit" type="number" min="1" prefix="₹" value={draft.pricePerUnit} onChange={(event) => setDraft((current) => ({ ...current, pricePerUnit: event.target.value }))} /><div className="rounded-lg border border-brand-border bg-brand-soft/50 p-3 sm:col-span-3"><p className="text-sm text-brand-text">Total value: <span className="text-lg font-bold text-brand-primary">₹{Number.isFinite(totalValue) ? totalValue.toLocaleString('en-IN') : '0'}</span></p></div></div>}
              {builderStep === 2 && <div className="grid gap-4 sm:grid-cols-2"><Input label="Delivery location" value={draft.deliveryLocation} onChange={(event) => setDraft((current) => ({ ...current, deliveryLocation: event.target.value }))} /><Input label="Delivery date" type="date" min={today} value={draft.deliveryDate} onChange={(event) => setDraft((current) => ({ ...current, deliveryDate: event.target.value }))} /><div className="sm:col-span-2"><Textarea label="Quality conditions" value={draft.qualityConditions} onChange={(event) => setDraft((current) => ({ ...current, qualityConditions: event.target.value }))} placeholder="Grade, moisture, pest damage, packaging…" /></div><div className="sm:col-span-2"><Textarea label="Inspection process" value={draft.inspectionProcess} onChange={(event) => setDraft((current) => ({ ...current, inspectionProcess: event.target.value }))} placeholder="Verifier inspection before delivery" /></div><div className="rounded-lg border border-brand-success/20 bg-brand-success/5 p-3 text-xs leading-relaxed text-brand-text sm:col-span-2"><ShieldCheck className="mr-2 inline h-4 w-4 text-brand-success" />The sandbox records an agreement hash. Production must sign and submit it through the backend.</div></div>}

              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-between"><Button variant="outline" onClick={() => { setFormError(''); setBuilderStep((step) => Math.max(0, step - 1)); }} disabled={builderStep === 0} icon={<ArrowLeft className="h-4 w-4" />}>Back</Button>{builderStep < 2 ? <Button onClick={nextStep} icon={<ArrowRight className="h-4 w-4" />}>Next</Button> : <Button onClick={createAgreement} icon={<FileText className="h-4 w-4" />}>Send for review</Button>}</div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <Tabs tabs={[{ id: 'active', label: 'Active', count: active.length }, { id: 'completed', label: 'Completed', count: completed.length }, { id: 'disputed', label: 'Disputed', count: disputed.length }]} active={tab} onChange={setTab} />

      <div className="space-y-3">
        {tabAgreements.map((agreement, index) => {
          const state = stateColor(agreement.state);
          const expanded = selectedAgreementId === agreement.id;
          const stateIndex = agreementStates.indexOf(agreement.state);
          return (
            <motion.div key={agreement.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
              <Card hover className="p-4 sm:p-5">
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="flex min-w-0 items-start gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-primary"><FileText className="h-5 w-5" /></div><div><p className="text-sm font-semibold text-brand-text">{agreement.crop} · {agreement.quantity} {agreement.unit}</p><p className="text-xs text-brand-muted">Buyer: {agreement.buyerName}</p></div></div><div className="flex flex-wrap items-center gap-2"><Badge className={`${state.bg} ${state.text}`}>{state.label}</Badge><span className="text-lg font-bold text-brand-text">₹{agreement.totalValue.toLocaleString('en-IN')}</span></div></div>
                <div className="mb-3 flex items-center gap-1">{agreementStates.map((progressState, progressIndex) => <div key={progressState} className={cn('h-1.5 flex-1 rounded-full', progressIndex <= stateIndex ? 'bg-brand-primary' : 'bg-brand-border')} />)}</div>
                <Button variant="ghost" size="sm" className="w-full justify-between sm:w-auto" onClick={() => setSelectedAgreementId(expanded ? null : agreement.id)} aria-expanded={expanded} icon={expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}>{expanded ? 'Hide details' : 'View details'}</Button>

                <AnimatePresence initial={false}>{expanded && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden"><div className="mt-4 space-y-4 border-t border-brand-border pt-4"><div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4"><div><p className="text-brand-muted">Price per unit</p><p className="mt-1 font-medium text-brand-text">₹{agreement.pricePerUnit}</p></div><div><p className="text-brand-muted">Escrow</p><p className="mt-1 font-medium text-brand-text">₹{agreement.escrowAmount.toLocaleString('en-IN')}</p></div><div><p className="text-brand-muted">Advance</p><p className="mt-1 font-medium text-brand-text">{agreement.advancePercent}%</p></div><div><p className="text-brand-muted">Delivery</p><p className="mt-1 font-medium text-brand-text">{agreement.deliveryDate}</p></div></div><div className="rounded-lg border border-brand-border bg-brand-cream/50 p-3 text-xs leading-relaxed"><p><span className="text-brand-muted">Quality:</span> {agreement.qualityConditions}</p><p className="mt-1"><span className="text-brand-muted">Inspection:</span> {agreement.inspectionProcess}</p></div><div className="rounded-lg border border-brand-border bg-brand-cream/50 p-3"><p className="flex items-center gap-1.5 text-xs font-semibold text-brand-text"><Link2 className="h-3.5 w-3.5 text-brand-primary" /> Blockchain record</p><p className="mt-1 break-all text-xs text-brand-muted">{truncateHash(agreement.agreementHash)}</p></div><div className="flex flex-wrap gap-2">{agreement.state === 'sent_for_review' && <Button size="sm" onClick={() => updateState(agreement, 'farmer_approved', 'Farmer approval')} icon={<CheckCircle2 className="h-4 w-4" />}>Approve agreement</Button>}{agreement.state === 'inspection_pending' && <Button size="sm" variant="outline" onClick={() => setMessage(`Inspection request for ${agreement.crop} is already pending with the assigned verifier.`)} icon={<ShieldCheck className="h-4 w-4" />}>Inspection status</Button>}{agreement.state === 'disputed' && <Button size="sm" variant="danger" onClick={() => setMessage(`Dispute details for ${agreement.crop} are shown in this agreement record. Contact support to submit new evidence.`)} icon={<Scale className="h-4 w-4" />}>View dispute</Button>}<ButtonLink to="/farmer/payments" size="sm" variant="ghost" icon={<Wallet className="h-4 w-4" />}>View payments</ButtonLink></div></div></motion.div>}</AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
        {tabAgreements.length === 0 && <Card><EmptyState icon={<FileText className="h-8 w-8" />} title={`No ${tab} agreements`} message="Create a new agreement to get started." action={<Button onClick={() => setShowBuilder(true)} icon={<Plus className="h-4 w-4" />}>Create draft</Button>} /></Card>}
      </div>
    </div>
  );
}
