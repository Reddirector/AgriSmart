// AgriSmart — Admin Disputes
import { AlertBanner,Badge,Button,Card,EmptyState,StatCard,Tabs,Textarea } from '@/components/ui';
import { disputes,tradeAgreements } from '@/data/seed';
import { timeAgo } from '@/lib/utils';
import type { Dispute } from '@/types';
import { AnimatePresence,motion } from 'framer-motion';
import { AlertTriangle,CheckCircle2,Clock,FileText,MessageSquare,Scale,XCircle } from 'lucide-react';
import { useState } from 'react';

export function AdminDisputes() {
  const [tab, setTab] = useState('all');
  const [disputeRecords, setDisputeRecords] = useState<Dispute[]>(() => disputes.map((dispute) => ({ ...dispute })));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [resolution, setResolution] = useState('');
  const [formError, setFormError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const unresolved = disputeRecords.filter((dispute) => dispute.status !== 'resolved');
  const tabDisputes = tab === 'open' ? unresolved : disputeRecords;

  const openReview = (dispute: Dispute) => {
    setSelectedId(dispute.id);
    setResolution(dispute.resolution || '');
    setFormError('');
  };

  const updateDispute = (dispute: Dispute, status: Dispute['status'], decision: string) => {
    if (resolution.trim().length < 10) {
      setFormError('Add at least 10 characters explaining the decision.');
      return;
    }
    setDisputeRecords((current) => current.map((item) => item.id === dispute.id ? {
      ...item,
      status,
      resolution: `${decision}: ${resolution.trim()}`,
      resolvedAt: status === 'resolved' ? new Date().toISOString() : undefined,
    } : item));
    setStatusMessage(`${dispute.id} was ${status === 'resolved' ? 'resolved' : 'escalated'} successfully.`);
    setSelectedId(null);
    setResolution('');
    setFormError('');
  };

  const requestEvidence = (dispute: Dispute) => {
    setDisputeRecords((current) => current.map((item) => item.id === dispute.id ? {
      ...item,
      status: 'under_review',
      evidenceCount: item.evidenceCount + 1,
      resolution: resolution.trim() || 'Additional evidence requested from both parties.',
    } : item));
    setStatusMessage(`Additional evidence was requested for ${dispute.id}.`);
    setSelectedId(null);
    setResolution('');
    setFormError('');
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-brand-text">⚖️ Dispute Management</h1><p className="text-sm text-brand-muted">Review and resolve trade agreement disputes</p></div>
      {statusMessage && <AlertBanner type="success" title="Dispute updated" message={statusMessage} onClose={() => setStatusMessage('')} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Disputes" value={disputeRecords.length} icon={<AlertTriangle className="w-5 h-5" />} accent="error" />
        <StatCard label="Open" value={disputeRecords.filter((dispute) => dispute.status === 'open').length} icon={<Clock className="w-5 h-5" />} accent="warning" />
        <StatCard label="Under Review" value={disputeRecords.filter((dispute) => dispute.status === 'under_review').length} icon={<Scale className="w-5 h-5" />} accent="sky" />
        <StatCard label="Resolved" value={disputeRecords.filter((dispute) => dispute.status === 'resolved').length} icon={<CheckCircle2 className="w-5 h-5" />} accent="success" />
      </div>

      <Tabs tabs={[{ id: 'all', label: 'All Disputes', count: disputeRecords.length }, { id: 'open', label: 'Active Cases', count: unresolved.length }]} active={tab} onChange={setTab} />

      <div className="space-y-3">
        {tabDisputes.map((dispute, index) => {
          const agreement = tradeAgreements.find((item) => item.id === dispute.agreementId);
          const badgeVariant = dispute.status === 'resolved' ? 'success' : dispute.status === 'under_review' ? 'warning' : 'error';
          return (
            <motion.div key={dispute.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card className="p-5 border-l-4 border-l-brand-error">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand-error/10 text-brand-error flex items-center justify-center"><AlertTriangle className="w-5 h-5" /></div>
                    <div><p className="text-sm font-semibold text-brand-text">{dispute.reason}</p><p className="text-xs text-brand-muted">Dispute #{dispute.id} · Agreement: {dispute.agreementId}</p></div>
                  </div>
                  <Badge variant={badgeVariant}>{dispute.status.replace(/_/g, ' ')}</Badge>
                </div>

                <p className="text-sm text-brand-text mb-3">{dispute.description}</p>
                {dispute.resolution && <p className="mb-3 rounded-lg bg-brand-soft/50 p-3 text-xs text-brand-text"><span className="font-semibold">Latest decision:</span> {dispute.resolution}</p>}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
                  <div><span className="text-brand-muted">Raised by:</span> <span className="font-medium text-brand-text">{dispute.raisedBy}</span></div>
                  <div><span className="text-brand-muted">Evidence:</span> <span className="font-medium text-brand-text">{dispute.evidenceCount} items</span></div>
                  <div><span className="text-brand-muted">Created:</span> <span className="font-medium text-brand-text">{timeAgo(dispute.createdAt)}</span></div>
                  {agreement && <div><span className="text-brand-muted">Value:</span> <span className="font-medium text-brand-text">₹{agreement.totalValue.toLocaleString('en-IN')}</span></div>}
                </div>

                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <span className="text-xs font-medium text-brand-muted">Evidence:</span>
                  {Array.from({ length: dispute.evidenceCount }).map((_, evidenceIndex) => <Badge key={evidenceIndex} variant="info" icon={<FileText className="w-3 h-3" />}>Evidence #{evidenceIndex + 1}</Badge>)}
                </div>

                <AnimatePresence>
                  {selectedId === dispute.id && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="pt-3 border-t border-brand-border space-y-3">
                        {formError && <AlertBanner type="error" title="Resolution required" message={formError} />}
                        <Textarea label="Resolution Notes" placeholder="Document your decision and reasoning…" value={resolution} onChange={(event) => setResolution(event.target.value)} />
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" icon={<CheckCircle2 className="w-4 h-4" />} onClick={() => updateDispute(dispute, 'resolved', "Resolved in farmer's favour")}>Farmer's Favor</Button>
                          <Button size="sm" variant="outline" icon={<CheckCircle2 className="w-4 h-4" />} onClick={() => updateDispute(dispute, 'resolved', "Resolved in buyer's favour")}>Buyer's Favor</Button>
                          <Button size="sm" variant="danger" icon={<XCircle className="w-4 h-4" />} onClick={() => updateDispute(dispute, 'escalated', 'Escalated for legal review')}>Escalate</Button>
                          <Button size="sm" variant="ghost" icon={<MessageSquare className="w-4 h-4" />} onClick={() => requestEvidence(dispute)}>Request Evidence</Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {selectedId !== dispute.id && dispute.status !== 'resolved' && <Button variant="secondary" size="sm" onClick={() => openReview(dispute)}>Review Dispute</Button>}
              </Card>
            </motion.div>
          );
        })}
        {tabDisputes.length === 0 && <Card><EmptyState icon={<CheckCircle2 className="w-8 h-8" />} title="No active disputes" message="All cases in this view are resolved." /></Card>}
      </div>
    </div>
  );
}
