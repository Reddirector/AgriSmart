// ============================================================
// AgriSmart — Core Type Definitions
// ============================================================

export type UserRole = 'farmer' | 'buyer' | 'verifier' | 'admin';
export type Locale = 'en' | 'hi' | 'bn' | 'te' | 'mr' | 'ta' | 'gu' | 'kn' | 'ml' | 'pa' | 'or' | 'as';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';
export type AgreementState =
  | 'draft' | 'sent_for_review' | 'negotiation' | 'farmer_approved' | 'buyer_approved'
  | 'escrow_funded' | 'active' | 'produce_ready' | 'inspection_pending'
  | 'delivery_confirmed' | 'payment_released' | 'completed' | 'disputed' | 'cancelled';

export type PaymentStatus = 'pending' | 'escrow_held' | 'released' | 'refunded' | 'failed';
export type SensorType =
  | 'soil_moisture' | 'soil_temperature' | 'air_temperature' | 'humidity' | 'rainfall'
  | 'water_level' | 'soil_ph' | 'ec' | 'nitrogen' | 'phosphorus' | 'potassium'
  | 'light' | 'leaf_wetness' | 'irrigation_flow' | 'pump_status' | 'battery' | 'connectivity';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  avatar?: string;
  language: Locale;
  identityVerified: VerificationStatus;
  kccStatus: VerificationStatus;
  createdAt: string;
  lastActive: string;
  state?: string;
  district?: string;
}

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Farm {
  id: string;
  farmerId: string;
  name: string;
  state: string;
  district: string;
  village: string;
  areaAcres: number;
  lat: number;
  lng: number;
  boundary?: GeoPoint[];
  boundarySource?: 'gps' | 'manual' | 'area_estimate' | 'imported' | 'search';
  boundaryUpdatedAt?: string;
  zones: FarmZone[];
  trustScore: number;
  verified: boolean;
}

export interface FarmZone {
  id: string;
  name: string;
  crop: string;
  variety: string;
  areaAcres: number;
  deviceId?: string;
}

export interface Device {
  id: string;
  farmId: string;
  zoneId: string;
  name: string;
  model: string;
  firmware: string;
  battery: number;
  connectivity: 'online' | 'offline' | 'degraded';
  lastSeen: string;
  sensors: SensorType[];
  location: { lat: number; lng: number };
  certificateVerified: boolean;
}

export interface SensorReading {
  deviceId: string;
  sensorType: SensorType;
  value: number;
  unit: string;
  timestamp: string;
  confidence: number;
  signature: string;
  validationStatus: 'valid' | 'anomaly' | 'tamper_suspected';
}

export interface ProduceListing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerState: string;
  crop: string;
  variety: string;
  quantity: number;
  unit: string;
  minPrice: number;
  qualityGrade: 'A' | 'B' | 'C';
  harvestDate: string;
  deliveryOptions: string[];
  certifications: string[];
  sensorSupported: boolean;
  verified: boolean;
  photos: string[];
  createdAt: string;
}

export interface BuyerOffer {
  id: string;
  listingId: string;
  buyerId: string;
  buyerName: string;
  offeredPrice: number;
  quantity: number;
  deliveryLocation: string;
  deliveryDate: string;
  paymentTerms: string;
  inspectionRequired: boolean;
  status: 'pending' | 'accepted' | 'rejected' | 'negotiating';
  createdAt: string;
}

export interface TradeAgreement {
  id: string;
  farmerId: string;
  farmerName: string;
  buyerId: string;
  buyerName: string;
  crop: string;
  variety: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalValue: number;
  state: AgreementState;
  escrowAmount: number;
  advancePercent: number;
  deliveryDate: string;
  deliveryLocation: string;
  qualityConditions: string;
  inspectionProcess: string;
  cancellationTerms: string;
  penaltyTerms: string;
  verifierId?: string;
  agreementHash: string;
  txHash?: string;
  milestones: AgreementMilestone[];
  createdAt: string;
  updatedAt: string;
}

export interface AgreementMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  completed: boolean;
  completedAt?: string;
  paymentAmount?: number;
}

export interface Payment {
  id: string;
  agreementId: string;
  type: 'escrow_funding' | 'advance' | 'milestone' | 'final_release' | 'refund' | 'penalty';
  amount: number;
  status: PaymentStatus;
  method: 'blockchain' | 'upi' | 'bank_transfer';
  txHash?: string;
  providerRef?: string;
  timestamp: string;
}

export interface AlertEvent {
  id: string;
  farmId: string;
  deviceId?: string;
  type: 'low_soil_moisture' | 'extreme_heat' | 'high_humidity' | 'water_shortage'
    | 'pump_failure' | 'device_offline' | 'sensor_anomaly' | 'data_spike'
    | 'low_battery' | 'signature_failure' | 'contract_condition_breach';
  severity: 'info' | 'warning' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface Inspection {
  id: string;
  agreementId?: string;
  farmId: string;
  verifierId: string;
  verifierName: string;
  type: 'farm_verification' | 'crop_inspection' | 'delivery_inspection' | 'identity_verification';
  status: 'pending' | 'scheduled' | 'completed' | 'rejected';
  scheduledDate: string;
  location: { lat: number; lng: number };
  notes?: string;
  checklist?: { item: string; passed: boolean }[];
  riskFlags?: string[];
  photos?: string[];
  geoTag?: { lat: number; lng: number; timestamp: string };
  result?: 'approved' | 'rejected' | 'needs_review';
}

export interface Dispute {
  id: string;
  agreementId: string;
  raisedBy: string;
  reason: string;
  description: string;
  status: 'open' | 'under_review' | 'resolved' | 'escalated';
  evidenceCount: number;
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface Notification {
  id: string;
  userId: string;
  category: 'alert' | 'agreement' | 'payment' | 'verification' | 'marketplace' | 'system';
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  read: boolean;
  deepLink?: string;
  timestamp: string;
}

export interface CropCycle {
  id: string;
  farmId: string;
  crop: string;
  variety: string;
  startDate: string;
  expectedHarvest: string;
  stage: 'preparation' | 'sowing' | 'growing' | 'flowering' | 'harvesting';
  areaAcres: number;
  healthScore: number;
}

export interface FarmHealthSummary {
  farmId: string;
  overallScore: number;
  soilMoisture: number;
  temperature: number;
  humidity: number;
  rainfall: number;
  irrigationStatus: 'optimal' | 'needed' | 'excessive';
  waterLevel: number;
  sensorHealth: number;
  activeAlerts: number;
}
