import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const enginePath = join(root, 'src/lib/patentEngine.ts');
const source = readFileSync(enginePath, 'utf8');
const compiled = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ES2022,
    target: ts.ScriptTarget.ES2022,
  },
}).outputText;
const moduleUrl = `data:text/javascript;base64,${Buffer.from(compiled).toString('base64')}`;
const engine = await import(moduleUrl);

const capture = {
  captureId: 'verification-capture',
  capturedAt: new Date().toISOString(),
  rgb: { lesionAreaPercent: 18, chlorosisPercent: 12, textureAnomaly: 0.61, confidence: 0.93 },
  multispectral: { ndvi: 0.46, ndre: 0.41, chlorophyllIndex: 0.52, confidence: 0.91 },
  thermal: { canopyTemperatureC: 34.6, healthyBaselineC: 30.2, differentialC: 4.4, confidence: 0.9 },
};
const evidence = {
  gnss: { lat: 18.53241, lng: 73.84712, altitudeM: 34, accuracyM: 0.8 },
  rtk: { lat: 18.532411, lng: 73.847119, altitudeM: 34, accuracyM: 0.025, fixed: true },
  inertial: { driftM: 0.18, headingDeg: 88, velocityMps: 3.1 },
  visualOdometry: { offsetEastM: 0.03, offsetNorthM: -0.02, confidence: 0.95 },
  rowStructure: { rowIndex: 7, plantIndex: 19, confidence: 0.96 },
};
const environment = {
  windSpeedKph: 9,
  windDirectionDeg: 250,
  temperatureC: 28,
  humidityPercent: 62,
  rainProbabilityPercent: 12,
  solarIntensityWm2: 720,
};
const policy = {
  policyId: 'verification-policy', version: 1, baseDoseMl: 0.2, gain: 0.86,
  curveExponent: 1.22, learningRate: 0.08, uncertaintyThreshold: 0.42,
  minimumTreatmentSeverity: 0.12,
};
const chemical = {
  chemicalName: 'Verification input', minimumDoseMlPerPlant: 0.1,
  maximumDoseMlPerPlant: 8, maximumWindKph: 18, minimumTemperatureC: 12,
  maximumTemperatureC: 35, maximumRainProbabilityPercent: 45, reentryHours: 12,
};

const severity = engine.assessDiseaseSeverity(capture);
assert.ok(severity.continuousSeverity > 0 && severity.continuousSeverity <= 1);
assert.ok(severity.earlyStageProbability >= 0 && severity.earlyStageProbability <= 1);
const localization = engine.fusePlantLocalization('verification-farm', evidence);
assert.match(localization.persistentPlantId, /^plant-/);
assert.ok(localization.sources.some((sourceName) => sourceName.includes('RTK')));
const prescription = engine.prescribeDose(severity, policy, chemical, environment);
assert.equal(prescription.suppressed, false);
assert.ok(prescription.targetDoseMl > 0 && prescription.targetDoseMl <= chemical.maximumDoseMlPerPlant);
const speed = engine.adjustVehicleSpeed(5.2, 0.7, prescription.targetDoseMl);
assert.ok(speed >= 1.2 && speed <= 5.2);
const channels = engine.buildNozzleCommands(prescription.targetDoseMl, speed, environment, 2, 8.4, 8);
assert.equal(channels.length, 8);
assert.equal(channels.filter((channel) => channel.enabled).length, 1);
assert.ok(channels.find((channel) => channel.enabled).openWindowMs >= 50);
assert.ok(channels.find((channel) => channel.enabled).openWindowMs <= 200);
const forecast = engine.forecastDiseaseProgression(localization.persistentPlantId, severity.continuousSeverity, prescription.targetDoseMl);
assert.equal(forecast.points.length, 9);
const adapted = engine.adaptSeverityDosePolicy(policy, 0.9, 0.8);
assert.equal(adapted.version, policy.version + 1);
const plan = engine.buildPlantTreatmentPlan({
  farmId: 'verification-farm', capture, localizationEvidence: evidence, policy,
  chemical, environment, localDiseaseDensity: 0.7, selectedNozzleChannel: 2,
});
assert.equal(plan.localization.persistentPlantId, localization.persistentPlantId);
assert.equal(plan.command.geofenceValidated, true);
assert.equal(engine.AUTONOMOUS_TREATMENT_PROGRAM.claimsImplemented.length, 14);

const claimSource = readFileSync(join(root, 'src/data/patentSeed.ts'), 'utf8');
const claimNumbers = [...claimSource.matchAll(/claimNumber:\s*(\d+)/g)].map((match) => Number(match[1]));
assert.deepEqual(claimNumbers, Array.from({ length: 14 }, (_, index) => index + 1));

console.log('AgriSmart claim verification passed.');
console.log(JSON.stringify({
  severity: severity.continuousSeverity,
  earlyStageProbability: severity.earlyStageProbability,
  localizationAccuracyM: localization.accuracyM,
  prescribedDoseMl: prescription.targetDoseMl,
  activeNozzle: channels.find((channel) => channel.enabled)?.channelId,
  nozzleWindowMs: channels.find((channel) => channel.enabled)?.openWindowMs,
  claims: claimNumbers.length,
}, null, 2));
