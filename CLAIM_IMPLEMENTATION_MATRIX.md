# AgriSmart claim implementation matrix

This repository contains a production-oriented software embodiment for the representative claims in `claims.pdf`. It maps the claim language to executable modules, user interfaces, API contracts, safety gates, and verification scripts.

| Claim | Software embodiment | Primary evidence |
|---|---|---|
| 1 | Multimodal capture → perception → continuous severity → prescription → fused localization → independent nozzle and speed command | `buildPlantTreatmentPlan()`, `/api/v1/missions`, `/api/v1/control/step` |
| 2 | RGB lesion/texture, multispectral NDVI/NDRE/chlorophyll, and thermal differential fusion | `assessDiseaseSeverity()` |
| 3 | Continuous programmable severity-to-dose curve constrained by label and environmental limits | `prescribeDose()` |
| 4 | Predictive gating from aircraft speed, nozzle offset, droplet travel time, and wind drift | `buildNozzleCommands()` |
| 5 | Independent PWM channels, measured-flow correction, and clamped 50–200 ms actuation windows | `buildNozzleCommands()`, closed-loop control API |
| 6 | Vehicle speed decreases with disease density and prescribed dose | `adjustVehicleSpeed()` |
| 7 | High uncertainty, weather, temperature, rain, or low severity suppresses dosage and supports revisit | `prescribeDose()` and treatment console |
| 8 | Persistent plant treatment history, efficacy forecasting, and policy adaptation | `plantTreatmentHistory`, `forecastDiseaseProgression()`, `adaptSeverityDosePolicy()` |
| 9 | GNSS/RTK, IMU drift, visual odometry, and row constraints create a persistent plant identifier | `fusePlantLocalization()` |
| 10 | Field dashboard, treatment history, efficacy assessment, and disease digital twin | `PatentTreatmentConsole.tsx`, mission API persistence and SSE |
| 11 | Ordered capture-to-command UAV treatment method | `buildPlantTreatmentPlan()` |
| 12 | Reward-driven temporal-difference update of severity-to-dose parameters | `adaptSeverityDosePolicy()` |
| 13 | Early-stage infection score from thermal and multispectral cues before visible lesions dominate | `assessDiseaseSeverity()` |
| 14 | Versioned computer-readable treatment program distributed with the application | `AUTONOMOUS_TREATMENT_PROGRAM` |

## Acceptance verification

Run:

```bash
npm ci
npm run check
npm run verify:claims
npm run build
```

`verify:claims` executes calibrated fixtures and asserts multimodal scoring, persistent RTK plant localization, constrained dosing, disease-density speed control, eight independent channels, one enabled nozzle, a 50–200 ms window, digital-twin output, adaptive-policy versioning, and all 14 claim entries.

## Real hardware boundary

The application now supports an authenticated autopilot bridge. Set `AGRISMART_AUTOPILOT_BRIDGE_URL`, `AGRISMART_OPERATOR_TOKEN`, and `AGRISMART_BRIDGE_TOKEN`. The companion-computer bridge must expose `POST /missions` and `POST /control/step` and translate validated commands into the selected flight-controller protocol.

Commercial physical operation still requires calibrated RGB, multispectral, and thermal sensors, GNSS/RTK and IMU telemetry, visual odometry, independent PWM nozzle drivers, flow sensors, geofence and obstacle validation, chemical-label compliance, aviation authorization, and field test records.

Source code can support a patent specification, but it does not by itself establish novelty, non-obviousness, written description, enablement, best mode, inventorship, or claim scope. Patent counsel should align the claims, specification, drawings, source release, calibration procedure, and hardware test evidence.
