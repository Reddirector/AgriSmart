# AgriSmart production readiness

## Implemented in this release

- Full React and TypeScript application with farmer, buyer, verifier, and administrator workspaces
- Autonomous treatment console for claims 1–14
- Executable multimodal disease-severity and dose engine
- Independent eight-channel nozzle command model with closed-loop flow correction
- Authenticated mission and real-time control API
- Optional companion-computer/autopilot bridge
- Return-to-dock temperature and geofence safety gates
- Global AgriSmart Copilot with server-side model integration and guided fallback
- Farm boundary mapping through GPS, place search, map tracing, acreage generation, coordinate import, area calculation, and verification queue
- JSON persistence for a single-instance pilot deployment
- Server-sent telemetry and mission events
- Docker and Render deployment configuration
- GitHub Pages workflow for the static demonstration build
- Reduced-motion and accessibility support
- Calming low-glare colour system and shared motion language

## Deployment modes

### Static public interface

GitHub Pages deploys the browser application. It uses local-first storage and cannot perform authenticated live aircraft control because GitHub Pages has no backend runtime.

### Full-stack pilot

Build the application and run `node server/index.mjs`, or deploy the included Docker image. The production browser automatically uses the same-origin API outside GitHub Pages. An explicit `VITE_AGRISMART_API_URL` can override it. Set server secrets from `.env.example`.

### Live hardware

Live mode remains disabled until both an operator token and autopilot bridge URL are configured. The bridge is responsible for protocol translation, vehicle arming policy, hardware failsafes, and acknowledgement from PX4, ArduPilot, or another certified controller.

## Before commercial release

Replace JSON persistence with PostgreSQL or another transactional database. Add production identity, encrypted secrets, audit retention, object storage for imagery, background jobs, signed device identities, role-based server authorization, observability, backups, disaster recovery, chemical catalogue validation, jurisdiction-specific aviation rules, and independent penetration testing.

No software audit can guarantee zero defects. Run the included checks, browser tests on target devices, hardware-in-the-loop simulation, calibrated spray-rig tests, and supervised field trials before live operation.
