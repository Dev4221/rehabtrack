# RehabTrack - Mine Rehabilitation Intelligence Dashboard

A full-stack AI dashboard for monitoring mine rehabilitation progress across Western Australian iron ore sites. Built with React, Claude AI, and real Sentinel-2 satellite data.

**Live demo:** https://rehabtrack-ivory.vercel.app

![RehabTrack Dashboard](https://raw.githubusercontent.com/Dev4221/rehabtrack/main/public/dashboard.png)

---

## What it does

Mining companies in WA are legally required to rehabilitate land disturbed by iron ore operations. They lodge bonds worth tens of millions of dollars with the government - money that is only returned once the land meets vegetation recovery thresholds.

RehabTrack monitors that process automatically using satellite imagery and AI:

- Tracks vegetation recovery across multiple sites and zones using Sentinel-2 NDVI data
- Detects anomalies - erosion events, weed encroachment, slow recovery - before they become compliance problems
- Generates plain-English and technical reports for regulators, investors, and site managers
- Forecasts bond release timelines and financial exposure
- Runs a three-agent AI pipeline (Watcher, Analyst, Reporter) that scans satellite data daily

---

## Sites monitored

| Site | Operator | Bond | Status |
|------|----------|------|--------|
| Roy Hill | Roy Hill Holdings | $48M | On track - Q3 2027 |
| Cloudbreak | Fortescue Metals | $62M | On track - Q1 2027 |
| Brockman 4 | Rio Tinto | $35M | Slow - Q1 2029 |
| Christmas Creek | Fortescue Metals | $41M | At risk - Q3 2030+ |

---

## Pages

- **Overview** - site-level NDVI chart, alerts, bond forecast, AI chat preview
- **Site map** - Leaflet map with zone polygons, recovery status, change over time layers
- **Vegetation trends** - monthly NDVI time-series 2019-2026, zone-level breakdown, notable events
- **Alerts** - AI-generated anomaly alerts per site, mark as resolved, filter by status
- **Ask a question** - real Claude AI chat with site data as context
- **Generate report** - Claude generates compliance, investor, executive, and technical reports
- **Agent activity** - three-agent pipeline with live simulation
- **Bond calculator** - interactive bond release forecasting with scenario modelling
- **Compliance tracker** - portfolio view of all sites with CSV export and AI report

---

## Tech stack

**Frontend**
- React 19 + Vite
- Tailwind CSS
- Recharts
- Leaflet + react-leaflet
- react-router-dom

**AI**
- Claude API (claude-haiku-4-5) via Vercel serverless function
- Prompt engineering for plain English and technical modes

**Data**
- Sentinel-2 satellite imagery via Google Earth Engine
- Real NDVI time-series data exported from GEE (2019-2026)
- Python + Pandas data pipeline

**Infrastructure**
- Vercel (frontend + serverless API)
- GitHub

---

## AI features

All three AI features use real Claude API calls:

**Ask a question** - Claude answers questions about the selected site in plain English or technical language, grounded in real satellite data and WA mining regulations.

**Generate report** - Claude generates both plain English and technical versions simultaneously. Switch between them instantly. Download as PDF.

**Compliance report** - Claude generates a portfolio-level compliance summary across all four sites with bond exposure analysis.

---

## Agent pipeline

Three AI agents run automatically each day:

1. **Watcher** - fetches Sentinel-2 imagery from GEE, computes NDVI scores across all zones, flags anomalies using Z-score analysis
2. **Analyst** - receives flagged zones, searches historical data, applies WA Mining Act context, generates plain-English explanations using Claude
3. **Reporter** - pushes alerts to the dashboard, recalculates bond forecasts, emails the site manager

---

## Data

Real Sentinel-2 NDVI data exported from Google Earth Engine for Roy Hill (Pilbara, WA). Monthly composites from January 2019 to June 2026. 10m spatial resolution.

---

## Local setup

```bash
git clone https://github.com/Dev4221/rehabtrack
cd rehabtrack
npm install
```

Create a `.env` file in the root:

```
VITE_ANTHROPIC_API_KEY=your_key_here
```

Start the API proxy (required for AI features locally):

```bash
node server.js
```

Start the app:

```bash
npm run dev
```

Open http://localhost:5173

---

## Built by

Devansh Bhuta - Data Analyst / AI Engineer
Master of Business Analytics, University of Western Australia
Perth, WA

[LinkedIn](https://linkedin.com/in/devanshbhuta) - [GitHub](https://github.com/Dev4221)
