// ============================================================
// AgriSmart — Farmer Drone Operations
// ============================================================
import { PatentTreatmentConsole } from '@/components/drone/PatentTreatmentConsole';
import { AlertBanner,Badge,Button,Card,ProgressBar,SectionHeader,StatCard,Tabs } from '@/components/ui';
import {
droneAlerts,
droneDock,
droneGridCells,
droneMissions,
droneWeather,
farmDrones,
} from '@/data/droneSeed';
import { cn,downloadCsv } from '@/lib/utils';
import { useAppStore } from '@/store';
import type {
DroneGridCell,
DroneMission,
DroneMissionStatus,
DroneMissionType,
DronePayload,
DroneStatus,
FarmDrone,
GridCellStatus,
} from '@/types/drone';
import { motion } from 'framer-motion';
import {
Activity,
AlertTriangle,
Battery,
BatteryCharging,
Camera,
CheckCircle2,
Clock,
Crosshair,
Droplets,
Eye,
Gauge,
Grid3X3,
Leaf,
MapPin,
Navigation,
Pause,
Plane,
Play,
Radio,
RotateCcw,
Route,
Settings,
ShieldCheck,
Sun,
Thermometer,
Wind,
Wrench,
Zap,
} from 'lucide-react';
import { useEffect,useMemo,useState,type ChangeEvent } from 'react';

type WorkspaceTab = 'command' | 'grid' | 'missions' | 'fleet' | 'intelligence' | 'treatment';
type MapLayer = 'health' | 'thermal' | 'rgb';

const workspaceTabs = [
  { id: 'command', label: '🎛️ Command centre' },
  { id: 'grid', label: '🗺️ Farm grid' },
  { id: 'missions', label: '🧭 Missions' },
  { id: 'fleet', label: '🔋 Fleet & dock' },
  { id: 'intelligence', label: '🌿 Crop intelligence' },
  { id: 'treatment', label: '🎯 Autonomous treatment' },
];

const payloadLabels: Record<DronePayload, string> = {
  rgb: 'RGB survey camera',
  multispectral: 'Multispectral NDVI/NDRE camera',
  thermal: 'Thermal camera',
  sprayer: 'Precision sprayer',
};

const missionTypeLabels: Record<DroneMissionType, string> = {
  rgb_survey: 'RGB crop survey',
  thermal_survey: 'Thermal water-stress survey',
  precision_spray: 'Precision spot treatment',
  verification: 'Post-action verification',
};

const statusLabels: Record<GridCellStatus, string> = {
  healthy: 'Healthy',
  water_stress: 'Water stress',
  disease_risk: 'Disease risk',
  treatment_scheduled: 'Treatment scheduled',
  treated: 'Treated',
  scan_pending: 'Scan pending',
};

const statusClasses: Record<GridCellStatus, string> = {
  healthy: 'bg-brand-success/20 border-brand-success/25 text-brand-success',
  water_stress: 'bg-brand-sky/25 border-brand-sky/35 text-brand-sky',
  disease_risk: 'bg-brand-error/20 border-brand-error/35 text-brand-error',
  treatment_scheduled: 'bg-brand-warning/25 border-brand-warning/35 text-brand-warning',
  treated: 'bg-brand-primary/25 border-brand-primary/40 text-brand-primary',
  scan_pending: 'bg-brand-border/50 border-brand-muted/20 text-brand-muted',
};

const droneAccent: Record<string, string> = {
  'drone-rgb-01': 'bg-brand-primary text-white border-brand-primary',
  'drone-multispectral-04': 'bg-brand-purple text-white border-brand-purple',
  'drone-thermal-02': 'bg-brand-saffron text-white border-brand-saffron',
  'drone-spray-03': 'bg-brand-sky text-white border-brand-sky',
};

const FARM_AREA_ACRES = 14.6;

const droneLineColor: Record<string, string> = {
  'drone-rgb-01': '#124C35',
  'drone-multispectral-04': '#6D4AA2',
  'drone-thermal-02': '#C87B25',
  'drone-spray-03': '#397EAC',
};

function formatTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Time unavailable';
  return parsed.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'Schedule unavailable';
  return parsed.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function droneStatusBadge(status: DroneStatus) {
  const config: Record<DroneStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'muted' | 'primary' }> = {
    ready: { label: 'Ready', variant: 'success' },
    in_mission: { label: 'In mission', variant: 'primary' },
    returning: { label: 'Returning', variant: 'warning' },
    charging: { label: 'Charging', variant: 'info' },
    maintenance: { label: 'Maintenance', variant: 'warning' },
    offline: { label: 'Offline', variant: 'error' },
  };
  return config[status];
}

function missionStatusBadge(status: DroneMissionStatus) {
  const config: Record<DroneMissionStatus, { label: string; variant: 'success' | 'warning' | 'error' | 'info' | 'muted' | 'primary' }> = {
    planned: { label: 'Planned', variant: 'muted' },
    scheduled: { label: 'Scheduled', variant: 'info' },
    active: { label: 'Active', variant: 'primary' },
    paused: { label: 'Paused', variant: 'warning' },
    completed: { label: 'Completed', variant: 'success' },
    aborted: { label: 'Aborted', variant: 'error' },
  };
  return config[status];
}

function routePosition(progress: number, rowStart: number, rowEnd: number) {
  const safeProgress = Math.max(0, Math.min(100, progress));
  const laneCount = Math.max(1, rowEnd - rowStart + 1);
  const laneProgress = (safeProgress / 100) * laneCount;
  const lane = Math.min(laneCount - 1, Math.floor(laneProgress));
  const withinLane = laneProgress - lane;
  const x = lane % 2 === 0 ? 8 + withinLane * 84 : 92 - withinLane * 84;
  const y = 10 + ((rowStart + lane + 0.5) / 6) * 80;
  return { x, y };
}

function statusCellClass(cell: DroneGridCell, layer: MapLayer) {
  if (layer === 'thermal') {
    if (cell.canopyTemperatureC >= 34) return 'bg-brand-error/55 border-brand-error/45 text-white';
    if (cell.canopyTemperatureC >= 31) return 'bg-brand-warning/45 border-brand-warning/40 text-brand-text';
    if (cell.canopyTemperatureC >= 29) return 'bg-brand-saffron/30 border-brand-saffron/35 text-brand-text';
    return 'bg-brand-sky/30 border-brand-sky/35 text-brand-sky';
  }
  if (layer === 'rgb') {
    if (cell.diseaseConfidencePercent >= 70) return 'bg-brand-error/20 border-brand-error/50 text-brand-error';
    if (cell.diseaseConfidencePercent >= 25) return 'bg-brand-warning/25 border-brand-warning/45 text-brand-warning';
    return 'bg-brand-success/15 border-brand-success/25 text-brand-success';
  }
  return statusClasses[cell.status];
}

function FarmGridMap({
  cells,
  drones,
  progress,
  running,
  layer,
  selectedCellId,
  onSelectCell,
  compact = false,
}: {
  cells: DroneGridCell[];
  drones: FarmDrone[];
  progress: number;
  running: boolean;
  layer: MapLayer;
  selectedCellId?: string;
  onSelectCell?: (cell: DroneGridCell) => void;
  compact?: boolean;
}) {
  const markerPositions = {
    'drone-rgb-01': routePosition(Math.min(100, progress * 1.12), 0, 1),
    'drone-thermal-02': routePosition(Math.min(100, progress * 0.94), 2, 3),
    'drone-spray-03': routePosition(Math.max(4, progress - 52), 4, 5),
  };

  return (
    <div className={cn('relative overflow-hidden rounded-xl border border-brand-border bg-[#E9EEE8]', compact ? 'p-3' : 'p-4')}>
      <div className="absolute inset-0 opacity-[0.16]" aria-hidden="true" style={{ backgroundImage: 'radial-gradient(#124C35 0.7px, transparent 0.7px)', backgroundSize: '14px 14px' }} />
      <div className="relative">
        <div className={cn('grid grid-cols-8 gap-1.5', compact ? 'min-h-[250px]' : 'min-h-[390px]')}>
          {cells.map((cell) => (
            <button
              key={cell.id}
              type="button"
              disabled={!onSelectCell}
              onClick={() => onSelectCell?.(cell)}
              aria-label={`${cell.id}, ${statusLabels[cell.status]}`}
              className={cn(
                'relative min-h-9 rounded-md border transition-all duration-200 focus-visible:z-20',
                onSelectCell && 'hover:z-20 hover:scale-[1.04] hover:shadow-soft',
                !onSelectCell && 'cursor-default',
                statusCellClass(cell, layer),
                selectedCellId === cell.id && 'ring-2 ring-brand-dark ring-offset-2 ring-offset-[#E9EEE8]',
              )}
            >
              {!compact && <span className="absolute left-1 top-1 text-[9px] font-bold opacity-75">{cell.row + 1}.{cell.column + 1}</span>}
              <span className="absolute bottom-1 right-1 h-2 w-2 rounded-full border border-white/60" style={{ backgroundColor: droneLineColor[cell.assignedDroneId || 'drone-rgb-01'] }} />
            </button>
          ))}
        </div>

        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 800 480" preserveAspectRatio="none" aria-hidden="true">
          <path d="M55 58 H745 V132 H55 V205 H745" fill="none" stroke={droneLineColor['drone-rgb-01']} strokeWidth="4" strokeDasharray="10 10" opacity="0.52" />
          <path d="M745 210 H55 V284 H745 V357 H55" fill="none" stroke={droneLineColor['drone-thermal-02']} strokeWidth="4" strokeDasharray="10 10" opacity="0.52" />
          <path d="M55 362 H745 V435 H55" fill="none" stroke={droneLineColor['drone-spray-03']} strokeWidth="4" strokeDasharray="10 10" opacity="0.48" />
        </svg>

        {drones.map((drone) => {
          const routeMarker = markerPositions[drone.id as keyof typeof markerPositions] || { x: drone.location.x, y: drone.location.y };
          const position = drone.status === 'in_mission' ? routeMarker : drone.status === 'returning' ? { x: 92, y: 88 } : { x: drone.location.x, y: drone.location.y };
          return (
            <motion.div
              key={drone.id}
              className={cn('absolute z-30 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white shadow-lift', droneAccent[drone.id])}
              animate={{ left: `${position.x}%`, top: `${position.y}%`, rotate: running ? 8 : 0 }}
              transition={{ duration: 0.7, ease: 'easeInOut' }}
              style={{ marginLeft: -16, marginTop: -16 }}
              title={`${drone.name} · ${drone.batteryPercent}% battery`}
            >
              <Plane className="h-4 w-4" />
              {running && drone.status === 'in_mission' && <span className="absolute -inset-1 -z-10 animate-ping rounded-full bg-current opacity-20" />}
            </motion.div>
          );
        })}

        <div className="absolute bottom-3 right-3 z-20 flex items-center gap-2 rounded-lg border border-brand-border bg-brand-card/95 px-2.5 py-2 text-[10px] font-semibold text-brand-muted shadow-card">
          <MapPin className="h-3.5 w-3.5 text-brand-primary" /> North dock
        </div>
      </div>
    </div>
  );
}

function DroneMiniCard({ drone }: { drone: FarmDrone }) {
  const status = droneStatusBadge(drone.status);
  const tempRisk = drone.temperatureC >= 60;
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', droneAccent[drone.id])}>
            <Plane className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-brand-text">{drone.name}</p>
            <p className="mt-0.5 truncate text-xs text-brand-muted">{payloadLabels[drone.payload]}</p>
          </div>
        </div>
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-brand-cream/70 p-2">
          <Battery className="mx-auto h-4 w-4 text-brand-primary" />
          <p className="mt-1 text-xs font-bold tabular-nums text-brand-text">{Math.round(drone.batteryPercent)}%</p>
        </div>
        <div className="rounded-lg bg-brand-cream/70 p-2">
          <Thermometer className={cn('mx-auto h-4 w-4', tempRisk ? 'text-brand-error' : 'text-brand-warning')} />
          <p className="mt-1 text-xs font-bold tabular-nums text-brand-text">{Math.round(drone.temperatureC)}°C</p>
        </div>
        <div className="rounded-lg bg-brand-cream/70 p-2">
          <Radio className="mx-auto h-4 w-4 text-brand-sky" />
          <p className="mt-1 text-xs font-bold tabular-nums text-brand-text">{drone.signalPercent}%</p>
        </div>
      </div>
    </Card>
  );
}

function MissionCard({ mission, drones, selected, onSelect }: { mission: DroneMission; drones: FarmDrone[]; selected: boolean; onSelect: () => void }) {
  const status = missionStatusBadge(mission.status);
  const assignedNames = mission.assignedDroneIds.map((id) => drones.find((drone) => drone.id === id)?.name).filter(Boolean).join(', ');
  return (
    <Card hover onClick={onSelect} className={cn('p-4', selected && 'border-brand-primary/60 ring-2 ring-brand-primary/10')}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold text-brand-text">{mission.name}</p>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="mt-1 text-xs leading-relaxed text-brand-muted">{mission.objective}</p>
        </div>
        <span className="shrink-0 text-xs font-semibold text-brand-muted">{formatDateTime(mission.scheduledAt)}</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <div className="rounded-lg bg-brand-cream/70 p-2.5"><p className="text-[10px] uppercase tracking-wide text-brand-muted">Mission</p><p className="mt-1 text-xs font-semibold text-brand-text">{missionTypeLabels[mission.type]}</p></div>
        <div className="rounded-lg bg-brand-cream/70 p-2.5"><p className="text-[10px] uppercase tracking-wide text-brand-muted">Coverage</p><p className="mt-1 text-xs font-semibold text-brand-text">{mission.coverageAcres} acres</p></div>
        <div className="rounded-lg bg-brand-cream/70 p-2.5"><p className="text-[10px] uppercase tracking-wide text-brand-muted">Duration</p><p className="mt-1 text-xs font-semibold text-brand-text">{mission.estimatedMinutes} minutes</p></div>
        <div className="rounded-lg bg-brand-cream/70 p-2.5"><p className="text-[10px] uppercase tracking-wide text-brand-muted">Assigned fleet</p><p className="mt-1 truncate text-xs font-semibold text-brand-text">{assignedNames}</p></div>
      </div>
      {(mission.status === 'active' || mission.status === 'paused' || mission.status === 'completed') && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-xs"><span className="text-brand-muted">Mission progress</span><span className="font-bold tabular-nums text-brand-text">{Math.round(mission.progressPercent)}%</span></div>
          <ProgressBar value={mission.progressPercent} accent={mission.status === 'completed' ? 'success' : 'primary'} />
        </div>
      )}
    </Card>
  );
}

export function FarmerDrones() {
  const { lowBandwidth } = useAppStore();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('command');
  const [mapLayer, setMapLayer] = useState<MapLayer>('health');
  const [drones, setDrones] = useState<FarmDrone[]>(() => farmDrones.map((drone) => ({ ...drone, location: { ...drone.location } })));
  const [cells, setCells] = useState<DroneGridCell[]>(() => droneGridCells.map((cell) => ({ ...cell })));
  const [missions, setMissions] = useState<DroneMission[]>(() => droneMissions.map((mission) => ({ ...mission, assignedDroneIds: [...mission.assignedDroneIds], gridCellIds: [...mission.gridCellIds] })));
  const [selectedMissionId, setSelectedMissionId] = useState('mission-active-01');
  const [selectedCellId, setSelectedCellId] = useState('cell-3-3');
  const [running, setRunning] = useState(true);
  const [alertsAcknowledged, setAlertsAcknowledged] = useState<string[]>([]);
  const [plannerType, setPlannerType] = useState<DroneMissionType>('thermal_survey');
  const [plannerAltitude, setPlannerAltitude] = useState(35);
  const [plannerOverlap, setPlannerOverlap] = useState(30);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [plannerMessage, setPlannerMessage] = useState('');
  const [approvedCellIds, setApprovedCellIds] = useState<string[]>(() => droneGridCells.filter((cell) => cell.status === 'treatment_scheduled').map((cell) => cell.id));
  const [maintenanceDroneId, setMaintenanceDroneId] = useState<string | null>(null);
  const [cropScanRequest, setCropScanRequest] = useState<{ crop?: string; condition?: string; farmId?: string; diagnosisId?: string } | null>(() => {
    try {
      return JSON.parse(localStorage.getItem('agrismart-drone-scan-request') || 'null') as { crop?: string; condition?: string; farmId?: string; diagnosisId?: string } | null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (!cropScanRequest) return;
    setPlannerType('verification');
    setActiveTab('missions');
    setPlannerMessage(`Crop Health Scanner requested RGB and thermal verification for ${cropScanRequest.crop || 'the selected crop'}${cropScanRequest.condition ? ` after a ${cropScanRequest.condition} finding` : ''}. Review the farm and route before scheduling.`);
  }, [cropScanRequest]);

  const selectedMission = missions.find((mission) => mission.id === selectedMissionId) || missions[0];
  const flightMission = missions.find((mission) => mission.status === 'active') || missions.find((mission) => mission.status === 'paused');
  const commandMission = flightMission || selectedMission || missions[0];
  const selectedCell = cells.find((cell) => cell.id === selectedCellId) || cells[0];
  const selectedCellApproved = approvedCellIds.includes(selectedCell.id);
  const selectedCellActionable = ['water_stress', 'disease_risk', 'treatment_scheduled'].includes(selectedCell.status);
  const activeAlerts = droneAlerts.filter((alert) => !alert.acknowledged && !alertsAcknowledged.includes(alert.id));
  const missionLaunchBlocked = (mission: DroneMission) => {
    const assignedIds = new Set(mission.assignedDroneIds);
    return drones.some((drone) => {
      if (!assignedIds.has(drone.id)) return false;
      const availableStatus = drone.status === 'ready' || (drone.status === 'in_mission' && drone.assignedMissionId === mission.id);
      return !availableStatus || drone.batteryPercent < 30 || drone.temperatureC >= 60;
    });
  };
  const resumeBlocked = missionLaunchBlocked(commandMission);
  const anotherMissionInProgress = Boolean(flightMission && flightMission.id !== selectedMission.id);
  const returningDroneIds = drones.filter((drone) => drone.status === 'returning').map((drone) => drone.id).sort().join(',');
  const chargingDroneIds = drones.filter((drone) => drone.status === 'charging').map((drone) => drone.id).sort().join(',');

  const fleetStats = useMemo(() => {
    const active = drones.filter((drone) => drone.status === 'in_mission').length;
    const averageBattery = drones.length ? Math.round(drones.reduce((sum, drone) => sum + drone.batteryPercent, 0) / drones.length) : 0;
    const averageSignal = drones.length ? Math.round(drones.reduce((sum, drone) => sum + drone.signalPercent, 0) / drones.length) : 0;
    return { active, averageBattery, averageSignal };
  }, [drones]);

  const plannerMetrics = useMemo(() => {
    const requiredPayloads: Record<DroneMissionType, DronePayload[]> = {
      rgb_survey: ['rgb'],
      thermal_survey: ['thermal'],
      precision_spray: ['sprayer'],
      verification: ['rgb', 'thermal'],
    };
    const eligibleDrones = drones.filter((drone) => requiredPayloads[plannerType].includes(drone.payload) && drone.status === 'ready' && drone.batteryPercent >= 30 && drone.temperatureC < 60);
    const targetCells = plannerType === 'precision_spray'
      ? cells.filter((cell) => approvedCellIds.includes(cell.id))
      : plannerType === 'verification'
        ? cells.filter((cell) => cell.status === 'treated' || cell.status === 'treatment_scheduled')
        : cells;
    const sensorFootprintM = plannerType === 'precision_spray' ? 4 : Math.max(6, plannerAltitude * 0.34);
    const effectiveSpacingM = Math.max(1.5, sensorFootprintM * (1 - plannerOverlap / 100));
    const parallelPassFactor = 10 / effectiveSpacingM;
    const routeLengthKm = Math.max(0.4, Number((targetCells.length * 0.085 * parallelPassFactor).toFixed(1)));
    const cruiseSpeedMps = plannerType === 'precision_spray' ? 4 : 6.5;
    const routePerDroneKm = routeLengthKm / Math.max(1, eligibleDrones.length);
    const estimatedMinutes = Math.max(6, Math.ceil((routePerDroneKm * 1000) / cruiseSpeedMps / 60 + 4));
    const minimumBattery = eligibleDrones.length ? Math.min(...eligibleDrones.map((drone) => drone.batteryPercent)) : 0;
    const minimumReservePercent = Math.max(0, Math.round(minimumBattery - estimatedMinutes * 1.25));
    const expectedCoveragePercent = Math.min(99.8, Number((94.5 + plannerOverlap * 0.08 + Math.min(plannerAltitude, 45) * 0.025).toFixed(1)));
    return { eligibleDrones, targetCells, routeLengthKm, estimatedMinutes, minimumReservePercent, expectedCoveragePercent, effectiveSpacingM };
  }, [approvedCellIds, cells, drones, plannerAltitude, plannerOverlap, plannerType]);

  useEffect(() => {
    if (!running || !flightMission || flightMission.status !== 'active') return;
    const timer = window.setInterval(() => {
      setMissions((current) => current.map((mission) => {
        if (mission.id !== flightMission.id) return mission;
        const nextProgress = Math.min(100, mission.progressPercent + 1.25);
        return { ...mission, progressPercent: nextProgress, status: nextProgress >= 100 ? 'completed' : 'active', completedAt: nextProgress >= 100 ? new Date().toISOString() : mission.completedAt };
      }));
      setDrones((current) => current.map((drone) => {
        if (drone.assignedMissionId !== flightMission.id) return drone;
        const nextBattery = Math.max(18, drone.batteryPercent - 0.32);
        if (drone.status !== 'in_mission') return drone;
        const nextTemperature = Math.min(72, drone.temperatureC + (drone.id === 'drone-thermal-02' ? 0.11 : 0.05));
        const shouldReturn = nextBattery <= 22 || nextTemperature >= 65;
        return {
          ...drone,
          batteryPercent: nextBattery,
          temperatureC: nextTemperature,
          remainingFlightMinutes: Math.max(2, drone.remainingFlightMinutes - 0.18),
          status: shouldReturn ? 'returning' : drone.status,
        };
      }));
    }, lowBandwidth ? 1_800 : 950);
    return () => window.clearInterval(timer);
  }, [flightMission?.id, flightMission?.status, lowBandwidth, running]);

  useEffect(() => {
    if (!running || !flightMission) return;
    const automaticReturnStarted = drones.some((drone) => drone.assignedMissionId === flightMission.id && drone.status === 'returning');
    if (automaticReturnStarted) {
      setRunning(false);
      setMissions((current) => current.map((mission) => mission.id === flightMission.id && mission.status === 'active' ? { ...mission, status: 'paused' } : mission));
    }
  }, [drones, flightMission?.id, running]);

  useEffect(() => {
    const completedMission = missions.find((mission) => mission.status === 'completed' && drones.some((drone) => drone.assignedMissionId === mission.id && drone.status === 'in_mission'));
    if (!completedMission) return;
    setRunning(false);
    setDrones((current) => current.map((drone) => drone.assignedMissionId === completedMission.id ? { ...drone, status: 'returning' } : drone));
  }, [drones, missions]);

  useEffect(() => {
    const returning = drones.some((drone) => drone.status === 'returning');
    if (!returning) return;
    const timer = window.setTimeout(() => {
      setDrones((current) => current.map((drone) => {
        if (drone.status !== 'returning') return drone;
        const needsCharge = drone.batteryPercent < 35;
        return {
          ...drone,
          status: needsCharge ? 'charging' : 'ready',
          altitudeM: 0,
          speedMps: 0,
          temperatureC: Math.max(34, drone.temperatureC - 10),
          location: { ...drone.location, x: 92, y: 88, lat: droneDock.location.lat, lng: droneDock.location.lng },
        };
      }));
    }, 1800);
    return () => window.clearTimeout(timer);
  }, [returningDroneIds]);

  useEffect(() => {
    const hasChargingDrone = drones.some((drone) => drone.status === 'charging');
    if (!hasChargingDrone) return;
    const timer = window.setInterval(() => {
      setDrones((current) => current.map((drone) => {
        if (drone.status !== 'charging') return drone;
        const batteryPercent = Math.min(100, drone.batteryPercent + 4);
        return { ...drone, batteryPercent, status: batteryPercent >= 80 ? 'ready' : 'charging' };
      }));
    }, lowBandwidth ? 2_400 : 1_200);
    return () => window.clearInterval(timer);
  }, [chargingDroneIds, lowBandwidth]);

  const handlePauseResume = () => {
    if (!running && resumeBlocked) return;
    setRunning((current) => {
      const next = !current;
      setMissions((missionsCurrent) => missionsCurrent.map((mission) => mission.id === commandMission.id ? { ...mission, status: next ? 'active' : 'paused' } : mission));
      if (next) {
        setDrones((currentDrones) => currentDrones.map((drone) => commandMission.assignedDroneIds.includes(drone.id) ? { ...drone, assignedMissionId: commandMission.id, status: 'in_mission', altitudeM: commandMission.altitudeM, speedMps: drone.payload === 'sprayer' ? 4 : 6.5 } : drone));
      }
      return next;
    });
  };

  const handleResetMission = () => {
    setRunning(false);
    setMissions((current) => current.map((mission) => mission.id === commandMission.id ? { ...mission, progressPercent: 0, status: 'planned', startedAt: undefined, completedAt: undefined } : mission));
    setDrones((current) => current.map((drone) => commandMission.assignedDroneIds.includes(drone.id) ? {
      ...drone,
      assignedMissionId: undefined,
      status: 'ready',
      altitudeM: 0,
      speedMps: 0,
      location: { ...drone.location, x: 92, y: 88, lat: droneDock.location.lat, lng: droneDock.location.lng },
    } : drone));
  };

  const handleStartMission = (missionId: string = commandMission.id) => {
    const targetMission = missions.find((mission) => mission.id === missionId);
    if (!targetMission || missionLaunchBlocked(targetMission)) return;
    if (flightMission && flightMission.id !== targetMission.id) {
      setPlannerMessage(`Pause or complete ${flightMission.name} before starting another mission.`);
      setActiveTab('missions');
      return;
    }
    setMissions((current) => current.map((mission) => mission.id === targetMission.id ? { ...mission, status: 'active', progressPercent: mission.progressPercent >= 100 ? 0 : mission.progressPercent, startedAt: new Date().toISOString(), completedAt: undefined } : mission));
    setDrones((current) => current.map((drone) => targetMission.assignedDroneIds.includes(drone.id) ? { ...drone, assignedMissionId: targetMission.id, status: 'in_mission', altitudeM: targetMission.altitudeM, speedMps: drone.payload === 'sprayer' ? 4 : 6.5 } : drone));
    setSelectedMissionId(targetMission.id);
    setRunning(true);
  };

  const handleReturnAll = () => {
    const hasAirborneDrone = drones.some((drone) => drone.status === 'in_mission' || drone.status === 'returning');
    if (!hasAirborneDrone) return;
    setRunning(false);
    setMissions((current) => current.map((mission) => mission.status === 'active' ? { ...mission, status: 'paused' } : mission));
    setDrones((current) => current.map((drone) => drone.status === 'in_mission' ? { ...drone, status: 'returning', altitudeM: Math.max(12, drone.altitudeM) } : drone));
  };

  const handleGeneratePlan = () => {
    if (!droneWeather.flightSafe || droneWeather.windSpeedKph > 25) {
      setPlanGenerated(false);
      setPlannerMessage('The weather window is not safe enough to generate a launch-ready route.');
      return;
    }
    if (!plannerMetrics.eligibleDrones.length) {
      setPlanGenerated(false);
      setPlannerMessage('No compatible drone has enough battery and a service-ready status for this mission.');
      return;
    }
    if (!plannerMetrics.targetCells.length) {
      setPlanGenerated(false);
      setPlannerMessage('Approve at least one affected grid cell before creating a precision treatment mission.');
      return;
    }
    setPlanGenerated(true);
    setPlannerMessage(`Route validated for ${plannerMetrics.eligibleDrones.length} drone${plannerMetrics.eligibleDrones.length === 1 ? '' : 's'} across ${plannerMetrics.targetCells.length} grid cells.`);
  };

  const handleScheduleMission = () => {
    if (!planGenerated || !plannerMetrics.eligibleDrones.length || !plannerMetrics.targetCells.length) return;
    const id = `mission-${Date.now()}`;
    const objectiveByType: Record<DroneMissionType, string> = {
      rgb_survey: 'Capture a complete RGB crop-health layer and flag visual anomalies.',
      thermal_survey: 'Measure canopy temperature variance and estimate water-stress probability.',
      precision_spray: 'Treat only farmer-approved grid cells using a precision spray route.',
      verification: 'Re-scan treated cells and verify whether the recommended action worked.',
    };
    const mission: DroneMission = {
      id,
      name: missionTypeLabels[plannerType],
      type: plannerType,
      status: 'scheduled',
      progressPercent: 0,
      assignedDroneIds: plannerMetrics.eligibleDrones.map((drone) => drone.id),
      gridCellIds: plannerMetrics.targetCells.map((cell) => cell.id),
      coverageAcres: cells.length ? Number((FARM_AREA_ACRES * plannerMetrics.targetCells.length / cells.length).toFixed(1)) : 0,
      routeLengthKm: plannerMetrics.routeLengthKm,
      estimatedMinutes: plannerMetrics.estimatedMinutes,
      altitudeM: plannerAltitude,
      sideOverlapPercent: plannerOverlap,
      frontOverlapPercent: Math.min(90, plannerOverlap + 40),
      scheduledAt: new Date(Date.now() + 15 * 60_000).toISOString(),
      objective: objectiveByType[plannerType],
    };
    setMissions((current) => [mission, ...current]);
    setSelectedMissionId(id);
    setPlanGenerated(false);
    setPlannerMessage('Mission added to the queue for the next safe launch slot.');
  };

  const toggleSelectedCellApproval = () => {
    if (!selectedCellActionable) return;
    if (selectedCellApproved) {
      const originalStatus = droneGridCells.find((cell) => cell.id === selectedCell.id)?.status || 'disease_risk';
      setApprovedCellIds((current) => current.filter((id) => id !== selectedCell.id));
      setCells((current) => current.map((cell) => cell.id === selectedCell.id ? { ...cell, status: originalStatus } : cell));
      return;
    }
    setApprovedCellIds((current) => [...current, selectedCell.id]);
    setCells((current) => current.map((cell) => cell.id === selectedCell.id ? { ...cell, status: 'treatment_scheduled' } : cell));
  };

  const openFinding = (cellId: string, layer: MapLayer) => {
    setSelectedCellId(cellId);
    setMapLayer(layer);
    setActiveTab('grid');
  };

  const downloadIntelligenceReport = () => {
    downloadCsv(
      'agrismart-drone-grid-report.csv',
      ['Grid', 'Crop', 'Status', 'Health score', 'Water stress %', 'Disease confidence %', 'Canopy temperature °C', 'Approved for action', 'Recommended action'],
      cells.map((cell) => [
        `${cell.row + 1}.${cell.column + 1}`,
        cell.crop,
        statusLabels[cell.status],
        cell.healthScore,
        cell.waterStressPercent,
        cell.diseaseConfidencePercent,
        cell.canopyTemperatureC,
        approvedCellIds.includes(cell.id) ? 'Yes' : 'No',
        cell.recommendedAction,
      ]),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="page-heading">🚁 Drone Operations</h1>
            <Badge variant="primary" icon={<Plane className="h-3.5 w-3.5" />}>Autonomous demo</Badge>
            <Badge variant="success" icon={<ShieldCheck className="h-3.5 w-3.5" />}>Flight window safe</Badge>
          </div>
          <p className="page-subtitle">Plan, monitor, and verify autonomous farm missions through grid-level intelligence and solar-powered docking.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" icon={<Navigation className="h-4 w-4" />} onClick={handleReturnAll} disabled={!drones.some((drone) => drone.status === 'in_mission' || drone.status === 'returning')}>Return all drones</Button>
          <Button icon={<Route className="h-4 w-4" />} onClick={() => setActiveTab('missions')}>Plan mission</Button>
        </div>
      </div>

      {cropScanRequest && (
        <AlertBanner
          type="info"
          title="Crop Health Scanner verification request"
          message={`${cropScanRequest.crop || 'Crop'} · ${cropScanRequest.condition || 'Unconfirmed condition'}. A verification route has been prepared, but no treatment is approved.`}
          onClose={() => {
            localStorage.removeItem('agrismart-drone-scan-request');
            setCropScanRequest(null);
          }}
        />
      )}

      <Card className="overflow-hidden">
        <div className="border-b border-brand-border px-3 sm:px-5">
          <Tabs tabs={workspaceTabs} active={activeTab} onChange={(id) => setActiveTab(id as WorkspaceTab)} />
        </div>
      </Card>

      {activeTab === 'command' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Fleet online" value={`${drones.filter((drone) => drone.status !== 'offline').length}/${drones.length}`} icon={<Plane className="h-5 w-5" />} accent="primary" />
            <StatCard label="Drones in mission" value={fleetStats.active} icon={<Activity className="h-5 w-5" />} accent="sky" />
            <StatCard label="Average battery" value={fleetStats.averageBattery} unit="%" icon={<Battery className="h-5 w-5" />} accent="success" />
            <StatCard label="Grid coverage" value={Math.round(commandMission.progressPercent)} unit="%" icon={<Grid3X3 className="h-5 w-5" />} accent="saffron" />
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(330px,0.75fr)]">
            <Card className="p-4 sm:p-5">
              <SectionHeader
                title="Live mission map"
                subtitle="Multi-drone lawnmower routes with connected grid ownership"
                icon={<MapPin className="h-5 w-5" />}
                action={<Badge variant={running ? 'success' : 'warning'} icon={<span className={cn('h-1.5 w-1.5 rounded-full', running ? 'animate-pulse bg-brand-success' : 'bg-brand-warning')} />}>{running ? 'Live telemetry' : 'Mission paused'}</Badge>}
              />
              <div className="mb-3 flex flex-wrap gap-2">
                {(['health', 'thermal', 'rgb'] as MapLayer[]).map((layer) => (
                  <button type="button" key={layer} onClick={() => setMapLayer(layer)} className={cn('rounded-lg border px-3 py-1.5 text-xs font-semibold capitalize transition-colors', mapLayer === layer ? 'border-brand-primary bg-brand-soft text-brand-primary' : 'border-brand-border bg-brand-card text-brand-muted hover:border-brand-primary/40')}>{layer} layer</button>
                ))}
              </div>
              <FarmGridMap cells={cells} drones={drones} progress={commandMission.progressPercent} running={running} layer={mapLayer} selectedCellId={selectedCellId} onSelectCell={(cell) => setSelectedCellId(cell.id)} />
              <div className="mt-4 flex flex-col gap-3 rounded-xl border border-brand-border bg-brand-cream/55 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-brand-text">{commandMission.name}</p>
                    <Badge variant={missionStatusBadge(commandMission.status).variant}>{missionStatusBadge(commandMission.status).label}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-brand-muted">{commandMission.routeLengthKm} km route · {commandMission.coverageAcres} acres · {commandMission.assignedDroneIds.length} drones</p>
                  <div className="mt-3"><ProgressBar value={commandMission.progressPercent} /></div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button variant="outline" size="sm" icon={<RotateCcw className="h-4 w-4" />} onClick={handleResetMission}>Reset</Button>
                  {commandMission.status === 'planned' || commandMission.status === 'scheduled' || commandMission.status === 'completed' ? (
                    <Button size="sm" icon={<Play className="h-4 w-4" />} onClick={() => handleStartMission()} disabled={resumeBlocked}>Start</Button>
                  ) : (
                    <Button size="sm" icon={running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />} onClick={handlePauseResume} disabled={!running && resumeBlocked}>{running ? 'Pause' : 'Resume'}</Button>
                  )}
                </div>
              </div>
            </Card>

            <div className="space-y-4">
              <Card className="p-4">
                <SectionHeader title="Flight conditions" subtitle={`Safe until ${formatTime(droneWeather.safeUntil)}`} icon={<Wind className="h-5 w-5" />} />
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-brand-cream/70 p-3"><Wind className="h-4 w-4 text-brand-sky" /><p className="mt-2 text-lg font-bold text-brand-text">{droneWeather.windSpeedKph} km/h</p><p className="text-xs text-brand-muted">Wind · {droneWeather.windDirection}</p></div>
                  <div className="rounded-lg bg-brand-cream/70 p-3"><Sun className="h-4 w-4 text-brand-saffron" /><p className="mt-2 text-lg font-bold text-brand-text">{droneWeather.solarIntensityWm2}</p><p className="text-xs text-brand-muted">Solar W/m²</p></div>
                  <div className="rounded-lg bg-brand-cream/70 p-3"><Droplets className="h-4 w-4 text-brand-sky" /><p className="mt-2 text-lg font-bold text-brand-text">{droneWeather.humidityPercent}%</p><p className="text-xs text-brand-muted">Humidity</p></div>
                  <div className="rounded-lg bg-brand-cream/70 p-3"><Crosshair className="h-4 w-4 text-brand-primary" /><p className="mt-2 text-lg font-bold text-brand-text">±{droneWeather.gpsAccuracyM} m</p><p className="text-xs text-brand-muted">GPS accuracy</p></div>
                </div>
              </Card>

              <Card className="p-4">
                <SectionHeader title="Safety automation" icon={<ShieldCheck className="h-5 w-5" />} />
                <div className="space-y-3">
                  {[
                    ['Geofence enforced', 'Farm boundary plus 15 m safety buffer'],
                    ['Thermal failsafe', 'Return to dock at 65°C internal temperature'],
                    ['Battery reserve', '22% reserved for return and landing'],
                    ['Collision separation', 'Different route zones and altitude layers'],
                  ].map(([title, description]) => (
                    <div key={title} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-success" />
                      <div><p className="text-sm font-semibold text-brand-text">{title}</p><p className="text-xs text-brand-muted">{description}</p></div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {drones.map((drone) => <DroneMiniCard key={drone.id} drone={drone} />)}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <SectionHeader title="Priority alerts" subtitle={`${activeAlerts.length} item${activeAlerts.length === 1 ? '' : 's'} require attention`} icon={<AlertTriangle className="h-5 w-5" />} />
              <div className="space-y-3">
                {droneAlerts.map((alert) => {
                  const acknowledged = alert.acknowledged || alertsAcknowledged.includes(alert.id);
                  return (
                    <div key={alert.id} className={cn('rounded-xl border p-4', acknowledged ? 'border-brand-border bg-brand-cream/40 opacity-70' : alert.severity === 'warning' ? 'border-brand-warning/30 bg-brand-warning/5' : 'border-brand-sky/25 bg-brand-sky/5')}>
                      <div className="flex items-start justify-between gap-3">
                        <div><p className="text-sm font-semibold text-brand-text">{alert.title}</p><p className="mt-1 text-xs leading-relaxed text-brand-muted">{alert.message}</p><p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-brand-muted">{alert.source} · {formatTime(alert.timestamp)}</p></div>
                        {!acknowledged && <Button variant="ghost" size="sm" onClick={() => setAlertsAcknowledged((current) => [...current, alert.id])}>Acknowledge</Button>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            <Card className="p-5">
              <SectionHeader title="Solar docking station" subtitle={droneDock.name} icon={<BatteryCharging className="h-5 w-5" />} action={<Badge variant="success">Online</Badge>} />
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-brand-border bg-brand-cream/55 p-4"><Sun className="h-5 w-5 text-brand-saffron" /><p className="mt-3 text-2xl font-bold text-brand-text">{droneDock.solarGenerationKw} kW</p><p className="text-xs text-brand-muted">Live solar generation</p><div className="mt-3"><ProgressBar value={droneDock.solarGenerationKw} max={droneDock.solarCapacityKw} accent="saffron" /></div></div>
                <div className="rounded-xl border border-brand-border bg-brand-cream/55 p-4"><Battery className="h-5 w-5 text-brand-success" /><p className="mt-3 text-2xl font-bold text-brand-text">{droneDock.batteryStoragePercent}%</p><p className="text-xs text-brand-muted">Dock energy storage</p><div className="mt-3"><ProgressBar value={droneDock.batteryStoragePercent} accent="success" /></div></div>
              </div>
              <div className="mt-4 rounded-xl bg-brand-soft/60 p-4 text-sm text-brand-text">
                <p className="font-semibold">Estimated charging capacity</p>
                <p className="mt-1 text-xs leading-relaxed text-brand-muted">Stored energy supports approximately 4.3 full drone charging cycles. KT-Spray-03 is docked and mission-ready.</p>
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {activeTab === 'grid' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
          <Card className="p-4 sm:p-5">
            <SectionHeader title="Grid-level farm intelligence" subtitle="Each cell stores imagery, risk scores, assigned drone, and treatment history" icon={<Grid3X3 className="h-5 w-5" />} />
            <div className="mb-4 flex flex-wrap items-center gap-2">
              {(['health', 'thermal', 'rgb'] as MapLayer[]).map((layer) => <button type="button" key={layer} onClick={() => setMapLayer(layer)} className={cn('rounded-lg border px-3 py-2 text-xs font-semibold capitalize', mapLayer === layer ? 'border-brand-primary bg-brand-soft text-brand-primary' : 'border-brand-border text-brand-muted')}>{layer} layer</button>)}
            </div>
            <FarmGridMap cells={cells} drones={drones} progress={commandMission.progressPercent} running={running} layer={mapLayer} selectedCellId={selectedCellId} onSelectCell={(cell) => setSelectedCellId(cell.id)} />
            <div className="mt-4 flex flex-wrap gap-2">
              {(Object.keys(statusLabels) as GridCellStatus[]).map((status) => <span key={status} className="flex items-center gap-1.5 rounded-full border border-brand-border bg-brand-card px-2.5 py-1 text-[10px] font-semibold text-brand-muted"><span className={cn('h-2.5 w-2.5 rounded-sm border', statusClasses[status])} />{statusLabels[status]}</span>)}
            </div>
          </Card>

          <div className="space-y-4">
            <Card className="p-5">
              <SectionHeader title={`Grid ${selectedCell.row + 1}.${selectedCell.column + 1}`} subtitle={selectedCell.crop} icon={<Crosshair className="h-5 w-5" />} action={<Badge variant={selectedCell.status === 'healthy' ? 'success' : selectedCell.status === 'disease_risk' ? 'error' : 'warning'}>{statusLabels[selectedCell.status]}</Badge>} />
              <div className="space-y-3">
                <div><div className="mb-1.5 flex justify-between text-xs"><span className="text-brand-muted">Crop health</span><span className="font-bold text-brand-text">{selectedCell.healthScore || 'Pending'}{selectedCell.healthScore ? '%' : ''}</span></div><ProgressBar value={selectedCell.healthScore} accent={selectedCell.healthScore >= 80 ? 'success' : 'warning'} /></div>
                <div><div className="mb-1.5 flex justify-between text-xs"><span className="text-brand-muted">Water stress probability</span><span className="font-bold text-brand-text">{selectedCell.waterStressPercent}%</span></div><ProgressBar value={selectedCell.waterStressPercent} accent={selectedCell.waterStressPercent >= 60 ? 'sky' : 'success'} /></div>
                <div><div className="mb-1.5 flex justify-between text-xs"><span className="text-brand-muted">Disease confidence</span><span className="font-bold text-brand-text">{selectedCell.diseaseConfidencePercent}%</span></div><ProgressBar value={selectedCell.diseaseConfidencePercent} accent={selectedCell.diseaseConfidencePercent >= 70 ? 'error' : 'success'} /></div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-brand-cream/70 p-3"><Thermometer className="h-4 w-4 text-brand-warning" /><p className="mt-2 text-lg font-bold text-brand-text">{selectedCell.canopyTemperatureC.toFixed(1)}°C</p><p className="text-xs text-brand-muted">Canopy temperature</p></div>
                <div className="rounded-lg bg-brand-cream/70 p-3"><Plane className="h-4 w-4 text-brand-primary" /><p className="mt-2 truncate text-xs font-bold text-brand-text">{drones.find((drone) => drone.id === selectedCell.assignedDroneId)?.name || 'Unassigned'}</p><p className="mt-1 text-xs text-brand-muted">Assigned drone</p></div>
              </div>
              <div className="mt-4 rounded-xl border border-brand-primary/20 bg-brand-primary/[0.055] p-4">
                <p className="text-xs font-bold uppercase tracking-wide text-brand-primary">Recommended action</p>
                <p className="mt-1.5 text-sm leading-relaxed text-brand-text">{selectedCell.recommendedAction}</p>
              </div>
              <Button className="mt-4 w-full" variant={selectedCellApproved ? 'secondary' : 'primary'} icon={selectedCellApproved ? <CheckCircle2 className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />} onClick={toggleSelectedCellApproval} disabled={!selectedCellActionable}>{selectedCellActionable ? selectedCellApproved ? 'Action approved for this cell' : 'Approve action for this cell' : selectedCell.status === 'scan_pending' ? 'Awaiting scan result' : 'No treatment required'}</Button>
            </Card>

            <Card className="p-5">
              <SectionHeader title="Grid data model" icon={<Settings className="h-5 w-5" />} />
              <div className="space-y-2 text-xs text-brand-muted">
                {['GPS polygon and cell coordinates', 'Latest RGB and thermal observations', 'Crop health and anomaly confidence', 'Mission, drone, and treatment ownership', 'Audit trail for detect → decide → act → verify'].map((item) => <div key={item} className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-success" /><span>{item}</span></div>)}
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {activeTab === 'missions' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_420px]">
          <div className="space-y-4">
            <SectionHeader title="Mission queue" subtitle="Survey, treatment, and verification missions share one auditable workflow" icon={<Route className="h-5 w-5" />} />
            {missions.map((mission) => <MissionCard key={mission.id} mission={mission} drones={drones} selected={selectedMission.id === mission.id} onSelect={() => setSelectedMissionId(mission.id)} />)}

            <Card className="p-5">
              <SectionHeader title="Selected mission route" subtitle={selectedMission.name} icon={<MapPin className="h-5 w-5" />} />
              <FarmGridMap cells={cells} drones={drones.filter((drone) => selectedMission.assignedDroneIds.includes(drone.id))} progress={selectedMission.progressPercent} running={running && selectedMission.status === 'active'} layer={selectedMission.type === 'thermal_survey' ? 'thermal' : selectedMission.type === 'rgb_survey' ? 'rgb' : 'health'} compact />
              <div className="mt-4 flex flex-col gap-3 rounded-xl border border-brand-border bg-brand-cream/55 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-brand-text">{selectedMission.assignedDroneIds.length} drone{selectedMission.assignedDroneIds.length === 1 ? '' : 's'} · {selectedMission.gridCellIds.length} cells</p>
                  <p className="mt-1 text-xs text-brand-muted">{anotherMissionInProgress ? `${flightMission?.name} must finish or pause before this mission can start.` : 'The launch check validates weather, battery reserve, temperature, and payload readiness.'}</p>
                </div>
                <Button
                  size="sm"
                  icon={<Play className="h-4 w-4" />}
                  onClick={() => handleStartMission(selectedMission.id)}
                  disabled={selectedMission.status === 'active' || selectedMission.status === 'paused' || anotherMissionInProgress || missionLaunchBlocked(selectedMission)}
                >
                  {selectedMission.status === 'completed' ? 'Fly again' : selectedMission.status === 'active' ? 'Mission active' : selectedMission.status === 'paused' ? 'Resume in command centre' : 'Start selected mission'}
                </Button>
              </div>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="p-5">
              <SectionHeader title="Create optimized mission" subtitle="The planner divides connected grid zones by payload, battery, and dock distance" icon={<Navigation className="h-5 w-5" />} />
              <div className="space-y-4">
                <label className="block"><span className="label">Mission type</span><select className="input" value={plannerType} onChange={(event: ChangeEvent<HTMLSelectElement>) => { setPlannerType(event.target.value as DroneMissionType); setPlanGenerated(false); setPlannerMessage(''); }}>{Object.entries(missionTypeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                <label className="block"><span className="label">Flight altitude</span><div className="flex items-center gap-3"><input aria-label="Mission altitude in metres" type="range" min="3" max="60" value={plannerAltitude} onChange={(event: ChangeEvent<HTMLInputElement>) => { setPlannerAltitude(Number(event.target.value)); setPlanGenerated(false); setPlannerMessage(''); }} className="w-full accent-brand-primary" /><span className="w-14 rounded-lg bg-brand-soft px-2 py-1 text-center text-xs font-bold text-brand-primary">{plannerAltitude} m</span></div></label>
                <label className="block"><span className="label">Side overlap</span><div className="flex items-center gap-3"><input aria-label="Side overlap percentage" type="range" min="10" max="60" value={plannerOverlap} onChange={(event: ChangeEvent<HTMLInputElement>) => { setPlannerOverlap(Number(event.target.value)); setPlanGenerated(false); setPlannerMessage(''); }} className="w-full accent-brand-primary" /><span className="w-14 rounded-lg bg-brand-soft px-2 py-1 text-center text-xs font-bold text-brand-primary">{plannerOverlap}%</span></div></label>
                <div className="rounded-xl border border-brand-border bg-brand-cream/55 p-4">
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-muted">Planner inputs</p>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <span className="rounded-lg bg-brand-card p-2 text-brand-muted">{cells.length ? Number((FARM_AREA_ACRES * plannerMetrics.targetCells.length / cells.length).toFixed(1)) : 0} acres</span>
                    <span className="rounded-lg bg-brand-card p-2 text-brand-muted">{plannerMetrics.targetCells.length} target grid cells</span>
                    <span className="rounded-lg bg-brand-card p-2 text-brand-muted">{plannerMetrics.eligibleDrones.length} launch-ready drones</span>
                    <span className="rounded-lg bg-brand-card p-2 text-brand-muted">{droneWeather.windSpeedKph} km/h wind</span>
                  </div>
                </div>
                <Button className="w-full" icon={<Route className="h-4 w-4" />} onClick={handleGeneratePlan}>Generate optimized route</Button>
                {plannerMessage && <p role="status" className={cn('rounded-lg border px-3 py-2 text-xs leading-relaxed', planGenerated ? 'border-brand-success/25 bg-brand-success/5 text-brand-success' : 'border-brand-warning/25 bg-brand-warning/5 text-brand-warning')}>{plannerMessage}</p>}
              </div>
            </Card>

            {planGenerated && (
              <Card className="border-brand-success/30 bg-brand-success/[0.035] p-5">
                <SectionHeader title="Route ready" subtitle="Connected zones prevent route crossing" icon={<CheckCircle2 className="h-5 w-5" />} action={<Badge variant="success">Validated</Badge>} />
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-brand-muted">Estimated route</span><span className="font-bold text-brand-text">{plannerMetrics.routeLengthKm} km</span></div>
                  <div className="flex justify-between"><span className="text-brand-muted">Estimated duration</span><span className="font-bold text-brand-text">{plannerMetrics.estimatedMinutes} minutes</span></div>
                  <div className="flex justify-between"><span className="text-brand-muted">Minimum battery reserve</span><span className={cn('font-bold', plannerMetrics.minimumReservePercent >= 22 ? 'text-brand-success' : 'text-brand-error')}>{plannerMetrics.minimumReservePercent}%</span></div>
                  <div className="flex justify-between"><span className="text-brand-muted">Expected image coverage</span><span className="font-bold text-brand-text">{plannerMetrics.expectedCoveragePercent}%</span></div>
                </div>
                <Button className="mt-4 w-full" variant="secondary" icon={<Clock className="h-4 w-4" />} onClick={handleScheduleMission} disabled={plannerMetrics.minimumReservePercent < 22}>Schedule mission</Button>
              </Card>
            )}

            <Card className="p-5">
              <SectionHeader title="Execution loop" icon={<Activity className="h-5 w-5" />} />
              <div className="space-y-3">
                {['Detect with RGB and thermal imagery', 'Score every grid cell', 'Recommend action with confidence', 'Request farmer approval', 'Execute targeted mission', 'Verify the result in the next scan'].map((step, index) => <div key={step} className="flex items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand-primary">{index + 1}</span><span className="text-sm text-brand-text">{step}</span></div>)}
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {activeTab === 'fleet' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            {drones.map((drone) => {
              const status = droneStatusBadge(drone.status);
              const servicePercent = Math.min(100, (drone.flightHours / drone.nextServiceHours) * 100);
              return (
                <Card key={drone.id} className="p-5">
                  <div className="flex items-start justify-between gap-3"><div className="flex items-start gap-3"><div className={cn('flex h-11 w-11 items-center justify-center rounded-xl', droneAccent[drone.id])}><Plane className="h-5 w-5" /></div><div><p className="font-bold text-brand-text">{drone.name}</p><p className="text-xs text-brand-muted">{drone.model}</p></div></div><Badge variant={status.variant}>{status.label}</Badge></div>
                  <div className="mt-4 rounded-xl bg-brand-cream/55 p-4"><p className="text-xs font-semibold text-brand-muted">Installed payload</p><p className="mt-1 text-sm font-bold text-brand-text">{payloadLabels[drone.payload]}</p><p className="mt-1 text-xs text-brand-muted">{drone.firmware}</p></div>
                  <div className="mt-4 space-y-3">
                    <div><div className="mb-1 flex justify-between text-xs"><span className="text-brand-muted">Battery</span><span className="font-bold text-brand-text">{Math.round(drone.batteryPercent)}%</span></div><ProgressBar value={drone.batteryPercent} accent={drone.batteryPercent < 30 ? 'error' : 'success'} /></div>
                    <div><div className="mb-1 flex justify-between text-xs"><span className="text-brand-muted">Service interval used</span><span className="font-bold text-brand-text">{drone.flightHours}/{drone.nextServiceHours} h</span></div><ProgressBar value={servicePercent} accent={servicePercent > 85 ? 'warning' : 'primary'} /></div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-lg border border-brand-border p-2"><Thermometer className="mx-auto h-4 w-4 text-brand-warning" /><p className="mt-1 text-xs font-bold">{Math.round(drone.temperatureC)}°C</p></div><div className="rounded-lg border border-brand-border p-2"><Gauge className="mx-auto h-4 w-4 text-brand-sky" /><p className="mt-1 text-xs font-bold">{drone.speedMps.toFixed(1)} m/s</p></div><div className="rounded-lg border border-brand-border p-2"><Radio className="mx-auto h-4 w-4 text-brand-primary" /><p className="mt-1 text-xs font-bold">{drone.signalPercent}%</p></div></div>
                  <Button variant="outline" className="mt-4 w-full" icon={<Wrench className="h-4 w-4" />} onClick={() => setMaintenanceDroneId(drone.id)}>Open maintenance log</Button>
                </Card>
              );
            })}
          </div>

          {maintenanceDroneId && (() => {
            const maintenanceDrone = drones.find((drone) => drone.id === maintenanceDroneId);
            if (!maintenanceDrone) return null;
            const hoursRemaining = Math.max(0, Number((maintenanceDrone.nextServiceHours - maintenanceDrone.flightHours).toFixed(1)));
            return (
              <Card className="border-brand-primary/25 bg-brand-primary/[0.035] p-5">
                <SectionHeader title={`${maintenanceDrone.name} maintenance log`} subtitle="Demo service history and next inspection" icon={<Wrench className="h-5 w-5" />} action={<Button variant="ghost" size="sm" onClick={() => setMaintenanceDroneId(null)}>Close</Button>} />
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-lg border border-brand-border bg-brand-card p-3"><p className="text-xs text-brand-muted">Last inspection</p><p className="mt-1 text-sm font-bold text-brand-text">18 July 2026</p></div>
                  <div className="rounded-lg border border-brand-border bg-brand-card p-3"><p className="text-xs text-brand-muted">Flight hours</p><p className="mt-1 text-sm font-bold text-brand-text">{maintenanceDrone.flightHours} h</p></div>
                  <div className="rounded-lg border border-brand-border bg-brand-card p-3"><p className="text-xs text-brand-muted">Service due in</p><p className="mt-1 text-sm font-bold text-brand-text">{hoursRemaining} h</p></div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-brand-muted">Propellers, motors, battery health, payload calibration, geofence failsafe, and firmware checks passed in the latest sandbox inspection.</p>
              </Card>
            );
          })()}

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="p-5">
              <SectionHeader title="Solar dock operations" subtitle={droneDock.name} icon={<BatteryCharging className="h-5 w-5" />} action={<Badge variant="success">{droneDock.status}</Badge>} />
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-brand-cream/70 p-3"><Sun className="h-4 w-4 text-brand-saffron" /><p className="mt-2 text-lg font-bold">{droneDock.solarGenerationKw} kW</p><p className="text-[10px] text-brand-muted">Generation</p></div>
                <div className="rounded-lg bg-brand-cream/70 p-3"><Battery className="h-4 w-4 text-brand-success" /><p className="mt-2 text-lg font-bold">{droneDock.batteryStoragePercent}%</p><p className="text-[10px] text-brand-muted">Storage</p></div>
                <div className="rounded-lg bg-brand-cream/70 p-3"><Thermometer className="h-4 w-4 text-brand-warning" /><p className="mt-2 text-lg font-bold">{droneDock.dockTemperatureC}°C</p><p className="text-[10px] text-brand-muted">Dock temp</p></div>
                <div className="rounded-lg bg-brand-cream/70 p-3"><Zap className="h-4 w-4 text-brand-sky" /><p className="mt-2 text-lg font-bold">{droneDock.chargingRatePercentPerHour}%/h</p><p className="text-[10px] text-brand-muted">Charge rate</p></div>
              </div>
              <div className="mt-4 rounded-xl border border-brand-border bg-brand-cream/55 p-4"><div className="mb-2 flex justify-between text-xs"><span className="font-semibold text-brand-muted">Solar capacity utilization</span><span className="font-bold text-brand-text">{Math.round((droneDock.solarGenerationKw / droneDock.solarCapacityKw) * 100)}%</span></div><ProgressBar value={droneDock.solarGenerationKw} max={droneDock.solarCapacityKw} accent="saffron" /></div>
            </Card>

            <Card className="p-5">
              <SectionHeader title="Hardware control boundary" subtitle="The web app never controls motors directly" icon={<ShieldCheck className="h-5 w-5" />} />
              <div className="space-y-3">
                {[
                  ['Web application', 'Farmer approval, mission planning, reports, and live telemetry'],
                  ['Backend mission API', 'Authentication, audit logs, geofence validation, and command queue'],
                  ['Mission controller', 'MAVLink bridge, dynamic replanning, and multi-drone separation'],
                  ['PX4 or ArduPilot', 'Flight stabilization, navigation, failsafes, and motor control'],
                ].map(([title, description], index) => <div key={title} className="relative flex gap-3 rounded-xl border border-brand-border bg-brand-cream/45 p-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-xs font-bold text-brand-primary">{index + 1}</span><div><p className="text-sm font-semibold text-brand-text">{title}</p><p className="mt-0.5 text-xs leading-relaxed text-brand-muted">{description}</p></div></div>)}
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {activeTab === 'intelligence' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="overflow-hidden">
              <div className="h-44 bg-gradient-to-br from-brand-success/35 via-brand-primary/20 to-brand-saffron/15 p-4">
                <div className="flex items-center justify-between"><Badge variant="success" icon={<Camera className="h-3.5 w-3.5" />}>RGB layer</Badge><span className="text-xs font-semibold text-brand-muted">2.4 cm/pixel</span></div>
                <div className="mt-5 grid grid-cols-6 gap-1 opacity-90">{cells.slice(0, 24).map((cell) => <div key={cell.id} className={cn('h-5 rounded-sm', cell.diseaseConfidencePercent > 70 ? 'bg-brand-error' : cell.diseaseConfidencePercent > 20 ? 'bg-brand-warning' : 'bg-brand-success')} />)}</div>
              </div>
              <div className="p-4"><p className="font-bold text-brand-text">Disease anomaly map</p><p className="mt-1 text-sm text-brand-muted">3 connected cells show a visual anomaly above 88% confidence.</p><div className="mt-3 flex items-center justify-between"><Badge variant="error">High confidence</Badge><Button variant="ghost" size="sm" icon={<Eye className="h-4 w-4" />} onClick={() => openFinding('cell-3-3', 'rgb')}>Review</Button></div></div>
            </Card>

            <Card className="overflow-hidden">
              <div className="h-44 bg-gradient-to-br from-brand-sky/60 via-brand-saffron/35 to-brand-error/55 p-4">
                <div className="flex items-center justify-between"><Badge variant="warning" icon={<Thermometer className="h-3.5 w-3.5" />}>Thermal layer</Badge><span className="text-xs font-semibold text-white/90">Calibrated</span></div>
                <div className="mt-8 flex items-end gap-2">{[42, 55, 47, 78, 84, 63, 38, 48].map((height, index) => <div key={index} className="flex-1 rounded-t bg-white/45" style={{ height: `${height}px` }} />)}</div>
              </div>
              <div className="p-4"><p className="font-bold text-brand-text">Water-stress probability</p><p className="mt-1 text-sm text-brand-muted">A 1.7-acre zone is 4.8°C warmer than the healthy canopy baseline.</p><div className="mt-3 flex items-center justify-between"><Badge variant="info">Irrigation check</Badge><Button variant="ghost" size="sm" icon={<Eye className="h-4 w-4" />} onClick={() => openFinding('cell-2-6', 'thermal')}>Review</Button></div></div>
            </Card>

            <Card className="overflow-hidden">
              <div className="h-44 bg-brand-dark p-4 text-white">
                <div className="flex items-center justify-between"><Badge variant="primary" icon={<Leaf className="h-3.5 w-3.5" />}>AI fusion</Badge><span className="text-xs font-semibold text-white/70">RGB + thermal</span></div>
                <div className="mt-8 flex items-center justify-center"><div className="relative flex h-24 w-24 items-center justify-center rounded-full border-[10px] border-brand-success/70"><span className="text-2xl font-bold">86</span><span className="absolute -bottom-6 text-xs text-white/65">Farm health</span></div></div>
              </div>
              <div className="p-4"><p className="font-bold text-brand-text">Combined crop health</p><p className="mt-1 text-sm text-brand-muted">The model combines imagery, weather, mission history, and IoT readings.</p><div className="mt-3 flex items-center justify-between"><Badge variant="success">Stable trend</Badge><Button variant="ghost" size="sm" icon={<Eye className="h-4 w-4" />} onClick={downloadIntelligenceReport}>Export report</Button></div></div>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Card className="p-5">
              <SectionHeader title="Detected findings" subtitle="Every recommendation keeps evidence and confidence attached" icon={<Activity className="h-5 w-5" />} />
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead><tr className="border-b border-brand-border text-left text-xs uppercase tracking-wide text-brand-muted"><th className="px-3 py-3">Finding</th><th className="px-3 py-3">Grid cells</th><th className="px-3 py-3">Confidence</th><th className="px-3 py-3">Evidence</th><th className="px-3 py-3">Next action</th></tr></thead>
                  <tbody>
                    <tr className="border-b border-brand-border/60"><td className="px-3 py-4 font-semibold text-brand-text">Possible fungal infection</td><td className="px-3 py-4 text-brand-muted">3.3, 3.4, 4.3</td><td className="px-3 py-4"><Badge variant="error">89%</Badge></td><td className="px-3 py-4 text-brand-muted">RGB texture and colour anomaly</td><td className="px-3 py-4"><Button size="sm" onClick={() => openFinding('cell-3-3', 'rgb')}>Review treatment</Button></td></tr>
                    <tr className="border-b border-brand-border/60"><td className="px-3 py-4 font-semibold text-brand-text">Irrigation pressure issue</td><td className="px-3 py-4 text-brand-muted">2.6, 2.7, 3.6</td><td className="px-3 py-4"><Badge variant="warning">82%</Badge></td><td className="px-3 py-4 text-brand-muted">Thermal variance and low moisture</td><td className="px-3 py-4"><Button variant="outline" size="sm" onClick={() => openFinding('cell-2-6', 'thermal')}>Inspect line</Button></td></tr>
                    <tr><td className="px-3 py-4 font-semibold text-brand-text">Treatment recovery</td><td className="px-3 py-4 text-brand-muted">6.2, 6.3</td><td className="px-3 py-4"><Badge variant="success">94%</Badge></td><td className="px-3 py-4 text-brand-muted">Temperature normalized after irrigation</td><td className="px-3 py-4"><Button variant="ghost" size="sm" onClick={() => openFinding('cell-6-2', 'health')}>View proof</Button></td></tr>
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-5">
              <SectionHeader title="Model pipeline" subtitle="Designed for real hardware integration" icon={<Settings className="h-5 w-5" />} />
              <div className="space-y-3">
                {[
                  ['Capture', 'RGB and radiometric thermal frames with GPS and altitude metadata'],
                  ['Correct', 'Lens correction, thermal calibration, and image quality filtering'],
                  ['Segment', 'Separate crop canopy, soil, shadow, and non-farm objects'],
                  ['Infer', 'Run disease and water-stress models with confidence scoring'],
                  ['Fuse', 'Combine drone imagery with IoT, weather, and crop-cycle context'],
                  ['Act', 'Create an approval-based mission for only the affected cells'],
                ].map(([title, description], index) => <div key={title} className="flex gap-3"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-xs font-bold text-brand-primary">{index + 1}</span><div><p className="text-sm font-semibold text-brand-text">{title}</p><p className="mt-0.5 text-xs leading-relaxed text-brand-muted">{description}</p></div></div>)}
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {activeTab === 'treatment' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <PatentTreatmentConsole />
        </motion.div>
      )}
    </div>
  );
}
