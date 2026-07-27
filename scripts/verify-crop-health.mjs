import { spawn } from 'node:child_process';
import { existsSync,unlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { setTimeout as wait } from 'node:timers/promises';

const port = 3917;
const dataFile = join(tmpdir(), `agrismart-crop-health-${process.pid}.json`);
const child = spawn(process.execPath, ['server/index.mjs'], {
  cwd: new URL('..', import.meta.url),
  env: { ...process.env, PORT: String(port), AGRISMART_VISION_URL: '', AGRISMART_LLM_URL: '', AGRISMART_DATA_FILE: dataFile },
  stdio: ['ignore', 'pipe', 'pipe'],
});

let output = '';
child.stdout.on('data', (chunk) => { output += chunk; });
child.stderr.on('data', (chunk) => { output += chunk; });

async function request(path, options) {
  const response = await fetch(`http://127.0.0.1:${port}${path}`, options);
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || `Request failed with ${response.status}`);
  return payload;
}

try {
  let ready = false;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      await request('/health');
      ready = true;
      break;
    } catch {
      await wait(100);
    }
  }
  if (!ready) throw new Error(`Server did not start. ${output}`);

  const diagnosis = await request('/api/v1/crop-health/diagnose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      imageName: 'leaf.jpg',
      imageDataUrl: 'data:image/jpeg;base64,AA==',
      imageMetrics: {
        width: 1000,
        height: 800,
        brightness: 126,
        contrast: 48,
        sharpness: 22,
        greenRatio: 0.42,
        yellowRatio: 0.12,
        brownRatio: 0.14,
        whiteRatio: 0.02,
        darkRatio: 0.08,
        lesionRatio: 0.22,
        qualityScore: 88,
        issues: [],
      },
      context: {
        cropHint: 'Tomato',
        affectedPart: 'leaf',
        symptomsText: 'Brown circular spots after heavy rain',
        recentRainfall: 'heavy',
        nearbyAffected: 'yes',
      },
    }),
  });

  if (!diagnosis.id || diagnosis.cropCandidates?.[0]?.commonName !== 'Tomato') throw new Error('Crop candidate was not preserved.');
  if (!Array.isArray(diagnosis.conditionCandidates) || diagnosis.conditionCandidates.length === 0) throw new Error('Condition candidates are missing.');
  if (diagnosis.treatmentGate?.automaticTreatmentAllowed !== false) throw new Error('Automatic treatment safety gate must remain closed.');
  if (!Number.isFinite(diagnosis.severity?.affectedPercent)) throw new Error('Severity estimate is missing.');

  console.log('Crop-health API verification passed.');
} finally {
  child.kill('SIGTERM');
  if (existsSync(dataFile)) unlinkSync(dataFile);
}
