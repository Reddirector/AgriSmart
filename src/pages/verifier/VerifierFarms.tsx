import { Badge,Button,ButtonLink,Card,EmptyState,StatCard,VerificationBadge } from '@/components/ui';
import { devices,farms,users } from '@/data/seed';
import { calculateSingleFarmDataReliability } from '@/lib/trustScore';
import { useCurrentUser } from '@/store';
import { AnimatePresence,motion } from 'framer-motion';
import { CheckCircle2,ClipboardCheck,Gauge,MapPin,Radio,ShieldCheck,Sprout,X } from 'lucide-react';
import { useState } from 'react';

export function VerifierFarms() {
  const user = useCurrentUser();
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  if (!user) return null;

  const assignedFarms = farms.slice(0, 12);
  const selectedFarm = assignedFarms.find((farm) => farm.id === selectedFarmId) || null;
  const selectedDevices = selectedFarm ? devices.filter((device) => device.farmId === selectedFarm.id) : [];
  const reliabilityFor = (farm: (typeof farms)[number]) => {
    const owner = users.find((candidate) => candidate.id === farm.farmerId);
    return calculateSingleFarmDataReliability(farm, devices.filter((device) => device.farmId === farm.id), owner?.identityVerified);
  };

  return (
    <div className="space-y-6">
      <div><h1 className="page-heading">🗺️ Assigned Farms</h1><p className="page-subtitle">Review farms within your verification workload and inspect their sensor status.</p></div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Farms" value={assignedFarms.length} icon={<MapPin className="h-5 w-5" />} />
        <StatCard label="Verified" value={assignedFarms.filter((farm) => farm.verified).length} icon={<CheckCircle2 className="h-5 w-5" />} accent="success" />
        <StatCard label="Pending" value={assignedFarms.filter((farm) => !farm.verified).length} icon={<ShieldCheck className="h-5 w-5" />} accent="warning" />
        <StatCard label="Avg Data Reliability" value={assignedFarms.length ? Math.round(assignedFarms.reduce((sum, farm) => sum + reliabilityFor(farm).score, 0) / assignedFarms.length) : 0} icon={<Gauge className="h-5 w-5" />} accent="primary" />
      </div>

      <AnimatePresence>
        {selectedFarm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Card className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div><p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Sensor overview</p><h2 className="mt-1 text-lg font-bold text-brand-text">{selectedFarm.name}</h2><p className="mt-1 text-sm text-brand-muted">{selectedFarm.village}, {selectedFarm.state}</p></div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedFarmId(null)} aria-label="Close sensor overview" icon={<X className="h-4 w-4" />} />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {selectedDevices.map((device) => (
                  <div key={device.id} className="rounded-xl border border-brand-border bg-brand-cream/50 p-3">
                    <div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold text-brand-text">{device.name}</p><Badge variant={device.connectivity === 'online' ? 'success' : device.connectivity === 'degraded' ? 'warning' : 'error'}>{device.connectivity}</Badge></div>
                    <p className="mt-1 text-xs text-brand-muted">{device.model} · Battery {device.battery}%</p>
                    <p className="mt-2 text-xs text-brand-muted">{device.sensors.length} sensor channels</p>
                  </div>
                ))}
                {selectedDevices.length === 0 && <p className="text-sm text-brand-muted">No sensor devices are registered for this farm.</p>}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {assignedFarms.map((farm, index) => {
          const farmDevices = devices.filter((device) => device.farmId === farm.id);
          return (
            <motion.div key={farm.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
              <Card hover className="p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-2"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-primary"><Sprout className="h-5 w-5" /></div><div className="min-w-0"><p className="text-sm font-semibold text-brand-text">{farm.name}</p><p className="text-xs text-brand-muted">{farm.village}, {farm.state}</p></div></div>
                  <VerificationBadge status={farm.verified ? 'verified' : 'pending'} />
                </div>
                <div className="mb-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded bg-brand-cream/50 p-1.5"><p className="text-sm font-bold text-brand-text">{farm.areaAcres}</p><p className="text-[10px] text-brand-muted">acres</p></div>
                  <div className="rounded bg-brand-cream/50 p-1.5"><p className="text-sm font-bold text-brand-text">{farmDevices.length}</p><p className="text-[10px] text-brand-muted">devices</p></div>
                  <div className="rounded bg-brand-cream/50 p-1.5"><p className="text-sm font-bold text-brand-primary">{reliabilityFor(farm).score}</p><p className="text-[10px] text-brand-muted">reliability /100</p></div>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <ButtonLink to="/verifier/inspections" variant="secondary" size="sm" className="flex-1" icon={<ClipboardCheck className="h-3.5 w-3.5" />}>Open inspections</ButtonLink>
                  <Button variant="outline" size="sm" onClick={() => setSelectedFarmId(farm.id)} icon={<Radio className="h-3.5 w-3.5" />}>Sensors</Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
      {assignedFarms.length === 0 && <Card><EmptyState icon={<MapPin className="h-8 w-8" />} title="No assigned farms" /></Card>}
    </div>
  );
}
