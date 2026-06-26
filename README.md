# RehabTrack

**Mine Rehabilitation Intelligence for Western Australia's Iron Ore Industry**

Live demo: https://rehabtrack-ivory.vercel.app

![RehabTrack Dashboard](https://raw.githubusercontent.com/Dev4221/rehabtrack/main/public/dashboard.png)

---

## The problem this solves

Every iron ore mine operating in Western Australia is legally required to restore the land it disturbs. Before a single tonne of ore is extracted, the operator lodges a financial bond with the state government, held by the Department of Energy, Mines, Industry Regulation and Safety (DEMIRS). That bond is only returned once the land meets strict vegetation recovery standards. Until then, the capital sits locked up - unavailable to the business.

Across the four Pilbara sites RehabTrack monitors, that locked capital totals $186 million.

The challenge is that rehabilitation is slow, complex, and difficult to monitor. Vegetation recovery unfolds over years. Problems, including soil erosion after rainfall, invasive weed species, or zones that simply fail to establish, can begin quietly and spread for months before they are discovered during a quarterly ground inspection. By the time a site manager confirms the issue on the ground, the rehabilitation programme is already behind, the bond release date has moved, and the cost of remediation has grown.

The industry has historically managed this through manual site visits, spreadsheet reporting, and periodic submissions to regulators. That approach works, but it is reactive by design. It finds problems after they have already caused damage.

---

## What RehabTrack demonstrates

RehabTrack is a working proof of concept for a different approach: continuous, automated rehabilitation monitoring powered by satellite imagery and artificial intelligence.

The system processes real Sentinel-2 satellite data (freely available from the European Space Agency at 10 metre resolution, captured every five days) and applies statistical analysis to detect vegetation anomalies across monitored zones. When a zone shows unusual decline compared to its five-year seasonal baseline, the system flags it, classifies the likely cause, estimates the severity, and surfaces the finding in a dashboard accessible to any stakeholder - without anyone needing to visit the site.

Built and shipped in four days. Live on the internet. Backed by real data.

---

## Why this matters to a business

**Faster bond release.** Every month of delay on a $48 million bond costs the operator roughly $200,000 in financing. Catching a weed encroachment event six weeks earlier than a quarterly inspection would have, and treating it before it spreads, directly accelerates the path to release.

**Reduced compliance risk.** DEMIRS requires mine operators to submit Mine Closure Plans every three years and demonstrate continuous progress toward rehabilitation targets. A system that provides continuous, auditable records of vegetation recovery is a stronger compliance posture than one that relies on periodic snapshots.

**Reporting that serves every audience.** The same satellite data means different things to a Chief Financial Officer, a rehabilitation scientist, and a regulator. RehabTrack generates plain-English summaries for business leaders and technical reports for environmental consultants simultaneously, from the same underlying data, using AI.

**Decision support before spending money.** The Scenario Planner allows operators to model the financial outcome of different intervention options, including doing nothing, treating weeds, replanting, or running a full programme, against different rainfall conditions. Before committing $400,000 to a replanting programme, a site manager can see the projected bond release date, the estimated months saved, and the net financial benefit. That is a tool for making better decisions, not just reporting on outcomes.

---

## How RehabTrack is different

Most existing rehabilitation monitoring services provide data. Environmental consultancies such as Stantec and companies such as Satsense and Decipher offer satellite imagery, vegetation indices, and periodic reports. Those services are valuable, but they share a common structure: a specialist interprets the data, prepares a document, and delivers it to the operator on a schedule.

RehabTrack takes a different position. The interpretation happens automatically, continuously, and in plain language. A non-technical stakeholder, whether that is an executive, an investor, or a board member, can open the dashboard today and understand the status of four Pilbara sites, the financial exposure, and the recommended actions, without needing a consultant to explain the output.

This is not a replacement for expert environmental assessment. It is a layer above the raw data that makes that data accessible and actionable to the people who control the capital and make the decisions.

That gap, between the data that exists and the decisions it should be informing, is where the opportunity sits.

---

## Features

**Live satellite monitoring.** Vegetation health scores across all zones, updated monthly from January 2019 to June 2026. Statistical anomaly detection against a five-year seasonal baseline. Zone-level breakdowns per site.

**AI anomaly alerts.** Three AI agents operate in sequence. The Watcher scans satellite imagery and flags unusual zone behaviour. The Analyst searches historical records and Western Australian mining regulation context to classify the cause and severity. The Reporter surfaces alerts to the dashboard and drafts a summary for the site manager. A live simulation shows the full pipeline running in real time.

**Ask a question.** Conversational AI interface powered by Claude (Anthropic's large language model). Ask anything about the selected site in plain English or technical mode. Responses are grounded in satellite data, DEMIRS compliance guidelines, and the WA Mining Act 1978. The system is restricted to mining rehabilitation topics only.

**Generate report.** Two versions of every report generated simultaneously: an Executive version in plain English with dollar figures and dates, and an Analyst version with vegetation index values, zone references, and regulatory citations. Switch between them instantly. Download as a PDF. Alerts flagged on the Alerts page are automatically incorporated into the report.

**Scenario planner.** Model any combination of intervention decision and external conditions. Claude calculates the projected bond release date, months saved versus the baseline, financing cost recovered, and net benefit after intervention cost, then writes a plain-English recommendation.

**Bond calculator.** Interactive financial model that updates automatically when switching between sites. Shows projected release under current and downside scenarios. Labelling adapts to the selected audience mode.

**Compliance tracker.** Portfolio view of all four sites and $186 million in total bonds. Recovery rate versus regulatory target, active alerts, and bond release status per site. Portfolio-level compliance report on demand. CSV export.

**Interactive site map.** Zone polygons per site with three view modes: recovery status, satellite imagery, and year-on-year change.

**Full light and dark mode.**

---

## Stack

React 19, Vite, Tailwind CSS, React Router, Recharts, Leaflet, Claude API (Anthropic), Vercel serverless functions, Google Earth Engine, Python, Pandas

---

## Local setup

```bash
git clone https://github.com/Dev4221/rehabtrack
cd rehabtrack
npm install
```

Create `.env` in the root directory:

```
VITE_ANTHROPIC_API_KEY=your_key_here
```

Start the local API proxy (required for AI features when running locally):

```bash
node server.js
```

Start the application:

```bash
npm run dev
```

Open http://localhost:5173

AI features on Vercel route through a serverless function automatically. No local proxy required.

---

## Built by

Devansh Bhuta - Data Analyst and AI Engineer, Perth WA

Master of Business Analytics, University of Western Australia. Previous work includes a player recruitment analytics framework for the Perth Wildcats (National Basketball League) that reduced evaluation time by 80% and was featured on 10News Perth, 20 hours of monthly reporting automated for a SaaS business (DashboardWorX), and a 70% improvement in data accuracy at an AI content platform (WryteAI).

[LinkedIn](https://linkedin.com/in/devanshbhuta) - [GitHub](https://github.com/Dev4221)
