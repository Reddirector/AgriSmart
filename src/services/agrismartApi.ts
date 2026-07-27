// ============================================================
// AgriSmart — Production API client with local-first fallback
// ============================================================
import type { GeoPoint } from '@/types';
import { createLocalCropDiagnosis } from '@/lib/cropHealthEngine';
import type { CropHealthDiagnosis,CropHealthDiagnosisRequest } from '@/types/cropHealth';
import type { RealTimeControlStepReceipt,RealTimeControlStepRequest,TreatmentMissionReceipt,TreatmentMissionRequest } from '@/types/patent';

interface RuntimeEnvironment {
  VITE_AGRISMART_API_URL?: string;
  VITE_AGRISMART_CHAT_URL?: string;
  DEV?: boolean;
}

const runtimeEnvironment = ((import.meta as ImportMeta & { env?: RuntimeEnvironment }).env || {});
const browserOrigin = typeof window === 'undefined' ? '' : window.location.origin;
const staticHost = typeof window !== 'undefined' && window.location.hostname.endsWith('github.io');
const sameOriginApi = !runtimeEnvironment.DEV && !staticHost ? browserOrigin : '';
const apiUrl = runtimeEnvironment.VITE_AGRISMART_API_URL?.replace(/\/$/, '') || sameOriginApi;
const chatUrl = runtimeEnvironment.VITE_AGRISMART_CHAT_URL?.replace(/\/$/, '') || apiUrl;

export const runtimeStatus = {
  mode: apiUrl ? 'connected' : 'local-first',
  apiUrl,
  chatUrl,
} as const;

function localStorageAvailable() {
  try {
    const key = '__agrismart_storage_test__';
    window.localStorage.setItem(key, key);
    window.localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

function saveLocalRecord(key: string, value: unknown) {
  if (typeof window === 'undefined' || !localStorageAvailable()) return;
  let previous: unknown[] = [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || '[]') as unknown;
    previous = Array.isArray(parsed) ? parsed : [];
  } catch {
    previous = [];
  }
  try {
    window.localStorage.setItem(key, JSON.stringify([value, ...previous].slice(0, 100)));
  } catch {
    window.localStorage.setItem(key, JSON.stringify([value]));
  }
}

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const headers = new Headers(options?.headers);
  headers.set('Content-Type', 'application/json');
  const response = await fetch(url, {
    ...options,
    headers,
  });
  if (!response.ok) {
    const body = await response.text();
    try {
      const parsed = JSON.parse(body) as { error?: string; message?: string };
      throw new Error(parsed.error || parsed.message || `Request failed with ${response.status}`);
    } catch (error) {
      if (error instanceof Error && !error.message.startsWith('Unexpected')) throw error;
      throw new Error(body || `Request failed with ${response.status}`);
    }
  }
  return response.json() as Promise<T>;
}

export async function submitFarmBoundary(payload: {
  farmId: string;
  farmerId: string;
  boundary: GeoPoint[];
  areaAcres: number;
  source: string;
}) {
  if (!apiUrl) {
    const receipt = { id: `boundary-${Date.now()}`, status: 'saved_locally', createdAt: new Date().toISOString() };
    saveLocalRecord('agrismart-boundary-submissions', { ...payload, ...receipt });
    return receipt;
  }
  return requestJson<{ id: string; status: string; createdAt: string }>(`${apiUrl}/api/v1/farms/boundaries`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function queueTreatmentMission(request: TreatmentMissionRequest): Promise<TreatmentMissionReceipt> {
  if (!apiUrl) {
    const receipt: TreatmentMissionReceipt = {
      missionId: `local-mission-${Date.now()}`,
      status: 'simulation_saved',
      createdAt: new Date().toISOString(),
      message: 'Mission saved locally. Configure VITE_AGRISMART_API_URL to send approved commands to a mission controller.',
    };
    saveLocalRecord('agrismart-treatment-missions', { request, receipt });
    return receipt;
  }

  return requestJson<TreatmentMissionReceipt>(`${apiUrl}/api/v1/missions`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}


export async function diagnoseCropImage(request: CropHealthDiagnosisRequest): Promise<CropHealthDiagnosis> {
  if (!apiUrl) {
    const result = createLocalCropDiagnosis(request);
    saveLocalRecord('agrismart-crop-health-history', { ...result, imageDataUrl: undefined, overlayDataUrl: undefined });
    return result;
  }
  try {
    return await requestJson<CropHealthDiagnosis>(`${apiUrl}/api/v1/crop-health/diagnose`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  } catch {
    const result = createLocalCropDiagnosis(request);
    saveLocalRecord('agrismart-crop-health-history', { ...result, imageDataUrl: undefined, overlayDataUrl: undefined });
    return result;
  }
}

export interface AssistantRequest {
  message: string;
  pathname: string;
  role?: string;
  context?: string;
}

export interface AssistantResponse {
  answer: string;
  source: 'local' | 'server';
  suggestedRoute?: string;
}

function localAssistantAnswer(request: AssistantRequest): AssistantResponse {
  const message = request.message.toLowerCase();
  if (message.includes('map') || message.includes('boundary') || message.includes('gps') || message.includes('land')) {
    return {
      answer: 'Open My Farms, choose Add farm, then use your current GPS location. Tap the map corners in order, or enter acreage and generate a starter boundary. Review the calculated area before saving.',
      source: 'local',
      suggestedRoute: '/farmer/farms',
    };
  }
  if (message.includes('crop scan') || message.includes('leaf') || message.includes('plant photo') || message.includes('disease detector') || message.includes('diagnosis')) {
    return {
      answer: request.context
        ? `The active crop-health result says: ${request.context}. Review the confidence, alternatives, image quality, and treatment safety gate before acting.`
        : 'Open Crop Health Scanner, upload a close leaf image, confirm the crop, and add rainfall, irrigation, and recent spray details. The scanner reports uncertainty and never authorizes chemical treatment from one image.',
      source: 'local',
      suggestedRoute: '/farmer/crop-health',
    };
  }
  if (message.includes('dose') || message.includes('spray') || message.includes('disease') || message.includes('treatment')) {
    return {
      answer: 'Use Crop Health Scanner for the first diagnosis, then create an RGB and thermal verification mission. The treatment engine checks severity, uncertainty, weather, labels, dose, speed, and nozzle commands. Farmer approval remains required before live treatment.',
      source: 'local',
      suggestedRoute: '/farmer/crop-health',
    };
  }
  if (message.includes('drone') || message.includes('battery') || message.includes('mission')) {
    return {
      answer: 'Drone Operations shows fleet health, active routes, solar docking, crop intelligence, and autonomous treatment. A live deployment also requires the AgriSmart mission API and a PX4 or ArduPilot MAVLink bridge.',
      source: 'local',
      suggestedRoute: '/farmer/drones',
    };
  }
  if (message.includes('patent') || message.includes('claim')) {
    return {
      answer: 'The System assurance view maps claims 1 through 14 to executable modules and acceptance evidence. Physical nozzle, sensor, and flight-controller validation still needs calibrated hardware test records.',
      source: 'local',
      suggestedRoute: '/farmer/drones',
    };
  }
  if (message.includes('payment') || message.includes('escrow')) {
    return {
      answer: 'Use Payments to review escrow, releases, refunds, and transaction references. Confirm the agreement and inspection state before releasing funds.',
      source: 'local',
      suggestedRoute: request.role === 'buyer' ? '/buyer/payments' : '/farmer/payments',
    };
  }
  return {
    answer: 'I can guide you through farm mapping, crop-image diagnosis, drone missions, plant-specific treatment, IoT readings, agreements, verification, and payments. Tell me the task you want to complete.',
    source: 'local',
  };
}

export async function askAgriAssistant(request: AssistantRequest): Promise<AssistantResponse> {
  if (!chatUrl) return localAssistantAnswer(request);
  try {
    return await requestJson<AssistantResponse>(`${chatUrl}/api/v1/chat`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  } catch {
    return localAssistantAnswer(request);
  }
}


export async function executeRealTimeControlStep(request: RealTimeControlStepRequest): Promise<RealTimeControlStepReceipt> {
  if (!apiUrl) {
    const receipt: RealTimeControlStepReceipt = {
      accepted: request.mode === 'simulation' && !request.plan.prescription.suppressed,
      command: request.plan.command,
      nextControlStepMs: request.plan.command.nozzleCommands.some((channel) => channel.enabled)
        ? Math.max(50, Math.min(200, request.plan.command.nozzleCommands.find((channel) => channel.enabled)?.openWindowMs || 100))
        : 200,
      safetyState: request.plan.prescription.suppressed ? 'suppressed' : 'clear',
      message: 'Local control step evaluated without hardware actuation.',
    };
    saveLocalRecord('agrismart-control-steps', { request, receipt });
    return receipt;
  }
  return requestJson<RealTimeControlStepReceipt>(`${apiUrl}/api/v1/control/step`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export interface LandSearchResult {
  id: string;
  displayName: string;
  lat: number;
  lng: number;
  boundingBox?: [number, number, number, number];
}

export async function searchLandLocation(query: string): Promise<LandSearchResult[]> {
  const cleaned = query.trim();
  if (cleaned.length < 3) return [];

  if (apiUrl) {
    return requestJson<LandSearchResult[]>(`${apiUrl}/api/v1/geocode?q=${encodeURIComponent(cleaned)}`);
  }

  const response = await fetch(
    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&q=${encodeURIComponent(cleaned)}`,
    { headers: { Accept: 'application/json' } },
  );
  if (!response.ok) throw new Error('Location search is temporarily unavailable.');
  const rows = await response.json() as Array<{
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    boundingbox?: [string, string, string, string];
  }>;
  return rows.map((row) => ({
    id: String(row.place_id),
    displayName: row.display_name,
    lat: Number(row.lat),
    lng: Number(row.lon),
    boundingBox: row.boundingbox
      ? row.boundingbox.map(Number) as [number, number, number, number]
      : undefined,
  }));
}
