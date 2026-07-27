// ============================================================
// AgriSmart — Patent-oriented autonomous treatment domain types
// ============================================================

export interface GeoCoordinate {
  lat: number;
  lng: number;
  altitudeM?: number;
}

export interface SensorConfidence {
  value: number;
  uncertainty: number;
}

export interface MultimodalPlantCapture {
  captureId: string;
  capturedAt: string;
  rgb: {
    lesionAreaPercent: number;
    chlorosisPercent: number;
    textureAnomaly: number;
    confidence: number;
  };
  multispectral: {
    ndvi: number;
    ndre: number;
    chlorophyllIndex: number;
    confidence: number;
  };
  thermal: {
    canopyTemperatureC: number;
    healthyBaselineC: number;
    differentialC: number;
    confidence: number;
  };
}

export interface LocalizationEvidence {
  gnss: GeoCoordinate & { accuracyM: number };
  rtk?: GeoCoordinate & { accuracyM: number; fixed: boolean };
  inertial: { driftM: number; headingDeg: number; velocityMps: number };
  visualOdometry: { offsetEastM: number; offsetNorthM: number; confidence: number };
  rowStructure: { rowIndex: number; plantIndex: number; confidence: number };
}

export interface FusedPlantLocalization {
  persistentPlantId: string;
  coordinate: GeoCoordinate;
  accuracyM: number;
  sources: string[];
  rowIndex: number;
  plantIndex: number;
}

export interface DiseaseSeverityAssessment {
  continuousSeverity: number;
  diseaseProbability: number;
  earlyStageProbability: number;
  uncertainty: number;
  evidence: {
    lesion: number;
    spectralStress: number;
    thermalStress: number;
    textureAnomaly: number;
  };
}

export interface ChemicalLabelConstraint {
  chemicalName: string;
  minimumDoseMlPerPlant: number;
  maximumDoseMlPerPlant: number;
  maximumWindKph: number;
  minimumTemperatureC: number;
  maximumTemperatureC: number;
  maximumRainProbabilityPercent: number;
  reentryHours: number;
}

export interface EnvironmentSnapshot {
  windSpeedKph: number;
  windDirectionDeg: number;
  temperatureC: number;
  humidityPercent: number;
  rainProbabilityPercent: number;
  solarIntensityWm2: number;
}

export interface SeverityDosePolicy {
  policyId: string;
  version: number;
  baseDoseMl: number;
  gain: number;
  curveExponent: number;
  learningRate: number;
  uncertaintyThreshold: number;
  minimumTreatmentSeverity: number;
}

export interface PrescriptionDecision {
  targetDoseMl: number;
  unconstrainedDoseMl: number;
  suppressed: boolean;
  suppressionReasons: string[];
  constraintNotes: string[];
  policyVersion: number;
}

export interface NozzleChannelCommand {
  channelId: string;
  targetFlowMlPerSecond: number;
  measuredFlowMlPerSecond: number;
  pwmPercent: number;
  openWindowMs: number;
  gatingAdvanceMs: number;
  windDriftCompensationM: number;
  enabled: boolean;
}

export interface VehicleTreatmentCommand {
  commandId: string;
  plantId: string;
  prescribedDoseMl: number;
  vehicleSpeedMps: number;
  targetCoordinate: GeoCoordinate;
  nozzleCommands: NozzleChannelCommand[];
  issuedAt: string;
  expiresAt: string;
  requiresOperatorApproval: boolean;
  geofenceValidated: boolean;
}

export interface PlantTreatmentRecord {
  recordId: string;
  plantId: string;
  observedAt: string;
  severity: number;
  uncertainty: number;
  prescribedDoseMl: number;
  deliveredDoseMl: number;
  treatmentSuppressed: boolean;
  efficacyScore?: number;
  revisitScheduledAt?: string;
  policyVersion: number;
}

export interface DiseaseProgressionPoint {
  hour: number;
  untreatedSeverity: number;
  treatedSeverity: number;
}

export interface DigitalTwinForecast {
  plantId: string;
  generatedAt: string;
  treatmentEfficacy: number;
  points: DiseaseProgressionPoint[];
  expectedRecoveryHours: number;
}

export interface PlantTreatmentPlan {
  capture: MultimodalPlantCapture;
  localization: FusedPlantLocalization;
  severity: DiseaseSeverityAssessment;
  prescription: PrescriptionDecision;
  command: VehicleTreatmentCommand;
  forecast: DigitalTwinForecast;
}

export type ClaimImplementationStatus = 'implemented' | 'hardware-interface' | 'validation-required';

export interface PatentClaimCoverage {
  claimNumber: number;
  title: string;
  implementation: string;
  sourceFiles: string[];
  status: ClaimImplementationStatus;
  acceptanceEvidence: string;
}


export interface RealTimeControlStepRequest {
  missionId: string;
  plan: PlantTreatmentPlan;
  telemetry: {
    timestamp: string;
    vehicleSpeedMps: number;
    measuredFlowMlPerSecond: number;
    windSpeedKph: number;
    position: GeoCoordinate;
    internalTemperatureC?: number;
  };
  operatorApprovalCode?: string;
  mode: 'simulation' | 'live';
}

export interface RealTimeControlStepReceipt {
  accepted: boolean;
  command: VehicleTreatmentCommand;
  nextControlStepMs: number;
  safetyState: 'clear' | 'suppressed' | 'return-to-dock';
  message: string;
}

export interface TreatmentMissionRequest {
  missionName: string;
  farmId: string;
  plantPlans: PlantTreatmentPlan[];
  operatorApprovalCode?: string;
  mode: 'simulation' | 'live';
}

export interface TreatmentMissionReceipt {
  missionId: string;
  status: 'queued' | 'rejected' | 'simulation_saved';
  createdAt: string;
  message: string;
}
