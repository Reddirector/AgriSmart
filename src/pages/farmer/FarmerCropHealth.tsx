import { AlertBanner,Badge,Button,Card,EmptyState,Input,ProgressBar,Select,Textarea } from '@/components/ui';
import { farms } from '@/data/seed';
import { prepareCropImage } from '@/lib/cropHealthEngine';
import { diagnoseCropImage } from '@/services/agrismartApi';
import { useCurrentUser } from '@/store';
import type { CropHealthContext,CropHealthDiagnosis,CropSupportLevel } from '@/types/cropHealth';
import { AnimatePresence,motion } from 'framer-motion';
import {
  AlertTriangle,
  Bot,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  FileImage,
  Focus,
  History,
  ImagePlus,
  Leaf,
  Loader2,
  MapPin,
  Microscope,
  Plane,
  RefreshCw,
  Save,
  ScanSearch,
  ShieldAlert,
  Sparkles,
  Sprout,
  Upload,
  X,
} from 'lucide-react';
import { useEffect,useMemo,useRef,useState } from 'react';
import { useNavigate } from 'react-router-dom';

const historyKey = 'agrismart-crop-health-history';
const activeDiagnosisKey = 'agrismart-active-diagnosis';

const growthStages = [
  { value: '', label: 'Select growth stage' },
  { value: 'seedling', label: 'Seedling' },
  { value: 'vegetative', label: 'Vegetative growth' },
  { value: 'flowering', label: 'Flowering' },
  { value: 'fruiting', label: 'Fruiting or grain filling' },
  { value: 'maturity', label: 'Maturity or harvest stage' },
  { value: 'unknown', label: 'Not sure' },
];

const affectedParts = [
  { value: '', label: 'Select affected part' },
  { value: 'leaf', label: 'Leaf' },
  { value: 'stem', label: 'Stem' },
  { value: 'fruit', label: 'Fruit or pod' },
  { value: 'root', label: 'Root or crown' },
  { value: 'whole_plant', label: 'Whole plant' },
  { value: 'multiple', label: 'Multiple parts' },
];

const rainfallOptions = [
  { value: 'unknown', label: 'Not sure' },
  { value: 'none', label: 'No recent rain' },
  { value: 'light', label: 'Light rain' },
  { value: 'heavy', label: 'Heavy rain or waterlogging' },
];

const nearbyOptions = [
  { value: 'unknown', label: 'Not checked' },
  { value: 'yes', label: 'Yes, nearby plants are affected' },
  { value: 'no', label: 'No, only this plant is affected' },
];

function loadHistory(): CropHealthDiagnosis[] {
  try {
    return JSON.parse(localStorage.getItem(historyKey) || '[]') as CropHealthDiagnosis[];
  } catch {
    return [];
  }
}

function saveHistory(diagnosis: CropHealthDiagnosis) {
  try {
    const compact = {
      ...diagnosis,
      imageDataUrl: diagnosis.imageDataUrl && diagnosis.imageDataUrl.length < 180_000 ? diagnosis.imageDataUrl : undefined,
      overlayDataUrl: undefined,
    };
    const next = [compact, ...loadHistory().filter((item) => item.id !== diagnosis.id)].slice(0, 20);
    localStorage.setItem(historyKey, JSON.stringify(next));
  } catch {
    const compact = { ...diagnosis, imageDataUrl: undefined, overlayDataUrl: undefined };
    localStorage.setItem(historyKey, JSON.stringify([compact, ...loadHistory().filter((item) => item.id !== diagnosis.id)].slice(0, 10)));
  }
}

function confidenceVariant(level: CropSupportLevel) {
  if (level === 'verified') return 'success' as const;
  if (level === 'supported') return 'info' as const;
  if (level === 'experimental') return 'warning' as const;
  return 'muted' as const;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Date unavailable' : date.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
}

export function FarmerCropHealth() {
  const navigate = useNavigate();
  const user = useCurrentUser();
  const farmerFarms = useMemo(() => farms.filter((farm) => farm.farmerId === user?.id), [user?.id]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [overlayDataUrl, setOverlayDataUrl] = useState('');
  const [showOverlay, setShowOverlay] = useState(true);
  const [metrics, setMetrics] = useState<Awaited<ReturnType<typeof prepareCropImage>>['metrics'] | null>(null);
  const [processingImage, setProcessingImage] = useState(false);
  const [diagnosing, setDiagnosing] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [diagnosis, setDiagnosis] = useState<CropHealthDiagnosis | null>(null);
  const [history, setHistory] = useState<CropHealthDiagnosis[]>([]);
  const [context, setContext] = useState<CropHealthContext>({
    cropHint: '',
    variety: '',
    growthStage: '',
    affectedPart: 'leaf',
    symptomsText: '',
    durationDays: 1,
    nearbyAffected: 'unknown',
    recentRainfall: 'unknown',
    irrigation: '',
    recentInputs: '',
    location: user ? `${user.district || ''}, ${user.state || ''}`.replace(/^,\s*/, '') : '',
    farmId: farmerFarms[0]?.id || '',
  });

  useEffect(() => setHistory(loadHistory()), []);

  useEffect(() => {
    if (!context.farmId && farmerFarms[0]) setContext((current) => ({ ...current, farmId: farmerFarms[0].id }));
  }, [context.farmId, farmerFarms]);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setError('');
    setNotice('');
    setDiagnosis(null);
    setProcessingImage(true);
    try {
      const prepared = await prepareCropImage(file);
      setFileName(file.name || `camera-${Date.now()}.jpg`);
      setImageDataUrl(prepared.imageDataUrl);
      setOverlayDataUrl(prepared.overlayDataUrl);
      setMetrics(prepared.metrics);
      setShowOverlay(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The image could not be prepared.');
      setImageDataUrl('');
      setOverlayDataUrl('');
      setMetrics(null);
    } finally {
      setProcessingImage(false);
    }
  };

  const resetScan = () => {
    setFileName('');
    setImageDataUrl('');
    setOverlayDataUrl('');
    setMetrics(null);
    setDiagnosis(null);
    setError('');
    setNotice('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const runDiagnosis = async () => {
    if (!imageDataUrl || !metrics) {
      setError('Upload or capture a clear crop image first.');
      return;
    }
    setError('');
    setNotice('');
    setDiagnosing(true);
    try {
      const result = await diagnoseCropImage({
        imageName: fileName || 'crop-image.jpg',
        imageDataUrl,
        imageMetrics: metrics,
        context,
      });
      const completeResult = { ...result, overlayDataUrl, imageDataUrl };
      setDiagnosis(completeResult);
      saveHistory(completeResult);
      setHistory(loadHistory());
      localStorage.setItem(activeDiagnosisKey, JSON.stringify({
        id: completeResult.id,
        crop: completeResult.cropCandidates[0]?.commonName,
        condition: completeResult.conditionCandidates[0]?.name,
        confidence: completeResult.conditionCandidates[0]?.confidence,
        severity: completeResult.severity,
        summary: completeResult.summary,
      }));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The crop health analysis could not be completed.');
    } finally {
      setDiagnosing(false);
    }
  };

  const scheduleDroneScan = () => {
    if (!diagnosis) return;
    const intent = {
      diagnosisId: diagnosis.id,
      crop: diagnosis.cropCandidates[0]?.commonName,
      condition: diagnosis.conditionCandidates[0]?.name,
      severity: diagnosis.severity,
      farmId: context.farmId,
      createdAt: new Date().toISOString(),
      missionType: 'rgb_thermal_verification',
    };
    localStorage.setItem('agrismart-drone-scan-request', JSON.stringify(intent));
    navigate('/farmer/drones');
  };

  const openCopilot = () => {
    window.dispatchEvent(new CustomEvent('agrismart:open-assistant', {
      detail: { prompt: diagnosis ? `Explain this crop diagnosis: ${diagnosis.summary}` : 'Help me take a good crop disease photo.' },
    }));
  };

  const selectHistory = (item: CropHealthDiagnosis) => {
    setDiagnosis(item);
    setImageDataUrl(item.imageDataUrl || '');
    setOverlayDataUrl(item.overlayDataUrl || '');
    setMetrics(item.imageMetrics);
    setContext(item.context);
    setFileName(item.imageName);
    setShowOverlay(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const qualityLabel = metrics ? (metrics.qualityScore >= 80 ? 'Excellent' : metrics.qualityScore >= 60 ? 'Usable' : 'Retake recommended') : '';

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-brand-primary/15 bg-gradient-to-br from-[#F4FAF5] via-white to-[#EEF4F7] p-5 shadow-soft sm:p-7">
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-teal/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-brand-purple/10 blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-primary/15 bg-white/80 px-3 py-1.5 text-xs font-bold text-brand-primary shadow-card">
              <Sparkles className="h-3.5 w-3.5" /> Universal open-crop analysis
            </div>
            <h1 className="text-2xl font-bold text-brand-text sm:text-3xl">🌿 Crop Health Scanner</h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-brand-muted sm:text-base">Capture a leaf or plant, confirm the crop, and receive an uncertainty-aware assessment of visible disease, pest, nutrient, water, heat, chemical, or physical stress.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
            {[
              ['1', 'Capture'],
              ['2', 'Confirm crop'],
              ['3', 'Analyse'],
              ['4', 'Verify'],
            ].map(([number, label]) => <div key={number} className="rounded-xl border border-white/80 bg-white/75 px-3 py-2 text-center shadow-card"><p className="text-sm font-bold text-brand-primary">{number}</p><p className="text-[11px] font-semibold text-brand-muted">{label}</p></div>)}
          </div>
        </div>
      </section>

      {error && <AlertBanner type="error" title="Crop scan needs attention" message={error} onClose={() => setError('')} />}
      {notice && <AlertBanner type="success" title="Saved" message={notice} onClose={() => setNotice('')} />}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)]">
        <Card className="overflow-hidden">
          <div className="border-b border-brand-border bg-gradient-to-r from-brand-primary/[0.06] to-brand-sky/[0.06] p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div><h2 className="flex items-center gap-2 text-lg font-bold text-brand-text"><Camera className="h-5 w-5 text-brand-primary" /> Add crop photos</h2><p className="mt-1 text-sm text-brand-muted">Use one close leaf image now. Add full-plant and nearby-plant images in follow-up scans.</p></div>
              {imageDataUrl && <Button variant="ghost" size="sm" onClick={resetScan} icon={<X className="h-4 w-4" />}>Clear</Button>}
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {!imageDataUrl ? (
              <div className="rounded-2xl border-2 border-dashed border-brand-primary/25 bg-gradient-to-br from-brand-soft/45 to-brand-sky/[0.04] p-6 text-center transition-colors hover:border-brand-primary/45 sm:p-10" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); void handleFile(event.dataTransfer.files?.[0]); }}>
                <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-brand-primary shadow-soft"><ImagePlus className="h-8 w-8" /></motion.div>
                <h3 className="mt-4 text-base font-bold text-brand-text">Keep the affected area clear and close</h3>
                <p className="mx-auto mt-1 max-w-lg text-sm leading-relaxed text-brand-muted">Place the leaf against a plain background. Use indirect daylight. Include both healthy and damaged tissue.</p>
                <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
                  <Button onClick={() => fileInputRef.current?.click()} icon={<Upload className="h-4 w-4" />}>Upload image</Button>
                  <Button variant="outline" onClick={() => cameraInputRef.current?.click()} icon={<Camera className="h-4 w-4" />}>Open camera</Button>
                </div>
                <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => void handleFile(event.target.files?.[0])} />
                <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="sr-only" onChange={(event) => void handleFile(event.target.files?.[0])} />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl border border-brand-border bg-brand-dark/5">
                  <img src={imageDataUrl} alt="Uploaded crop for health analysis" className="max-h-[470px] w-full object-contain" />
                  {showOverlay && overlayDataUrl && <img src={overlayDataUrl} alt="Potentially affected regions highlighted" className="pointer-events-none absolute inset-0 h-full w-full object-contain mix-blend-multiply transition-opacity duration-500" />}
                  {diagnosing && <div className="crop-scan-sweep" aria-hidden="true" />}
                  {processingImage && <div className="absolute inset-0 grid place-items-center bg-white/75 backdrop-blur-sm"><div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-brand-primary shadow-lift"><Loader2 className="h-4 w-4 animate-spin" /> Preparing image…</div></div>}
                </div>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-brand-text">{fileName}</p><p className="text-xs text-brand-muted">Processed locally before diagnosis</p></div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setShowOverlay((current) => !current)} icon={<Focus className="h-4 w-4" />}>{showOverlay ? 'Hide highlight' : 'Show highlight'}</Button>
                    <Button variant="ghost" size="sm" onClick={() => fileInputRef.current?.click()} icon={<RefreshCw className="h-4 w-4" />}>Replace</Button>
                  </div>
                </div>
                {metrics && (
                  <div className="rounded-xl border border-brand-border bg-brand-cream/45 p-4">
                    <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-bold text-brand-text">Image quality</p><p className="text-xs text-brand-muted">{qualityLabel} · {metrics.width} × {metrics.height}</p></div><Badge variant={metrics.qualityScore >= 60 ? 'success' : 'warning'}>{Math.round(metrics.qualityScore)}/100</Badge></div>
                    <ProgressBar value={metrics.qualityScore} accent={metrics.qualityScore >= 60 ? 'success' : 'warning'} className="mt-3" />
                    {metrics.issues.length > 0 && <div className="mt-3 space-y-1.5">{metrics.issues.map((issue) => <p key={issue} className="flex items-start gap-2 text-xs text-brand-warning"><AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />{issue}</p>)}</div>}
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        <Card className="p-4 sm:p-5">
          <div className="mb-4"><h2 className="flex items-center gap-2 text-lg font-bold text-brand-text"><ClipboardCheck className="h-5 w-5 text-brand-teal" /> Crop and field context</h2><p className="mt-1 text-sm text-brand-muted">These details help separate disease from nutrient, water, weather, and spray injury.</p></div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            <Input label="Crop name or best guess" value={context.cropHint || ''} onChange={(event) => setContext((current) => ({ ...current, cropHint: event.target.value }))} placeholder="Optional, for example tomato" hint="Optional. A configured vision model can identify the crop; your confirmation improves reliability." />
            <Input label="Variety" value={context.variety || ''} onChange={(event) => setContext((current) => ({ ...current, variety: event.target.value }))} placeholder="Optional variety" />
            <Select label="Growth stage" value={context.growthStage || ''} onChange={(event) => setContext((current) => ({ ...current, growthStage: event.target.value }))} options={growthStages} />
            <Select label="Affected plant part" value={context.affectedPart || ''} onChange={(event) => setContext((current) => ({ ...current, affectedPart: event.target.value }))} options={affectedParts} />
            <Select label="Nearby plants" value={context.nearbyAffected || 'unknown'} onChange={(event) => setContext((current) => ({ ...current, nearbyAffected: event.target.value as CropHealthContext['nearbyAffected'] }))} options={nearbyOptions} />
            <Select label="Recent rainfall" value={context.recentRainfall || 'unknown'} onChange={(event) => setContext((current) => ({ ...current, recentRainfall: event.target.value as CropHealthContext['recentRainfall'] }))} options={rainfallOptions} />
            <Input label="Symptoms noticed for" type="number" min="0" max="365" suffix="days" value={context.durationDays ?? 1} onChange={(event) => setContext((current) => ({ ...current, durationDays: Number(event.target.value) }))} />
            <Select label="Farm" value={context.farmId || ''} onChange={(event) => setContext((current) => ({ ...current, farmId: event.target.value }))} options={[{ value: '', label: 'Not linked to a registered farm' }, ...farmerFarms.map((farm) => ({ value: farm.id, label: farm.name }))]} />
          </div>
          <div className="mt-4 space-y-4">
            <Textarea label="Visible symptoms" rows={3} value={context.symptomsText || ''} onChange={(event) => setContext((current) => ({ ...current, symptomsText: event.target.value }))} placeholder="Describe spots, colour, curling, powder, holes, wilting, insects, or smell." />
            <Input label="Irrigation and soil condition" value={context.irrigation || ''} onChange={(event) => setContext((current) => ({ ...current, irrigation: event.target.value }))} placeholder="For example: drip irrigation, soil remained wet" />
            <Input label="Recent fertilizer or spray" value={context.recentInputs || ''} onChange={(event) => setContext((current) => ({ ...current, recentInputs: event.target.value }))} placeholder="Product or input used, if any" />
            <Input label="Location" icon={<MapPin className="h-4 w-4" />} value={context.location || ''} onChange={(event) => setContext((current) => ({ ...current, location: event.target.value }))} placeholder="Village, district, state" />
          </div>
          <div className="mt-5 rounded-xl border border-brand-sky/20 bg-brand-sky/[0.055] p-3 text-xs leading-relaxed text-brand-text"><ShieldAlert className="mr-2 inline h-4 w-4 text-brand-sky" />The scanner never authorizes automatic chemical treatment from one image. It uses confidence, uncertainty, crop confirmation, weather, label, and human approval gates.</div>
          <Button className="mt-5 w-full" size="lg" loading={diagnosing} onClick={() => void runDiagnosis()} disabled={!imageDataUrl || processingImage} icon={<ScanSearch className="h-5 w-5" />}>Analyse crop health</Button>
        </Card>
      </div>

      <AnimatePresence mode="wait">
        {diagnosis && (
          <motion.section key={diagnosis.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35 }} className="space-y-5">
            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <Card className="overflow-hidden">
                <div className="border-b border-brand-border bg-gradient-to-r from-brand-primary/[0.08] via-brand-teal/[0.06] to-brand-purple/[0.06] p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div><p className="text-xs font-bold uppercase tracking-widest text-brand-primary">Analysis result</p><h2 className="mt-1 text-xl font-bold text-brand-text">{diagnosis.conditionCandidates[0]?.name}</h2><p className="mt-1 text-sm leading-relaxed text-brand-muted">{diagnosis.summary}</p></div>
                    <Badge variant={confidenceVariant(diagnosis.conditionCandidates[0]?.supportLevel || 'unknown')}>{diagnosis.conditionCandidates[0]?.supportLevel || 'unknown'} evidence</Badge>
                  </div>
                </div>
                <div className="grid gap-4 p-5 sm:grid-cols-3">
                  <div className="rounded-xl bg-brand-soft/55 p-4"><Sprout className="h-5 w-5 text-brand-primary" /><p className="mt-2 text-xs font-semibold text-brand-muted">Crop</p><p className="mt-1 font-bold text-brand-text">{diagnosis.cropCandidates[0]?.commonName}</p><p className="text-xs italic text-brand-muted">{diagnosis.cropCandidates[0]?.scientificName || 'Scientific name not confirmed'}</p></div>
                  <div className="rounded-xl bg-brand-saffron/[0.08] p-4"><Microscope className="h-5 w-5 text-brand-saffron" /><p className="mt-2 text-xs font-semibold text-brand-muted">Condition confidence</p><p className="mt-1 text-2xl font-bold text-brand-text">{Math.round(diagnosis.conditionCandidates[0]?.confidence || 0)}%</p><ProgressBar value={diagnosis.conditionCandidates[0]?.confidence || 0} accent="saffron" className="mt-2" /></div>
                  <div className="rounded-xl bg-brand-rose/[0.07] p-4"><Leaf className="h-5 w-5 text-brand-rose" /><p className="mt-2 text-xs font-semibold text-brand-muted">Visible severity</p><p className="mt-1 text-2xl font-bold capitalize text-brand-text">{diagnosis.severity.band}</p><p className="text-xs text-brand-muted">{diagnosis.severity.affectedPercent}% affected area</p></div>
                </div>
              </Card>

              <Card className="p-5">
                <h3 className="flex items-center gap-2 font-bold text-brand-text"><ShieldAlert className="h-5 w-5 text-brand-warning" /> Treatment safety gate</h3>
                <div className="mt-4 rounded-xl border border-brand-warning/25 bg-brand-warning/[0.06] p-4"><p className="text-sm font-semibold text-brand-warning">Automatic treatment blocked</p><p className="mt-1 text-sm leading-relaxed text-brand-text">{diagnosis.treatmentGate.reason}</p></div>
                <div className="mt-4 flex flex-wrap gap-2"><Badge variant="warning">Farmer approval required</Badge><Badge variant={diagnosis.treatmentGate.agronomistReviewRecommended ? 'error' : 'info'}>{diagnosis.treatmentGate.agronomistReviewRecommended ? 'Expert review recommended' : 'Continue verification'}</Badge></div>
                <div className="mt-5 grid gap-2">
                  <Button onClick={scheduleDroneScan} icon={<Plane className="h-4 w-4" />}>Create RGB + thermal verification</Button>
                  <Button variant="outline" onClick={openCopilot} icon={<Bot className="h-4 w-4" />}>Ask Copilot to explain</Button>
                  <Button variant="ghost" onClick={() => { saveHistory(diagnosis); setNotice('The diagnosis is stored in this browser and linked to the active crop-health context.'); }} icon={<Save className="h-4 w-4" />}>Save to crop history</Button>
                </div>
              </Card>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="p-5"><h3 className="font-bold text-brand-text">Possible conditions</h3><div className="mt-4 space-y-3">{diagnosis.conditionCandidates.map((candidate, index) => <div key={`${candidate.name}-${index}`} className="rounded-xl border border-brand-border p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-brand-text">{candidate.name}</p><p className="mt-1 text-xs leading-relaxed text-brand-muted">{candidate.reason}</p></div><span className="text-sm font-bold text-brand-primary">{Math.round(candidate.confidence)}%</span></div><ProgressBar value={candidate.confidence} accent={index === 0 ? 'primary' : 'sky'} className="mt-2" /></div>)}</div></Card>
              <Card className="p-5"><h3 className="font-bold text-brand-text">Detected symptoms</h3>{diagnosis.symptoms.length ? <div className="mt-4 space-y-3">{diagnosis.symptoms.map((symptom) => <div key={symptom.id} className="flex items-start gap-3 rounded-xl bg-brand-cream/50 p-3"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-success" /><div><p className="text-sm font-semibold text-brand-text">{symptom.label} · {Math.round(symptom.confidence)}%</p><p className="mt-0.5 text-xs leading-relaxed text-brand-muted">{symptom.evidence}</p></div></div>)}</div> : <EmptyState icon={<Microscope className="h-8 w-8" />} title="No strong visual symptom" message="Add a closer image or more symptom details." />}</Card>
              <Card className="p-5"><h3 className="font-bold text-brand-text">Immediate next steps</h3><div className="mt-4 space-y-3">{diagnosis.immediateActions.map((action, index) => <div key={action} className="flex items-start gap-3"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-primary text-xs font-bold text-white">{index + 1}</span><p className="text-sm leading-relaxed text-brand-text">{action}</p></div>)}</div></Card>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="flex items-center gap-2 text-lg font-bold text-brand-text"><History className="h-5 w-5 text-brand-purple" /> Crop scan history</h2><p className="mt-1 text-sm text-brand-muted">Compare repeat images and track disease progression, treatment, and verification outcomes.</p></div><Badge variant="muted">{history.length} saved</Badge></div>
        {history.length === 0 ? <EmptyState icon={<FileImage className="h-9 w-9" />} title="No crop scans yet" message="Your completed analyses will appear here." /> : <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{history.slice(0, 9).map((item) => <button type="button" key={item.id} onClick={() => selectHistory(item)} className="group overflow-hidden rounded-xl border border-brand-border bg-white text-left transition hover:-translate-y-0.5 hover:border-brand-primary/35 hover:shadow-lift"><div className="flex gap-3 p-3">{item.imageDataUrl ? <img src={item.imageDataUrl} alt="Crop diagnosis thumbnail" className="h-16 w-16 shrink-0 rounded-lg object-cover" /> : <div className="grid h-16 w-16 shrink-0 place-items-center rounded-lg bg-brand-soft"><Leaf className="h-6 w-6 text-brand-primary" /></div>}<div className="min-w-0"><p className="truncate text-sm font-bold text-brand-text">{item.cropCandidates[0]?.commonName}</p><p className="truncate text-xs font-semibold text-brand-primary">{item.conditionCandidates[0]?.name}</p><p className="mt-1 flex items-center gap-1 text-[11px] text-brand-muted"><Clock3 className="h-3 w-3" />{formatDate(item.createdAt)}</p></div></div></button>)}</div>}
      </Card>
    </div>
  );
}
