// ============================================================
// AgriSmart — Utility Functions
// ============================================================
import type { AgreementState } from '@/types';
import { clsx,type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function stateColor(state: AgreementState): { bg: string; text: string; label: string } {
  const map: Record<AgreementState, { bg: string; text: string; label: string }> = {
    draft: { bg: 'bg-brand-muted/10', text: 'text-brand-muted', label: 'Draft' },
    sent_for_review: { bg: 'bg-brand-sky/10', text: 'text-brand-sky', label: 'Sent for Review' },
    negotiation: { bg: 'bg-brand-saffron/10', text: 'text-brand-saffron', label: 'Negotiation' },
    farmer_approved: { bg: 'bg-brand-success/10', text: 'text-brand-success', label: 'Farmer Approved' },
    buyer_approved: { bg: 'bg-brand-success/10', text: 'text-brand-success', label: 'Buyer Approved' },
    escrow_funded: { bg: 'bg-brand-sky/10', text: 'text-brand-sky', label: 'Escrow Funded' },
    active: { bg: 'bg-brand-primary/10', text: 'text-brand-primary', label: 'Active' },
    produce_ready: { bg: 'bg-brand-success/10', text: 'text-brand-success', label: 'Produce Ready' },
    inspection_pending: { bg: 'bg-brand-warning/10', text: 'text-brand-warning', label: 'Inspection Pending' },
    delivery_confirmed: { bg: 'bg-brand-sky/10', text: 'text-brand-sky', label: 'Delivery Confirmed' },
    payment_released: { bg: 'bg-brand-success/10', text: 'text-brand-success', label: 'Payment Released' },
    completed: { bg: 'bg-brand-success/15', text: 'text-brand-success', label: 'Completed' },
    disputed: { bg: 'bg-brand-error/10', text: 'text-brand-error', label: 'Disputed' },
    cancelled: { bg: 'bg-brand-muted/10', text: 'text-brand-muted', label: 'Cancelled' },
  };
  return map[state] || map.draft;
}

export function severityColor(sev: 'info' | 'warning' | 'critical'): string {
  return sev === 'critical' ? 'badge-error' : sev === 'warning' ? 'badge-warning' : 'badge-info';
}

export function timeAgo(timestamp: string, nowMs: number = Date.now()): string {
  const timestampMs = new Date(timestamp).getTime();
  if (!Number.isFinite(timestampMs)) return 'Unknown time';

  const diffMs = nowMs - timestampMs;
  const future = diffMs < 0;
  const absoluteMinutes = Math.max(0, Math.round(Math.abs(diffMs) / 60_000));
  if (absoluteMinutes < 1) return future ? 'in a moment' : 'just now';

  const units: Array<[number, string]> = [
    [60 * 24 * 365, 'y'],
    [60 * 24 * 30, 'mo'],
    [60 * 24, 'd'],
    [60, 'h'],
    [1, 'm'],
  ];
  const [unitMinutes, label] = units.find(([minutes]) => absoluteMinutes >= minutes) || units[units.length - 1];
  const value = Math.floor(absoluteMinutes / unitMinutes);
  return future ? `in ${value}${label}` : `${value}${label} ago`;
}

export function truncateHash(hash: string, chars: number = 8): string {
  if (!hash || hash.length < chars * 2 + 2) return hash;
  return `${hash.slice(0, chars + 2)}…${hash.slice(-chars)}`;
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCell = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  const csv = [headers, ...rows].map(row => row.map(escapeCell).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
}

// ── IoT Simulator: generate live sensor data ───────────────
export function generateLiveReading(sensorType: string): { value: number; unit: string } {
  const ranges: Record<string, { min: number; max: number; unit: string; decimals?: number }> = {
    soil_moisture: { min: 18, max: 62, unit: '%', decimals: 1 },
    soil_temperature: { min: 22, max: 38, unit: '°C', decimals: 1 },
    air_temperature: { min: 24, max: 42, unit: '°C', decimals: 1 },
    humidity: { min: 42, max: 82, unit: '%', decimals: 1 },
    rainfall: { min: 0, max: 12, unit: 'mm', decimals: 1 },
    water_level: { min: 25, max: 95, unit: '%', decimals: 1 },
    soil_ph: { min: 6.0, max: 7.6, unit: 'pH', decimals: 2 },
    ec: { min: 0.6, max: 2.2, unit: 'dS/m', decimals: 2 },
    nitrogen: { min: 110, max: 210, unit: 'kg/ha' },
    phosphorus: { min: 25, max: 68, unit: 'kg/ha' },
    potassium: { min: 95, max: 180, unit: 'kg/ha' },
    light: { min: 15000, max: 85000, unit: 'lux' },
    battery: { min: 35, max: 100, unit: '%' },
  };
  const r = ranges[sensorType] || { min: 0, max: 100, unit: '' };
  const val = r.min + Math.random() * (r.max - r.min);
  return { value: r.decimals ? parseFloat(val.toFixed(r.decimals)) : Math.round(val), unit: r.unit };
}

export const sensorLabels: Record<string, string> = {
  soil_moisture: 'Soil Moisture', soil_temperature: 'Soil Temperature', air_temperature: 'Air Temperature',
  humidity: 'Humidity', rainfall: 'Rainfall', water_level: 'Water Level', soil_ph: 'Soil pH',
  ec: 'Electrical Conductivity', nitrogen: 'Nitrogen (N)', phosphorus: 'Phosphorus (P)',
  potassium: 'Potassium (K)', light: 'Light Intensity', leaf_wetness: 'Leaf Wetness',
  irrigation_flow: 'Irrigation Flow', pump_status: 'Pump Status', battery: 'Battery', connectivity: 'Connectivity',
};

export const sensorIcons: Record<string, string> = {
  soil_moisture: '💧', soil_temperature: '🌡️', air_temperature: '☀️', humidity: '🌫️',
  rainfall: '🌧️', water_level: '🚰', soil_ph: '⚗️', ec: '⚡', nitrogen: '🌱',
  phosphorus: '🧪', potassium: '🟤', light: '💡', battery: '🔋', connectivity: '📡',
};

export function toDateInputValue(date: Date = new Date()): string {
  const localTime = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return localTime.toISOString().slice(0, 10);
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!Number.isFinite(d.getTime())) return 'Unknown date';
  return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}
