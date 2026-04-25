# Krishi Mitra v1

**India's first Risk-Free Farmer Support System**

Krishi Mitra (Farmer's Friend) is an application designed to transform smallholder agriculture into a guaranteed-profit profession. By combining forward FPO contracts, real-time satellite insights, and financial tracking, the app entirely de-risks farming for low-resource farmers.

## The 3 Pillars of Risk Elimination

1. **Guaranteed Buy Orders (FPOs):** Farmers browse and accept contracts from institutional buyers *before* they plant, locking in guaranteed prices above मंडी (Mandi) rates.
2. **Satellite Crop Monitoring:** Regular EOSDA NDVI scans keep track of crop health, provide early disease alerts, and capture proof data capable of accelerating PMFBY insurance claims automatically.
3. **Real-time Profit Dashboard:** A "salary slip" style interface manages EMIs and maps true cost-of-production into a final Net Season Profit.

## Business Model
- **Freemium App**: Free for standard features.
- **Platform Fee**: FPOs/Buyers pay a 2% commission per successful contract.
- **Premium (Krishi Mitra OS)**: ₹99/month for active satellite alerts, disease predictions, and KCC loan fast-tracking.
- **Impact Potential**: Equipping 10,000 farmers to gain ₹1L extra profit generates a ₹100Cr rural economy boost in Year 1.

## Run Guide

This guide walks you from a fresh clone to a working local app.

### 1. Prerequisites

Make sure these are installed on your machine:

- **Node.js 18+**
- **npm** (ships with Node.js)

You can verify both with:

\`\`\`bash
node -v
npm -v
\`\`\`

### 2. Install dependencies

From the project root, run:

\`\`\`bash
npm install
\`\`\`

### 3. Configure environment variables

Copy \`.env.example\` to \`.env\` and make sure it contains:

\`\`\`bash
VITE_DEMO_MODE=true
# Optional: add your EOSDA API key to use live satellite data
VITE_EOSDA_API_KEY=
\`\`\`

Notes:

- If \`VITE_EOSDA_API_KEY\` is empty, the app uses built-in mock satellite data.
- That is enough for local development and the full demo flow.

### 4. Start the development server

Run:

\`\`\`bash
npm run dev
\`\`\`

Vite will print a local URL, usually something like:

\`\`\`text
http://127.0.0.1:5173/
\`\`\`

Open that URL in your browser.

### 5. Use the app locally

Once the app opens:

1. On the splash screen, click **Scan KM Card** or **New farmer? Register**
2. For the fastest demo path, use the demo ID: **KM2024DEMO**
3. After entering the app, you can move through:
   - Dashboard
   - Satellite View
   - Orders Board
   - Finance Dashboard
   - Schemes Finder

### 6. Run the built app locally

To create a production build:

\`\`\`bash
npm run build
\`\`\`

To preview the production build locally:

\`\`\`bash
npm run preview
\`\`\`

Vite will print a preview URL you can open in the browser.

### 7. Useful scripts

- \`npm run dev\` — start the development server
- \`npm run build\` — create the production build in \`dist/\`
- \`npm run preview\` — serve the built app locally
- \`npm run lint\` — run ESLint

### 8. Troubleshooting

**Port already in use**

- If Vite says the default port is busy, stop the other process or run the app on a different port:

\`\`\`bash
npm run dev -- --port 4174
\`\`\`

**Camera / QR scanner not working**

- The QR scanner needs camera permission in the browser.
- If camera access is blocked, use the manual demo ID entry instead.

**Satellite data not loading**

- This is expected if no EOSDA API key is set.
- The app will fall back to mock satellite data.

**Changes are not showing up**

- Stop the dev server and run \`npm run dev\` again.
- Make sure you are editing files inside the project root.

## EOSDA API Key Setup
While the app uses mock satellite data by default, it includes full API integration with EOSDA.
1. Sign up at [EOSDA Crop Monitoring](https://eos.com/crop-monitoring/).
2. Generate an API Key in the dashboard.
3. Add it to `.env` as `VITE_EOSDA_API_KEY`.

## The 2-Minute Demo Flow

The application features an integrated auto-running demo to showcase the entire product cycle. You can trigger this manually by navigating to `/#/demo` or using the ID `KM2024DEMO` on the home screen.

1. **Start Screen:** Onboard / scan KM Card.
2. **Dashboard:** Profile populates, crop health is summarized.
3. **Satellite View:** Maps farm boundaries, NDVI growth score, active field alerts.
4. **Orders Board:** Browse verified Contracts, accept an FPO tomato contract.
5. **Dashboard Broker Alert:** Mandi alert pops up comparing FPO secured price with today's live rate.
6. **Finance Dashboard:** Watch the P&L calculate final season profit including loan breakdown.
7. **Schemes Finder:** Connect KM Card data with automatically matched government subsidies.
