# RehabTrack

**AI dashboard for monitoring mine rehabilitation across Western Australia's iron ore sites.**

Live demo: https://rehabtrack-ivory.vercel.app

![RehabTrack Dashboard](https://raw.githubusercontent.com/Dev4221/rehabtrack/main/public/dashboard.png)

---

## The problem

Mining companies in WA are legally required to rehabilitate land disturbed by iron ore operations. They lodge bonds worth tens of millions of dollars with the government — money that is only returned once the land meets vegetation recovery thresholds verified by DMIRS.

The current process is manual, slow, and reactive. Site managers wait for quarterly ground inspections to discover problems that satellite data could have flagged weeks earlier. By the time erosion or weed encroachment is confirmed on the ground, it has already set back the rehabilitation timeline — and delayed the bond release.

**$186 million in rehabilitation bonds across four Pilbara sites. RehabTrack monitors all of it automatically.**

---

## What I built

A full-stack AI dashboard that monitors vegetation recovery using real Sentinel-2 satellite data, detects anomalies before they become compliance problems, and generates plain-English reports for executives and technical analysts — all powered by Claude AI.

The system tracks four active iron ore sites: Roy Hill ($48M bond), Cloudbreak ($62M), Brockman 4 ($35M), and Christmas Creek ($41M). Each site has zone-level monitoring, per-site alerts, and bond release forecasting.

---

## Features

**Vegetation monitoring**
Monthly NDVI time-series from January 2019 to June 2026, exported from Google Earth Engine at 10m resolution. Zone-level breakdowns per site. Anomaly detection via Z-score analysis against a 5-year seasonal baseline.

**AI anomaly alerts**
Three-agent pipeline runs daily. The Watcher scans satellite imagery and flags anomalies. The Analyst searches historical data and WA Mining Act context to explain what happened and how serious it is. The Reporter pushes alerts to the dashboard and emails the site manager. Live simulation shows the full pipeline in real time.

**Ask a question**
Real Claude API integration. Ask anything about the selected site in plain English or technical mode. Answers are grounded in satellite data, DMIRS guidelines, and WA Mining Act 1978. Guardrail ensures Claude only answers mining rehabilitation questions — nothing off-topic.

**Generate report**
Claude writes both an Executive version (plain English, dollars and dates) and an Analyst version (NDVI values, zone references, regulatory citations) simultaneously. Switch between them instantly. Download as PDF. Alerts flagged on the Alerts page flow through automatically into the report prompt.

**Scenario planner**
Model different intervention decisions — do nothing, treat weeds, replant, erosion control, or full programme — against external conditions like normal rainfall, drought, or a cyclone event. Claude analyses each scenario and gives a specific financial recommendation. Shows months saved, financing cost recovered, and net benefit against intervention cost.

**Bond calculator**
Interactive calculator that updates automatically when you switch sites. Shows projected bond release under current trajectory and a downside scenario. Executive and Analyst modes show different label sets for the same underlying model.

**Compliance tracker**
Portfolio view of all four sites. $186M in total bonds. Shows recovery rate vs regulatory target, alert count, and bond release status per site. Generates a portfolio-level compliance report via Claude. CSV export.

**Site map**
Leaflet map with per-site zone polygons. Three layer modes: recovery status, satellite imagery, and change over time. Zone popups show NDVI scores and year-on-year change.

**Light and dark mode**
Full theme toggle across all pages using CSS variables.

---

## Technical decisions worth noting

**Why a serverless function for the API?**
The Claude API key can't be exposed in the frontend. All AI requests go through a Vercel serverless function that reads the key from environment variables. This mirrors how you'd handle API credentials in a production environment.

**Why a guardrail on the Ask AI page?**
Without it, Claude answers anything. That breaks the product experience and makes the demo look like a generic chatbot. The system prompt restricts Claude to mine rehabilitation topics only, with a specific redirect message for off-topic queries.

**Why both Executive and Analyst modes?**
The same data means different things to different people. An executive needs "Zone B2 may delay the bond release by 6 months." An analyst needs "Band 4/Band 8 ratio: 0.68 vs 0.51 baseline. Z-score: -1.9. Confidence: 64%." Both versions are generated simultaneously via parallel Claude API calls and cached — no regeneration needed when switching modes.

**Why CSS variables for theming?**
All colours in the codebase are arbitrary Tailwind hex values. Tailwind's dark: variant doesn't work with those. CSS variables on the root element let a single class toggle switch the entire palette cleanly without touching component files.

---

## Stack

React 19, Vite, Tailwind CSS, React Router, Recharts, Leaflet, React-Leaflet, Papa Parse, React Markdown, Claude API (claude-haiku-4-5), Vercel serverless functions, Google Earth Engine (data export), Python + Pandas (data pipeline)

---

## Local setup

```bash
git clone https://github.com/Dev4221/rehabtrack
cd rehabtrack
npm install
```

Create `.env` in the root:

```
VITE_ANTHROPIC_API_KEY=your_key_here
```

Start the local API proxy:

```bash
node server.js
```

Start the app:

```bash
npm run dev
```

Open http://localhost:5173

AI features require the proxy to be running locally. On Vercel they route through the serverless function automatically.

---

## Built by

Devansh Bhuta — Data Analyst and AI Engineer, Perth WA

Master of Business Analytics, University of Western Australia. Internship experience across sports analytics (Perth Wildcats, featured on 10News Perth), SaaS (DashboardWorX), AI startups (WryteAI), and clean energy (Hydrizon).

[LinkedIn](https://linkedin.com/in/devanshbhuta) · [GitHub](https://github.com/Dev4221)
