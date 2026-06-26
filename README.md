# RehabTrack

AI dashboard for monitoring mine rehabilitation across Western Australia's iron ore sites.

Live demo: https://rehabtrack-ivory.vercel.app

![RehabTrack Dashboard](https://raw.githubusercontent.com/Dev4221/rehabtrack/main/public/dashboard.png)

---

## The problem

Mining companies in Western Australia are legally required to rehabilitate land they disturb during iron ore mining. Before operations begin, they lodge bonds worth tens of millions of dollars with the state government. That money is only returned once the land meets strict vegetation recovery targets, verified by the Department of Mines, Industry Regulation and Safety (DMIRS).

The current process is manual, slow, and reactive. Site managers rely on quarterly ground inspections to discover problems that satellite data could have flagged weeks earlier. By the time erosion or invasive weed growth is confirmed on the ground, it has already set back the rehabilitation timeline and delayed the bond release.

RehabTrack monitors $186 million in rehabilitation bonds across four Pilbara sites automatically, using satellite imagery and AI to catch problems early.

---

## What I built

A full-stack AI dashboard that monitors vegetation recovery using real satellite data, detects problems before they become compliance failures, and generates reports for both business leaders and technical teams - all powered by Claude AI (Anthropic's large language model).

The system tracks four active iron ore sites: Roy Hill ($48M bond), Cloudbreak ($62M), Brockman 4 ($35M), and Christmas Creek ($41M). Each site has zone-level monitoring, automated alerts, and bond release forecasting.

---

## Features

**Vegetation monitoring**

Monthly vegetation health scores from January 2019 to June 2026, sourced from Sentinel-2 satellite imagery via Google Earth Engine at 10 metre resolution. Zone-level breakdowns per site. Anomaly detection compares each reading against a 5-year seasonal baseline to flag anything unusual.

**AI anomaly alerts**

Three AI agents run together daily. The Watcher scans satellite imagery and flags problem zones. The Analyst searches historical data and Western Australian mining regulation context to explain what happened and how serious it is. The Reporter pushes alerts to the dashboard and composes an email to the site manager. A live simulation shows the full pipeline running in real time.

**Ask a question**

Real AI chat powered by the Claude API. Ask anything about the selected site in plain English or technical mode. Answers are grounded in satellite data, DMIRS compliance guidelines, and the WA Mining Act 1978. A guardrail in the system prompt ensures Claude only answers mining rehabilitation questions - anything off-topic gets a polite redirect.

**Generate report**

Claude writes both an Executive version (plain English, dollars and dates) and an Analyst version (vegetation index values, zone references, regulatory citations) at the same time. Switch between them instantly with no need to regenerate. Download as a PDF. Alerts flagged on the Alerts page are automatically included in the report prompt.

**Scenario planner**

Model different intervention decisions - do nothing, treat weeds, replant, install erosion controls, or run a full programme - against external conditions like normal rainfall, drought, or a cyclone event. Claude analyses each scenario and gives a specific financial recommendation: months saved, financing costs recovered, and net benefit against intervention cost.

**Bond calculator**

Interactive calculator that updates automatically when you switch sites. Shows the projected bond release date under the current recovery trajectory and under a slower scenario. Executive and Analyst modes use different labels for the same underlying model.

**Compliance tracker**

Portfolio view of all four sites. $186M in total bonds. Shows each site's recovery rate against the regulatory target, open alerts, and bond release status. Generates a portfolio-level compliance report via Claude. Exports to CSV.

**Site map**

Interactive map with per-site zone polygons. Three view modes: recovery status, satellite imagery, and change over time. Zone popups show vegetation scores and year-on-year change.

**Light and dark mode**

Full theme toggle across all pages.

---

## Technical decisions worth noting

**Why a serverless function for the API?**

The Claude API key cannot be exposed in the browser. All AI requests route through a Vercel serverless function that reads the key securely from environment variables. This is how API credentials are handled in production systems.

**Why a guardrail on the Ask AI page?**

Without it, Claude answers anything - which breaks the product experience and makes the demo look like a generic chatbot. The system prompt restricts Claude to mine rehabilitation topics only, with a specific redirect message for anything off-topic.

**Why both Executive and Analyst modes?**

The same data means different things to different audiences. A business leader needs "Zone B2 may delay the bond release by 6 months." A technical analyst needs "Band 4/Band 8 spectral ratio: 0.68 vs 0.51 baseline. Z-score: -1.9. Classifier confidence: 64%." Both versions are generated via parallel API calls and cached - no regeneration needed when switching.

**Why CSS variables for theming?**

All colours in the codebase use specific hex values that Tailwind's built-in dark mode system cannot override. CSS variables on the root element let a single class toggle switch the entire colour palette cleanly, without modifying any component files.

---

## Stack

React 19, Vite, Tailwind CSS, React Router, Recharts, Leaflet, React-Leaflet, Papa Parse, React Markdown, Claude API (claude-haiku-4-5), Vercel serverless functions, Google Earth Engine (satellite data export), Python and Pandas (data pipeline)

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

Start the local API proxy (required for AI features when running locally):

```bash
node server.js
```

Start the app:

```bash
npm run dev
```

Open http://localhost:5173

On Vercel, AI features route through the serverless function automatically. No proxy needed.

---

## Built by

Devansh Bhuta - Data Analyst and AI Engineer, Perth WA

Master of Business Analytics, University of Western Australia. Internship experience across sports analytics (Perth Wildcats, featured on 10News Perth), SaaS reporting automation (DashboardWorX), AI content tools (WryteAI), and clean energy (Hydrizon).

[LinkedIn](https://linkedin.com/in/devanshbhuta) - [GitHub](https://github.com/Dev4221)
