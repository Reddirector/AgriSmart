# AgriSmart

## Universal Crop Health Scanner

Farmers can capture or upload any crop image, confirm the crop, receive uncertainty-aware crop and condition candidates, view affected-region highlighting and continuous severity, ask Copilot for an explanation, and create an RGB plus thermal drone verification request. See `CROP_HEALTH_SCANNER.md`. 🌾

**Verified farms. Secure agreements. Reliable payments.**

AgriSmart is a smart farming and agricultural trade platform built around trust infrastructure — combining real-time IoT farm monitoring, verified farmer/buyer identities, blockchain-backed trade agreements, escrow payments, and oracle-risk mitigation into one accessible, multilingual platform.

> ⚠️ **Sandbox Notice**: This is a development demo. Identity verification (Aadhaar, KCC), payment processing, and government integrations use **mock data**. No real connections to UIDAI, banks, or government systems exist. Blockchain transactions use **Polygon Amoy testnet** with mock ERC-20 tokens — they do not represent real Indian rupees.

---

## 🚀 Quick Start

```bash
# Install the exact dependency tree
npm ci

# Run strict TypeScript checks
npm run check

# Build for production
npm run build

# Start the development server
npm run dev

# Preview a completed production build
npm run preview
```

The app runs at `http://localhost:3000`.

---

## 🔐 Demo Accounts (Sandbox)

| Role | Name | Login Path |
|------|------|------------|
| **Farmer** | Rajesh Patel | Login → "Login as Farmer" |
| **Buyer** | Anand Agro Industries | Login → "Login as Buyer" |
| **Verifier** | Dr. Meena Krishnan | Login → "Login as Verifier" |
| **Admin** | Platform Administrator | Login → "Login as Admin" |

Click any demo account button on the login page to instantly access that role's dashboard.

---

## 📐 Technology Stack

### Frontend
- **React 18** + **TypeScript** (strict mode)
- **Vite** build tooling
- **Tailwind CSS** design system
- **Framer Motion** animations
- **React Router** navigation
- **Zustand** client state management
- **React Hook Form** + **Zod** validation
- **Recharts** data visualization
- **Lucide React** icons
- **Low-bandwidth and accessibility modes** for constrained devices and connections

### Backend (Architecture Spec)
- **NestJS** + TypeScript
- **Prisma ORM** + **PostgreSQL** + **TimescaleDB**
- **Redis** caching, sessions, queues
- **BullMQ** background jobs
- **MQTT** IoT ingestion
- **WebSocket** real-time updates
- **S3/MinIO** object storage

### Blockchain (Architecture Spec)
- **Solidity** + **Hardhat** + **OpenZeppelin**
- **Polygon Amoy** testnet
- **Ethers.js/Viem** interaction
- Smart contracts for agreement registry, escrow, milestones, disputes

### Infrastructure (Architecture Spec)
- **Turborepo** monorepo
- **Docker** + **Docker Compose**
- **GitHub Actions** CI/CD
- **Kubernetes**-ready
- **Terraform** infrastructure
- **Sentry** + **OpenTelemetry** + **Prometheus** + **Grafana**

---

## 🎨 Design System

| Token | Color | Usage |
|-------|-------|-------|
| Primary Green | `#124C35` | Brand, primary actions |
| Dark Green | `#082A1D` | Footer, emphasis |
| Soft Green | `#DCEAE2` | Backgrounds, badges |
| Cream | `#F1F0E9` | Page background |
| Saffron | `#C87B25` | Buyer accent, warnings |
| Sky Blue | `#397EAC` | Info, IoT |
| Success | `#18734B` | Verified, completed |
| Warning | `#B96F17` | Pending, alerts |
| Error | `#B13D3D` | Critical, disputes |
| Text | `#152019` | Body text |
| Muted | `#58665D` | Secondary text |
| Border | `#D4DED7` | Card borders |

---

## 🌐 Multilingual Support (12 Languages)

| Code | Language | Native Name |
|------|----------|-------------|
| `en` | English | English |
| `hi` | Hindi | हिन्दी |
| `bn` | Bengali | বাংলা |
| `te` | Telugu | తెలుగు |
| `mr` | Marathi | मराठी |
| `ta` | Tamil | தமிழ் |
| `gu` | Gujarati | ગુજરાતી |
| `kn` | Kannada | ಕನ್ನಡ |
| `ml` | Malayalam | മലയാളം |
| `pa` | Punjabi | ਪੰਜਾਬੀ |
| `or` | Odia | ଓଡ଼ିଆ |
| `as` | Assamese | অসমীয়া |

Switch language via the globe icon in the header. Preference is persisted in localStorage.

---

## 📱 Features

### Public Website
- Homepage with live dashboard preview, trust problem section, workflow, IoT preview, oracle-risk mitigation, farmer/buyer benefits, multilingual showcase
- 14 public pages: Home, How It Works, Farmer Solutions, Buyer Solutions, IoT Monitoring, Secure Payments, Identity Verification, Trust & Data Validation, Supported Languages, Pricing, About, Contact, Privacy Policy, Terms of Service

### Authentication
- Phone/email login with OTP flow (sandbox simulated)
- Role selection (Farmer, Buyer, Verifier, Admin)
- Demo account instant login
- 14-step guided farmer onboarding with progress tracking and save-and-continue

### Farmer Dashboard
- Live IoT sensor grid (soil moisture, temperature, humidity, water level)
- Farm health score gauge with trust score breakdown
- Current crop cycle with growth progress
- Active contracts with milestone timeline
- Active alerts with severity indicators
- Payment status (escrow held vs. completed)
- Recommended actions
- Quick actions grid (8 actions)
- Verification status badges

### Drone Operations
- New farmer-facing Drone Operations tab with five internal workspaces
- Multi-drone lawnmower route simulation with connected grid ownership
- 48-cell farm intelligence grid with RGB, thermal, and health layers
- Live battery, temperature, signal, altitude, speed, and mission progress
- Automatic return-to-dock simulation for temperature and battery thresholds
- Solar docking station generation, storage, charging, and weather telemetry
- RGB disease-anomaly detection and thermal water-stress probability
- Precision treatment approval and detect → decide → act → verify workflow
- Hardware-ready architecture for a backend mission controller, MAVLink, PX4, and ArduPilot

### IoT Dashboard
- Real-time sensor monitoring with live-updating values
- Historical charts with 30-day data and custom date ranges
- Multi-sensor comparison charts
- Device management (40 devices, online/offline/degraded status)
- Sensor data table with signatures, confidence scores, validation status
- Irrigation pump simulation control
- Farm map placeholder (Leaflet/Mapbox integration point)
- CSV export of sensor history
- Alert rules configuration
- 17 sensor types supported

### Marketplace
- Farmer: Create produce listings with crop, variety, quantity, price, quality grade
- Buyer: Search and filter by crop, state, quality grade, verification status, price range
- Buyer: Make offer modal with price, quantity, delivery, payment terms
- Sensor-supported listings with IoT data badges
- Verification status on all listings

### Trade Agreements
- 5-step guided agreement builder
- 14-state agreement lifecycle with visual timeline
- Milestone tracking with payment amounts
- Blockchain record display (agreement hash, transaction hash)
- Expanded details: quality conditions, inspection process, cancellation/penalty terms
- Escrow funding and milestone release actions

### Payments
- Hybrid payment architecture (blockchain + UPI/bank)
- Payment types: escrow funding, advance, milestone, final release, refund, penalty
- Transaction details with on-chain hashes and provider references
- Clear sandbox labeling for all transactions

### Verification (Sandbox)
- Mock Aadhaar verification (clearly labeled, not UIDAI)
- Mock KCC verification (clearly labeled, not bank)
- Farm ownership verification
- Bank account verification
- Business registration (buyer)
- Consent records and privacy notices
- Data masking and token-only storage messaging

### Verifier Dashboard
- Pending and completed inspections
- Inspection checklist with geo-tag and photo upload
- Digital signature and approval/rejection workflow
- Risk flags and evidence
- Assigned farms with trust scores
- Verifier performance score

### Admin Dashboard
- Platform-wide statistics (farmers, buyers, contracts, escrow, devices)
- System health monitoring (CPU, memory, API latency, services)
- User management with search, filter, approve/suspend
- All agreements view with blockchain hashes
- Dispute management with resolution workflow
- Fraud alerts and device anomalies
- Audit logs with severity filtering and category icons
- Blockchain status (Polygon Amoy, block height, gas, contracts)
- API usage metrics and queue status

### Accessibility
- WCAG 2.2 AA compliance
- Reduced motion mode
- High contrast mode
- Large text mode
- Keyboard navigation
- Visible focus states
- Screen-reader labels
- Minimum touch target sizes
- Color-independent status indicators

### Offline & PWA
- IndexedDB caching architecture
- Offline dashboard access
- Draft listings/agreements offline
- Sync queue for uploads
- Low-bandwidth mode (reduced animations, compressed data, text-first)

---

## 🗄️ Seeded Demo Data

| Entity | Count | Details |
|--------|-------|---------|
| Farmers | 10 | Realistic Indian names, 10 states |
| Buyers | 5 | Agro companies, rice mills, traders |
| Verifiers | 3 | Agricultural officers |
| Admins | 1 | Platform administrator |
| Farms | 20 | 10 states, GPS coordinates, zones |
| IoT Devices | 40 | 5 models, online/offline/degraded |
| Drones | 3 | RGB survey, thermal survey, precision sprayer |
| Drone Grid Cells | 48 | Health, water stress, disease, treatment states |
| Solar Docks | 1 | Generation, storage, charge rate, weather station |
| Sensor History | 90 days | 4 sensors per device, 6h intervals |
| Produce Listings | 15 | 10 crop types, quality grades |
| Buyer Offers | 10 | Pending/accepted/negotiating |
| Trade Agreements | 8 | 14 states, milestones, blockchain hashes |
| Payments | 24+ | Escrow, advance, release transactions |
| Alerts | 8 | Critical/warning/info severities |
| Inspections | 6 | Pending/scheduled/completed |
| Disputes | 2 | Under review, open |
| Notifications | 8 | Multi-category, read/unread |
| Crop Cycles | 10 | 5 growth stages |
| Audit Logs | 12 | 7 categories, 3 severity levels |

### Crops Included
Wheat, Rice, Cotton, Sugarcane, Mustard, Maize, Potato, Tomato, Onion, Pulses

### States Covered
Gujarat, Uttar Pradesh, Telangana, Punjab, Maharashtra, Tamil Nadu, Rajasthan, Assam, Bihar, Karnataka

---

## 📁 Project Structure

```
agrismart/
├── src/
│   ├── components/
│   │   ├── ui/              # Button, Card, Badge, Input, Select, StatCard, etc.
│   │   ├── layout/          # PublicHeader, PublicFooter, DashboardLayout
│   │   └── charts/          # SensorChart, MultiSensorChart, DonutChart, ScoreGauge
│   ├── pages/
│   │   ├── public/          # HomePage, GenericPage, LegalPage
│   │   ├── auth/            # LoginPage, RegisterPage, OnboardingPage
│   │   ├── farmer/          # Dashboard, Farms, IoT, Marketplace, Offers, Agreements, Payments, Verification, Alerts
│   │   ├── buyer/           # Dashboard, Marketplace, Offers, Agreements, Payments, Verification
│   │   ├── verifier/        # Dashboard, Inspections, Farms
│   │   └── admin/           # Dashboard, Users, Agreements, Disputes, System, Audit
│   ├── lib/                 # utils.ts (cn, stateColor, generateLiveReading, etc.)
│   ├── store/               # Zustand global state
│   ├── data/                # seed.ts (all demo data)
│   ├── i18n/                # 12-language translations
│   ├── types/               # TypeScript type definitions
│   ├── App.tsx              # Router with protected routes
│   ├── main.tsx             # Entry point
│   └── index.css            # Tailwind + design system
├── public/                  # favicon.svg
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

---

## 🛡️ Security Principles

- ✅ Authentication tokens in HTTP-only cookies (architecture)
- ✅ No tokens in localStorage (architecture)
- ✅ Role-based access control (RBAC) with protected routes
- ✅ Input validation with Zod schemas
- ✅ No sensitive identity data on blockchain
- ✅ Only verification tokens stored, not raw identity numbers
- ✅ Data masking for sensitive fields
- ✅ Consent records for all verification actions
- ✅ Audit logging for all critical actions
- ❌ Never expose private keys, DB credentials, OTP secrets, payment secrets

---

## ⛓️ Blockchain Usage Principles

Blockchain is used **only** where it provides practical value:
- ✅ **Agreement hash** — immutable record of contract terms
- ✅ **Escrow state** — transparent fund holding and release
- ✅ **Transaction auditability** — payment event logs
- ✅ **Milestone tracking** — verifiable contract progression

**Not** used for:
- ❌ Personal identity data
- ❌ Complete documents
- ❌ Marketing gimmicks
- ❌ Replacing regulated payment systems

---

## 🧪 Validation

```bash
# Strict TypeScript contract and unused-code checks
npm run check

# TypeScript plus Vite production compilation
npm run build
```

Automated unit and browser test suites are not bundled in this frontend demo yet. Add Vitest and Playwright before treating it as a production release.

---

## 📦 Production Deployment

### Frontend
- **Vercel**: Connect repo, set build command `npm run build`, output `dist/`
- **Docker**: `docker build -t agrismart-web . && docker run -p 3000:3000 agrismart-web`

### Backend (Architecture)
- **AWS/GCP/Azure/Railway/Render**: Deploy NestJS container
- **Managed PostgreSQL** with TimescaleDB extension
- **Managed Redis** for caching and queues
- **S3-compatible storage** for documents and images
- **Managed MQTT broker** for IoT ingestion
- **Polygon Amoy** testnet for development
- **CDN + HTTPS** via Nginx/Cloudflare

---

## 🔧 Environment Variables (.env.example)

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/agrismart
REDIS_URL=redis://localhost:6379

# MQTT
MQTT_BROKER_URL=mqtt://localhost:1883

# S3 / MinIO
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
S3_BUCKET=agrismart

# JWT
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# OTP Provider
OTP_PROVIDER_API_KEY=your-otp-key

# Email / SMS / WhatsApp
EMAIL_PROVIDER_API_KEY=your-email-key
SMS_PROVIDER_API_KEY=your-sms-key
WHATSAPP_PROVIDER_API_KEY=your-wa-key

# Payment Provider
PAYMENT_PROVIDER_API_KEY=your-payment-key
PAYMENT_WEBHOOK_SECRET=your-webhook-secret

# Blockchain
BLOCKCHAIN_RPC_URL=https://rpc-amoy.polygon.technology
CONTRACT_REGISTRY_ADDRESS=0x...
CONTRACT_ESCROW_ADDRESS=0x...
WALLET_PRIVATE_KEY=your-wallet-key

# Map Provider
MAPBOX_TOKEN=your-mapbox-token

# Weather / Satellite
WEATHER_API_KEY=your-weather-key
SATELLITE_API_KEY=your-satellite-key

# Error Monitoring
SENTRY_DSN=your-sentry-dsn

# Analytics
ANALYTICS_KEY=your-analytics-key
```

> ⚠️ Never commit real secret values. Use `.env.local` for development.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This repository is a production-oriented pilot. Drone mission, farm-boundary, telemetry, control-step, and chatbot APIs are implemented. Identity verification, payment-provider, government-registry, and some marketplace integrations still use seeded or local-first fallback data until their external providers are configured.

---

## 🙏 Acknowledgments

Built for Indian agriculture. Designed to be credible, technically defensible, and accessible to first-time digital users.

**AgriSmart** — *Building trust in agricultural trade, one verified agreement at a time.* 🌾

## Patent-oriented autonomous treatment

The Drone Operations workspace now contains an **Autonomous treatment** tab implementing the software workflow for representative claims 1–14:

- RGB, multispectral, and thermal fusion
- continuous plant-level disease severity
- programmable severity-to-dose mapping
- chemical-label and environmental safety constraints
- GNSS/RTK, inertial, visual-odometry, and crop-row localization
- persistent plant identifiers
- independent PWM nozzle commands with flow feedback
- 50–200 ms micro-dose windows
- motion, droplet-time, and wind-drift gating compensation
- adaptive flight speed
- uncertainty-based suppression and revisit scheduling
- treatment history, reinforcement policy update, and digital-twin forecasting

See `CLAIM_IMPLEMENTATION_MATRIX.md` and `PRODUCTION_READINESS.md`.

## AgriSmart

## Universal Crop Health Scanner

Farmers can capture or upload any crop image, confirm the crop, receive uncertainty-aware crop and condition candidates, view affected-region highlighting and continuous severity, ask Copilot for an explanation, and create an RGB plus thermal drone verification request. See `CROP_HEALTH_SCANNER.md`. Copilot

A floating assistant is available across the application. It provides safe guided answers locally and can call a server-side OpenAI-compatible or internal chat-completions endpoint through `AGRISMART_LLM_URL`. API credentials remain on the server.

## Easier farm mapping

The farm registration flow now supports place and landmark search, current GPS, click-to-outline mapping, coordinate import, automatic acreage calculation, starter boundaries generated from declared area, boundary persistence, and API submission.


## Full-stack pilot deployment

```bash
cp .env.example .env
npm ci
npm run check
npm run verify:claims
npm run build
npm start
```

Health endpoint: `GET /health`. Live aircraft control stays disabled until the operator token and autopilot bridge URL are configured. The bridge must acknowledge `POST /missions` and `POST /control/step`.

For the static GitHub Pages build, local-first mode remains available, but live hardware control requires the full-stack deployment.


## Optional crop-vision service

Configure `AGRISMART_VISION_URL`, `AGRISMART_VISION_API_KEY`, and `AGRISMART_VISION_MODEL` on the Node server. Without them, the scanner uses its cautious local-first fallback.
