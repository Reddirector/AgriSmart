import { createServer } from 'node:http';
import { createReadStream,existsSync,mkdirSync,readFileSync,writeFileSync } from 'node:fs';
import { dirname,extname,join,normalize,resolve } from 'node:path';
import { randomUUID,timingSafeEqual } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const localEnvironmentFile = join(root, '.env');
if (existsSync(localEnvironmentFile)) {
  for (const rawLine of readFileSync(localEnvironmentFile, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const separator = line.indexOf('=');
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}
const distDir = join(root, 'dist');
const dataFile = resolve(process.env.AGRISMART_DATA_FILE || join(root, 'data', 'agrismart-runtime.json'));
const dataDir = dirname(dataFile);
const port = Number(process.env.PORT || 3000);
const allowedOrigin = process.env.AGRISMART_ALLOWED_ORIGIN || '*';
const operatorToken = process.env.AGRISMART_OPERATOR_TOKEN || '';
const autopilotBridgeUrl = (process.env.AGRISMART_AUTOPILOT_BRIDGE_URL || '').replace(/\/$/, '');
const bridgeToken = process.env.AGRISMART_BRIDGE_TOKEN || '';
const llmUrl = process.env.AGRISMART_LLM_URL || '';
const llmApiKey = process.env.AGRISMART_LLM_API_KEY || '';
const llmModel = process.env.AGRISMART_LLM_MODEL || 'agrismart-assistant';
const visionUrl = process.env.AGRISMART_VISION_URL || llmUrl;
const visionApiKey = process.env.AGRISMART_VISION_API_KEY || llmApiKey;
const visionModel = process.env.AGRISMART_VISION_MODEL || 'agrismart-crop-vision';
const maximumBodyBytes = 8_000_000;
const clients = new Set();
const rateLimits = new Map();

mkdirSync(dataDir, { recursive: true });
if (!existsSync(dataFile)) {
  writeFileSync(dataFile, JSON.stringify({ boundaries: [], missions: [], telemetry: [], controlSteps: [], chat: [], diagnoses: [] }, null, 2));
}

function loadDatabase() {
  try {
    return JSON.parse(readFileSync(dataFile, 'utf8'));
  } catch {
    return { boundaries: [], missions: [], telemetry: [], controlSteps: [], chat: [], diagnoses: [] };
  }
}

function saveDatabase(database) {
  writeFileSync(dataFile, JSON.stringify(database, null, 2));
}

function sendJson(response, status, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, X-Operator-Token',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Cache-Control': 'no-store',
  });
  response.end(body);
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left || '');
  const rightBuffer = Buffer.from(right || '');
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function authorized(request, body) {
  if (!operatorToken) return body.mode !== 'live';
  const provided = request.headers['x-operator-token'] || body.operatorApprovalCode || '';
  return safeEqual(String(provided), operatorToken);
}

function rateLimit(request) {
  const key = request.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const current = rateLimits.get(key) || { startedAt: now, count: 0 };
  if (now - current.startedAt > windowMs) {
    rateLimits.set(key, { startedAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  rateLimits.set(key, current);
  return current.count > 180;
}

function readJson(request) {
  return new Promise((resolveBody, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > maximumBodyBytes) {
        reject(new Error('Request body is too large.'));
        request.destroy();
      }
    });
    request.on('end', () => {
      try {
        resolveBody(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error('Request body must contain valid JSON.'));
      }
    });
    request.on('error', reject);
  });
}

function broadcast(event, payload) {
  const message = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const client of clients) client.write(message);
}

async function fetchJson(url, options = {}, timeoutMs = 8_000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const text = await response.text();
    const payload = text ? JSON.parse(text) : {};
    if (!response.ok) throw new Error(payload.error || payload.message || `Upstream request failed with ${response.status}.`);
    return payload;
  } finally {
    clearTimeout(timeout);
  }
}

async function sendToAutopilotBridge(path, payload) {
  if (!autopilotBridgeUrl) throw new Error('Live hardware bridge is not configured. Set AGRISMART_AUTOPILOT_BRIDGE_URL.');
  return fetchJson(`${autopilotBridgeUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(bridgeToken ? { 'X-Bridge-Token': bridgeToken } : {}),
    },
    body: JSON.stringify(payload),
  }, 10_000);
}

function distanceMetres(left, right) {
  const earthRadiusM = 6_371_000;
  const toRadians = (value) => (value * Math.PI) / 180;
  const deltaLat = toRadians(Number(right.lat) - Number(left.lat));
  const deltaLng = toRadians(Number(right.lng) - Number(left.lng));
  const latitude1 = toRadians(Number(left.lat));
  const latitude2 = toRadians(Number(right.lat));
  const value = Math.sin(deltaLat / 2) ** 2
    + Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(deltaLng / 2) ** 2;
  return earthRadiusM * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
}

function validateTreatmentPlan(plan) {
  const enabledChannels = plan?.command?.nozzleCommands?.filter((channel) => channel.enabled) || [];
  return Boolean(
    plan?.capture?.rgb
    && plan?.capture?.multispectral
    && plan?.capture?.thermal
    && Number.isFinite(plan?.severity?.continuousSeverity)
    && plan?.localization?.persistentPlantId
    && plan?.command?.geofenceValidated
    && enabledChannels.length <= 1
    && enabledChannels.every((channel) => channel.openWindowMs >= 50 && channel.openWindowMs <= 200)
  );
}

async function answerWithConfiguredModel(message, pathname, role, context) {
  if (!llmUrl) return null;
  const payload = {
    model: llmModel,
    messages: [
      {
        role: 'system',
        content: 'You are AgriSmart Copilot. Give concise operational guidance for crop-image diagnosis, farm mapping, UAV missions, plant-specific treatment, sensors, verification, agreements, and payments. Explain uncertainty clearly. Never diagnose with certainty from weak evidence, never claim physical validation or legal patent conclusions, and require human approval for chemical treatment and live aircraft control.',
      },
      { role: 'user', content: `Role: ${role || 'visitor'}\nRoute: ${pathname || '/'}\nActive crop-health context: ${context || 'none'}\nQuestion: ${message}` },
    ],
    temperature: 0.2,
  };
  const result = await fetchJson(llmUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(llmApiKey ? { Authorization: `Bearer ${llmApiKey}` } : {}),
    },
    body: JSON.stringify(payload),
  }, 15_000);
  return result.choices?.[0]?.message?.content || result.answer || null;
}

function localChat(message) {
  const value = String(message || '').toLowerCase();
  if (value.includes('boundary') || value.includes('map') || value.includes('gps')) {
    return 'Use My Farms → Add and map farm. Find your GPS position, tap the field corners clockwise, compare mapped acreage, and submit the boundary for verification.';
  }
  if (value.includes('leaf') || value.includes('crop scan') || value.includes('diagnosis') || value.includes('disease')) {
    return 'Use Crop Health Scanner to upload a close plant image, confirm the crop, and add rainfall, irrigation, and recent input details. The scanner shows alternatives and uncertainty, then offers RGB and thermal drone verification before treatment.';
  }
  if (value.includes('spray') || value.includes('dose')) {
    return 'The treatment engine uses confirmed crop-health evidence, RGB, multispectral, and thermal data. It applies label and weather limits, suppresses uncertain doses, and queues independent nozzle commands only after approval.';
  }
  if (value.includes('drone') || value.includes('mission')) {
    return 'Drone Operations provides mission planning, fleet telemetry, solar docking, geofences, crop intelligence, and the plant-specific treatment console. Live control requires the operator token and MAVLink mission bridge.';
  }
  return 'I can help with mapping, drones, treatment plans, sensors, verification, agreements, and payments.';
}


const clampPercent = (value) => Math.max(0, Math.min(100, Number(value) || 0));
const rounded = (value, decimals = 1) => Number((Number(value) || 0).toFixed(decimals));

function cropSeverityBand(percent) {
  if (percent <= 5) return 'minimal';
  if (percent <= 20) return 'mild';
  if (percent <= 40) return 'moderate';
  if (percent <= 65) return 'severe';
  return 'critical';
}

function cropSupportLevel(confidence) {
  if (confidence >= 65) return 'supported';
  if (confidence >= 35) return 'experimental';
  return 'unknown';
}

function localCropDiagnosis(body) {
  const metrics = body.imageMetrics || {};
  const context = body.context || {};
  const text = `${context.symptomsText || ''} ${context.recentInputs || ''} ${context.irrigation || ''}`.toLowerCase();
  const has = (...terms) => terms.some((term) => text.includes(term));
  const crop = String(context.cropHint || '').trim();
  const fungal = clampPercent((metrics.brownRatio || 0) * 330 + (metrics.darkRatio || 0) * 110 + (context.recentRainfall === 'heavy' ? 18 : 0));
  const nutrient = clampPercent((metrics.yellowRatio || 0) * 300 + (has('fertilizer', 'nutrient', 'nitrogen') ? 12 : 0));
  const mildew = clampPercent((metrics.whiteRatio || 0) * 340 + (has('powder', 'white coating') ? 25 : 0));
  const pest = clampPercent(has('hole', 'chewed', 'insect', 'mite', 'web') ? 78 : (metrics.darkRatio || 0) * 95);
  const stress = clampPercent((1 - (metrics.greenRatio || 0)) * 70 + (has('dry', 'drought', 'hot', 'heat', 'wilt') ? 24 : 0));
  const options = [
    { name: 'Fungal leaf-spot complex', category: 'fungal', confidence: fungal, reason: 'Brown or dark lesions combined with wet conditions can match fungal leaf-spot patterns.', contagious: true },
    { name: 'Nutrient deficiency or chlorosis', category: 'nutrient', confidence: nutrient, reason: 'Broad yellowing without a strong lesion pattern can indicate nutrient imbalance or root stress.', contagious: false },
    { name: 'Powdery mildew-like surface growth', category: 'fungal', confidence: mildew, reason: 'Bright low-saturation patches can resemble powdery fungal growth, after excluding glare.', contagious: true },
    { name: 'Insect or mite damage', category: 'pest', confidence: pest, reason: 'Holes, chewing, webbing, or visible insects support pest damage.', contagious: true },
    { name: 'Water or heat stress', category: has('dry', 'drought') ? 'water_stress' : 'heat_stress', confidence: stress, reason: 'Reduced green tissue and dry, hot, or wilting symptoms can indicate physiological stress.', contagious: false },
  ].filter((item) => item.confidence >= 18).sort((a, b) => b.confidence - a.confidence).slice(0, 4);
  if (!options.length || options[0].confidence < 32) options.unshift({ name: 'Unknown or insufficient evidence', category: 'unknown', confidence: 54, reason: 'The image and context do not support a reliable named condition.', contagious: false });
  const conditions = options.map((item) => ({ ...item, confidence: rounded(item.confidence), supportLevel: cropSupportLevel(item.confidence), urgency: item.confidence >= 75 ? 'urgent' : item.confidence >= 48 ? 'soon' : 'routine' }));
  const symptomRows = [
    ['yellowing', 'Yellowing or chlorosis', (metrics.yellowRatio || 0) * 260, 'Yellow-coloured tissue was detected.'],
    ['necrosis', 'Brown or necrotic tissue', (metrics.brownRatio || 0) * 320, 'Brown lesion-like tissue was detected.'],
    ['powder', 'White surface pattern', (metrics.whiteRatio || 0) * 300, 'Bright low-saturation surface areas were detected.'],
    ['dark-spots', 'Dark spotting', (metrics.darkRatio || 0) * 220, 'Dark regions were detected.'],
  ].filter((row) => row[2] >= 24).map(([id, label, confidence, evidence]) => ({ id, label, confidence: rounded(clampPercent(confidence)), evidence }));
  const affectedPercent = clampPercent((metrics.lesionRatio || 0) * 100);
  const top = conditions[0];
  const severity = { affectedPercent: rounded(affectedPercent), band: cropSeverityBand(affectedPercent), confidence: rounded(((metrics.qualityScore || 40) + top.confidence) / 2) };
  const cropConfidence = crop ? 78 : 18;
  return {
    id: `diagnosis-${randomUUID()}`,
    createdAt: new Date().toISOString(),
    modelVersion: 'agrismart-open-crop-hybrid-1.0',
    source: 'hybrid-local',
    imageName: body.imageName || 'crop-image.jpg',
    imageMetrics: metrics,
    context,
    cropCandidates: [{ commonName: crop || 'Crop not confirmed', confidence: cropConfidence, supportLevel: crop ? 'supported' : 'unknown', reason: crop ? 'The crop name was supplied by the farmer and accepted by the open crop registry.' : 'Confirm the crop name or configure a vision model for species identification.' }],
    conditionCandidates: conditions,
    symptoms: symptomRows,
    severity,
    summary: `${crop || 'Unconfirmed crop'}: ${top.name} is the leading possibility at ${rounded(top.confidence)}% confidence. Estimated visible damage is ${severity.affectedPercent}% (${severity.band}).`,
    immediateActions: ['Inspect at least three nearby plants and take another close image.', top.contagious ? 'Avoid moving wet leaves or tools between affected and healthy plants.' : 'Check irrigation, soil condition, and input records.', 'Use an RGB and thermal drone verification mission before field-wide treatment.', severity.band === 'severe' || severity.band === 'critical' ? 'Request an agronomist review promptly.' : 'Monitor the marked plants for 24 to 48 hours.'],
    prevention: ['Keep image, weather, and treatment records.', 'Use clean tools and crop-specific sanitation.', 'Use only approved products after label, weather, dose, and human checks.'],
    additionalEvidence: ['Front and back leaf images', 'Full-plant image', 'Nearby healthy and affected plants', 'Rainfall, irrigation, fertilizer, and spray history'],
    treatmentGate: { automaticTreatmentAllowed: false, reason: 'Image diagnosis can guide inspection, but treatment requires crop confirmation, label, weather, agronomist, and farmer approval.', agronomistReviewRecommended: top.confidence < 60 || severity.band === 'severe' || severity.band === 'critical' },
  };
}

function extractJsonObject(value) {
  if (typeof value === 'object' && value) return value;
  const text = String(value || '').replace(/^```(?:json)?/i, '').replace(/```$/i, '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('Vision model did not return valid JSON.');
  return JSON.parse(text.slice(start, end + 1));
}

async function diagnoseWithConfiguredVision(body) {
  if (!visionUrl) return null;
  const fallback = localCropDiagnosis(body);
  const prompt = `Analyse this crop or plant image. The system accepts any crop, but you must express uncertainty and may return unknown. Farmer context: ${JSON.stringify(body.context || {})}. Image metrics: ${JSON.stringify(body.imageMetrics || {})}. Return JSON only with keys cropCandidates, conditionCandidates, symptoms, severity, summary, immediateActions, prevention, additionalEvidence, treatmentGate. cropCandidates require commonName, scientificName, family, confidence 0-100, supportLevel, reason. conditionCandidates require name, category, confidence, supportLevel, reason, contagious, urgency. Never authorize automatic chemical treatment.`;
  const payload = {
    model: visionModel,
    messages: [
      { role: 'system', content: 'You are a cautious agricultural vision assistant. Identify crop and visible crop-health conditions from images and context. Return JSON only. Use unknown when evidence is weak. Do not prescribe or authorize chemicals.' },
      { role: 'user', content: [{ type: 'text', text: prompt }, { type: 'image_url', image_url: { url: body.imageDataUrl, detail: 'high' } }] },
    ],
    temperature: 0.1,
    response_format: { type: 'json_object' },
  };
  const result = await fetchJson(visionUrl, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(visionApiKey ? { Authorization: `Bearer ${visionApiKey}` } : {}) }, body: JSON.stringify(payload) }, 45_000);
  const parsed = extractJsonObject(result.choices?.[0]?.message?.content || result.answer || result);
  const cropCandidates = Array.isArray(parsed.cropCandidates) && parsed.cropCandidates.length
    ? parsed.cropCandidates.slice(0, 3).map((candidate) => ({
      ...candidate,
      commonName: String(candidate.commonName || 'Crop not confirmed'),
      confidence: clampPercent(candidate.confidence),
      supportLevel: candidate.supportLevel === 'unknown' ? 'unknown' : candidate.supportLevel === 'experimental' ? 'experimental' : 'supported',
      reason: String(candidate.reason || 'The configured vision model produced this crop candidate.'),
    }))
    : fallback.cropCandidates;
  const conditionCandidates = Array.isArray(parsed.conditionCandidates) && parsed.conditionCandidates.length
    ? parsed.conditionCandidates.slice(0, 5).map((candidate) => ({
      ...candidate,
      name: String(candidate.name || 'Unknown condition'),
      category: String(candidate.category || 'unknown'),
      confidence: clampPercent(candidate.confidence),
      supportLevel: candidate.supportLevel === 'unknown' ? 'unknown' : candidate.supportLevel === 'experimental' ? 'experimental' : 'supported',
      reason: String(candidate.reason || 'The configured vision model produced this condition candidate.'),
      contagious: Boolean(candidate.contagious),
      urgency: ['routine', 'soon', 'urgent'].includes(candidate.urgency) ? candidate.urgency : 'soon',
    }))
    : fallback.conditionCandidates;
  const parsedSeverity = parsed.severity && Number.isFinite(Number(parsed.severity.affectedPercent))
    ? {
      affectedPercent: clampPercent(parsed.severity.affectedPercent),
      band: cropSeverityBand(clampPercent(parsed.severity.affectedPercent)),
      confidence: clampPercent(parsed.severity.confidence),
    }
    : fallback.severity;
  return {
    ...fallback,
    id: `diagnosis-${randomUUID()}`,
    createdAt: new Date().toISOString(),
    modelVersion: visionModel,
    source: 'vision-model',
    imageName: body.imageName || fallback.imageName,
    imageMetrics: body.imageMetrics,
    context: body.context,
    cropCandidates,
    conditionCandidates,
    symptoms: Array.isArray(parsed.symptoms) ? parsed.symptoms.slice(0, 10) : fallback.symptoms,
    severity: parsedSeverity,
    summary: typeof parsed.summary === 'string' ? parsed.summary : fallback.summary,
    immediateActions: Array.isArray(parsed.immediateActions) ? parsed.immediateActions.slice(0, 8).map(String) : fallback.immediateActions,
    prevention: Array.isArray(parsed.prevention) ? parsed.prevention.slice(0, 8).map(String) : fallback.prevention,
    additionalEvidence: Array.isArray(parsed.additionalEvidence) ? parsed.additionalEvidence.slice(0, 8).map(String) : fallback.additionalEvidence,
    treatmentGate: { ...fallback.treatmentGate, ...(parsed.treatmentGate || {}), automaticTreatmentAllowed: false },
  };
}

function validateBoundary(body) {
  return Boolean(
    typeof body.farmId === 'string'
    && typeof body.farmerId === 'string'
    && Array.isArray(body.boundary)
    && body.boundary.length >= 3
    && body.boundary.every((point) => Number.isFinite(point.lat) && Number.isFinite(point.lng))
    && Number.isFinite(body.areaAcres)
    && body.areaAcres > 0,
  );
}

function validateMission(body) {
  return Boolean(
    typeof body.missionName === 'string'
    && typeof body.farmId === 'string'
    && Array.isArray(body.plantPlans)
    && body.plantPlans.length > 0
    && ['simulation', 'live'].includes(body.mode),
  );
}

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.json': 'application/json; charset=utf-8',
  '.woff2': 'font/woff2',
};

function serveStatic(request, response) {
  if (!existsSync(distDir)) {
    sendJson(response, 503, { error: 'The production bundle is missing. Run npm run build first.' });
    return;
  }
  const rawPath = new URL(request.url, `http://${request.headers.host}`).pathname;
  const stripped = rawPath.startsWith('/AgriSmart/') ? rawPath.slice('/AgriSmart'.length) : rawPath;
  const relativePath = stripped === '/' ? '/index.html' : stripped;
  const candidate = normalize(join(distDir, relativePath));
  const safePath = candidate.startsWith(distDir) ? candidate : join(distDir, 'index.html');
  const filePath = existsSync(safePath) ? safePath : join(distDir, 'index.html');
  response.writeHead(200, {
    'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream',
    'Cache-Control': filePath.endsWith('index.html') ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  createReadStream(filePath).pipe(response);
}

const server = createServer(async (request, response) => {
  if (rateLimit(request)) {
    sendJson(response, 429, { error: 'Too many requests. Try again later.' });
    return;
  }

  if (request.method === 'OPTIONS') {
    response.writeHead(204, {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Headers': 'Content-Type, X-Operator-Token',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    });
    response.end();
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host}`);

  if (request.method === 'GET' && url.pathname === '/health') {
    sendJson(response, 200, {
      status: 'ok',
      service: 'agrismart-mission-api',
      mode: operatorToken && autopilotBridgeUrl ? 'live-ready' : 'simulation-only',
      autopilotBridge: Boolean(autopilotBridgeUrl),
      modelAssistant: Boolean(llmUrl),
      cropVision: Boolean(visionUrl),
      time: new Date().toISOString(),
    });
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/v1/events') {
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': allowedOrigin,
    });
    response.write(`event: connected\ndata: ${JSON.stringify({ time: new Date().toISOString() })}\n\n`);
    clients.add(response);
    request.on('close', () => clients.delete(response));
    return;
  }

  if (request.method === 'GET' && url.pathname === '/api/v1/geocode') {
    try {
      const query = String(url.searchParams.get('q') || '').trim();
      if (query.length < 3) {
        sendJson(response, 400, { error: 'Enter at least three characters.' });
        return;
      }
      const rows = await fetchJson(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&q=${encodeURIComponent(query)}`, {
        headers: { Accept: 'application/json', 'User-Agent': 'AgriSmart/1.0 farm-boundary-mapper' },
      });
      sendJson(response, 200, rows.map((row) => ({
        id: String(row.place_id),
        displayName: row.display_name,
        lat: Number(row.lat),
        lng: Number(row.lon),
        boundingBox: Array.isArray(row.boundingbox) ? row.boundingbox.map(Number) : undefined,
      })));
    } catch (error) {
      sendJson(response, 502, { error: error.message || 'Location search is temporarily unavailable.' });
    }
    return;
  }


  if (request.method === 'POST' && url.pathname === '/api/v1/crop-health/diagnose') {
    try {
      const body = await readJson(request);
      if (typeof body.imageDataUrl !== 'string' || !body.imageDataUrl.startsWith('data:image/') || typeof body.imageName !== 'string' || !body.imageMetrics || !body.context) {
        sendJson(response, 400, { error: 'A processed crop image, image metrics, image name, and crop context are required.' });
        return;
      }
      let diagnosis = null;
      try {
        diagnosis = await diagnoseWithConfiguredVision(body);
      } catch (error) {
        console.warn('Configured crop vision failed; using hybrid fallback.', error.message);
      }
      diagnosis = diagnosis || localCropDiagnosis(body);
      const database = loadDatabase();
      database.diagnoses = database.diagnoses || [];
      database.diagnoses.unshift({ ...diagnosis, imageDataUrl: undefined });
      database.diagnoses = database.diagnoses.slice(0, 1_000);
      saveDatabase(database);
      broadcast('crop-diagnosis', { id: diagnosis.id, summary: diagnosis.summary, createdAt: diagnosis.createdAt });
      sendJson(response, 200, diagnosis);
    } catch (error) {
      sendJson(response, 400, { error: error.message || 'Crop health analysis failed.' });
    }
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/v1/farms/boundaries') {
    try {
      const body = await readJson(request);
      if (!validateBoundary(body)) {
        sendJson(response, 400, { error: 'A farm ID, farmer ID, positive acreage, and at least three valid GPS points are required.' });
        return;
      }
      const database = loadDatabase();
      const record = { ...body, id: `boundary-${randomUUID()}`, status: 'queued_for_verification', createdAt: new Date().toISOString() };
      database.boundaries.unshift(record);
      database.boundaries = database.boundaries.slice(0, 500);
      saveDatabase(database);
      broadcast('boundary', record);
      sendJson(response, 201, record);
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/v1/missions') {
    try {
      const body = await readJson(request);
      if (!validateMission(body)) {
        sendJson(response, 400, { error: 'Mission name, farm, mode, and at least one plant plan are required.' });
        return;
      }
      if (!body.plantPlans.every(validateTreatmentPlan)) {
        sendJson(response, 400, { error: 'Every plan must contain multimodal evidence, a persistent plant location, a valid geofence, and compliant nozzle windows.' });
        return;
      }
      if (!authorized(request, body)) {
        sendJson(response, 403, { error: body.mode === 'live' ? 'The operator approval code is invalid or live mode is disabled.' : 'Mission is not authorized.' });
        return;
      }
      let bridgeReceipt = null;
      if (body.mode === 'live') {
        bridgeReceipt = await sendToAutopilotBridge('/missions', {
          missionName: body.missionName,
          farmId: body.farmId,
          plantPlans: body.plantPlans,
        });
      }
      const database = loadDatabase();
      const receipt = {
        missionId: `mission-${randomUUID()}`,
        status: body.mode === 'live' ? 'queued' : 'simulation_saved',
        createdAt: new Date().toISOString(),
        bridgeReceipt,
        message: body.mode === 'live'
          ? 'Mission passed validation and was accepted by the configured autopilot bridge.'
          : 'Simulation mission was saved without hardware actuation.',
      };
      database.missions.unshift({ ...body, ...receipt });
      database.missions = database.missions.slice(0, 500);
      saveDatabase(database);
      broadcast('mission', receipt);
      sendJson(response, 201, receipt);
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/v1/control/step') {
    try {
      const body = await readJson(request);
      if (!body.plan?.command || !body.telemetry || typeof body.missionId !== 'string') {
        sendJson(response, 400, { error: 'missionId, treatment plan command, and telemetry are required.' });
        return;
      }
      if (!authorized(request, body)) {
        sendJson(response, 403, { error: 'The real-time control step is not authorized.' });
        return;
      }
      if (!validateTreatmentPlan(body.plan)) {
        sendJson(response, 400, { error: 'Treatment plan failed multimodal, localization, geofence, or nozzle-window validation.' });
        return;
      }
      const command = structuredClone(body.plan.command);
      const enabledChannel = command.nozzleCommands?.find((channel) => channel.enabled);
      const overheating = Number(body.telemetry.internalTemperatureC || 0) >= 65;
      const suppressed = Boolean(body.plan.prescription?.suppressed);
      const expired = Number.isFinite(Date.parse(command.expiresAt)) && Date.parse(command.expiresAt) < Date.now();
      const targetDistanceM = distanceMetres(body.telemetry.position, command.targetCoordinate);
      const outsidePlantWindow = targetDistanceM > Math.max(5, Number(body.plan.localization?.accuracyM || 0) * 4);
      const returnToDock = overheating || !command.geofenceValidated;

      if (enabledChannel && Number(body.telemetry.measuredFlowMlPerSecond) > 0) {
        const flowRatio = enabledChannel.targetFlowMlPerSecond / Number(body.telemetry.measuredFlowMlPerSecond);
        enabledChannel.measuredFlowMlPerSecond = Number(body.telemetry.measuredFlowMlPerSecond.toFixed(2));
        enabledChannel.pwmPercent = Math.max(0, Math.min(100, Number((enabledChannel.pwmPercent * flowRatio).toFixed(1))));
      }
      command.vehicleSpeedMps = Math.max(1.2, Math.min(command.vehicleSpeedMps, Number(body.telemetry.vehicleSpeedMps) || command.vehicleSpeedMps));

      const accepted = !returnToDock && !suppressed && !expired && !outsidePlantWindow;
      let bridgeReceipt = null;
      if (accepted && body.mode === 'live') {
        bridgeReceipt = await sendToAutopilotBridge('/control/step', { missionId: body.missionId, command, telemetry: body.telemetry });
      }
      const receipt = {
        accepted,
        command,
        bridgeReceipt,
        targetDistanceM: Number(targetDistanceM.toFixed(2)),
        nextControlStepMs: enabledChannel ? Math.max(50, Math.min(200, enabledChannel.openWindowMs || 100)) : 200,
        safetyState: returnToDock ? 'return-to-dock' : suppressed || expired || outsidePlantWindow ? 'suppressed' : 'clear',
        message: returnToDock
          ? 'Control step blocked and return-to-dock requested by a vehicle safety limit.'
          : expired
            ? 'Control step blocked because the plant command expired.'
            : outsidePlantWindow
              ? 'Control step held because the aircraft is outside the target plant window.'
              : suppressed
                ? 'Control step blocked by the uncertainty or environmental safety gate.'
                : body.mode === 'live'
                  ? 'Closed-loop command was accepted by the configured autopilot bridge.'
                  : 'Closed-loop simulation command was accepted without hardware actuation.',
      };
      const database = loadDatabase();
      database.controlSteps = database.controlSteps || [];
      database.controlSteps.unshift({ id: `control-${randomUUID()}`, ...body, receipt, receivedAt: new Date().toISOString() });
      database.controlSteps = database.controlSteps.slice(0, 5_000);
      saveDatabase(database);
      broadcast('control-step', receipt);
      sendJson(response, 200, receipt);
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/v1/telemetry') {
    try {
      const body = await readJson(request);
      if (typeof body.droneId !== 'string' || !body.sample) {
        sendJson(response, 400, { error: 'droneId and sample are required.' });
        return;
      }
      const database = loadDatabase();
      const telemetry = { id: `telemetry-${randomUUID()}`, ...body, receivedAt: new Date().toISOString() };
      database.telemetry.unshift(telemetry);
      database.telemetry = database.telemetry.slice(0, 2_000);
      saveDatabase(database);
      broadcast('telemetry', telemetry);
      sendJson(response, 202, { accepted: true, id: telemetry.id });
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }
    return;
  }

  if (request.method === 'POST' && url.pathname === '/api/v1/chat') {
    try {
      const body = await readJson(request);
      if (typeof body.message !== 'string' || body.message.trim().length < 2 || body.message.length > 1_000) {
        sendJson(response, 400, { error: 'A message between 2 and 1,000 characters is required.' });
        return;
      }
      let answer = null;
      try {
        answer = await answerWithConfiguredModel(body.message, body.pathname, body.role, body.context);
      } catch (error) {
        console.warn('Configured assistant model failed; using guided fallback.', error.message);
      }
      answer = answer || localChat(body.message);
      const database = loadDatabase();
      database.chat.unshift({ id: `chat-${randomUUID()}`, message: body.message, answer, createdAt: new Date().toISOString() });
      database.chat = database.chat.slice(0, 500);
      saveDatabase(database);
      sendJson(response, 200, { answer, source: llmUrl ? 'server' : 'local' });
    } catch (error) {
      sendJson(response, 400, { error: error.message });
    }
    return;
  }

  serveStatic(request, response);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`AgriSmart is running on http://0.0.0.0:${port}`);
  console.log(operatorToken && autopilotBridgeUrl ? 'Live mission authorization and the autopilot bridge are enabled.' : 'Mission API is in simulation-only mode until operator token and bridge URL are configured.');
});
