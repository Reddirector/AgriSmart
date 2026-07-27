// AgriSmart — Verifier Inspections
import { AlertBanner,Badge,Button,Card,EmptyState,Tabs,Textarea } from '@/components/ui';
import { farms,inspections } from '@/data/seed';
import { cn,formatDate } from '@/lib/utils';
import { useCurrentUser } from '@/store';
import type { Inspection } from '@/types';
import { AnimatePresence,motion } from 'framer-motion';
import { AlertTriangle,Camera,CheckCircle2,ChevronDown,ChevronUp,ClipboardCheck,MapPin,PenLine,XCircle } from 'lucide-react';
import { useState } from 'react';

const checklistItems = [
  'Crop variety matches agreement',
  'Crop stage appropriate for delivery date',
  'No visible pest damage',
  'Irrigation system operational',
  'Sensor devices functional and online',
  'Farm area matches records',
  'Geo-tagged photos captured',
  'No signs of data tampering',
];

export function VerifierInspections() {
  const user = useCurrentUser();
  const [tab, setTab] = useState('pending');
  const [inspectionRecords, setInspectionRecords] = useState<Inspection[]>(() => inspections.map((inspection) => ({ ...inspection, checklist: inspection.checklist?.map((item) => ({ ...item })) })));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState('');
  const [photoCount, setPhotoCount] = useState(0);
  const [geoCaptured, setGeoCaptured] = useState(false);
  const [formError, setFormError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  if (!user) return null;

  const myInspections = inspectionRecords.filter((inspection) => inspection.verifierId === user.id);
  const pending = myInspections.filter((inspection) => inspection.status === 'pending' || inspection.status === 'scheduled');
  const completed = myInspections.filter((inspection) => inspection.status === 'completed' || inspection.status === 'rejected');
  const tabInspections = tab === 'pending' ? pending : completed;

  const selectInspection = (inspection: Inspection) => {
    if (selectedId === inspection.id) {
      setSelectedId(null);
      return;
    }
    setSelectedId(inspection.id);
    setChecklist(Object.fromEntries(checklistItems.map((item) => [item, inspection.checklist?.find((entry) => entry.item === item)?.passed || false])));
    setNotes(inspection.notes || '');
    setPhotoCount(inspection.photos?.length || 0);
    setGeoCaptured(Boolean(inspection.geoTag));
    setFormError('');
  };

  const completeInspection = (inspection: Inspection, result: NonNullable<Inspection['result']>) => {
    if (!geoCaptured) {
      setFormError('Capture the inspection location before submitting.');
      return;
    }
    if (result === 'approved' && !checklistItems.every((item) => checklist[item])) {
      setFormError('Complete every checklist item before approving the inspection.');
      return;
    }
    if (result !== 'approved' && notes.trim().length < 10) {
      setFormError('Add clear inspection notes before rejecting or requesting review.');
      return;
    }

    const completedAt = new Date().toISOString();
    setInspectionRecords((current) => current.map((item) => item.id === inspection.id ? {
      ...item,
      status: result === 'rejected' ? 'rejected' : 'completed',
      result,
      notes: notes.trim(),
      checklist: checklistItems.map((checklistItem) => ({ item: checklistItem, passed: Boolean(checklist[checklistItem]) })),
      photos: Array.from({ length: photoCount }, (_, index) => `sandbox-photo-${index + 1}`),
      geoTag: { ...inspection.location, timestamp: completedAt },
    } : item));
    setStatusMessage(`${inspection.type.replace(/_/g, ' ')} submitted as ${result.replace(/_/g, ' ')}.`);
    setSelectedId(null);
    setFormError('');
    setTab('completed');
  };

  return (
    <div className="space-y-6">
      <div><h1 className="text-xl font-bold text-brand-text">🔍 Inspections</h1><p className="text-sm text-brand-muted">Field visits, crop inspections, and delivery verification</p></div>
      {statusMessage && <AlertBanner type="success" title="Inspection submitted" message={statusMessage} onClose={() => setStatusMessage('')} />}
      <Tabs tabs={[{ id: 'pending', label: 'Pending', count: pending.length }, { id: 'completed', label: 'Completed', count: completed.length }]} active={tab} onChange={setTab} />

      <div className="space-y-3">
        {tabInspections.map((inspection, index) => {
          const farm = farms.find((item) => item.id === inspection.farmId);
          return (
            <motion.div key={inspection.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card hover className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', inspection.status === 'completed' ? 'bg-brand-success/10 text-brand-success' : inspection.status === 'rejected' ? 'bg-brand-error/10 text-brand-error' : 'bg-brand-warning/10 text-brand-warning')}>
                      <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-brand-text capitalize">{inspection.type.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-brand-muted">{farm?.name || inspection.farmId} · {farm?.village}, {farm?.state}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    <Badge variant={inspection.status === 'completed' ? 'success' : inspection.status === 'rejected' ? 'error' : 'warning'}>{inspection.status}</Badge>
                    {inspection.result && <Badge variant={inspection.result === 'approved' ? 'success' : inspection.result === 'rejected' ? 'error' : 'warning'}>{inspection.result.replace(/_/g, ' ')}</Badge>}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs mb-3">
                  <div><span className="text-brand-muted">Scheduled:</span> <span className="font-medium text-brand-text">{formatDate(inspection.scheduledDate)}</span></div>
                  <div><span className="text-brand-muted">Location:</span> <span className="font-medium text-brand-text">{inspection.location.lat.toFixed(2)}, {inspection.location.lng.toFixed(2)}</span></div>
                  {inspection.agreementId && <div><span className="text-brand-muted">Agreement:</span> <span className="font-medium text-brand-text">{inspection.agreementId}</span></div>}
                </div>

                {inspection.notes && <p className="text-xs text-brand-text p-2 rounded bg-brand-cream/50 mb-2">{inspection.notes}</p>}
                {inspection.riskFlags && inspection.riskFlags.length > 0 && (
                  <div className="flex items-center gap-1.5 flex-wrap mb-2">
                    {inspection.riskFlags.map((flag) => <Badge key={flag} variant="warning" icon={<AlertTriangle className="w-3 h-3" />}>{flag}</Badge>)}
                  </div>
                )}

                {inspection.status !== 'completed' && inspection.status !== 'rejected' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-between sm:w-auto"
                    onClick={() => selectInspection(inspection)}
                    aria-expanded={selectedId === inspection.id}
                    icon={selectedId === inspection.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  >
                    {selectedId === inspection.id ? 'Close inspection form' : 'Start inspection'}
                  </Button>
                )}

                <AnimatePresence>
                  {selectedId === inspection.id && inspection.status !== 'completed' && inspection.status !== 'rejected' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="pt-3 border-t border-brand-border space-y-3">
                        {formError && <AlertBanner type="error" title="Inspection incomplete" message={formError} />}
                        <p className="text-xs font-semibold text-brand-text">Inspection Checklist</p>
                        {checklistItems.map((item) => (
                          <label key={item} className="flex items-center gap-2 text-sm cursor-pointer">
                            <input type="checkbox" checked={checklist[item] || false} onChange={(event) => setChecklist((current) => ({ ...current, [item]: event.target.checked }))} className="rounded border-brand-border w-4 h-4" />
                            <span className="text-brand-text">{item}</span>
                          </label>
                        ))}
                        <Textarea label="Inspection Notes" placeholder="Document your findings…" value={notes} onChange={(event) => setNotes(event.target.value)} />
                        <div className="flex items-center gap-2 flex-wrap">
                          <Button variant="outline" size="sm" icon={<Camera className="w-4 h-4" />} onClick={() => setPhotoCount((count) => count + 1)}>Add Photo ({photoCount})</Button>
                          <Button variant={geoCaptured ? 'secondary' : 'outline'} size="sm" icon={<MapPin className="w-4 h-4" />} onClick={() => setGeoCaptured(true)}>{geoCaptured ? 'Geo-tag Captured' : 'Capture Geo-tag'}</Button>
                        </div>
                        <div className="flex gap-2 flex-wrap pt-2">
                          <Button size="sm" icon={<CheckCircle2 className="w-4 h-4" />} onClick={() => completeInspection(inspection, 'approved')}>Approve</Button>
                          <Button size="sm" variant="danger" icon={<XCircle className="w-4 h-4" />} onClick={() => completeInspection(inspection, 'rejected')}>Reject</Button>
                          <Button size="sm" variant="outline" icon={<PenLine className="w-4 h-4" />} onClick={() => completeInspection(inspection, 'needs_review')}>Sign & Submit for Review</Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
        {tabInspections.length === 0 && <Card><EmptyState icon={<ClipboardCheck className="w-8 h-8" />} title={`No ${tab} inspections`} /></Card>}
      </div>
    </div>
  );
}
