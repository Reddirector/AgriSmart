// ============================================================
// AgriSmart — Realistic Seed Data
// All sandbox/demo data clearly labeled. No real identity data.
// ============================================================
import type {
AlertEvent,
BuyerOffer,
CropCycle,
Device,
Dispute,
Farm,
FarmHealthSummary,
Inspection,
Notification,
Payment,
ProduceListing,
SensorReading,
TradeAgreement,
User,
} from '@/types';

// Deterministic demo values keep the UI stable across route changes and reloads.
function stableUnit(seed: string | number): number {
  const text = String(seed);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967295;
}

function stableNumber(seed: string | number, min: number, max: number, decimals = 0): number {
  const value = min + stableUnit(seed) * (max - min);
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function stableHex(seed: string | number, length = 64): string {
  const alphabet = '0123456789abcdef';
  return Array.from({ length }, (_, index) => alphabet[Math.floor(stableUnit(`${seed}-${index}`) * alphabet.length)]).join('');
}

// ── Users ──────────────────────────────────────────────────
export const users: User[] = [
  // Farmers (10)
  { id: 'u-farmer-1', name: 'Rajesh Patel', role: 'farmer', email: 'rajesh.patel@agrismart.demo', phone: '+91-98765-43210', language: 'hi', identityVerified: 'verified', kccStatus: 'verified', createdAt: '2025-09-15', lastActive: '2026-07-25', state: 'Gujarat', district: 'Ahmedabad' },
  { id: 'u-farmer-2', name: 'Sunita Devi', role: 'farmer', email: 'sunita.devi@agrismart.demo', phone: '+91-98765-43211', language: 'hi', identityVerified: 'verified', kccStatus: 'verified', createdAt: '2025-10-02', lastActive: '2026-07-25', state: 'Uttar Pradesh', district: 'Kanpur' },
  { id: 'u-farmer-3', name: 'Lakshmi Reddy', role: 'farmer', email: 'lakshmi.reddy@agrismart.demo', phone: '+91-98765-43212', language: 'te', identityVerified: 'verified', kccStatus: 'pending', createdAt: '2025-10-10', lastActive: '2026-07-24', state: 'Telangana', district: 'Warangal' },
  { id: 'u-farmer-4', name: 'Gurpreet Singh', role: 'farmer', email: 'gurpreet.singh@agrismart.demo', phone: '+91-98765-43213', language: 'pa', identityVerified: 'verified', kccStatus: 'verified', createdAt: '2025-08-20', lastActive: '2026-07-25', state: 'Punjab', district: 'Ludhiana' },
  { id: 'u-farmer-5', name: 'Arun Kulkarni', role: 'farmer', email: 'arun.kulkarni@agrismart.demo', phone: '+91-98765-43214', language: 'mr', identityVerified: 'verified', kccStatus: 'verified', createdAt: '2025-09-28', lastActive: '2026-07-23', state: 'Maharashtra', district: 'Nashik' },
  { id: 'u-farmer-6', name: 'Karthik Iyer', role: 'farmer', email: 'karthik.iyer@agrismart.demo', phone: '+91-98765-43215', language: 'ta', identityVerified: 'pending', kccStatus: 'unverified', createdAt: '2026-01-05', lastActive: '2026-07-22', state: 'Tamil Nadu', district: 'Madurai' },
  { id: 'u-farmer-7', name: 'Priya Sharma', role: 'farmer', email: 'priya.sharma@agrismart.demo', phone: '+91-98765-43216', language: 'hi', identityVerified: 'verified', kccStatus: 'verified', createdAt: '2025-11-12', lastActive: '2026-07-25', state: 'Rajasthan', district: 'Kota' },
  { id: 'u-farmer-8', name: 'Bikash Das', role: 'farmer', email: 'bikash.das@agrismart.demo', phone: '+91-98765-43217', language: 'as', identityVerified: 'verified', kccStatus: 'pending', createdAt: '2025-12-03', lastActive: '2026-07-20', state: 'Assam', district: 'Nagaon' },
  { id: 'u-farmer-9', name: 'Mahesh Yadav', role: 'farmer', email: 'mahesh.yadav@agrismart.demo', phone: '+91-98765-43218', language: 'hi', identityVerified: 'verified', kccStatus: 'verified', createdAt: '2025-07-18', lastActive: '2026-07-25', state: 'Bihar', district: 'Gaya' },
  { id: 'u-farmer-10', name: 'Venkatesh Gowda', role: 'farmer', email: 'venkatesh.gowda@agrismart.demo', phone: '+91-98765-43219', language: 'kn', identityVerified: 'verified', kccStatus: 'verified', createdAt: '2025-08-05', lastActive: '2026-07-24', state: 'Karnataka', district: 'Mandya' },

  // Buyers (5)
  { id: 'u-buyer-1', name: 'Anand Agro Industries', role: 'buyer', email: 'procurement@anandagro.demo', phone: '+91-90000-11111', language: 'en', identityVerified: 'verified', kccStatus: 'unverified', createdAt: '2025-06-10', lastActive: '2026-07-25', state: 'Gujarat', district: 'Surat' },
  { id: 'u-buyer-2', name: 'GreenFields Foods Ltd', role: 'buyer', email: 'sourcing@greenfields.demo', phone: '+91-90000-22222', language: 'en', identityVerified: 'verified', kccStatus: 'unverified', createdAt: '2025-06-15', lastActive: '2026-07-25', state: 'Maharashtra', district: 'Pune' },
  { id: 'u-buyer-3', name: 'Surya Rice Mills', role: 'buyer', email: 'purchase@suryarice.demo', phone: '+91-90000-33333', language: 'te', identityVerified: 'verified', kccStatus: 'unverified', createdAt: '2025-07-01', lastActive: '2026-07-24', state: 'Telangana', district: 'Hyderabad' },
  { id: 'u-buyer-4', name: 'NorthStar Traders', role: 'buyer', email: 'trade@northstar.demo', phone: '+91-90000-44444', language: 'en', identityVerified: 'pending', kccStatus: 'unverified', createdAt: '2026-01-20', lastActive: '2026-07-22', state: 'Punjab', district: 'Amritsar' },
  { id: 'u-buyer-5', name: 'Krishna Export House', role: 'buyer', email: 'exports@krishnaeh.demo', phone: '+91-90000-55555', language: 'en', identityVerified: 'verified', kccStatus: 'unverified', createdAt: '2025-05-20', lastActive: '2026-07-25', state: 'Karnataka', district: 'Bengaluru' },

  // Verifiers (3)
  { id: 'u-verifier-1', name: 'Dr. Meena Krishnan', role: 'verifier', email: 'meena.krishnan@agrismart.demo', phone: '+91-80000-11111', language: 'en', identityVerified: 'verified', kccStatus: 'unverified', createdAt: '2025-05-01', lastActive: '2026-07-25', state: 'Tamil Nadu', district: 'Coimbatore' },
  { id: 'u-verifier-2', name: 'Vikram Singh Rathore', role: 'verifier', email: 'vikram.rathore@agrismart.demo', phone: '+91-80000-22222', language: 'hi', identityVerified: 'verified', kccStatus: 'unverified', createdAt: '2025-05-10', lastActive: '2026-07-25', state: 'Rajasthan', district: 'Jaipur' },
  { id: 'u-verifier-3', name: 'Suresh Bhoi', role: 'verifier', email: 'suresh.bhoi@agrismart.demo', phone: '+91-80000-33333', language: 'mr', identityVerified: 'verified', kccStatus: 'unverified', createdAt: '2025-06-01', lastActive: '2026-07-24', state: 'Maharashtra', district: 'Nashik' },

  // Admin (1)
  { id: 'u-admin-1', name: 'Platform Administrator', role: 'admin', email: 'admin@agrismart.demo', phone: '+91-70000-00001', language: 'en', identityVerified: 'verified', kccStatus: 'unverified', createdAt: '2025-01-01', lastActive: '2026-07-25' },
];

// ── Farms (20) ─────────────────────────────────────────────
const farmTemplate = [
  { farmerId: 'u-farmer-1', name: 'Patel Family Farm', state: 'Gujarat', district: 'Ahmedabad', village: 'Sanand', acres: 8.5, lat: 23.0176, lng: 72.4659 },
  { farmerId: 'u-farmer-1', name: 'Narmada Plot B', state: 'Gujarat', district: 'Ahmedabad', village: 'Bavla', acres: 4.0, lat: 23.0585, lng: 72.3636 },
  { farmerId: 'u-farmer-2', name: 'Devi Krishi Farm', state: 'Uttar Pradesh', district: 'Kanpur', village: 'Shivrajpur', acres: 6.2, lat: 26.4499, lng: 80.3319 },
  { farmerId: 'u-farmer-3', name: 'Reddy Agricultural Land', state: 'Telangana', district: 'Warangal', village: 'Hasanparthy', acres: 5.5, lat: 17.9689, lng: 79.5941 },
  { farmerId: 'u-farmer-4', name: 'Green Punjab Fields', state: 'Punjab', district: 'Ludhiana', village: 'Doraha', acres: 12.0, lat: 30.9010, lng: 75.7892 },
  { farmerId: 'u-farmer-4', name: 'Singh Wheat Estate', state: 'Punjab', district: 'Ludhiana', village: 'Sahnewal', acres: 7.8, lat: 30.8543, lng: 75.8426 },
  { farmerId: 'u-farmer-5', name: 'Kulkarni Vineyard', state: 'Maharashtra', district: 'Nashik', village: 'Niphad', acres: 3.5, lat: 20.1579, lng: 73.9924 },
  { farmerId: 'u-farmer-5', name: 'Grape Valley Plot', state: 'Maharashtra', district: 'Nashik', village: 'Dindori', acres: 2.8, lat: 20.1938, lng: 73.9252 },
  { farmerId: 'u-farmer-6', name: 'Iyer Cane Farm', state: 'Tamil Nadu', district: 'Madurai', village: 'Vadipatti', acres: 4.5, lat: 10.0736, lng: 78.1056 },
  { farmerId: 'u-farmer-7', name: 'Sharma Mustard Fields', state: 'Rajasthan', district: 'Kota', village: 'Ladpura', acres: 9.0, lat: 25.2138, lng: 75.8648 },
  { farmerId: 'u-farmer-7', name: 'Chambal Plot', state: 'Rajasthan', district: 'Kota', village: 'Ramganj Mandi', acres: 6.3, lat: 24.6486, lng: 75.9488 },
  { farmerId: 'u-farmer-8', name: 'Das Paddy Land', state: 'Assam', district: 'Nagaon', village: 'Raha', acres: 5.0, lat: 26.3473, lng: 92.6597 },
  { farmerId: 'u-farmer-9', name: 'Yadav Crop Fields', state: 'Bihar', district: 'Gaya', village: 'Manpur', acres: 3.8, lat: 24.7961, lng: 85.0400 },
  { farmerId: 'u-farmer-9', name: 'Falgu River Plot', state: 'Bihar', district: 'Gaya', village: 'Belaganj', acres: 4.2, lat: 24.8750, lng: 84.9550 },
  { farmerId: 'u-farmer-10', name: 'Gowda Sugar Farm', state: 'Karnataka', district: 'Mandya', village: 'Pandavapura', acres: 7.2, lat: 12.5000, lng: 76.9000 },
  { farmerId: 'u-farmer-10', name: 'Cauvery Plot', state: 'Karnataka', district: 'Mandya', village: 'Srirangapatna', acres: 5.5, lat: 12.4184, lng: 76.6822 },
  { farmerId: 'u-farmer-2', name: 'Ganga Plains', state: 'Uttar Pradesh', district: 'Kanpur', village: 'Bithoor', acres: 5.0, lat: 26.6090, lng: 80.2650 },
  { farmerId: 'u-farmer-3', name: 'Kakatiya Farm', state: 'Telangana', district: 'Warangal', village: 'Geesukonda', acres: 3.2, lat: 17.9000, lng: 79.5800 },
  { farmerId: 'u-farmer-6', name: 'Vaigai Cotton Field', state: 'Tamil Nadu', district: 'Madurai', village: 'Usilampatti', acres: 6.0, lat: 9.9700, lng: 77.9800 },
  { farmerId: 'u-farmer-8', name: 'Brahmaputra Plot', state: 'Assam', district: 'Nagaon', village: 'Juria', acres: 4.5, lat: 26.2800, lng: 92.7200 },
];

const cropZoneMap: Record<string, { crop: string; variety: string }> = {
  'Gujarat': { crop: 'Cotton', variety: 'G Cot 21' },
  'Uttar Pradesh': { crop: 'Wheat', variety: 'HD 2967' },
  'Telangana': { crop: 'Rice', variety: 'BPT 5204' },
  'Punjab': { crop: 'Wheat', variety: 'PBW 725' },
  'Maharashtra': { crop: 'Sugarcane', variety: 'Co 86032' },
  'Tamil Nadu': { crop: 'Cotton', variety: 'SVPR 4' },
  'Rajasthan': { crop: 'Mustard', variety: 'Pusa Bold' },
  'Assam': { crop: 'Rice', variety: 'Ranjit' },
  'Bihar': { crop: 'Maize', variety: 'Pusa HM 9' },
  'Karnataka': { crop: 'Sugarcane', variety: 'Co 94012' },
};

export const farms: Farm[] = farmTemplate.map((f, i) => {
  const cropInfo = cropZoneMap[f.state];
  return {
    id: `farm-${i + 1}`,
    farmerId: f.farmerId,
    name: f.name,
    state: f.state,
    district: f.district,
    village: f.village,
    areaAcres: f.acres,
    lat: f.lat,
    lng: f.lng,
    trustScore: stableNumber(`farm-trust-${i}`, 78, 95),
    verified: stableUnit(`farm-verified-${i}`) > 0.18,
    zones: [
      { id: `zone-${i}-1`, name: 'Zone A', crop: cropInfo.crop, variety: cropInfo.variety, areaAcres: Math.round(f.acres * 0.6 * 10) / 10 },
      { id: `zone-${i}-2`, name: 'Zone B', crop: cropInfo.crop, variety: cropInfo.variety, areaAcres: Math.round(f.acres * 0.4 * 10) / 10 },
    ],
  };
});

// ── IoT Devices (40) ───────────────────────────────────────
const sensorTypes: Device['sensors'] = ['soil_moisture', 'soil_temperature', 'air_temperature', 'humidity', 'water_level', 'soil_ph', 'ec', 'nitrogen', 'phosphorus', 'potassium', 'battery', 'connectivity'];
const models = ['SoilSense Pro v3', 'AgroNode Mini', 'FieldGuard Max', 'KisanIoT Standard', 'EarthWatch S2'];

export const devices: Device[] = Array.from({ length: 40 }, (_, i) => {
  const farm = farms[i % farms.length];
  const zone = farm.zones[i % 2];
  const connRoll = stableUnit(`device-connectivity-${i}`);
  return {
    id: `dev-${String(i + 1).padStart(3, '0')}`,
    farmId: farm.id,
    zoneId: zone.id,
    name: `${zone.name} Sensor #${i + 1}`,
    model: models[i % models.length],
    firmware: `v${2 + Math.floor(i / 10)}.${i % 4}.0`,
    battery: stableNumber(`device-battery-${i}`, 48, 98),
    connectivity: connRoll > 0.85 ? 'offline' : connRoll > 0.7 ? 'degraded' : 'online',
    lastSeen: `2026-07-${String(stableNumber(`device-day-${i}`, 20, 25)).padStart(2, '0')}T${String(stableNumber(`device-hour-${i}`, 8, 19)).padStart(2, '0')}:${String(stableNumber(`device-minute-${i}`, 0, 59)).padStart(2, '0')}:00Z`,
    sensors: sensorTypes.slice(0, 6 + (i % 5)),
    location: { lat: farm.lat + (stableUnit(`device-lat-${i}`) - 0.5) * 0.01, lng: farm.lng + (stableUnit(`device-lng-${i}`) - 0.5) * 0.01 },
    certificateVerified: stableUnit(`device-certificate-${i}`) > 0.12,
  };
});

// ── Sensor Reading Generator ───────────────────────────────
export function generateSensorHistory(deviceId: string, days: number = 30): SensorReading[] {
  const device = devices.find(d => d.id === deviceId);
  if (!device) return [];
  const readings: SensorReading[] = [];
  const now = new Date('2026-07-25T12:00:00Z');
  for (let d = days; d >= 0; d--) {
    for (let h = 0; h < 24; h += 6) {
      const ts = new Date(now);
      ts.setDate(ts.getDate() - d);
      ts.setHours(h);
      for (const sensor of device.sensors.slice(0, 4)) {
        const readingSeed = `${deviceId}-${d}-${h}-${sensor}`;
        const { value, unit } = generateSensorValue(sensor, h, readingSeed);
        readings.push({
          deviceId,
          sensorType: sensor,
          value,
          unit,
          timestamp: ts.toISOString(),
          confidence: stableNumber(`${readingSeed}-confidence`, 0.84, 0.99, 2),
          signature: `0x${stableHex(`${readingSeed}-signature`, 8)}`,
          validationStatus: stableUnit(`${readingSeed}-validation`) > 0.96 ? 'anomaly' : 'valid',
        });
      }
    }
  }
  return readings;
}

function generateSensorValue(type: string, hour: number, seed: string): { value: number; unit: string } {
  const dayFactor = Math.sin((hour / 24) * Math.PI) * 0.3 + 0.7;
  switch (type) {
    case 'soil_moisture': return { value: stableNumber(`${seed}-soil-moisture`, 25, 60, 1), unit: '%' };
    case 'soil_temperature': return { value: stableNumber(`${seed}-soil-temp`, 20 + dayFactor * 12, 23 + dayFactor * 12, 1), unit: '°C' };
    case 'air_temperature': return { value: stableNumber(`${seed}-air-temp`, 22 + dayFactor * 16, 26 + dayFactor * 16, 1), unit: '°C' };
    case 'humidity': return { value: stableNumber(`${seed}-humidity`, 45, 80, 1), unit: '%' };
    case 'rainfall': return { value: stableNumber(`${seed}-rainfall`, 0, 15, 1), unit: 'mm' };
    case 'water_level': return { value: stableNumber(`${seed}-water`, 60, 95, 1), unit: '%' };
    case 'soil_ph': return { value: stableNumber(`${seed}-ph`, 6.2, 7.4, 2), unit: 'pH' };
    case 'ec': return { value: stableNumber(`${seed}-ec`, 0.8, 2.3, 2), unit: 'dS/m' };
    case 'nitrogen': return { value: stableNumber(`${seed}-nitrogen`, 120, 200), unit: 'kg/ha' };
    case 'phosphorus': return { value: stableNumber(`${seed}-phosphorus`, 30, 70), unit: 'kg/ha' };
    case 'potassium': return { value: stableNumber(`${seed}-potassium`, 100, 180), unit: 'kg/ha' };
    case 'light': return { value: stableNumber(`${seed}-light`, dayFactor * 80000, dayFactor * 80000 + 10000), unit: 'lux' };
    case 'battery': return { value: stableNumber(`${seed}-battery`, 40, 99), unit: '%' };
    default: return { value: stableNumber(`${seed}-default`, 0, 100, 1), unit: '' };
  }
}

// ── Farm Health Summaries ──────────────────────────────────
export const farmHealth: FarmHealthSummary[] = farms.slice(0, 10).map((farm, i) => ({
  farmId: farm.id,
  overallScore: stableNumber(`health-overall-${i}`, 74, 96),
  soilMoisture: stableNumber(`health-moisture-${i}`, 24, 66, 1),
  temperature: stableNumber(`health-temperature-${i}`, 26, 36, 1),
  humidity: stableNumber(`health-humidity-${i}`, 50, 80, 1),
  rainfall: stableNumber(`health-rainfall-${i}`, 0, 12, 1),
  irrigationStatus: ['optimal', 'needed', 'excessive'][i % 3] as 'optimal' | 'needed' | 'excessive',
  waterLevel: stableNumber(`health-water-${i}`, 55, 95, 1),
  sensorHealth: stableNumber(`health-sensor-${i}`, 82, 99),
  activeAlerts: stableNumber(`health-alerts-${i}`, 0, 3),
}));

// ── Produce Listings (15) ──────────────────────────────────
const crops = [
  { crop: 'Wheat', variety: 'HD 2967', state: 'Punjab' },
  { crop: 'Rice', variety: 'BPT 5204', state: 'Telangana' },
  { crop: 'Cotton', variety: 'G Cot 21', state: 'Gujarat' },
  { crop: 'Sugarcane', variety: 'Co 86032', state: 'Maharashtra' },
  { crop: 'Mustard', variety: 'Pusa Bold', state: 'Rajasthan' },
  { crop: 'Maize', variety: 'Pusa HM 9', state: 'Bihar' },
  { crop: 'Potato', variety: 'Kufri Bahar', state: 'Uttar Pradesh' },
  { crop: 'Tomato', variety: 'Pusa Ruby', state: 'Karnataka' },
  { crop: 'Onion', variety: 'Nashik Red', state: 'Maharashtra' },
  { crop: 'Pulses', variety: 'Tur (Arhar)', state: 'Telangana' },
];

const farmersByState: Record<string, string> = {};
users.filter(u => u.role === 'farmer').forEach(u => { farmersByState[u.state!] = u.name; });
const farmerIdsByState: Record<string, string> = {};
users.filter(u => u.role === 'farmer').forEach(u => { farmerIdsByState[u.state!] = u.id; });

export const produceListings: ProduceListing[] = Array.from({ length: 15 }, (_, i) => {
  const c = crops[i % crops.length];
  const farmerName = farmersByState[c.state] || 'Rajesh Patel';
  const farmerId = farmerIdsByState[c.state] || 'u-farmer-1';
  return {
    id: `listing-${i + 1}`,
    farmerId,
    farmerName,
    farmerState: c.state,
    crop: c.crop,
    variety: c.variety,
    quantity: stableNumber(`listing-quantity-${i}`, 4, 48, 1),
    unit: i % 4 === 0 ? 'acres' : 'quintal',
    minPrice: Math.round(stableNumber(`listing-price-${i}`, 1200, 5000) / 50) * 50,
    qualityGrade: ['A', 'B', 'C'][i % 3] as 'A' | 'B' | 'C',
    harvestDate: `2026-${String(8 + (i % 4)).padStart(2, '0')}-${String(5 + (i % 20)).padStart(2, '0')}`,
    deliveryOptions: ['Farm pickup', 'Within 50km', 'Transport arranged'],
    certifications: i % 3 === 0 ? ['Organic'] : i % 3 === 1 ? ['GAP Certified'] : ['Pesticide-tested'],
    sensorSupported: i % 2 === 0,
    verified: i % 3 !== 2,
    photos: [],
    createdAt: `2026-07-${String(10 + i).padStart(2, '0')}T10:00:00Z`,
  };
});

// ── Buyer Offers (10) ──────────────────────────────────────
const buyerNames = users.filter(u => u.role === 'buyer').map(u => ({ id: u.id, name: u.name }));

export const buyerOffers: BuyerOffer[] = Array.from({ length: 10 }, (_, i) => {
  const listing = produceListings[i % produceListings.length];
  const buyer = buyerNames[i % buyerNames.length];
  return {
    id: `offer-${i + 1}`,
    listingId: listing.id,
    buyerId: buyer.id,
    buyerName: buyer.name,
    offeredPrice: Math.round((listing.minPrice * stableNumber(`offer-price-${i}`, 0.92, 1.12, 2)) / 50) * 50,
    quantity: stableNumber(`offer-quantity-${i}`, listing.quantity * 0.55, listing.quantity, 1),
    deliveryLocation: ['Surat, Gujarat', 'Pune, Maharashtra', 'Hyderabad, Telangana', 'Bengaluru, Karnataka'][i % 4],
    deliveryDate: `2026-${String(9 + (i % 3)).padStart(2, '0')}-${String(10 + i).padStart(2, '0')}`,
    paymentTerms: ['30% advance, 70% on delivery', '100% on delivery', '50% advance, 50% on inspection'][i % 3],
    inspectionRequired: i % 2 === 0,
    status: (['pending', 'accepted', 'negotiating', 'pending'] as const)[i % 4],
    createdAt: `2026-07-${String(12 + i).padStart(2, '0')}T14:00:00Z`,
  };
});

// ── Trade Agreements (8) ───────────────────────────────────
const agreementStates: TradeAgreement['state'][] = [
  'active', 'escrow_funded', 'produce_ready', 'inspection_pending',
  'delivery_confirmed', 'payment_released', 'completed', 'disputed',
];

export const tradeAgreements: TradeAgreement[] = Array.from({ length: 8 }, (_, i) => {
  const farmer = users.filter(u => u.role === 'farmer')[i % 10];
  const buyer = users.filter(u => u.role === 'buyer')[i % 5];
  const crop = crops[i % crops.length];
  const qty = stableNumber(`agreement-quantity-${i}`, 8, 48, 1);
  const price = Math.round(stableNumber(`agreement-price-${i}`, 1500, 4500) / 50) * 50;
  const total = Math.round(qty * price);
  const state = agreementStates[i];
  return {
    id: `agreement-${i + 1}`,
    farmerId: farmer.id,
    farmerName: farmer.name,
    buyerId: buyer.id,
    buyerName: buyer.name,
    crop: crop.crop,
    variety: crop.variety,
    quantity: qty,
    unit: 'quintal',
    pricePerUnit: price,
    totalValue: total,
    state,
    escrowAmount: Math.round(total * 0.3),
    advancePercent: [20, 30, 50, 25][i % 4],
    deliveryDate: `2026-${String(9 + (i % 3)).padStart(2, '0')}-${String(15 + i).padStart(2, '0')}`,
    deliveryLocation: `${buyer.district}, ${buyer.state}`,
    qualityConditions: `Grade ${['A', 'B'][i % 2]} quality, moisture below 14%, no pest damage`,
    inspectionProcess: 'Field verifier inspection before delivery, buyer inspection on delivery',
    cancellationTerms: '7-day notice required, advance refundable minus processing fee',
    penaltyTerms: '2% of contract value per week delay, capped at 10%',
    verifierId: i % 2 === 0 ? 'u-verifier-1' : 'u-verifier-2',
    agreementHash: `0x${stableHex(`agreement-hash-${i}`)}`,
    txHash: state !== 'draft' && state !== 'sent_for_review' ? `0x${stableHex(`agreement-tx-${i}`)}` : undefined,
    milestones: [
      { id: `m-${i}-1`, title: 'Advance Payment', description: 'Initial escrow funding', dueDate: '2026-08-01', completed: state !== 'draft' && state !== 'sent_for_review' && state !== 'negotiation', completedAt: state !== 'draft' ? '2026-07-15' : undefined, paymentAmount: Math.round(total * 0.3) },
      { id: `m-${i}-2`, title: 'Crop Inspection', description: 'Field verifier inspects crop readiness', dueDate: '2026-08-20', completed: ['delivery_confirmed', 'payment_released', 'completed'].includes(state), completedAt: ['delivery_confirmed', 'payment_released', 'completed'].includes(state) ? '2026-08-18' : undefined },
      { id: `m-${i}-3`, title: 'Delivery Confirmation', description: 'Buyer confirms produce delivery', dueDate: '2026-09-15', completed: ['payment_released', 'completed'].includes(state), completedAt: ['payment_released', 'completed'].includes(state) ? '2026-09-14' : undefined, paymentAmount: Math.round(total * 0.7) },
      { id: `m-${i}-4`, title: 'Final Settlement', description: 'Release remaining escrow to farmer', dueDate: '2026-09-20', completed: state === 'completed', completedAt: state === 'completed' ? '2026-09-19' : undefined },
    ],
    createdAt: `2026-07-${String(5 + i).padStart(2, '0')}T10:00:00Z`,
    updatedAt: `2026-07-${String(20 + (i % 5)).padStart(2, '0')}T16:00:00Z`,
  };
});

// ── Payments ───────────────────────────────────────────────
export const payments: Payment[] = tradeAgreements.flatMap((a, i) => {
  const txns: Payment[] = [];
  if (a.state !== 'draft' && a.state !== 'sent_for_review' && a.state !== 'negotiation' && a.state !== 'cancelled') {
    txns.push({
      id: `pay-${a.id}-escrow`, agreementId: a.id, type: 'escrow_funding',
      amount: a.escrowAmount, status: 'escrow_held', method: i % 2 === 0 ? 'blockchain' : 'upi',
      txHash: i % 2 === 0 ? a.txHash : undefined, providerRef: i % 2 === 0 ? undefined : `UPI-${a.id.toUpperCase()}`,
      timestamp: '2026-07-15T12:00:00Z',
    });
  }
  if (['payment_released', 'completed'].includes(a.state)) {
    txns.push({
      id: `pay-${a.id}-release`, agreementId: a.id, type: 'final_release',
      amount: a.totalValue - a.escrowAmount, status: 'released', method: i % 2 === 0 ? 'blockchain' : 'bank_transfer',
      txHash: i % 2 === 0 ? `0x${stableHex(`payment-tx-${i}`)}` : undefined,
      providerRef: i % 2 === 0 ? undefined : `NEFT-${a.id.toUpperCase()}`,
      timestamp: '2026-09-19T10:00:00Z',
    });
  }
  if (a.state === 'completed') {
    txns.push({
      id: `pay-${a.id}-advance`, agreementId: a.id, type: 'advance',
      amount: Math.round(a.totalValue * a.advancePercent / 100), status: 'released', method: 'upi',
      providerRef: `UPI-ADV-${a.id.toUpperCase()}`, timestamp: '2026-07-16T10:00:00Z',
    });
  }
  return txns;
});

// ── Alerts ─────────────────────────────────────────────────
export const alertEvents: AlertEvent[] = [
  { id: 'alert-1', farmId: 'farm-1', deviceId: 'dev-001', type: 'low_soil_moisture', severity: 'warning', message: 'Soil moisture in Zone A dropped to 18% — below 25% threshold. Irrigation recommended.', timestamp: '2026-07-25T06:30:00Z', acknowledged: false },
  { id: 'alert-2', farmId: 'farm-3', deviceId: 'dev-003', type: 'extreme_heat', severity: 'critical', message: 'Air temperature reached 42.3°C in Zone A. Crop stress risk — consider shade nets.', timestamp: '2026-07-25T11:45:00Z', acknowledged: false },
  { id: 'alert-3', farmId: 'farm-5', deviceId: 'dev-005', type: 'device_offline', severity: 'warning', message: 'Device dev-005 has been offline for 3 hours. Check connectivity or battery.', timestamp: '2026-07-25T09:00:00Z', acknowledged: true },
  { id: 'alert-4', farmId: 'farm-4', deviceId: 'dev-004', type: 'sensor_anomaly', severity: 'warning', message: 'Soil pH reading 8.9 deviates significantly from historical range (6.2–7.4). Possible calibration drift.', timestamp: '2026-07-24T14:20:00Z', acknowledged: false },
  { id: 'alert-5', farmId: 'farm-7', deviceId: 'dev-007', type: 'water_shortage', severity: 'critical', message: 'Water tank level at 12%. Irrigation pump may run dry — refill urgently needed.', timestamp: '2026-07-25T05:15:00Z', acknowledged: false },
  { id: 'alert-6', farmId: 'farm-2', deviceId: 'dev-002', type: 'low_battery', severity: 'info', message: 'Device dev-002 battery at 18%. Schedule maintenance to prevent data gaps.', timestamp: '2026-07-25T07:00:00Z', acknowledged: true },
  { id: 'alert-7', farmId: 'farm-6', deviceId: 'dev-006', type: 'signature_failure', severity: 'critical', message: 'Data signature verification failed for 3 consecutive readings from dev-006. Potential tamper — investigating.', timestamp: '2026-07-24T18:30:00Z', acknowledged: false },
  { id: 'alert-8', farmId: 'farm-1', type: 'contract_condition_breach', severity: 'warning', message: 'Farm conditions (soil moisture 18%) below agreement-1 threshold (25%). Verifier notified.', timestamp: '2026-07-25T06:35:00Z', acknowledged: false },
];

// ── Inspections ────────────────────────────────────────────
export const inspections: Inspection[] = [
  { id: 'insp-1', agreementId: 'agreement-1', farmId: 'farm-1', verifierId: 'u-verifier-1', verifierName: 'Dr. Meena Krishnan', type: 'crop_inspection', status: 'pending', scheduledDate: '2026-08-20', location: { lat: 23.0176, lng: 72.4659 }, checklist: [
    { item: 'Crop variety matches agreement', passed: true }, { item: 'Crop stage appropriate for delivery date', passed: true },
    { item: 'No visible pest damage', passed: false }, { item: 'Irrigation system operational', passed: true },
  ], riskFlags: ['Minor pest spots observed in Zone B'] },
  { id: 'insp-2', farmId: 'farm-3', verifierId: 'u-verifier-2', verifierName: 'Vikram Singh Rathore', type: 'farm_verification', status: 'scheduled', scheduledDate: '2026-07-28', location: { lat: 17.9689, lng: 79.5941 } },
  { id: 'insp-3', agreementId: 'agreement-2', farmId: 'farm-2', verifierId: 'u-verifier-1', verifierName: 'Dr. Meena Krishnan', type: 'delivery_inspection', status: 'completed', scheduledDate: '2026-07-22', location: { lat: 26.4499, lng: 80.3319 }, result: 'approved', notes: 'Produce quality meets Grade A standards. Moisture content 12.8%. Approved for delivery.', geoTag: { lat: 26.4499, lng: 80.3319, timestamp: '2026-07-22T11:30:00Z' } },
  { id: 'insp-4', farmId: 'farm-6', verifierId: 'u-verifier-3', verifierName: 'Suresh Bhoi', type: 'identity_verification', status: 'pending', scheduledDate: '2026-07-30', location: { lat: 10.0736, lng: 78.1056 } },
  { id: 'insp-5', agreementId: 'agreement-3', farmId: 'farm-5', verifierId: 'u-verifier-3', verifierName: 'Suresh Bhoi', type: 'crop_inspection', status: 'completed', scheduledDate: '2026-07-18', location: { lat: 20.1579, lng: 73.9924 }, result: 'needs_review', notes: 'Sugarcane height uniform but some dry leaves observed. Recommend second visit in 7 days.', riskFlags: ['Uneven growth in northern section'] },
  { id: 'insp-6', farmId: 'farm-9', verifierId: 'u-verifier-2', verifierName: 'Vikram Singh Rathore', type: 'farm_verification', status: 'completed', scheduledDate: '2026-07-10', location: { lat: 24.7961, lng: 85.04 }, result: 'approved', notes: 'Farm verified. Land records match. Ownership confirmed via mock land registry.', geoTag: { lat: 24.7961, lng: 85.04, timestamp: '2026-07-10T09:15:00Z' } },
];

// ── Disputes ───────────────────────────────────────────────
export const disputes: Dispute[] = [
  { id: 'dispute-1', agreementId: 'agreement-8', raisedBy: 'u-buyer-3', reason: 'Quality below agreed grade', description: 'Delivered produce classified as Grade B instead of agreed Grade A. Moisture content 15.2% exceeds 14% limit. Requesting 15% price reduction or partial refund.', status: 'under_review', evidenceCount: 4, createdAt: '2026-07-20T16:00:00Z' },
  { id: 'dispute-2', agreementId: 'agreement-7', raisedBy: 'u-farmer-3', reason: 'Delayed payment after delivery', description: 'Delivery confirmed on July 18 but payment not released after 5 business days. Escrow funds should have been released per milestone terms.', status: 'open', evidenceCount: 2, createdAt: '2026-07-24T10:00:00Z' },
];

// ── Notifications ──────────────────────────────────────────
export const notifications: Notification[] = [
  { id: 'n-1', userId: 'u-farmer-1', category: 'alert', priority: 'high', title: 'Low Soil Moisture Alert', message: 'Zone A soil moisture at 18% — irrigation recommended.', read: false, deepLink: '/farmer/alerts', timestamp: '2026-07-25T06:30:00Z' },
  { id: 'n-2', userId: 'u-farmer-1', category: 'agreement', priority: 'medium', title: 'New Buyer Offer', message: 'Anand Agro Industries offered ₹2,400/quintal for your wheat listing.', read: false, deepLink: '/farmer/offers', timestamp: '2026-07-24T15:00:00Z' },
  { id: 'n-3', userId: 'u-farmer-1', category: 'payment', priority: 'high', title: 'Escrow Funded', message: '₹45,000 escrow has been funded for agreement #1 with Anand Agro Industries.', read: true, deepLink: '/farmer/payments', timestamp: '2026-07-15T12:00:00Z' },
  { id: 'n-4', userId: 'u-farmer-1', category: 'verification', priority: 'medium', title: 'KCC Verification Approved', message: 'Your Kisan Credit Card verification has been approved (sandbox).', read: true, deepLink: '/farmer/verification', timestamp: '2026-07-10T09:00:00Z' },
  { id: 'n-5', userId: 'u-buyer-1', category: 'agreement', priority: 'medium', title: 'Agreement Active', message: 'Agreement #1 is now active. Escrow confirmed on-chain.', read: false, deepLink: '/buyer/agreements', timestamp: '2026-07-16T08:00:00Z' },
  { id: 'n-6', userId: 'u-buyer-1', category: 'marketplace', priority: 'low', title: 'New Listing Match', message: '3 new wheat listings match your saved search criteria.', read: false, deepLink: '/buyer/marketplace', timestamp: '2026-07-24T18:00:00Z' },
  { id: 'n-7', userId: 'u-verifier-1', category: 'verification', priority: 'high', title: 'New Inspection Assigned', message: 'Crop inspection scheduled for Patel Family Farm on Aug 20.', read: false, deepLink: '/verifier/inspections', timestamp: '2026-07-23T14:00:00Z' },
  { id: 'n-8', userId: 'u-admin-1', category: 'system', priority: 'high', title: 'Sensor Anomaly Detected', message: '3 devices showing anomalous readings — potential data tamper alert.', read: false, deepLink: '/admin/system', timestamp: '2026-07-25T08:00:00Z' },
];

// ── Crop Cycles ────────────────────────────────────────────
export const cropCycles: CropCycle[] = farms.slice(0, 10).map((farm, i) => {
  const cropInfo = cropZoneMap[farm.state];
  return {
    id: `cycle-${i + 1}`,
    farmId: farm.id,
    crop: cropInfo.crop,
    variety: cropInfo.variety,
    startDate: '2026-05-01',
    expectedHarvest: '2026-09-15',
    stage: (['sowing', 'growing', 'growing', 'flowering', 'growing'] as const)[i % 5],
    areaAcres: farm.areaAcres,
    healthScore: stableNumber(`cycle-health-${i}`, 76, 96),
  };
});

// ── Helper: get current user's data ────────────────────────
export function getUserData(userId: string) {
  const user = users.find(u => u.id === userId);
  if (!user) return null;
  const userFarms = farms.filter(f => f.farmerId === userId);
  const userDevices = devices.filter(d => userFarms.some(f => f.id === d.farmId));
  const userListings = produceListings.filter(l => l.farmerId === userId);
  const userOffers = buyerOffers.filter(o => userListings.some(l => l.id === o.listingId));
  const userAgreements = tradeAgreements.filter(a => a.farmerId === userId || a.buyerId === userId);
  const userPayments = payments.filter(p => userAgreements.some(a => a.id === p.agreementId));
  const userAlerts = alertEvents.filter(a => userFarms.some(f => f.id === a.farmId));
  const userNotifications = notifications.filter(n => n.userId === userId);
  return { user, farms: userFarms, devices: userDevices, listings: userListings, offers: userOffers, agreements: userAgreements, payments: userPayments, alerts: userAlerts, notifications: userNotifications };
}
