// ============================================================
// AgriSmart — Patent claim implementation seed and calibration data
// ============================================================
import { buildPlantTreatmentPlan } from '@/lib/patentEngine';
import type {
  ChemicalLabelConstraint,
  EnvironmentSnapshot,
  LocalizationEvidence,
  MultimodalPlantCapture,
  PatentClaimCoverage,
  PlantTreatmentPlan,
  PlantTreatmentRecord,
  SeverityDosePolicy,
} from '@/types/patent';

export const defaultSeverityDosePolicy: SeverityDosePolicy = {
  policyId: 'severity-dose-tomato-fungal-v1',
  version: 1,
  baseDoseMl: 0.18,
  gain: 0.88,
  curveExponent: 1.35,
  learningRate: 0.08,
  uncertaintyThreshold: 0.3,
  minimumTreatmentSeverity: 0.2,
};

export const defaultChemicalConstraint: ChemicalLabelConstraint = {
  chemicalName: 'Bio-fungicide A',
  minimumDoseMlPerPlant: 0.3,
  maximumDoseMlPerPlant: 8,
  maximumWindKph: 18,
  minimumTemperatureC: 12,
  maximumTemperatureC: 36,
  maximumRainProbabilityPercent: 35,
  reentryHours: 4,
};

export const defaultTreatmentEnvironment: EnvironmentSnapshot = {
  windSpeedKph: 11,
  windDirectionDeg: 248,
  temperatureC: 29,
  humidityPercent: 67,
  rainProbabilityPercent: 8,
  solarIntensityWm2: 746,
};

const captures: MultimodalPlantCapture[] = [
  {
    captureId: 'capture-row-12-plant-08',
    capturedAt: '2026-07-26T10:24:00.000Z',
    rgb: { lesionAreaPercent: 22, chlorosisPercent: 18, textureAnomaly: 0.86, confidence: 0.94 },
    multispectral: { ndvi: 0.47, ndre: 0.42, chlorophyllIndex: 0.51, confidence: 0.93 },
    thermal: { canopyTemperatureC: 33.8, healthyBaselineC: 28.7, differentialC: 5.1, confidence: 0.9 },
  },
  {
    captureId: 'capture-row-12-plant-09',
    capturedAt: '2026-07-26T10:24:01.000Z',
    rgb: { lesionAreaPercent: 8, chlorosisPercent: 11, textureAnomaly: 0.58, confidence: 0.91 },
    multispectral: { ndvi: 0.56, ndre: 0.49, chlorophyllIndex: 0.59, confidence: 0.92 },
    thermal: { canopyTemperatureC: 31.9, healthyBaselineC: 28.7, differentialC: 3.2, confidence: 0.89 },
  },
  {
    captureId: 'capture-row-13-plant-03',
    capturedAt: '2026-07-26T10:24:08.000Z',
    rgb: { lesionAreaPercent: 2, chlorosisPercent: 6, textureAnomaly: 0.36, confidence: 0.9 },
    multispectral: { ndvi: 0.61, ndre: 0.5, chlorophyllIndex: 0.62, confidence: 0.95 },
    thermal: { canopyTemperatureC: 31.2, healthyBaselineC: 28.6, differentialC: 2.6, confidence: 0.92 },
  },
  {
    captureId: 'capture-row-13-plant-04',
    capturedAt: '2026-07-26T10:24:09.000Z',
    rgb: { lesionAreaPercent: 34, chlorosisPercent: 28, textureAnomaly: 0.92, confidence: 0.96 },
    multispectral: { ndvi: 0.36, ndre: 0.31, chlorophyllIndex: 0.39, confidence: 0.94 },
    thermal: { canopyTemperatureC: 35.1, healthyBaselineC: 28.6, differentialC: 6.5, confidence: 0.91 },
  },
  {
    captureId: 'capture-row-14-plant-11',
    capturedAt: '2026-07-26T10:24:18.000Z',
    rgb: { lesionAreaPercent: 0.5, chlorosisPercent: 2, textureAnomaly: 0.12, confidence: 0.97 },
    multispectral: { ndvi: 0.81, ndre: 0.74, chlorophyllIndex: 0.78, confidence: 0.96 },
    thermal: { canopyTemperatureC: 28.9, healthyBaselineC: 28.5, differentialC: 0.4, confidence: 0.94 },
  },
];

function localization(index: number): LocalizationEvidence {
  const rowIndex = 12 + Math.floor(index / 2);
  const plantIndex = [8, 9, 3, 4, 11][index];
  const lat = 18.5322 + index * 0.000008;
  const lng = 73.8474 + index * 0.000011;
  return {
    gnss: { lat, lng, altitudeM: 4.2, accuracyM: 1.1 },
    rtk: { lat: lat + 0.000001, lng: lng - 0.000001, altitudeM: 4.2, accuracyM: 0.025, fixed: true },
    inertial: { driftM: 0.18 + index * 0.02, headingDeg: 87, velocityMps: 3.1 },
    visualOdometry: { offsetEastM: 0.04 * index, offsetNorthM: -0.03 * index, confidence: 0.92 - index * 0.015 },
    rowStructure: { rowIndex, plantIndex, confidence: 0.97 },
  };
}

export const plantTreatmentPlans: PlantTreatmentPlan[] = captures.map((capture, index) => buildPlantTreatmentPlan({
  farmId: 'farm-1',
  capture,
  localizationEvidence: localization(index),
  policy: defaultSeverityDosePolicy,
  chemical: defaultChemicalConstraint,
  environment: defaultTreatmentEnvironment,
  localDiseaseDensity: [0.72, 0.48, 0.3, 0.9, 0.08][index],
  selectedNozzleChannel: [2, 3, 4, 5, 6][index],
}));

export const plantTreatmentHistory: PlantTreatmentRecord[] = plantTreatmentPlans.map((plan, index) => ({
  recordId: `record-${index + 1}`,
  plantId: plan.localization.persistentPlantId,
  observedAt: new Date(Date.parse(plan.capture.capturedAt) - 24 * 60 * 60 * 1000).toISOString(),
  severity: Math.max(0.08, plan.severity.continuousSeverity + 0.11),
  uncertainty: plan.severity.uncertainty,
  prescribedDoseMl: plan.prescription.targetDoseMl,
  deliveredDoseMl: plan.prescription.suppressed ? 0 : Math.max(0, plan.prescription.targetDoseMl * (0.97 + index * 0.004)),
  treatmentSuppressed: plan.prescription.suppressed,
  efficacyScore: plan.prescription.suppressed ? undefined : 0.79 + index * 0.03,
  revisitScheduledAt: plan.prescription.suppressed ? '2026-07-26T16:30:00.000Z' : undefined,
  policyVersion: plan.prescription.policyVersion,
}));

export const patentClaimCoverage: PatentClaimCoverage[] = [
  {
    claimNumber: 1,
    title: 'Plant-specific variable-rate UAV treatment system',
    implementation: 'End-to-end capture, perception, continuous severity, constrained prescription, geolocation, independent nozzle control, and speed adaptation.',
    sourceFiles: ['src/lib/patentEngine.ts', 'src/components/drone/PatentTreatmentConsole.tsx', 'server/index.mjs'],
    status: 'hardware-interface',
    acceptanceEvidence: 'Treatment plan produces a georeferenced command with plant ID, dose, vehicle speed, and independent nozzle channel instructions.',
  },
  {
    claimNumber: 2,
    title: 'RGB, multispectral, and thermal fusion',
    implementation: 'Severity engine fuses lesion segmentation features, NDVI/NDRE/chlorophyll indices, and thermal differentials.',
    sourceFiles: ['src/lib/patentEngine.ts', 'src/data/patentSeed.ts'],
    status: 'implemented',
    acceptanceEvidence: 'Every plant plan displays modality evidence and a fused continuous severity score.',
  },
  {
    claimNumber: 3,
    title: 'Continuous severity-to-dose function with constraints',
    implementation: 'Programmable power curve maps severity to dose and enforces chemical-label and environmental limits.',
    sourceFiles: ['src/lib/patentEngine.ts'],
    status: 'implemented',
    acceptanceEvidence: 'Dose output includes unconstrained value, constrained value, and reasons for suppression or adjustment.',
  },
  {
    claimNumber: 4,
    title: 'Predictive timing for motion, droplet travel, and wind',
    implementation: 'Gating advance combines vehicle speed, nozzle offset, droplet travel time, and wind-drift compensation.',
    sourceFiles: ['src/lib/patentEngine.ts'],
    status: 'hardware-interface',
    acceptanceEvidence: 'Enabled nozzle command exposes gating advance milliseconds and wind-drift compensation metres.',
  },
  {
    claimNumber: 5,
    title: 'PWM closed-loop micro-dose in 50–200 ms',
    implementation: 'Per-channel target flow, measured flow feedback, PWM duty cycle, and clamped 50–200 ms actuation window.',
    sourceFiles: ['src/lib/patentEngine.ts', 'server/index.mjs'],
    status: 'hardware-interface',
    acceptanceEvidence: 'Nozzle console renders target/measured flow, PWM, and actuation window for every independent channel.',
  },
  {
    claimNumber: 6,
    title: 'Flight-speed adjustment for disease density',
    implementation: 'Vehicle speed decreases continuously as local disease density and prescribed dose rise.',
    sourceFiles: ['src/lib/patentEngine.ts'],
    status: 'implemented',
    acceptanceEvidence: 'Plant plans expose adapted metres-per-second values used by the command.',
  },
  {
    claimNumber: 7,
    title: 'Uncertainty suppression and revisit',
    implementation: 'Treatment is suppressed above a configurable uncertainty threshold and a revisit record is created.',
    sourceFiles: ['src/lib/patentEngine.ts', 'src/components/drone/PatentTreatmentConsole.tsx'],
    status: 'implemented',
    acceptanceEvidence: 'Suppressed plans show zero dose, explicit reasons, and a revisit action.',
  },
  {
    claimNumber: 8,
    title: 'Historical severity and dosing adaptation',
    implementation: 'Plant-level treatment history, efficacy logging, progression forecasts, and policy updates from observed reward.',
    sourceFiles: ['src/lib/patentEngine.ts', 'src/data/patentSeed.ts'],
    status: 'implemented',
    acceptanceEvidence: 'History and adaptive-policy controls update gain and curve exponent with a new policy version.',
  },
  {
    claimNumber: 9,
    title: 'GNSS/RTK, visual odometry, and row constraints',
    implementation: 'Weighted localization fusion assigns a persistent plant ID from farm, row, plant index, and fused coordinates.',
    sourceFiles: ['src/lib/patentEngine.ts'],
    status: 'hardware-interface',
    acceptanceEvidence: 'Plant plan lists fused accuracy, sources, row, plant index, and persistent identifier.',
  },
  {
    claimNumber: 10,
    title: 'Cloud analytics and digital twin',
    implementation: 'Dashboard, efficacy assessment, plant history, and treated-versus-untreated disease progression forecast.',
    sourceFiles: ['src/components/drone/PatentTreatmentConsole.tsx', 'server/index.mjs'],
    status: 'implemented',
    acceptanceEvidence: 'Digital twin provides forecast points and expected recovery time.',
  },
  {
    claimNumber: 11,
    title: 'Complete UAV treatment method',
    implementation: 'The buildPlantTreatmentPlan orchestrator performs capture-to-command and outcome logging in the claimed order.',
    sourceFiles: ['src/lib/patentEngine.ts'],
    status: 'implemented',
    acceptanceEvidence: 'One callable method returns severity, dose, timing, speed, nozzle commands, and forecast.',
  },
  {
    claimNumber: 12,
    title: 'Reinforcement learning policy tuning',
    implementation: 'A reward-driven temporal-difference update adapts dose gain and curve exponent subject to safe bounds.',
    sourceFiles: ['src/lib/patentEngine.ts'],
    status: 'validation-required',
    acceptanceEvidence: 'Policy adaptation creates a versioned policy from efficacy and chemical-use efficiency reward.',
  },
  {
    claimNumber: 13,
    title: 'Early-stage infection using thermal and multispectral cues',
    implementation: 'Early-stage probability weights spectral and thermal stress before visible lesion area dominates.',
    sourceFiles: ['src/lib/patentEngine.ts'],
    status: 'implemented',
    acceptanceEvidence: 'Plants with low lesion area can still produce elevated early-stage probability from non-RGB cues.',
  },
  {
    claimNumber: 14,
    title: 'Computer-readable implementation',
    implementation: 'Versioned AUTONOMOUS_TREATMENT_PROGRAM exports executable steps and treatment-policy functions.',
    sourceFiles: ['src/lib/patentEngine.ts'],
    status: 'implemented',
    acceptanceEvidence: 'The application build contains executable instructions for claims 11–13.',
  },
];
