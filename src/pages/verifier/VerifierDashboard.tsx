// ============================================================
// AgriSmart — Verifier Dashboard
// ============================================================
import { ScoreGauge } from '@/components/charts';
import { Badge,ButtonLink,Card,EmptyState,SectionHeader,StatCard,VerificationBadge } from '@/components/ui';
import { farms,inspections } from '@/data/seed';
import { translate } from '@/i18n';
import { cn } from '@/lib/utils';
import { useAppStore,useCurrentUser } from '@/store';
import { motion } from 'framer-motion';
import {
AlertTriangle,
ArrowRight,
CheckCircle2,
ClipboardCheck,
Clock,
FileText,
MapPin,ShieldCheck,
Star
} from 'lucide-react';
import { Link } from 'react-router-dom';

export function VerifierDashboard() {
  const { locale } = useAppStore();
  const user = useCurrentUser();
  const t = (k: string) => translate(k, locale);
  if (!user) return null;

  const myInspections = inspections.filter(i => i.verifierId === user.id);
  const pending = myInspections.filter(i => i.status === 'pending' || i.status === 'scheduled');
  const completed = myInspections.filter(i => i.status === 'completed');
  const assignedFarms = farms.slice(0, 8);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-brand-text">{t('dash.greeting')}, {user.name.split(' ')[0]} 👋</h1>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <VerificationBadge status={user.identityVerified} />
              <Badge variant="primary" icon={<ShieldCheck className="w-3 h-3" />}>Field Verifier</Badge>
              <Badge variant="muted">{user.state}</Badge>
            </div>
          </div>
          <ButtonLink to="/verifier/inspections" size="sm" icon={<ClipboardCheck className="w-4 h-4" />}>View Inspections</ButtonLink>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Pending Inspections" value={pending.length} icon={<Clock className="w-5 h-5" />} accent="saffron" />
        <StatCard label="Completed" value={completed.length} icon={<CheckCircle2 className="w-5 h-5" />} accent="success" />
        <StatCard label="Assigned Farms" value={assignedFarms.length} icon={<MapPin className="w-5 h-5" />} accent="primary" />
        <StatCard label="Verification Rate" value="94" unit="%" icon={<Star className="w-5 h-5" />} accent="sky" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Pending inspections */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <Card className="p-5">
            <SectionHeader title="Pending Inspections" icon={<ClipboardCheck className="w-5 h-5" />} action={<Badge variant="warning">{pending.length}</Badge>} />
            <div className="space-y-3">
              {pending.map((insp, i) => (
                <motion.div key={insp.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="p-4 border-l-4 border-l-brand-warning">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-brand-warning/10 text-brand-warning flex items-center justify-center"><ClipboardCheck className="w-5 h-5" /></div>
                        <div>
                          <p className="text-sm font-semibold text-brand-text capitalize">{insp.type.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-brand-muted">Farm: {farms.find(f => f.id === insp.farmId)?.name || insp.farmId}</p>
                        </div>
                      </div>
                      <Badge variant="warning">{insp.status}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-brand-muted pt-2 border-t border-brand-border/50">
                      <span>Scheduled: {insp.scheduledDate}</span>
                      <ButtonLink to="/verifier/inspections" variant="ghost" size="sm" icon={<ArrowRight className="w-3.5 h-3.5" />}>Start Inspection</ButtonLink>
                    </div>
                  </Card>
                </motion.div>
              ))}
              {pending.length === 0 && <EmptyState icon={<ClipboardCheck className="w-8 h-8" />} title="No pending inspections" message="All caught up!" />}
            </div>
          </Card>

          {/* Completed inspections */}
          <Card className="p-5">
            <SectionHeader title="Recent Completed Inspections" icon={<CheckCircle2 className="w-5 h-5" />} />
            <div className="space-y-2">
              {completed.map(insp => (
                <div key={insp.id} className="flex items-center justify-between p-3 rounded-lg border border-brand-border">
                  <div className="flex items-center gap-2">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', insp.result === 'approved' ? 'bg-brand-success/10 text-brand-success' : insp.result === 'rejected' ? 'bg-brand-error/10 text-brand-error' : 'bg-brand-warning/10 text-brand-warning')}>
                      {insp.result === 'approved' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                    </div>
                    <div><p className="text-sm font-medium text-brand-text capitalize">{insp.type.replace(/_/g, ' ')}</p><p className="text-xs text-brand-muted">{insp.scheduledDate}</p></div>
                  </div>
                  <Badge variant={insp.result === 'approved' ? 'success' : insp.result === 'rejected' ? 'error' : 'warning'}>{insp.result || 'review'}</Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-4 sm:space-y-6">
          {/* Verifier score */}
          <Card className="p-5 text-center">
            <SectionHeader title="Verifier Score" icon={<Star className="w-5 h-5" />} />
            <ScoreGauge score={94} label="Performance" height={130} />
            <div className="mt-3 space-y-1.5 text-left">
              {[
                { label: 'Inspection Accuracy', val: 96 },
                { label: 'On-Time Completion', val: 92 },
                { label: 'Evidence Quality', val: 95 },
              ].map(item => (
                <div key={item.label}>
                  <div className="flex justify-between text-xs mb-0.5"><span className="text-brand-muted">{item.label}</span><span className="font-medium text-brand-text">{item.val}%</span></div>
                  <div className="w-full h-1.5 rounded-full bg-brand-border overflow-hidden"><div className="h-full bg-brand-primary rounded-full" style={{ width: `${item.val}%` }} /></div>
                </div>
              ))}
            </div>
          </Card>

          {/* Assigned farms */}
          <Card className="p-5">
            <SectionHeader title="Assigned Farms" icon={<MapPin className="w-5 h-5" />} action={<ButtonLink to="/verifier/farms" variant="ghost" size="sm"><ArrowRight className="w-3.5 h-3.5" /></ButtonLink>} />
            <div className="space-y-2">
              {assignedFarms.slice(0, 5).map(farm => (
                <Link key={farm.id} to="/verifier/farms" className="block p-2.5 rounded-lg border border-brand-border hover:border-brand-primary hover:bg-brand-soft/20">
                  <div className="flex items-center justify-between">
                    <div><p className="text-sm font-medium text-brand-text">{farm.name}</p><p className="text-xs text-brand-muted">{farm.village}, {farm.state}</p></div>
                    <VerificationBadge status={farm.verified ? 'verified' : 'pending'} />
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Inspection checklist template */}
          <Card className="p-5">
            <SectionHeader title="Inspection Checklist" icon={<FileText className="w-5 h-5" />} />
            <div className="space-y-1.5 text-xs">
              {['Crop variety matches agreement', 'Crop stage appropriate', 'No visible pest damage', 'Irrigation system operational', 'Sensor devices functional', 'Geo-tagged photos captured', 'Digital signature applied'].map(item => (
                <div key={item} className="flex items-center gap-2 text-brand-muted"><CheckCircle2 className="w-3.5 h-3.5 text-brand-success" /> {item}</div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
