# AgriSmart Universal Crop Health Scanner

## Purpose

The scanner accepts an image of any crop or plant. It combines image-quality measurements, farmer-confirmed crop context, visible symptom extraction, an open crop registry, and an optional multimodal vision model.

It does not force a diagnosis. Results carry `verified`, `supported`, `experimental`, or `unknown` evidence labels. Automatic chemical treatment remains disabled.

## Workflow

1. Capture or upload a close leaf or plant image.
2. Check resolution, brightness, contrast, sharpness, and visible plant tissue.
3. Confirm the crop and add growth stage, affected part, rainfall, irrigation, recent inputs, location, and symptom notes.
4. Estimate crop candidates, condition alternatives, symptoms, visible affected area, severity, uncertainty, and next evidence required.
5. Save the result to crop history.
6. Ask AgriSmart Copilot to explain the result.
7. Create an RGB and thermal drone verification request.
8. Require label, weather, agronomist, farmer, and operator approval before treatment.

## Production vision model

Configure an OpenAI-compatible multimodal endpoint on the server:

```env
AGRISMART_VISION_URL=https://your-provider.example/v1/chat/completions
AGRISMART_VISION_API_KEY=server-side-secret
AGRISMART_VISION_MODEL=your-multimodal-model
```

Do not place a vision API key in a `VITE_` variable.

When no vision endpoint is configured, the system uses a cautious local image-metrics and farmer-context fallback. The fallback accepts any crop name but returns `unknown` when visual evidence is insufficient.

## API

`POST /api/v1/crop-health/diagnose`

The request contains a resized image data URL, image-quality metrics, image name, and crop context. The response contains crop candidates, condition candidates, symptoms, continuous visible severity, actions, evidence requirements, model version, and treatment gate.

## Validation

```bash
npm run verify:crop-health
npm run verify:ui
npm run check
npm run build
```
