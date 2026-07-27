import type {
  CropCandidate,
  CropConditionCandidate,
  CropHealthContext,
  CropHealthDiagnosis,
  CropHealthDiagnosisRequest,
  CropImageMetrics,
  CropSeverityBand,
  CropSupportLevel,
  CropSymptomFinding,
} from '@/types/cropHealth';

const cropRegistry: Record<string, { scientificName: string; family: string }> = {
  rice: { scientificName: 'Oryza sativa', family: 'Poaceae' },
  wheat: { scientificName: 'Triticum aestivum', family: 'Poaceae' },
  maize: { scientificName: 'Zea mays', family: 'Poaceae' },
  corn: { scientificName: 'Zea mays', family: 'Poaceae' },
  barley: { scientificName: 'Hordeum vulgare', family: 'Poaceae' },
  millet: { scientificName: 'Pennisetum glaucum', family: 'Poaceae' },
  sorghum: { scientificName: 'Sorghum bicolor', family: 'Poaceae' },
  tomato: { scientificName: 'Solanum lycopersicum', family: 'Solanaceae' },
  potato: { scientificName: 'Solanum tuberosum', family: 'Solanaceae' },
  chilli: { scientificName: 'Capsicum annuum', family: 'Solanaceae' },
  pepper: { scientificName: 'Capsicum annuum', family: 'Solanaceae' },
  brinjal: { scientificName: 'Solanum melongena', family: 'Solanaceae' },
  eggplant: { scientificName: 'Solanum melongena', family: 'Solanaceae' },
  cotton: { scientificName: 'Gossypium hirsutum', family: 'Malvaceae' },
  soybean: { scientificName: 'Glycine max', family: 'Fabaceae' },
  pea: { scientificName: 'Pisum sativum', family: 'Fabaceae' },
  chickpea: { scientificName: 'Cicer arietinum', family: 'Fabaceae' },
  lentil: { scientificName: 'Lens culinaris', family: 'Fabaceae' },
  groundnut: { scientificName: 'Arachis hypogaea', family: 'Fabaceae' },
  peanut: { scientificName: 'Arachis hypogaea', family: 'Fabaceae' },
  mustard: { scientificName: 'Brassica juncea', family: 'Brassicaceae' },
  cabbage: { scientificName: 'Brassica oleracea', family: 'Brassicaceae' },
  cauliflower: { scientificName: 'Brassica oleracea var. botrytis', family: 'Brassicaceae' },
  sugarcane: { scientificName: 'Saccharum officinarum', family: 'Poaceae' },
  banana: { scientificName: 'Musa spp.', family: 'Musaceae' },
  mango: { scientificName: 'Mangifera indica', family: 'Anacardiaceae' },
  apple: { scientificName: 'Malus domestica', family: 'Rosaceae' },
  grape: { scientificName: 'Vitis vinifera', family: 'Vitaceae' },
  citrus: { scientificName: 'Citrus spp.', family: 'Rutaceae' },
  orange: { scientificName: 'Citrus sinensis', family: 'Rutaceae' },
  lemon: { scientificName: 'Citrus limon', family: 'Rutaceae' },
  onion: { scientificName: 'Allium cepa', family: 'Amaryllidaceae' },
  garlic: { scientificName: 'Allium sativum', family: 'Amaryllidaceae' },
  turmeric: { scientificName: 'Curcuma longa', family: 'Zingiberaceae' },
  ginger: { scientificName: 'Zingiber officinale', family: 'Zingiberaceae' },
  tea: { scientificName: 'Camellia sinensis', family: 'Theaceae' },
  coffee: { scientificName: 'Coffea arabica', family: 'Rubiaceae' },
  coconut: { scientificName: 'Cocos nucifera', family: 'Arecaceae' },
  papaya: { scientificName: 'Carica papaya', family: 'Caricaceae' },
  pomegranate: { scientificName: 'Punica granatum', family: 'Lythraceae' },
  cucumber: { scientificName: 'Cucumis sativus', family: 'Cucurbitaceae' },
  pumpkin: { scientificName: 'Cucurbita spp.', family: 'Cucurbitaceae' },
  watermelon: { scientificName: 'Citrullus lanatus', family: 'Cucurbitaceae' },
};

const clamp = (value: number, min = 0, max = 100) => Math.max(min, Math.min(max, value));
const round = (value: number, decimals = 1) => Number(value.toFixed(decimals));

function normalizeCropName(value = '') {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function supportLevel(confidence: number, _knownCrop: boolean): CropSupportLevel {
  if (confidence >= 65) return 'supported';
  if (confidence >= 35) return 'experimental';
  return 'unknown';
}

function severityBand(percent: number): CropSeverityBand {
  if (percent <= 5) return 'minimal';
  if (percent <= 20) return 'mild';
  if (percent <= 40) return 'moderate';
  if (percent <= 65) return 'severe';
  return 'critical';
}

function condition(
  name: string,
  category: CropConditionCandidate['category'],
  confidence: number,
  reason: string,
  contagious: boolean,
): CropConditionCandidate {
  const safeConfidence = clamp(confidence);
  return {
    name,
    category,
    confidence: round(safeConfidence),
    supportLevel: supportLevel(safeConfidence, false),
    reason,
    contagious,
    urgency: safeConfidence >= 75 ? 'urgent' : safeConfidence >= 48 ? 'soon' : 'routine',
  };
}

function findText(context: CropHealthContext, terms: string[]) {
  const text = `${context.symptomsText || ''} ${context.recentInputs || ''} ${context.irrigation || ''}`.toLowerCase();
  return terms.some((term) => text.includes(term));
}

function buildCropCandidates(context: CropHealthContext, metrics: CropImageMetrics): CropCandidate[] {
  const cropName = normalizeCropName(context.cropHint);
  if (cropName) {
    const registry = cropRegistry[cropName];
    return [{
      commonName: context.cropHint?.trim() || cropName,
      scientificName: registry?.scientificName,
      family: registry?.family,
      confidence: registry ? 96 : 78,
      supportLevel: 'supported',
      reason: registry
        ? 'The farmer-provided crop name matches the built-in crop registry.'
        : 'The crop name was supplied by the farmer and is accepted by the open crop registry.',
    }];
  }

  const grassLike = metrics.greenRatio > 0.36 && metrics.yellowRatio < 0.18;
  return [{
    commonName: grassLike ? 'Possible cereal or grass crop' : 'Crop not confirmed',
    family: grassLike ? 'Poaceae candidate' : undefined,
    confidence: grassLike ? 38 : 18,
    supportLevel: 'unknown',
    reason: 'Visual colour statistics cannot safely identify the crop species. Confirm the crop name or connect a configured vision model.',
  }];
}

function buildSymptoms(metrics: CropImageMetrics, context: CropHealthContext): CropSymptomFinding[] {
  const symptoms: CropSymptomFinding[] = [];
  const add = (id: string, label: string, confidence: number, evidence: string) => {
    if (confidence >= 24) symptoms.push({ id, label, confidence: round(clamp(confidence)), evidence });
  };
  add('yellowing', 'Yellowing or chlorosis', metrics.yellowRatio * 260, `${round(metrics.yellowRatio * 100)}% of sampled pixels fall in a yellow range.`);
  add('necrosis', 'Brown or necrotic tissue', metrics.brownRatio * 320, `${round(metrics.brownRatio * 100)}% of sampled pixels fall in a brown lesion range.`);
  add('powder', 'White surface pattern', metrics.whiteRatio * 300, `${round(metrics.whiteRatio * 100)}% of sampled pixels are bright and low-saturation.`);
  add('dark-spots', 'Dark spotting', metrics.darkRatio * 220, `${round(metrics.darkRatio * 100)}% of sampled pixels form dark regions.`);
  add('loss-green', 'Reduced green canopy', (0.5 - metrics.greenRatio) * 130, `Green tissue ratio is ${round(metrics.greenRatio * 100)}%.`);
  if (findText(context, ['curl', 'curled', 'curling'])) add('curling', 'Leaf curling', 82, 'The farmer reported curling in the symptom description.');
  if (findText(context, ['hole', 'chewed', 'insect', 'pest'])) add('feeding', 'Chewing or pest damage', 79, 'The farmer reported holes, chewing, or visible insects.');
  if (findText(context, ['wilt', 'wilting', 'droop'])) add('wilting', 'Wilting', 82, 'The farmer reported wilting or drooping.');
  if (findText(context, ['mosaic', 'mottled'])) add('mosaic', 'Mosaic or mottling', 84, 'The farmer reported mosaic-like colour variation.');
  if (findText(context, ['rust', 'orange powder'])) add('rust', 'Rust-coloured pustules', 88, 'The farmer reported rust-coloured powder or pustules.');
  return symptoms.sort((left, right) => right.confidence - left.confidence).slice(0, 7);
}

function buildConditions(metrics: CropImageMetrics, context: CropHealthContext): CropConditionCandidate[] {
  const moistureRisk = context.recentRainfall === 'heavy' || findText(context, ['wet', 'waterlogged', 'humidity', 'rain']);
  const dryRisk = findText(context, ['dry', 'drought', 'hot', 'heat']) || context.irrigation?.toLowerCase().includes('low');
  const candidates = [
    condition(
      'Fungal leaf-spot complex',
      'fungal',
      metrics.brownRatio * 330 + metrics.darkRatio * 110 + (moistureRisk ? 18 : 0),
      'Brown or dark lesions combined with wet conditions often match fungal leaf-spot patterns.',
      true,
    ),
    condition(
      'Nutrient deficiency or chlorosis',
      'nutrient',
      metrics.yellowRatio * 300 + (findText(context, ['fertilizer', 'nitrogen', 'nutrient']) ? 12 : 0),
      'Broad yellowing without a strong lesion pattern can indicate nutrient imbalance or root stress.',
      false,
    ),
    condition(
      'Water or heat stress',
      dryRisk ? 'water_stress' : 'heat_stress',
      (1 - metrics.greenRatio) * 70 + (dryRisk ? 24 : 0),
      'Loss of green tissue and farmer-reported dry or hot conditions can indicate physiological stress.',
      false,
    ),
    condition(
      'Powdery mildew-like surface growth',
      'fungal',
      metrics.whiteRatio * 340 + (findText(context, ['powder', 'white coating']) ? 25 : 0),
      'Bright low-saturation patches can resemble powdery fungal growth, but glare must be excluded.',
      true,
    ),
    condition(
      'Insect or mite damage',
      'pest',
      (findText(context, ['hole', 'chewed', 'insect', 'web', 'mite']) ? 78 : metrics.darkRatio * 95),
      'Holes, chewing, webbing, or visible insects support a pest-damage diagnosis.',
      true,
    ),
    condition(
      'Viral mosaic or leaf-curl complex',
      'viral',
      (findText(context, ['mosaic', 'mottled', 'curl']) ? 76 : metrics.yellowRatio * 130),
      'Mosaic colour patterns and curling can indicate a viral complex or sap-feeding vector damage.',
      true,
    ),
    condition(
      'Chemical or spray injury',
      'chemical',
      (findText(context, ['spray', 'herbicide', 'pesticide', 'burn']) ? 62 : 12),
      'Recent chemical use can cause edge burn, spotting, or bleaching that resembles disease.',
      false,
    ),
  ].filter((candidate) => candidate.confidence >= 18);

  const sorted = candidates.sort((left, right) => right.confidence - left.confidence).slice(0, 4);
  if (!sorted.length || sorted[0].confidence < 32) {
    sorted.unshift(condition('Unknown or insufficient evidence', 'unknown', 54, 'The image and context do not support a reliable named condition.', false));
  }
  return sorted;
}

export function createLocalCropDiagnosis(request: CropHealthDiagnosisRequest): CropHealthDiagnosis {
  const cropCandidates = buildCropCandidates(request.context, request.imageMetrics);
  const symptoms = buildSymptoms(request.imageMetrics, request.context);
  const conditionCandidates = buildConditions(request.imageMetrics, request.context);
  const affectedPercent = clamp(request.imageMetrics.lesionRatio * 100, 0, 100);
  const topCondition = conditionCandidates[0];
  const severity = {
    affectedPercent: round(affectedPercent),
    band: severityBand(affectedPercent),
    confidence: round(clamp((request.imageMetrics.qualityScore + topCondition.confidence) / 2)),
  };
  const lowEvidence = request.imageMetrics.qualityScore < 55 || topCondition.confidence < 60 || topCondition.category === 'unknown';
  const summary = `${cropCandidates[0].commonName}: ${topCondition.name} is the leading possibility at ${round(topCondition.confidence)}% confidence. Estimated visible damage is ${severity.affectedPercent}% (${severity.band}).`;

  return {
    id: `diagnosis-${Date.now()}`,
    createdAt: new Date().toISOString(),
    modelVersion: 'agrismart-open-crop-hybrid-1.0',
    source: 'hybrid-local',
    imageName: request.imageName,
    imageDataUrl: request.imageDataUrl,
    imageMetrics: request.imageMetrics,
    context: request.context,
    cropCandidates,
    conditionCandidates,
    symptoms,
    severity,
    summary,
    immediateActions: [
      'Inspect at least three nearby plants and photograph the same symptom from another angle.',
      topCondition.contagious ? 'Avoid moving wet leaves or tools between affected and healthy plants.' : 'Check irrigation, soil condition, and recent input records before treatment.',
      severity.band === 'severe' || severity.band === 'critical' ? 'Request an agronomist review promptly.' : 'Monitor the marked plants for 24 to 48 hours.',
      'Use a drone RGB and thermal verification mission before any field-wide treatment.',
    ],
    prevention: [
      'Keep diagnosis images, dates, weather, and treatment outcomes in the crop history.',
      'Use clean tools and crop-specific spacing, irrigation, and sanitation practices.',
      'Apply only locally approved products after crop, disease, label, weather, and dose checks.',
    ],
    additionalEvidence: [
      'A close image of the front and back of one affected leaf',
      'A full-plant image showing growth stage',
      'A wider image showing nearby healthy and affected plants',
      'Recent rainfall, irrigation, fertilizer, and spray history',
    ],
    treatmentGate: {
      automaticTreatmentAllowed: false,
      reason: lowEvidence
        ? 'The evidence is not strong enough for automatic treatment. Confirm the crop and obtain additional images or expert review.'
        : 'Image diagnosis can guide inspection, but chemical treatment still requires label, weather, agronomist, and farmer approval.',
      agronomistReviewRecommended: lowEvidence || severity.band === 'severe' || severity.band === 'critical',
    },
  };
}

function loadImage(dataUrl: string) {
  return new Promise<HTMLImageElement>((resolveImage, reject) => {
    const image = new Image();
    image.onload = () => resolveImage(image);
    image.onerror = () => reject(new Error('The selected image could not be decoded.'));
    image.src = dataUrl;
  });
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolveUrl, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolveUrl(String(reader.result));
    reader.onerror = () => reject(new Error('The selected file could not be read.'));
    reader.readAsDataURL(file);
  });
}

export async function prepareCropImage(file: File): Promise<{
  imageDataUrl: string;
  overlayDataUrl: string;
  metrics: CropImageMetrics;
}> {
  if (!file.type.startsWith('image/')) throw new Error('Select a JPEG, PNG, WEBP, or camera image.');
  if (file.size > 12 * 1024 * 1024) throw new Error('Use an image smaller than 12 MB.');

  const originalUrl = await fileToDataUrl(file);
  const image = await loadImage(originalUrl);
  const maxDimension = 1280;
  const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Image analysis is not supported in this browser.');
  context.drawImage(image, 0, 0, width, height);
  const imageData = context.getImageData(0, 0, width, height);
  const pixels = imageData.data;
  const overlayCanvas = document.createElement('canvas');
  overlayCanvas.width = width;
  overlayCanvas.height = height;
  const overlayContext = overlayCanvas.getContext('2d');
  if (!overlayContext) throw new Error('Image overlay could not be prepared.');
  const overlay = overlayContext.createImageData(width, height);

  let brightnessTotal = 0;
  let brightnessSquaredTotal = 0;
  let edgeTotal = 0;
  let green = 0;
  let yellow = 0;
  let brown = 0;
  let white = 0;
  let dark = 0;
  let lesion = 0;
  const sampleStep = Math.max(1, Math.floor(Math.sqrt((width * height) / 260_000)));
  let samples = 0;

  const greyAt = (index: number) => (pixels[index] * 0.299) + (pixels[index + 1] * 0.587) + (pixels[index + 2] * 0.114);
  for (let y = 0; y < height; y += sampleStep) {
    for (let x = 0; x < width; x += sampleStep) {
      const index = (y * width + x) * 4;
      const red = pixels[index];
      const greenValue = pixels[index + 1];
      const blue = pixels[index + 2];
      const max = Math.max(red, greenValue, blue);
      const min = Math.min(red, greenValue, blue);
      const saturation = max === 0 ? 0 : (max - min) / max;
      const value = greyAt(index);
      brightnessTotal += value;
      brightnessSquaredTotal += value * value;
      if (x + sampleStep < width) edgeTotal += Math.abs(value - greyAt(index + sampleStep * 4));
      if (y + sampleStep < height) edgeTotal += Math.abs(value - greyAt(index + sampleStep * width * 4));

      const isGreen = greenValue > red * 1.08 && greenValue > blue * 1.05 && greenValue > 45;
      const isYellow = red > 95 && greenValue > 80 && red > blue * 1.45 && greenValue > blue * 1.35 && Math.abs(red - greenValue) < 90;
      const isBrown = red > 55 && red > greenValue * 1.12 && greenValue > blue * 1.05 && value < 175;
      const isWhite = value > 205 && saturation < 0.22;
      const isDark = value < 62;
      const isLesion = isYellow || isBrown || isWhite || isDark;
      if (isGreen) green += 1;
      if (isYellow) yellow += 1;
      if (isBrown) brown += 1;
      if (isWhite) white += 1;
      if (isDark) dark += 1;
      if (isLesion) {
        lesion += 1;
        overlay.data[index] = isBrown || isDark ? 210 : 245;
        overlay.data[index + 1] = isYellow ? 154 : 72;
        overlay.data[index + 2] = 52;
        overlay.data[index + 3] = 112;
      }
      samples += 1;
    }
  }

  overlayContext.putImageData(overlay, 0, 0);
  const brightness = brightnessTotal / Math.max(1, samples);
  const variance = (brightnessSquaredTotal / Math.max(1, samples)) - brightness ** 2;
  const contrast = Math.sqrt(Math.max(0, variance));
  const sharpness = edgeTotal / Math.max(1, samples * 2);
  const ratio = (count: number) => count / Math.max(1, samples);
  const issues: string[] = [];
  if (width < 640 || height < 480) issues.push('Low resolution. Move closer and use the rear camera.');
  if (brightness < 52) issues.push('The image is too dark. Use indirect daylight.');
  if (brightness > 220) issues.push('The image is overexposed. Avoid direct glare.');
  if (contrast < 22) issues.push('Low contrast. Place the leaf against a plain background.');
  if (sharpness < 9) issues.push('The image may be blurred. Hold the camera steady and refocus.');
  if (ratio(green) < 0.08) issues.push('Very little green plant tissue is visible. Include the affected leaf or plant.');
  const qualityScore = clamp(100 - issues.length * 16 - Math.max(0, 10 - sharpness) * 2, 12, 100);

  return {
    imageDataUrl: canvas.toDataURL('image/jpeg', 0.84),
    overlayDataUrl: overlayCanvas.toDataURL('image/png'),
    metrics: {
      width,
      height,
      brightness: round(brightness),
      contrast: round(contrast),
      sharpness: round(sharpness),
      greenRatio: round(ratio(green), 4),
      yellowRatio: round(ratio(yellow), 4),
      brownRatio: round(ratio(brown), 4),
      whiteRatio: round(ratio(white), 4),
      darkRatio: round(ratio(dark), 4),
      lesionRatio: round(ratio(lesion), 4),
      qualityScore: round(qualityScore),
      issues,
    },
  };
}
