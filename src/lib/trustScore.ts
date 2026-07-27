import type { Device,Farm,User,VerificationStatus } from '@/types';

export interface TrustScoreFactor {
  id: string;
  label: string;
  score: number;
  weight: number;
  emoji: string;
  explanation: string;
}

export interface FarmDataTrustScore {
  score: number;
  level: 'Excellent' | 'Strong' | 'Developing' | 'Needs attention';
  summary: string;
  factors: TrustScoreFactor[];
}

const verificationScore: Record<VerificationStatus, number> = {
  verified: 100,
  pending: 65,
  unverified: 35,
  rejected: 0,
};

function average(values: number[], fallback: number): number {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : fallback;
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}


export function calculateSingleFarmDataReliability(
  farm: Farm,
  farmDevices: Device[],
  identityStatus: VerificationStatus = 'unverified',
): FarmDataTrustScore {
  const identity = verificationScore[identityStatus];
  const farmVerification = farm.verified ? 100 : 50;
  const deviceIntegrity = average(farmDevices.map((device) => device.certificateVerified ? 100 : 45), 40);
  const connectivity = average(farmDevices.map((device) => {
    if (device.connectivity === 'online') return 100;
    if (device.connectivity === 'degraded') return 68;
    return 30;
  }), 40);
  const dataCompleteness = average(farmDevices.map((device) => Math.min(100, (device.sensors.length / 10) * 100)), 35);

  const factors: TrustScoreFactor[] = [
    { id: 'identity', label: 'Owner identity', score: clampScore(identity), weight: 15, emoji: '🪪', explanation: 'Confirms the account responsible for this farm.' },
    { id: 'farm', label: 'Boundary verification', score: clampScore(farmVerification), weight: 25, emoji: '🗺️', explanation: 'Checks whether the registered farm boundary has been reviewed.' },
    { id: 'device', label: 'Device authenticity', score: clampScore(deviceIntegrity), weight: 25, emoji: '📡', explanation: 'Checks certificates for devices registered to this farm.' },
    { id: 'continuity', label: 'Data continuity', score: clampScore(connectivity), weight: 20, emoji: '🔄', explanation: 'Measures whether farm devices are currently reporting data.' },
    { id: 'coverage', label: 'Sensor coverage', score: clampScore(dataCompleteness), weight: 15, emoji: '🌡️', explanation: 'Measures the range of sensor evidence available for the farm.' },
  ];

  const score = clampScore(factors.reduce((total, factor) => total + factor.score * factor.weight, 0) / 100);
  const level = score >= 90 ? 'Excellent' : score >= 80 ? 'Strong' : score >= 65 ? 'Developing' : 'Needs attention';
  const summary = score >= 90
    ? 'This farm has strong verified evidence and continuous sensor support.'
    : score >= 80
      ? 'This farm has reliable evidence with a small number of gaps.'
      : score >= 65
        ? 'This farm has useful evidence but still needs stronger verification or device continuity.'
        : 'This farm needs more verified boundaries or connected sensor evidence.';

  return { score, level, summary, factors };
}

export function calculateFarmDataTrustScore(user: User, farms: Farm[], devices: Device[]): FarmDataTrustScore {
  const identity = verificationScore[user.identityVerified];
  const farmVerification = average(farms.map((farm) => farm.verified ? 100 : 55), 45);
  const deviceIntegrity = average(devices.map((device) => device.certificateVerified ? 100 : 45), 50);
  const connectivity = average(devices.map((device) => {
    if (device.connectivity === 'online') return 100;
    if (device.connectivity === 'degraded') return 68;
    return 30;
  }), 50);
  const dataCompleteness = average(devices.map((device) => Math.min(100, (device.sensors.length / 10) * 100)), 45);

  const factors: TrustScoreFactor[] = [
    {
      id: 'identity',
      label: 'Identity verification',
      score: clampScore(identity),
      weight: 20,
      emoji: '🪪',
      explanation: 'Confirms the account behind the farm records.',
    },
    {
      id: 'farm',
      label: 'Farm verification',
      score: clampScore(farmVerification),
      weight: 20,
      emoji: '🗺️',
      explanation: 'Checks farm boundaries and verification status.',
    },
    {
      id: 'device',
      label: 'Device authenticity',
      score: clampScore(deviceIntegrity),
      weight: 25,
      emoji: '📡',
      explanation: 'Measures how many connected devices have valid certificates.',
    },
    {
      id: 'continuity',
      label: 'Data continuity',
      score: clampScore(connectivity),
      weight: 20,
      emoji: '🔄',
      explanation: 'Uses current online, degraded, and offline device states.',
    },
    {
      id: 'coverage',
      label: 'Sensor coverage',
      score: clampScore(dataCompleteness),
      weight: 15,
      emoji: '🌡️',
      explanation: 'Checks whether enough sensor types support the farm record.',
    },
  ];

  const score = clampScore(factors.reduce((total, factor) => total + factor.score * factor.weight, 0) / 100);
  const level = score >= 90 ? 'Excellent' : score >= 80 ? 'Strong' : score >= 65 ? 'Developing' : 'Needs attention';
  const summary = score >= 90
    ? 'Farm records are highly reliable and well supported by verified data.'
    : score >= 80
      ? 'Farm records are reliable, with a few areas that can still improve.'
      : score >= 65
        ? 'Farm records have useful evidence but need stronger verification or continuity.'
        : 'Farm records need more verified evidence before automated decisions should rely on them.';

  return { score, level, summary, factors };
}
