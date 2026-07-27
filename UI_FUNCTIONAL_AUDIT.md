# AgriSmart UI and Functional Audit

This release audits the uploaded Drone Operations build and fixes reproducible UI, interaction, data, routing, accessibility, and dependency defects.

## Critical fixes

- Repaired the npm lock file conflict between `picomatch` 2.x and 4.x.
- Replaced the broken ESLint script, which had no ESLint dependency, with a TypeScript source check.
- Corrected malformed generated dates that produced months such as `010` and `011`.
- Fixed a compile-level `AlertBanner` prop mismatch in the buyer marketplace.
- Removed invalid nested link and button markup through a reusable `ButtonLink` component.
- Added safe default button types to prevent accidental form submission.
- Removed accidental brace-named directories from the packaged source.

## Shared UI and accessibility

- Added consistent focus, disabled, loading, keyboard, and fallback interaction behaviour to reusable controls.
- Added keyboard support for cards and tabs, including Arrow, Home, and End navigation.
- Improved labels, descriptions, validation states, and ARIA attributes for form controls.
- Added reduced-motion, high-contrast, large-text, and low-bandwidth controls inside authenticated workspaces.
- Improved mobile navigation, notification behaviour, active-route matching, and body scroll locking.
- Added clear sandbox feedback for controls that require a future backend integration.

## Authentication and onboarding

- Fixed role-based demo login routing.
- Persisted onboarding fields, OTP state, identity verification, KCC verification, and IoT selection across refreshes.
- Added validation for phone, OTP, farm details, crop, bank account, IFSC, Aadhaar consent, and KCC data.
- Reset onboarding state only after successful completion.
- Prevented unsupported input props and restored the intended phone prefix UI.

## Drone Operations

- Mission planning now uses the selected mission type, altitude, overlap, available drones, and target grid cells.
- Generated missions now enter a real sandbox queue with calculated distance, duration, battery reserve, coverage, and assigned drones.
- Treatment approval now applies to the selected grid cell instead of the whole farm.
- Safety thresholds now match the displayed battery and temperature limits.
- Return-to-dock pauses the active mission and prevents unsafe restart.
- Returning drones reach the dock, enter charging state, and become ready after sufficient charge.
- Mission reset restores altitude, speed, location, and status correctly.
- Intelligence findings open the correct cell and map layer.
- Drone intelligence CSV export now works.
- Maintenance history opens as an actual panel.

## Marketplace and operational workflows

- Buyer offer creation now validates price, quantity, date, location, and payment terms.
- Saved marketplace listings now toggle visibly.
- Farmer offer acceptance, negotiation, and rejection now update the sandbox records and counts.
- Verifier inspections now track checklist items, notes, photos, geo-tags, approval, rejection, and review submission.
- Admin disputes now support resolution, escalation, evidence requests, notes, and updated counts.
- Admin user approval, suspension, restoration, filtering, and detail views now update locally.
- Payment and audit exports now create valid CSV files with safe escaping and UTF-8 support.

## Data and display stability

- Relative times now use the current clock and support future timestamps.
- Invalid dates no longer crash or render misleading values.
- Currency, number, and date formatting now follows the active locale.
- Dashboard sparkline data no longer changes during ordinary rerenders.
- Empty farm averages and similar zero-length calculations are guarded.
- Broken notification routes now point to valid pages.

## Verification performed

- TypeScript and TSX parser audit: passed.
- Local import resolution audit: passed.
- Route and notification deep-link audit: passed.
- Local TypeScript contract audit with dependency stubs: passed.
- `git diff --check`: passed.
- `npm ci --dry-run --offline`: passed, confirming package and lock-file synchronization.
- Patch application to a fresh copy: performed during packaging.

A complete production build still requires the npm packages to be available on the machine running `npm ci`. Real OTP, payments, identity verification, maps, device provisioning, drone telemetry, and flight control remain explicit backend or hardware integration boundaries.
