import { FarmBoundaryMapper,calculatePolygonAreaAcres } from '@/components/map/FarmBoundaryMapper';
import { AlertBanner,Badge,Button,ButtonLink,Card,EmptyState,Input,StatCard,VerificationBadge } from '@/components/ui';
import { getUserData } from '@/data/seed';
import { calculateSingleFarmDataReliability } from '@/lib/trustScore';
import { submitFarmBoundary } from '@/services/agrismartApi';
import { useCurrentUser } from '@/store';
import type { Farm,GeoPoint } from '@/types';
import { AnimatePresence,motion } from 'framer-motion';
import { Gauge,Layers,Map as MapIcon,MapPin,Plus,Radio,Save,ShieldCheck,Sprout,X } from 'lucide-react';
import { useEffect,useMemo,useState } from 'react';

const emptyFarm = { name: '', village: '', district: '', state: '', areaAcres: '', crop: '' };

function boundaryCenter(boundary: GeoPoint[], fallback: GeoPoint) {
  if (boundary.length === 0) return fallback;
  return {
    lat: boundary.reduce((sum, point) => sum + point.lat, 0) / boundary.length,
    lng: boundary.reduce((sum, point) => sum + point.lng, 0) / boundary.length,
  };
}

function storageKey(userId: string) {
  return `agrismart-farms-${userId}`;
}

function loadFarms(userId: string, fallback: Farm[]): Farm[] {
  try {
    const saved = window.localStorage.getItem(storageKey(userId));
    if (!saved) return fallback;
    const parsed = JSON.parse(saved) as Farm[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function FarmerFarms() {
  const user = useCurrentUser();
  const data = user ? getUserData(user.id) : null;
  const [farmRecords, setFarmRecords] = useState<Farm[]>(() => user && data ? loadFarms(user.id, data.farms.map((farm) => ({ ...farm, zones: farm.zones.map((zone) => ({ ...zone })) }))) : []);
  const [selectedFarmId, setSelectedFarmId] = useState<string | null>(null);
  const [showAddFarm, setShowAddFarm] = useState(false);
  const [form, setForm] = useState(emptyFarm);
  const [boundary, setBoundary] = useState<GeoPoint[]>([]);
  const [boundarySource, setBoundarySource] = useState<Farm['boundarySource']>('manual');
  const [calculatedArea, setCalculatedArea] = useState(0);
  const [formError, setFormError] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    try {
      window.localStorage.setItem(storageKey(user.id), JSON.stringify(farmRecords));
    } catch {
      // The application remains usable when storage is restricted.
    }
  }, [farmRecords, user]);

  const totalMappedArea = useMemo(() => farmRecords.reduce((sum, farm) => sum + (farm.boundary && farm.boundary.length >= 3 ? calculatePolygonAreaAcres(farm.boundary) : farm.areaAcres), 0), [farmRecords]);

  if (!data || !user) return null;
  const selectedFarm = farmRecords.find((farm) => farm.id === selectedFarmId) || null;
  const reliabilityFor = (farm: Farm) => calculateSingleFarmDataReliability(farm, data.devices.filter((device) => device.farmId === farm.id), user.identityVerified);

  const openAddFarm = () => {
    setShowAddFarm(true);
    setFormError('');
    setSelectedFarmId(null);
    setBoundary([]);
    setCalculatedArea(0);
    setBoundarySource('manual');
  };

  const saveFarm = async () => {
    const declaredArea = Number(form.areaAcres);
    if (!form.name.trim() || !form.village.trim() || !form.district.trim() || !form.state.trim() || !form.crop.trim()) {
      setFormError('Complete every farm and crop field.');
      return;
    }
    if (!Number.isFinite(declaredArea) || declaredArea <= 0 || declaredArea > 10000) {
      setFormError('Enter a valid farm area between 0 and 10,000 acres.');
      return;
    }
    if (boundary.length < 3) {
      setFormError('Map at least three boundary points before saving the farm.');
      return;
    }

    const mappedArea = calculatedArea || calculatePolygonAreaAcres(boundary);
    const areaDifference = Math.abs(mappedArea - declaredArea) / declaredArea;
    if (areaDifference > 0.35) {
      setFormError(`The mapped area (${mappedArea.toFixed(2)} acres) differs from the declared area by more than 35%. Review the points or acreage.`);
      return;
    }

    const centre = boundaryCenter(boundary, { lat: 20.5937, lng: 78.9629 });
    const farm: Farm = {
      id: `farm-${Date.now()}`,
      farmerId: user.id,
      name: form.name.trim(),
      village: form.village.trim(),
      district: form.district.trim(),
      state: form.state.trim(),
      areaAcres: Number(mappedArea.toFixed(2)),
      lat: centre.lat,
      lng: centre.lng,
      boundary,
      boundarySource,
      boundaryUpdatedAt: new Date().toISOString(),
      trustScore: 0,
      verified: false,
      zones: [{ id: `zone-${Date.now()}`, name: 'Primary Zone', crop: form.crop.trim(), variety: 'To be recorded', areaAcres: Number(mappedArea.toFixed(2)) }],
    };

    setSaving(true);
    try {
      const receipt = await submitFarmBoundary({
        farmId: farm.id,
        farmerId: user.id,
        boundary,
        areaAcres: farm.areaAcres,
        source: boundarySource || 'manual',
      });
      setFarmRecords((current) => [farm, ...current]);
      setForm(emptyFarm);
      setBoundary([]);
      setShowAddFarm(false);
      setMessage(`${farm.name} was saved with ${boundary.length} GPS points. Boundary submission: ${receipt.status}.`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'The farm boundary could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="page-heading">🌾 My Farms</h1>
          <p className="page-subtitle">Register farms with a real GPS boundary, calculated acreage, zones, verification, and connected monitoring.</p>
        </div>
        <Button onClick={openAddFarm} icon={<Plus className="h-4 w-4" />}>Add and map farm</Button>
      </div>

      {message && <AlertBanner type="success" title="Farm saved" message={message} onClose={() => setMessage('')} />}

      <AnimatePresence>
        {showAddFarm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <Card className="p-4 sm:p-5">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div><h2 className="text-lg font-bold text-brand-text">Register and map a farm</h2><p className="text-sm text-brand-muted">Enter the farm details, then use GPS or tap the map corners. The application checks the mapped area before saving.</p></div>
                <Button variant="ghost" size="sm" aria-label="Close farm form" onClick={() => setShowAddFarm(false)} icon={<X className="h-4 w-4" />} />
              </div>
              {formError && <div className="mb-4"><AlertBanner type="error" title="Farm could not be saved" message={formError} /></div>}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input label="Farm name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="North Field" />
                <Input label="Village" value={form.village} onChange={(event) => setForm((current) => ({ ...current, village: event.target.value }))} />
                <Input label="District" value={form.district} onChange={(event) => setForm((current) => ({ ...current, district: event.target.value }))} />
                <Input label="State" value={form.state} onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))} />
                <Input label="Declared area" type="number" min="0.1" step="0.1" suffix="acres" value={form.areaAcres} onChange={(event) => setForm((current) => ({ ...current, areaAcres: event.target.value }))} hint={calculatedArea > 0 ? `Mapped area: ${calculatedArea.toFixed(2)} acres` : 'Used to generate a starter boundary.'} />
                <Input label="Primary crop" value={form.crop} onChange={(event) => setForm((current) => ({ ...current, crop: event.target.value }))} placeholder="Wheat" />
              </div>

              <div className="mt-5">
                <FarmBoundaryMapper
                  value={boundary}
                  declaredAreaAcres={Number(form.areaAcres) || undefined}
                  onChange={(points, area, source) => {
                    setBoundary(points);
                    setCalculatedArea(area);
                    setBoundarySource(source);
                    setFormError('');
                  }}
                />
              </div>

              <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-brand-muted">Boundary source: <span className="font-semibold text-brand-text">{boundarySource?.replace('_', ' ')}</span></p>
                <div className="flex flex-col-reverse gap-2 sm:flex-row">
                  <Button variant="outline" onClick={() => setShowAddFarm(false)}>Cancel</Button>
                  <Button loading={saving} onClick={() => void saveFarm()} icon={<Save className="h-4 w-4" />}>Save mapped farm</Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Farms" value={farmRecords.length} icon={<MapPin className="h-5 w-5" />} />
        <StatCard label="Mapped Area" value={totalMappedArea.toFixed(1)} unit="acres" icon={<Layers className="h-5 w-5" />} accent="sky" />
        <StatCard label="Verified" value={farmRecords.filter((farm) => farm.verified).length} icon={<ShieldCheck className="h-5 w-5" />} accent="success" />
        <StatCard label="Avg Data Reliability" value={farmRecords.length ? Math.round(farmRecords.reduce((sum, farm) => sum + reliabilityFor(farm).score, 0) / farmRecords.length) : 0} icon={<Gauge className="h-5 w-5" />} accent="saffron" />
      </div>

      {selectedFarm && (
        <Card className="p-4 sm:p-5" aria-live="polite">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Selected farm boundary</p>
              <h2 className="mt-1 text-lg font-bold text-brand-text">{selectedFarm.name}</h2>
              <p className="mt-1 text-sm text-brand-muted">GPS centre: {selectedFarm.lat.toFixed(5)}, {selectedFarm.lng.toFixed(5)}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedFarmId(null)} icon={<X className="h-4 w-4" />}>Close map</Button>
          </div>
          <div className="mt-4">
            {selectedFarm.boundary && selectedFarm.boundary.length >= 3
              ? <FarmBoundaryMapper value={selectedFarm.boundary} initialCenter={{ lat: selectedFarm.lat, lng: selectedFarm.lng }} readOnly />
              : <div className="grid min-h-48 place-items-center rounded-xl border border-dashed border-brand-primary/30 bg-brand-soft/40 p-5 text-center"><div><MapIcon className="mx-auto h-9 w-9 text-brand-primary" /><p className="mt-2 text-sm font-semibold text-brand-text">Boundary not mapped yet</p><p className="mt-1 max-w-md text-xs leading-relaxed text-brand-muted">This older farm record only contains a centre point and acreage. Add a GPS polygon before autonomous drone missions.</p></div></div>}
          </div>
        </Card>
      )}

      {farmRecords.length === 0 ? (
        <Card><EmptyState icon={<Sprout className="h-10 w-10" />} title="No farms registered" message="Add your first farm and map its boundary to enable drone missions and monitoring." action={<Button onClick={openAddFarm}>Add farm</Button>} /></Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {farmRecords.map((farm, index) => (
            <motion.div key={farm.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
              <Card hover className="p-4 sm:p-5">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-soft to-brand-sky/15 text-brand-primary"><Sprout className="h-6 w-6" /></div>
                    <div className="min-w-0"><h3 className="text-base font-semibold text-brand-text">{farm.name}</h3><p className="text-xs text-brand-muted">{farm.village}, {farm.district}, {farm.state}</p></div>
                  </div>
                  <VerificationBadge status={farm.verified ? 'verified' : 'pending'} />
                </div>

                <div className="mb-3 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-brand-cream/50 p-2 text-center"><p className="text-lg font-bold text-brand-text">{farm.areaAcres}</p><p className="text-[10px] text-brand-muted">acres</p></div>
                  <div className="rounded-lg bg-brand-cream/50 p-2 text-center"><p className="text-lg font-bold text-brand-text">{farm.boundary?.length || 0}</p><p className="text-[10px] text-brand-muted">GPS points</p></div>
                  <div className="rounded-lg bg-brand-cream/50 p-2 text-center"><p className="text-lg font-bold text-brand-primary">{reliabilityFor(farm).score}</p><p className="text-[10px] text-brand-muted">reliability /100</p></div>
                </div>

                <div className="mb-3 space-y-2">
                  {farm.zones.map((zone) => (
                    <div key={zone.id} className="flex items-center justify-between gap-2 rounded-lg border border-brand-border p-2">
                      <div className="flex min-w-0 items-center gap-2"><Layers className="h-3.5 w-3.5 shrink-0 text-brand-muted" /><span className="truncate text-sm font-medium text-brand-text">{zone.name}</span><span className="truncate text-xs text-brand-muted">· {zone.crop}</span></div>
                      <Badge variant="muted">{zone.areaAcres} ac</Badge>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <ButtonLink to="/farmer/iot" variant="outline" size="sm" icon={<Radio className="h-4 w-4" />}>Monitoring</ButtonLink>
                  <Button variant="secondary" size="sm" onClick={() => setSelectedFarmId(farm.id)} icon={<MapIcon className="h-4 w-4" />}>View boundary</Button>
                  <Badge variant={farm.boundary && farm.boundary.length >= 3 ? 'success' : 'warning'} className="justify-center sm:ml-auto">{farm.boundary && farm.boundary.length >= 3 ? 'Flight geofence ready' : 'Mapping required'}</Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
