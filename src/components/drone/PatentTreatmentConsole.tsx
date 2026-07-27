import { AlertBanner,Badge,Button,Card,Input,ProgressBar,SectionHeader,Select,StatCard,Tabs } from '@/components/ui';
import {
  defaultChemicalConstraint,
  defaultSeverityDosePolicy,
  defaultTreatmentEnvironment,
  patentClaimCoverage,
  plantTreatmentHistory,
  plantTreatmentPlans,
} from '@/data/patentSeed';
import { adaptSeverityDosePolicy,buildPlantTreatmentPlan } from '@/lib/patentEngine';
import { downloadCsv } from '@/lib/utils';
import { executeRealTimeControlStep,queueTreatmentMission,runtimeStatus } from '@/services/agrismartApi';
import type { EnvironmentSnapshot,PlantTreatmentPlan,RealTimeControlStepReceipt,SeverityDosePolicy } from '@/types/patent';
import { motion } from 'framer-motion';
import {
  Activity,
  BrainCircuit,
  CheckCircle2,
  Cloud,
  Crosshair,
  Droplets,
  Gauge,
  History,
  MapPin,
  Network,
  Radio,
  ShieldCheck,
  Sparkles,
  Sprout,
  Target,
  Thermometer,
  Wind,
  Zap,
} from 'lucide-react';
import { useMemo,useState,type ChangeEvent } from 'react';

type ConsoleTab = 'treatment' | 'twin' | 'claims';

const consoleTabs = [
  { id: 'treatment', label: '🎯 Plant treatment' },
  { id: 'twin', label: '🧠 Digital twin' },
  { id: 'claims', label: '🧾 System assurance' },
];

function percentage(value: number) {
  return `${Math.round(value * 100)}%`;
}

function clonePlanWithEnvironment(
  plan: PlantTreatmentPlan,
  policy: SeverityDosePolicy,
  environment: EnvironmentSnapshot,
) {
  return buildPlantTreatmentPlan({
    farmId: 'farm-1',
    capture: plan.capture,
    localizationEvidence: {
      gnss: { ...plan.localization.coordinate, accuracyM: Math.max(0.6, plan.localization.accuracyM * 5) },
      rtk: { ...plan.localization.coordinate, lat: plan.localization.coordinate.lat + 0.000001, accuracyM: 0.025, fixed: true },
      inertial: { driftM: 0.19, headingDeg: 87, velocityMps: 3.1 },
      visualOdometry: { offsetEastM: 0.02, offsetNorthM: -0.03, confidence: 0.94 },
      rowStructure: { rowIndex: plan.localization.rowIndex, plantIndex: plan.localization.plantIndex, confidence: 0.97 },
    },
    policy,
    chemical: defaultChemicalConstraint,
    environment,
    localDiseaseDensity: Math.min(1, plan.severity.continuousSeverity + 0.18),
    selectedNozzleChannel: Math.max(0, Math.min(7, plan.localization.plantIndex % 8)),
  });
}

export function PatentTreatmentConsole() {
  const [activeTab, setActiveTab] = useState<ConsoleTab>('treatment');
  const [selectedCaptureId, setSelectedCaptureId] = useState(plantTreatmentPlans[0].capture.captureId);
  const [policy, setPolicy] = useState(defaultSeverityDosePolicy);
  const [environment, setEnvironment] = useState(defaultTreatmentEnvironment);
  const [approvalCode, setApprovalCode] = useState('');
  const [farmerApproved, setFarmerApproved] = useState(false);
  const [missionMessage, setMissionMessage] = useState('');
  const [missionError, setMissionError] = useState('');
  const [queueing, setQueueing] = useState(false);
  const [controlRunning, setControlRunning] = useState(false);
  const [controlReceipt, setControlReceipt] = useState<RealTimeControlStepReceipt | null>(null);
  const [internalTemperatureC, setInternalTemperatureC] = useState(48);
  const [missionMode, setMissionMode] = useState<'simulation' | 'live'>('simulation');

  const sourcePlan = plantTreatmentPlans.find((plan) => plan.capture.captureId === selectedCaptureId) || plantTreatmentPlans[0];
  const plan = useMemo(
    () => clonePlanWithEnvironment(sourcePlan, policy, environment),
    [environment, policy, sourcePlan],
  );
  const enabledNozzle = plan.command.nozzleCommands.find((command) => command.enabled);

  const updateEnvironment = (key: keyof EnvironmentSnapshot, value: string) => {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) setEnvironment((current) => ({ ...current, [key]: parsed }));
  };

  const queueMission = async () => {
    setMissionMessage('');
    setMissionError('');
    if (plan.prescription.suppressed) {
      setMissionError('This plant cannot be treated because safety or uncertainty rules suppressed dosing.');
      return;
    }
    if (!farmerApproved) {
      setMissionError('Farmer approval is required before a treatment mission can be queued.');
      return;
    }
    if (missionMode === 'live' && !approvalCode.trim()) {
      setMissionError('Enter the operator approval code configured on the mission server.');
      return;
    }

    setQueueing(true);
    try {
      const receipt = await queueTreatmentMission({
        missionName: `Plant-specific treatment · ${plan.localization.persistentPlantId}`,
        farmId: 'farm-1',
        plantPlans: [plan],
        operatorApprovalCode: approvalCode.trim() || undefined,
        mode: runtimeStatus.mode === 'connected' ? missionMode : 'simulation',
      });
      setMissionMessage(`${receipt.message} Mission reference: ${receipt.missionId}.`);
    } catch (error) {
      setMissionError(error instanceof Error ? error.message : 'Mission could not be queued.');
    } finally {
      setQueueing(false);
    }
  };

  const runControlCycle = async () => {
    setMissionMessage('');
    setMissionError('');
    setControlReceipt(null);
    if (!farmerApproved) {
      setMissionError('Farmer approval is required before a treatment control cycle can run.');
      return;
    }
    if (missionMode === 'live' && !approvalCode.trim()) {
      setMissionError('Enter the operator approval code configured on the mission server.');
      return;
    }
    setControlRunning(true);
    try {
      const receipt = await executeRealTimeControlStep({
        missionId: `control-${plan.localization.persistentPlantId}`,
        plan,
        telemetry: {
          timestamp: new Date().toISOString(),
          vehicleSpeedMps: plan.command.vehicleSpeedMps,
          measuredFlowMlPerSecond: enabledNozzle?.measuredFlowMlPerSecond || 8.4,
          windSpeedKph: environment.windSpeedKph,
          internalTemperatureC,
          position: plan.localization.coordinate,
        },
        operatorApprovalCode: approvalCode.trim() || undefined,
        mode: runtimeStatus.mode === 'connected' ? missionMode : 'simulation',
      });
      setControlReceipt(receipt);
      if (receipt.accepted) setMissionMessage(receipt.message);
      else setMissionError(receipt.message);
    } catch (error) {
      setMissionError(error instanceof Error ? error.message : 'The real-time control cycle failed.');
    } finally {
      setControlRunning(false);
    }
  };

  const adaptPolicy = () => {
    setPolicy((current) => adaptSeverityDosePolicy(current, 0.88, 0.82));
    setMissionMessage('The reinforcement-learning policy was updated from efficacy and chemical-use reward.');
  };

  const exportClaims = () => {
    downloadCsv(
      'agrismart-patent-claim-coverage.csv',
      ['Claim', 'Title', 'Implementation', 'Status', 'Acceptance evidence', 'Source files'],
      patentClaimCoverage.map((claim) => [
        claim.claimNumber,
        claim.title,
        claim.implementation,
        claim.status,
        claim.acceptanceEvidence,
        claim.sourceFiles.join(' | '),
      ]),
    );
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-brand-primary/20 bg-gradient-to-br from-[#F7FBF8] via-[#EDF6F1] to-[#F4F0FA] p-5 shadow-soft sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="primary" icon={<Sparkles className="h-3.5 w-3.5" />}>Claims 1–14 software embodiment</Badge>
              <Badge variant={runtimeStatus.mode === 'connected' ? 'success' : 'info'} icon={<Radio className="h-3.5 w-3.5" />}>
                {runtimeStatus.mode === 'connected' ? 'Mission API connected' : 'Local-first safety mode'}
              </Badge>
            </div>
            <h2 className="text-2xl font-bold text-brand-text">Autonomous plant-specific treatment</h2>
            <p className="mt-2 text-sm leading-relaxed text-brand-muted">Multimodal perception, continuous severity scoring, georeferenced plant identity, constrained variable-rate dosing, predictive nozzle timing, closed-loop flow feedback, and digital-twin verification in one traceable workflow.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-[430px]">
            <div className="rounded-xl border border-white/70 bg-white/75 p-3 text-center shadow-card"><p className="text-xl font-bold text-brand-primary">14/14</p><p className="text-[10px] text-brand-muted">claims mapped</p></div>
            <div className="rounded-xl border border-white/70 bg-white/75 p-3 text-center shadow-card"><p className="text-xl font-bold text-brand-teal">3</p><p className="text-[10px] text-brand-muted">sensor modes</p></div>
            <div className="rounded-xl border border-white/70 bg-white/75 p-3 text-center shadow-card"><p className="text-xl font-bold text-brand-sky">8</p><p className="text-[10px] text-brand-muted">nozzle channels</p></div>
            <div className="rounded-xl border border-white/70 bg-white/75 p-3 text-center shadow-card"><p className="text-xl font-bold text-brand-purple">RTK</p><p className="text-[10px] text-brand-muted">plant location</p></div>
          </div>
        </div>
      </div>

      <Tabs tabs={consoleTabs} active={activeTab} onChange={(id) => setActiveTab(id as ConsoleTab)} label="Autonomous treatment workspaces" />

      {missionMessage && <AlertBanner type="success" title="Treatment workflow updated" message={missionMessage} onClose={() => setMissionMessage('')} />}
      {missionError && <AlertBanner type="error" title="Treatment mission blocked" message={missionError} onClose={() => setMissionError('')} />}

      {activeTab === 'treatment' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[0.86fr_1.14fr]">
            <Card className="p-5">
              <SectionHeader title="Plant and environment" subtitle="Change field conditions and the prescription recalculates immediately" icon={<Sprout className="h-5 w-5" />} />
              <div className="space-y-4">
                <Select
                  label="Detected plant"
                  value={selectedCaptureId}
                  onChange={(event) => setSelectedCaptureId(event.target.value)}
                  options={plantTreatmentPlans.map((item) => ({
                    value: item.capture.captureId,
                    label: `Row ${item.localization.rowIndex} · plant ${item.localization.plantIndex} · ${item.localization.persistentPlantId}`,
                  }))}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="Wind speed" suffix="km/h" type="number" value={environment.windSpeedKph} onChange={(event) => updateEnvironment('windSpeedKph', event.target.value)} />
                  <Input label="Temperature" suffix="°C" type="number" value={environment.temperatureC} onChange={(event) => updateEnvironment('temperatureC', event.target.value)} />
                  <Input label="Rain probability" suffix="%" type="number" value={environment.rainProbabilityPercent} onChange={(event) => updateEnvironment('rainProbabilityPercent', event.target.value)} />
                  <Input label="Humidity" suffix="%" type="number" value={environment.humidityPercent} onChange={(event) => updateEnvironment('humidityPercent', event.target.value)} />
                </div>
                <div className="rounded-xl border border-brand-border bg-brand-cream/65 p-4">
                  <div className="flex items-center justify-between gap-3"><p className="text-sm font-bold text-brand-text">Programmable severity-to-dose curve</p><Badge variant="primary">v{policy.version}</Badge></div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <Input label="Dose gain" type="number" min="0.35" max="1.35" step="0.01" value={policy.gain} onChange={(event) => setPolicy((current) => ({ ...current, gain: Number(event.target.value) || current.gain }))} />
                    <Input label="Curve exponent" type="number" min="0.7" max="2.4" step="0.01" value={policy.curveExponent} onChange={(event) => setPolicy((current) => ({ ...current, curveExponent: Number(event.target.value) || current.curveExponent }))} />
                    <Input label="Uncertainty limit" type="number" min="0.05" max="0.8" step="0.01" value={policy.uncertaintyThreshold} onChange={(event) => setPolicy((current) => ({ ...current, uncertaintyThreshold: Number(event.target.value) || current.uncertaintyThreshold }))} />
                    <Input label="Minimum severity" type="number" min="0" max="1" step="0.01" value={policy.minimumTreatmentSeverity} onChange={(event) => setPolicy((current) => ({ ...current, minimumTreatmentSeverity: Number(event.target.value) || 0 }))} />
                  </div>
                  <Button className="mt-3" variant="outline" size="sm" onClick={adaptPolicy} icon={<BrainCircuit className="h-4 w-4" />}>Apply RL reward update</Button>
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard label="Severity" value={Math.round(plan.severity.continuousSeverity * 100)} unit="/100" icon={<Activity className="h-5 w-5" />} accent="rose" />
                <StatCard label="Disease probability" value={Math.round(plan.severity.diseaseProbability * 100)} unit="%" icon={<Target className="h-5 w-5" />} accent="saffron" />
                <StatCard label="Prescribed dose" value={plan.prescription.targetDoseMl.toFixed(2)} unit="ml" icon={<Droplets className="h-5 w-5" />} accent="sky" />
                <StatCard label="Vehicle speed" value={plan.command.vehicleSpeedMps.toFixed(2)} unit="m/s" icon={<Gauge className="h-5 w-5" />} accent="success" />
              </div>

              <Card className="p-5">
                <SectionHeader title="Multimodal severity evidence" subtitle="RGB + multispectral + thermal fusion" icon={<Network className="h-5 w-5" />} />
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    ['RGB lesion segmentation', plan.severity.evidence.lesion, 'rose'],
                    ['RGB texture anomaly', plan.severity.evidence.textureAnomaly, 'saffron'],
                    ['Multispectral stress', plan.severity.evidence.spectralStress, 'primary'],
                    ['Thermal differential', plan.severity.evidence.thermalStress, 'sky'],
                  ].map(([label, value, accent]) => (
                    <div key={String(label)} className="rounded-xl border border-brand-border bg-white/75 p-3">
                      <div className="mb-2 flex justify-between text-xs"><span className="font-semibold text-brand-muted">{label}</span><span className="font-bold text-brand-text">{percentage(Number(value))}</span></div>
                      <ProgressBar value={Number(value) * 100} max={100} accent={accent as 'primary' | 'sky' | 'saffron' | 'success' | 'rose'} />
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant={plan.severity.uncertainty <= policy.uncertaintyThreshold ? 'success' : 'error'}>Uncertainty {percentage(plan.severity.uncertainty)}</Badge>
                  <Badge variant="info">Early-stage probability {percentage(plan.severity.earlyStageProbability)}</Badge>
                  <Badge variant="muted">NDVI {plan.capture.multispectral.ndvi.toFixed(2)}</Badge>
                  <Badge variant="warning">Thermal Δ {plan.capture.thermal.differentialC.toFixed(1)}°C</Badge>
                </div>
              </Card>

              <Card className="p-5">
                <SectionHeader title="Georeferenced plant identity" subtitle="GNSS/RTK + inertial + visual odometry + row structure" icon={<Crosshair className="h-5 w-5" />} />
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-xl bg-brand-cream/70 p-3"><p className="text-[10px] uppercase text-brand-muted">Persistent ID</p><p className="mt-1 break-all text-sm font-bold text-brand-text">{plan.localization.persistentPlantId}</p></div>
                  <div className="rounded-xl bg-brand-cream/70 p-3"><p className="text-[10px] uppercase text-brand-muted">Accuracy</p><p className="mt-1 text-lg font-bold text-brand-primary">±{plan.localization.accuracyM} m</p></div>
                  <div className="rounded-xl bg-brand-cream/70 p-3"><p className="text-[10px] uppercase text-brand-muted">Row / plant</p><p className="mt-1 text-lg font-bold text-brand-text">{plan.localization.rowIndex} / {plan.localization.plantIndex}</p></div>
                  <div className="rounded-xl bg-brand-cream/70 p-3"><p className="text-[10px] uppercase text-brand-muted">GPS position</p><p className="mt-1 text-xs font-bold text-brand-text">{plan.localization.coordinate.lat.toFixed(6)}, {plan.localization.coordinate.lng.toFixed(6)}</p></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">{plan.localization.sources.map((source) => <Badge key={source} variant="muted" icon={<MapPin className="h-3 w-3" />}>{source}</Badge>)}</div>
              </Card>
            </div>
          </div>

          <Card className="p-5">
            <SectionHeader title="Independent multi-nozzle command" subtitle="PWM closed-loop control with predictive gating and 50–200 ms micro-dose windows" icon={<Zap className="h-5 w-5" />} />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
              {plan.command.nozzleCommands.map((nozzle) => (
                <motion.div
                  key={nozzle.channelId}
                  layout
                  className={nozzle.enabled
                    ? 'rounded-xl border border-brand-primary/40 bg-gradient-to-b from-brand-primary to-brand-teal p-3 text-white shadow-lift'
                    : 'rounded-xl border border-brand-border bg-brand-cream/55 p-3 text-brand-muted'}
                >
                  <div className="flex items-center justify-between"><p className="text-xs font-bold">{nozzle.channelId.replace('nozzle-', 'N')}</p><span className={cnNozzleDot(nozzle.enabled)} /></div>
                  <p className="mt-3 text-xl font-bold">{nozzle.pwmPercent.toFixed(0)}%</p>
                  <p className="text-[10px] opacity-80">PWM duty</p>
                  <div className="mt-2 space-y-0.5 text-[10px] opacity-85"><p>{nozzle.openWindowMs} ms window</p><p>{nozzle.gatingAdvanceMs} ms advance</p><p>{nozzle.targetFlowMlPerSecond.toFixed(1)} ml/s target</p></div>
                </motion.div>
              ))}
            </div>
            {enabledNozzle && (
              <div className="mt-4 grid gap-3 rounded-xl border border-brand-border bg-[#F3F7F4] p-4 sm:grid-cols-4">
                <div><p className="text-[10px] uppercase text-brand-muted">Selected channel</p><p className="font-bold text-brand-text">{enabledNozzle.channelId}</p></div>
                <div><p className="text-[10px] uppercase text-brand-muted">Flow feedback</p><p className="font-bold text-brand-text">{enabledNozzle.measuredFlowMlPerSecond} ml/s</p></div>
                <div><p className="text-[10px] uppercase text-brand-muted">Wind drift compensation</p><p className="font-bold text-brand-text">{enabledNozzle.windDriftCompensationM} m</p></div>
                <div><p className="text-[10px] uppercase text-brand-muted">Command expiry</p><p className="font-bold text-brand-text">30 seconds</p></div>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <SectionHeader title="Approval and command queue" subtitle="The browser prepares commands; the mission server and autopilot enforce hardware safety" icon={<ShieldCheck className="h-5 w-5" />} />
            {plan.prescription.suppressed && (
              <div className="mb-4"><AlertBanner type="warning" title="Dose suppressed" message={plan.prescription.suppressionReasons.join(' ')} /></div>
            )}
            <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
              <div className="space-y-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-brand-border bg-brand-cream/55 p-4">
                  <input type="checkbox" className="mt-1 h-4 w-4" checked={farmerApproved} onChange={(event: ChangeEvent<HTMLInputElement>) => setFarmerApproved(event.target.checked)} />
                  <span><span className="block text-sm font-bold text-brand-text">Farmer approves this plant-specific prescription</span><span className="mt-1 block text-xs leading-relaxed text-brand-muted">Approval confirms the selected chemical, label constraints, mapped farm boundary, weather window, and treatment target.</span></span>
                </label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={plan.command.geofenceValidated ? 'success' : 'error'} icon={<CheckCircle2 className="h-3.5 w-3.5" />}>Geofence validated</Badge>
                  <Badge variant={environment.windSpeedKph <= defaultChemicalConstraint.maximumWindKph ? 'success' : 'error'} icon={<Wind className="h-3.5 w-3.5" />}>Wind {environment.windSpeedKph} km/h</Badge>
                  <Badge variant={plan.prescription.suppressed ? 'warning' : 'success'} icon={<Thermometer className="h-3.5 w-3.5" />}>Dose safety gate</Badge>
                </div>
              </div>
              <div className="space-y-3">
                {runtimeStatus.mode === 'connected' && (
                  <Select label="Execution mode" value={missionMode} onChange={(event) => setMissionMode(event.target.value as 'simulation' | 'live')} options={[{ value: 'simulation', label: 'Safe simulation only' }, { value: 'live', label: 'Authenticated hardware bridge' }]} />
                )}
                {runtimeStatus.mode === 'connected' && missionMode === 'live' && <Input label="Operator approval code" type="password" value={approvalCode} onChange={(event) => setApprovalCode(event.target.value)} hint="Validated only by the mission API. Never store it in frontend source." />}
                <Input label="Drone internal temperature" suffix="°C" type="number" min="0" max="100" value={internalTemperatureC} onChange={(event) => setInternalTemperatureC(Number(event.target.value) || 0)} hint="At 65°C or above, the server requests return-to-dock." />
                <Button className="w-full" loading={queueing} disabled={plan.prescription.suppressed} onClick={() => void queueMission()} icon={<Radio className="h-4 w-4" />}>{runtimeStatus.mode === 'connected' && missionMode === 'live' ? 'Queue authenticated live mission' : 'Save safe simulation'}</Button>
                <Button className="w-full" variant="outline" loading={controlRunning} disabled={plan.prescription.suppressed} onClick={() => void runControlCycle()} icon={<Activity className="h-4 w-4" />}>Run one closed-loop control cycle</Button>
                <p className="text-[10px] leading-relaxed text-brand-muted">A live command requires the Node mission API, operator authorization, calibrated flow sensors, a configured autopilot bridge, and PX4 or ArduPilot failsafes.</p>
              </div>
            </div>
            {controlReceipt && (
              <div className="mt-4 grid gap-3 rounded-xl border border-brand-border bg-white/75 p-4 sm:grid-cols-4">
                <div><p className="text-[10px] uppercase text-brand-muted">Control accepted</p><p className={controlReceipt.accepted ? 'font-bold text-brand-success' : 'font-bold text-brand-error'}>{controlReceipt.accepted ? 'Yes' : 'No'}</p></div>
                <div><p className="text-[10px] uppercase text-brand-muted">Safety state</p><p className="font-bold text-brand-text">{controlReceipt.safetyState.replace(/-/g, ' ')}</p></div>
                <div><p className="text-[10px] uppercase text-brand-muted">Next cycle</p><p className="font-bold text-brand-sky">{controlReceipt.nextControlStepMs} ms</p></div>
                <div><p className="text-[10px] uppercase text-brand-muted">Closed-loop PWM</p><p className="font-bold text-brand-purple">{controlReceipt.command.nozzleCommands.find((channel) => channel.enabled)?.pwmPercent.toFixed(1) || '0'}%</p></div>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {activeTab === 'twin' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="p-5">
            <SectionHeader title="Disease-spread digital twin" subtitle="Forecast compares untreated and prescribed-treatment trajectories" icon={<Cloud className="h-5 w-5" />} />
            <div className="relative h-72 overflow-hidden rounded-xl border border-brand-border bg-gradient-to-b from-white to-[#F3F7F4] p-4">
              <div className="absolute inset-x-4 bottom-10 top-4 flex items-end gap-2">
                {plan.forecast.points.map((point) => (
                  <div key={point.hour} className="flex h-full flex-1 items-end justify-center gap-1">
                    <motion.div initial={{ height: 0 }} animate={{ height: `${point.untreatedSeverity * 90}%` }} className="w-2 rounded-t bg-brand-rose/65" title={`Untreated ${percentage(point.untreatedSeverity)}`} />
                    <motion.div initial={{ height: 0 }} animate={{ height: `${point.treatedSeverity * 90}%` }} className="w-2 rounded-t bg-brand-success/75" title={`Treated ${percentage(point.treatedSeverity)}`} />
                  </div>
                ))}
              </div>
              <div className="absolute inset-x-4 bottom-3 flex justify-between text-[10px] text-brand-muted">{plan.forecast.points.map((point) => <span key={point.hour}>{point.hour}h</span>)}</div>
            </div>
            <div className="mt-3 flex flex-wrap gap-3 text-xs"><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-brand-rose/65" />Untreated</span><span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-sm bg-brand-success/75" />Prescribed treatment</span></div>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-brand-cream/65 p-3"><p className="text-[10px] text-brand-muted">Expected efficacy</p><p className="text-lg font-bold text-brand-success">{percentage(plan.forecast.treatmentEfficacy)}</p></div>
              <div className="rounded-xl bg-brand-cream/65 p-3"><p className="text-[10px] text-brand-muted">Recovery estimate</p><p className="text-lg font-bold text-brand-text">{plan.forecast.expectedRecoveryHours} h</p></div>
              <div className="rounded-xl bg-brand-cream/65 p-3"><p className="text-[10px] text-brand-muted">Policy version</p><p className="text-lg font-bold text-brand-purple">v{policy.version}</p></div>
              <div className="rounded-xl bg-brand-cream/65 p-3"><p className="text-[10px] text-brand-muted">Chemical re-entry</p><p className="text-lg font-bold text-brand-saffron">{defaultChemicalConstraint.reentryHours} h</p></div>
            </div>
          </Card>

          <Card className="p-5">
            <SectionHeader title="Plant-level treatment history" subtitle="Persistent records support progression prediction and policy adaptation" icon={<History className="h-5 w-5" />} />
            <div className="space-y-3">
              {plantTreatmentHistory.map((record) => (
                <div key={record.recordId} className="rounded-xl border border-brand-border bg-white/75 p-3">
                  <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-brand-text">{record.plantId}</p><p className="mt-0.5 text-[10px] text-brand-muted">{new Date(record.observedAt).toLocaleString('en-IN')}</p></div><Badge variant={record.treatmentSuppressed ? 'warning' : 'success'}>{record.treatmentSuppressed ? 'Revisit' : 'Treated'}</Badge></div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center"><div className="rounded-lg bg-brand-cream/65 p-2"><p className="font-bold text-brand-text">{percentage(record.severity)}</p><p className="text-[9px] text-brand-muted">severity</p></div><div className="rounded-lg bg-brand-cream/65 p-2"><p className="font-bold text-brand-sky">{record.deliveredDoseMl.toFixed(2)}</p><p className="text-[9px] text-brand-muted">ml delivered</p></div><div className="rounded-lg bg-brand-cream/65 p-2"><p className="font-bold text-brand-success">{record.efficacyScore ? percentage(record.efficacyScore) : '—'}</p><p className="text-[9px] text-brand-muted">efficacy</p></div></div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {activeTab === 'claims' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <Card className="p-5">
            <SectionHeader title="Claim-to-code implementation matrix" subtitle="Executable evidence for every representative claim" icon={<ShieldCheck className="h-5 w-5" />} action={<Button variant="outline" size="sm" onClick={exportClaims}>Export CSV</Button>} />
            <div className="overflow-x-auto">
              <table className="min-w-[940px] text-sm">
                <thead><tr className="border-b border-brand-border text-left text-xs uppercase tracking-wide text-brand-muted"><th className="px-3 py-3">Claim</th><th className="px-3 py-3">Subject</th><th className="px-3 py-3">Implementation</th><th className="px-3 py-3">Status</th><th className="px-3 py-3">Acceptance evidence</th></tr></thead>
                <tbody>
                  {patentClaimCoverage.map((claim) => (
                    <tr key={claim.claimNumber} className="border-b border-brand-border/65 align-top transition hover:bg-brand-cream/45">
                      <td className="px-3 py-4"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-soft font-bold text-brand-primary">{claim.claimNumber}</span></td>
                      <td className="px-3 py-4"><p className="font-bold text-brand-text">{claim.title}</p><p className="mt-1 text-[10px] leading-relaxed text-brand-muted">{claim.sourceFiles.join(' · ')}</p></td>
                      <td className="max-w-sm px-3 py-4 leading-relaxed text-brand-muted">{claim.implementation}</td>
                      <td className="px-3 py-4"><Badge variant={claim.status === 'implemented' ? 'success' : claim.status === 'hardware-interface' ? 'info' : 'warning'}>{claim.status.replace('-', ' ')}</Badge></td>
                      <td className="max-w-sm px-3 py-4 leading-relaxed text-brand-muted">{claim.acceptanceEvidence}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
          <AlertBanner type="warning" title="Physical validation remains separate" message="The software implements and documents each claim path. Physical sensor calibration, spray-flow verification, flight testing, chemical-label compliance, and jurisdiction-specific aviation approval must be evidenced with real hardware records before commercial operation." />
        </motion.div>
      )}
    </div>
  );
}

function cnNozzleDot(enabled: boolean) {
  return enabled ? 'h-2.5 w-2.5 rounded-full bg-emerald-200 shadow-[0_0_0_4px_rgba(255,255,255,0.12)]' : 'h-2.5 w-2.5 rounded-full bg-brand-border';
}
