export type CropSupportLevel = 'verified' | 'supported' | 'experimental' | 'unknown';
export type CropConditionCategory = 'fungal' | 'bacterial' | 'viral' | 'pest' | 'nutrient' | 'water_stress' | 'heat_stress' | 'chemical' | 'physical' | 'unknown';
export type CropSeverityBand = 'minimal' | 'mild' | 'moderate' | 'severe' | 'critical';

export interface CropHealthContext {
  cropHint?: string;
  variety?: string;
  growthStage?: string;
  affectedPart?: string;
  symptomsText?: string;
  durationDays?: number;
  nearbyAffected?: 'yes' | 'no' | 'unknown';
  recentRainfall?: 'none' | 'light' | 'heavy' | 'unknown';
  irrigation?: string;
  recentInputs?: string;
  location?: string;
  farmId?: string;
}

export interface CropImageMetrics {
  width: number;
  height: number;
  brightness: number;
  contrast: number;
  sharpness: number;
  greenRatio: number;
  yellowRatio: number;
  brownRatio: number;
  whiteRatio: number;
  darkRatio: number;
  lesionRatio: number;
  qualityScore: number;
  issues: string[];
}

export interface CropCandidate {
  commonName: string;
  scientificName?: string;
  family?: string;
  confidence: number;
  supportLevel: CropSupportLevel;
  reason: string;
}

export interface CropConditionCandidate {
  name: string;
  category: CropConditionCategory;
  confidence: number;
  supportLevel: CropSupportLevel;
  reason: string;
  contagious: boolean;
  urgency: 'routine' | 'soon' | 'urgent';
}

export interface CropSymptomFinding {
  id: string;
  label: string;
  confidence: number;
  evidence: string;
}

export interface CropSeverity {
  affectedPercent: number;
  band: CropSeverityBand;
  confidence: number;
}

export interface CropHealthDiagnosis {
  id: string;
  createdAt: string;
  modelVersion: string;
  source: 'vision-model' | 'hybrid-local';
  imageName: string;
  imageDataUrl?: string;
  overlayDataUrl?: string;
  imageMetrics: CropImageMetrics;
  context: CropHealthContext;
  cropCandidates: CropCandidate[];
  conditionCandidates: CropConditionCandidate[];
  symptoms: CropSymptomFinding[];
  severity: CropSeverity;
  summary: string;
  immediateActions: string[];
  prevention: string[];
  additionalEvidence: string[];
  treatmentGate: {
    automaticTreatmentAllowed: boolean;
    reason: string;
    agronomistReviewRecommended: boolean;
  };
}

export interface CropHealthDiagnosisRequest {
  imageName: string;
  imageDataUrl: string;
  imageMetrics: CropImageMetrics;
  context: CropHealthContext;
}
