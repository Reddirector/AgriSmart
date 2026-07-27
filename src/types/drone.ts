// ============================================================
// AgriSmart — Drone Operations Domain Types
// ============================================================

export type DroneStatus = 'ready' | 'in_mission' | 'returning' | 'charging' | 'maintenance' | 'offline';
export type DronePayload = 'rgb' | 'multispectral' | 'thermal' | 'sprayer';
export type DroneMissionType = 'rgb_survey' | 'thermal_survey' | 'precision_spray' | 'verification';
export type DroneMissionStatus = 'planned' | 'scheduled' | 'active' | 'paused' | 'completed' | 'aborted';
export type GridCellStatus = 'healthy' | 'water_stress' | 'disease_risk' | 'treatment_scheduled' | 'treated' | 'scan_pending';
export type DroneAlertSeverity = 'info' | 'warning' | 'critical';

export interface DroneLocation {
  x: number;
  y: number;
  lat: number;
  lng: number;
}

export interface FarmDrone {
  id: string;
  name: string;
  model: string;
  payload: DronePayload;
  status: DroneStatus;
  batteryPercent: number;
  temperatureC: number;
  signalPercent: number;
  altitudeM: number;
  speedMps: number;
  maxFlightMinutes: number;
  remainingFlightMinutes: number;
  assignedMissionId?: string;
  dockId: string;
  location: DroneLocation;
  firmware: string;
  flightHours: number;
  nextServiceHours: number;
  lastSeen: string;
}

export interface DroneGridCell {
  id: string;
  row: number;
  column: number;
  status: GridCellStatus;
  crop: string;
  healthScore: number;
  waterStressPercent: number;
  diseaseConfidencePercent: number;
  canopyTemperatureC: number;
  assignedDroneId?: string;
  lastScannedAt?: string;
  recommendedAction: string;
}

export interface DroneMission {
  id: string;
  name: string;
  type: DroneMissionType;
  status: DroneMissionStatus;
  progressPercent: number;
  assignedDroneIds: string[];
  gridCellIds: string[];
  coverageAcres: number;
  routeLengthKm: number;
  estimatedMinutes: number;
  altitudeM: number;
  sideOverlapPercent: number;
  frontOverlapPercent: number;
  scheduledAt: string;
  startedAt?: string;
  completedAt?: string;
  objective: string;
}

export interface DroneDock {
  id: string;
  name: string;
  status: 'online' | 'degraded' | 'offline';
  solarGenerationKw: number;
  solarCapacityKw: number;
  batteryStoragePercent: number;
  dockTemperatureC: number;
  occupiedDroneId?: string;
  chargingRatePercentPerHour: number;
  weatherStationOnline: boolean;
  location: { lat: number; lng: number };
}

export interface DroneWeatherWindow {
  temperatureC: number;
  windSpeedKph: number;
  windDirection: string;
  humidityPercent: number;
  rainProbabilityPercent: number;
  solarIntensityWm2: number;
  gpsAccuracyM: number;
  flightSafe: boolean;
  safeUntil: string;
}

export interface DroneAlert {
  id: string;
  severity: DroneAlertSeverity;
  title: string;
  message: string;
  source: string;
  timestamp: string;
  acknowledged: boolean;
}
