// ============================================================
// AgriSmart — Drone Operations Seed Data
// ============================================================
import type {
DroneAlert,
DroneDock,
DroneGridCell,
DroneMission,
DroneWeatherWindow,
FarmDrone,
GridCellStatus,
} from '@/types/drone';

const now = new Date('2026-07-26T10:45:00.000Z');
const minutesAgo = (minutes: number) => new Date(now.getTime() - minutes * 60_000).toISOString();
const minutesAhead = (minutes: number) => new Date(now.getTime() + minutes * 60_000).toISOString();

export const farmDrones: FarmDrone[] = [
  {
    id: 'drone-rgb-01',
    name: 'KT-Survey-01',
    model: 'AeroMap X4',
    payload: 'rgb',
    status: 'in_mission',
    batteryPercent: 78,
    temperatureC: 47,
    signalPercent: 96,
    altitudeM: 40,
    speedMps: 7.2,
    maxFlightMinutes: 38,
    remainingFlightMinutes: 24,
    assignedMissionId: 'mission-active-01',
    dockId: 'dock-solar-01',
    location: { x: 18, y: 26, lat: 18.5324, lng: 73.8471 },
    firmware: 'PX4 1.15.2',
    flightHours: 126.4,
    nextServiceHours: 150,
    lastSeen: minutesAgo(0),
  },
  {
    id: 'drone-multispectral-04',
    name: 'AG-MultiSpec-04',
    model: 'SpectraLeaf M8',
    payload: 'multispectral',
    status: 'in_mission',
    batteryPercent: 74,
    temperatureC: 45,
    signalPercent: 94,
    altitudeM: 38,
    speedMps: 6.7,
    maxFlightMinutes: 36,
    remainingFlightMinutes: 22,
    assignedMissionId: 'mission-active-01',
    dockId: 'dock-solar-01',
    location: { x: 35, y: 34, lat: 18.5321, lng: 73.8481 },
    firmware: 'PX4 1.15.2',
    flightHours: 63.7,
    nextServiceHours: 80,
    lastSeen: minutesAgo(0),
  },
  {
    id: 'drone-thermal-02',
    name: 'KT-Thermal-02',
    model: 'ThermaScout T6',
    payload: 'thermal',
    status: 'in_mission',
    batteryPercent: 71,
    temperatureC: 51,
    signalPercent: 92,
    altitudeM: 35,
    speedMps: 6.1,
    maxFlightMinutes: 34,
    remainingFlightMinutes: 20,
    assignedMissionId: 'mission-active-01',
    dockId: 'dock-solar-01',
    location: { x: 54, y: 43, lat: 18.5318, lng: 73.8488 },
    firmware: 'ArduPilot 4.6.0',
    flightHours: 88.2,
    nextServiceHours: 100,
    lastSeen: minutesAgo(0),
  },
  {
    id: 'drone-spray-03',
    name: 'KT-Spray-03',
    model: 'AgriFlow S10',
    payload: 'sprayer',
    status: 'ready',
    batteryPercent: 96,
    temperatureC: 34,
    signalPercent: 100,
    altitudeM: 0,
    speedMps: 0,
    maxFlightMinutes: 22,
    remainingFlightMinutes: 21,
    dockId: 'dock-solar-01',
    location: { x: 92, y: 88, lat: 18.5309, lng: 73.8501 },
    firmware: 'PX4 1.15.2',
    flightHours: 54.8,
    nextServiceHours: 75,
    lastSeen: minutesAgo(1),
  },
];

const issueCells: Record<string, GridCellStatus> = {
  '1-5': 'water_stress', '1-6': 'water_stress', '2-5': 'water_stress',
  '2-2': 'disease_risk', '2-3': 'disease_risk', '3-2': 'disease_risk',
  '4-6': 'treatment_scheduled', '4-7': 'treatment_scheduled',
  '5-1': 'treated', '5-2': 'treated',
};

function buildGrid(): DroneGridCell[] {
  const cells: DroneGridCell[] = [];
  for (let row = 0; row < 6; row += 1) {
    for (let column = 0; column < 8; column += 1) {
      const key = `${row}-${column}`;
      const status = issueCells[key] || (row === 5 && column > 5 ? 'scan_pending' : 'healthy');
      const assignedDroneId = row < 2 ? 'drone-rgb-01' : row < 4 ? 'drone-thermal-02' : 'drone-spray-03';
      const diseaseConfidence = status === 'disease_risk' ? 91 - column : status === 'healthy' ? 4 + ((row + column) % 5) : 12;
      const waterStress = status === 'water_stress' ? 78 + column : status === 'healthy' ? 16 + ((row * 3 + column) % 12) : 34;
      const healthScore = status === 'healthy' ? 91 - ((row + column) % 7) : status === 'treated' ? 82 : status === 'scan_pending' ? 0 : 58;

      cells.push({
        id: `cell-${row + 1}-${column + 1}`,
        row,
        column,
        status,
        crop: 'Tomato · Arka Rakshak',
        healthScore,
        waterStressPercent: waterStress,
        diseaseConfidencePercent: diseaseConfidence,
        canopyTemperatureC: status === 'water_stress' ? 34.8 + column * 0.2 : 28.4 + ((row + column) % 5) * 0.4,
        assignedDroneId,
        lastScannedAt: status === 'scan_pending' ? undefined : minutesAgo(12 + row * 4 + column),
        recommendedAction:
          status === 'water_stress' ? 'Inspect irrigation pressure and run a targeted 18-minute watering cycle.' :
          status === 'disease_risk' ? 'Capture a closer RGB pass and request farmer approval before spot treatment.' :
          status === 'treatment_scheduled' ? 'Precision spray mission is queued for the safe weather window.' :
          status === 'treated' ? 'Re-scan after 24 hours to verify treatment effectiveness.' :
          status === 'scan_pending' ? 'Cell is queued for the current survey mission.' :
          'No action needed. Continue scheduled monitoring.',
      });
    }
  }
  return cells;
}

export const droneGridCells = buildGrid();

export const droneMissions: DroneMission[] = [
  {
    id: 'mission-active-01',
    name: 'Morning crop intelligence sweep',
    type: 'rgb_survey',
    status: 'active',
    progressPercent: 42,
    assignedDroneIds: ['drone-rgb-01', 'drone-multispectral-04', 'drone-thermal-02'],
    gridCellIds: droneGridCells.filter((cell) => cell.row < 4).map((cell) => cell.id),
    coverageAcres: 14.6,
    routeLengthKm: 8.4,
    estimatedMinutes: 31,
    altitudeM: 40,
    sideOverlapPercent: 30,
    frontOverlapPercent: 75,
    scheduledAt: minutesAgo(20),
    startedAt: minutesAgo(14),
    objective: 'Generate RGB, multispectral, and thermal layers, calculate NDVI/NDRE, identify water stress, and flag crop anomalies.',
  },
  {
    id: 'mission-planned-02',
    name: 'Targeted disease treatment',
    type: 'precision_spray',
    status: 'scheduled',
    progressPercent: 0,
    assignedDroneIds: ['drone-spray-03'],
    gridCellIds: droneGridCells.filter((cell) => cell.status === 'treatment_scheduled').map((cell) => cell.id),
    coverageAcres: 1.8,
    routeLengthKm: 1.2,
    estimatedMinutes: 12,
    altitudeM: 4,
    sideOverlapPercent: 10,
    frontOverlapPercent: 20,
    scheduledAt: minutesAhead(95),
    objective: 'Apply fungicide only to approved grid cells using a variable-rate spray plan.',
  },
  {
    id: 'mission-completed-03',
    name: 'Post-irrigation verification',
    type: 'thermal_survey',
    status: 'completed',
    progressPercent: 100,
    assignedDroneIds: ['drone-thermal-02'],
    gridCellIds: droneGridCells.filter((cell) => cell.row >= 4).map((cell) => cell.id),
    coverageAcres: 5.2,
    routeLengthKm: 3.1,
    estimatedMinutes: 18,
    altitudeM: 35,
    sideOverlapPercent: 35,
    frontOverlapPercent: 80,
    scheduledAt: new Date('2026-07-25T01:15:00.000Z').toISOString(),
    startedAt: new Date('2026-07-25T01:18:00.000Z').toISOString(),
    completedAt: new Date('2026-07-25T01:36:00.000Z').toISOString(),
    objective: 'Verify that the previous irrigation action reduced canopy temperature variance.',
  },
];

export const droneDock: DroneDock = {
  id: 'dock-solar-01',
  name: 'North Field Solar Dock',
  status: 'online',
  solarGenerationKw: 3.8,
  solarCapacityKw: 5.0,
  batteryStoragePercent: 87,
  dockTemperatureC: 32,
  occupiedDroneId: 'drone-spray-03',
  chargingRatePercentPerHour: 42,
  weatherStationOnline: true,
  location: { lat: 18.5309, lng: 73.8501 },
};

export const droneWeather: DroneWeatherWindow = {
  temperatureC: 29,
  windSpeedKph: 12,
  windDirection: 'WSW',
  humidityPercent: 67,
  rainProbabilityPercent: 8,
  solarIntensityWm2: 746,
  gpsAccuracyM: 0.8,
  flightSafe: true,
  safeUntil: minutesAhead(142),
};

export const droneAlerts: DroneAlert[] = [
  {
    id: 'drone-alert-01',
    severity: 'warning',
    title: 'Thermal hotspot detected',
    message: 'KT-Thermal-02 measured a sustained 51°C internal temperature. Automatic return begins at 65°C.',
    source: 'KT-Thermal-02',
    timestamp: minutesAgo(2),
    acknowledged: false,
  },
  {
    id: 'drone-alert-02',
    severity: 'info',
    title: 'Spray mission waiting for approval',
    message: 'Two disease-risk cells are ready for farmer approval before chemical application.',
    source: 'Mission controller',
    timestamp: minutesAgo(18),
    acknowledged: false,
  },
  {
    id: 'drone-alert-03',
    severity: 'info',
    title: 'Solar storage healthy',
    message: 'The docking station has enough stored energy for 4.3 full charging cycles.',
    source: 'North Field Solar Dock',
    timestamp: minutesAgo(31),
    acknowledged: true,
  },
];
