# AgriSmart Drone Operations Patch

## What this patch adds

This patch adds a complete farmer-facing Drone Operations module at `/farmer/drones`.

The module is designed as a high-fidelity hardware control demo. It separates the web application from the real flight-control layer so the same UI can later connect to PX4 or ArduPilot through a backend mission controller and MAVLink bridge.

## Main workspaces

- Command Centre
  - Live multi-drone mission simulation
  - Battery, temperature, signal, speed, altitude, and route progress
  - Pause, resume, reset, and return-to-dock controls
  - Flight weather, GPS accuracy, and safety thresholds
  - Solar dock energy status and alerts

- Farm Grid
  - 48 grid cells with connected drone ownership
  - Health, thermal, and RGB inspection layers
  - Water-stress probability, disease confidence, canopy temperature, and crop-health scores
  - Per-cell recommendations and farmer treatment approval

- Missions
  - Active, scheduled, and completed mission queue
  - Lawnmower-style coverage routes
  - Multi-drone route allocation
  - Mission type, altitude, and overlap controls
  - Optimized route simulation with battery reserve and image coverage estimates

- Fleet and Dock
  - Three demo drones with RGB, thermal, and spraying payloads
  - Maintenance intervals and firmware details
  - Solar generation, battery storage, charging rate, and dock temperature
  - Explicit web API → mission controller → autopilot architecture

- Crop Intelligence
  - RGB disease anomaly visualization
  - Thermal water-stress visualization
  - Combined AI crop-health score
  - Detect → decide → approve → act → verify workflow

## Demo fleet

- `KT-Survey-01`: RGB survey drone
- `KT-Thermal-02`: radiometric thermal survey drone
- `KT-Spray-03`: precision spot-treatment drone
- `North Field Solar Dock`: autonomous solar-powered charging station

## Files added

- `src/pages/farmer/FarmerDrones.tsx`
- `src/data/droneSeed.ts`
- `src/types/drone.ts`
- `DRONE_PATCH_NOTES.md`

## Files updated

- `src/App.tsx`
- `src/components/layout/DashboardLayout.tsx`
- `src/components/ui/index.tsx`
- `src/i18n/index.ts`
- `README.md`

## Hardware integration boundary

The demo does not command motors directly. Production integration should follow this chain:

```text
Farmer web app
  → authenticated backend mission API
  → mission controller and MAVLink bridge
  → PX4 or ArduPilot flight controller
  → drone hardware
```

The backend must enforce geofences, permissions, audit logs, command authorization, weather limits, battery reserve, collision separation, and emergency return behavior.

## Verification

- All TypeScript and TSX files passed TypeScript syntax parsing.
- The new drone domain model, seeded data, and page passed an isolated strict TypeScript check using local interface stubs.
- The patch was generated against the polished AgriSmart source, not the original unpatched archive.
- A full dependency build could not run in the packaging environment because npm registry access was unavailable.
