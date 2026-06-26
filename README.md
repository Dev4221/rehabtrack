# RehabTrack

**Mine Rehabilitation Intelligence for Western Australia's Iron Ore Industry**

Live demo: https://rehabtrack-ivory.vercel.app

![RehabTrack Dashboard](https://raw.githubusercontent.com/Dev4221/rehabtrack/main/public/dashboard.png)

---

## The problem

Western Australia's iron ore operators carry a rehabilitation obligation that does not go away at mine closure. It follows the tenement. Under the Mining Act 1978, operators must lodge an Unconditional Performance Bond with the state government before mining begins. That bond is held by the Department of Energy, Mines, Industry Regulation and Safety (DEMIRS) and is only released once the land meets the vegetation recovery thresholds defined in the approved Mine Closure Plan, reviewed and resubmitted to DEMIRS every three years.

The bond is not a fee. It is capital. It earns nothing while it sits with the government, and the operator carries the financing cost for every year the land falls short of its recovery targets.

Across the four Pilbara sites RehabTrack monitors, that locked capital totals $186 million.

The gap is not in effort. Most operators are investing in rehabilitation. The gap is in visibility. Vegetation recovery unfolds across thousands of hectares of remote land, monitored through quarterly ground inspections and annual environmental reports. Problems, including soil erosion from a single rainfall event, invasive weed species spreading from a haul road boundary, or a replanting programme failing to establish, can begin quietly and grow for months before anyone confirms them on the ground.

By the time the problem is documented, the recovery trajectory has already shifted. The bond release date moves. The cost of remediation grows. And the next DEMIRS submission reflects a programme that is behind where it should be.

---

## What the data shows

Sentinel-2 satellite imagery from the European Space Agency captures the Pilbara at 10 metre resolution every five days. That data is freely available. It has been available for over a decade. And it contains a precise, repeatable record of vegetation health across every rehabilitation zone on every major iron ore site in the region.

RehabTrack processes that data and applies statistical analysis against a five-year seasonal baseline to detect anomalies before they appear in a quarterly inspection report.

Specifically:

- Zone C3 at Roy Hill shows a vegetation health decline from 0.30 to 0.12 over 30 days following the June 2024 rainfall event. A Random Forest classifier identifies the zone as bare or disturbed with 91% confidence. That signal appears in the satellite data two days after the event. A ground inspection would not confirm it for weeks.

- Zone B2 at Roy Hill shows a spectral signature inconsistent with native Pilbara regrowth. The band ratio matches Cenchrus ciliaris (buffel grass) at 78% confidence. Under the Mine Closure Plan, this is a reportable event that must be resolved before bond release verification can proceed.

- Zone E1 at Christmas Creek has maintained a vegetation health score of 0.08 for five consecutive months, well below the 0.15 threshold for early regrowth. At the current recovery velocity of 1.2% per year, this zone will not reach the government's release threshold until 2035. The bond release target for the site is 2030.

- Zone A1 at Cloudbreak has sustained a vegetation health score above 0.35 for four consecutive months. The bond milestone for this zone is confirmed. The $62 million bond lodged for this site is on track for release in Q1 2027.

This is not modelled data. These are readings from real satellite passes over real sites, processed through a real analytical pipeline.

---

## Why this matters to a business

**Capital recovery.** A $48 million bond held at 5% annual financing cost represents approximately $2.4 million per year in opportunity cost. Identifying a problem six weeks earlier than a quarterly inspection, and treating it before it spreads, compresses that timeline. The Scenario Planner in RehabTrack calculates the exact financial impact of each intervention option before any commitment is made.

**Compliance posture.** DEMIRS assesses rehabilitation progress against the approved Mine Closure Plan. A system that produces continuous, auditable vegetation records across every zone provides a stronger basis for the triennial submission than one built from periodic site visits. It also reduces the risk of a DEMIRS finding that triggers a bond increase.

**Reporting for every audience without rework.** A Chief Financial Officer needs to know the bond release date and what is threatening it. A rehabilitation scientist needs the spectral indices and classifier confidence levels. A regulator needs zone-level compliance records referenced against the Mine Closure Plan. RehabTrack generates all three versions from the same underlying data, simultaneously, using AI. No analyst spends a week reformatting the same numbers for three different audiences.

**Decisions made before money is spent.** Before committing to a $400,000 to $800,000 replanting programme, a site manager can model the projected bond release date, months recovered, financing costs saved, and net benefit against the intervention cost, under normal conditions, drought, or a cyclone event. That analysis takes seconds in RehabTrack. Currently it takes weeks.

---

## How RehabTrack is different

Environmental consultancies such as Stantec and specialist monitoring platforms such as Satsense and Decipher provide satellite data and vegetation indices as a service. The data is delivered on a schedule. A specialist interprets it. A report is produced. The operator receives findings.

That model has a structural limitation. The insight is only as current as the last report, and it is only as accessible as the person who wrote it. An executive reviewing a board paper does not have the reference frame to interrogate a vegetation index graph. A financial controller approving a rehabilitation budget cannot assess whether a replanting programme is tracking to plan from a PDF appendix.

RehabTrack removes the interpretation layer between the data and the decision maker.

The dashboard is designed so that a Chief Executive, a board member, an investor, or a regulator can open it without a briefing and understand the status of four active rehabilitation programmes, the financial exposure behind each one, the alerts requiring action, and the projected outcomes under different scenarios.

The interpretation is done by the system. The AI generates plain-English findings. The Scenario Planner quantifies the financial consequence of each option. The reports write themselves in the format each audience needs.

The gap this addresses is not technical. The satellite data exists. The analytical methods exist. The gap is between the data and the people whose decisions it should be informing. That gap costs the industry money every year it remains open.

---

## Features

**Live satellite monitoring.** Vegetation health scores across all zones from January 2019 to June 2026. Statistical anomaly detection against a five-year seasonal baseline. Zone-level breakdowns per site with historical event overlays.

**AI anomaly alerts.** Three agents operate in sequence. The Watcher scans satellite imagery and flags anomalous zones. The Analyst searches historical records and WA Mining Act context to classify the cause and severity. The Reporter surfaces findings to the dashboard. Live simulation demonstrates the full pipeline.

**Ask a question.** Conversational AI interface powered by Claude (Anthropic). Responses are grounded in satellite data, DEMIRS guidelines, and the WA Mining Act 1978. Restricted to mining rehabilitation topics only.

**Generate report.** Executive version and Analyst version generated simultaneously from the same data. Plain English with financial figures for business leaders. Vegetation index values, zone references, and regulatory citations for technical teams. Downloadable as PDF.

**Scenario planner.** Model intervention decisions against external conditions. Outputs include projected bond release date, months recovered versus baseline, financing costs saved, and net benefit after intervention cost.

**Bond calculator.** Interactive financial model per site. Current and downside scenarios. Updates automatically when switching sites.

**Compliance tracker.** Portfolio view of all four sites and $186 million in bonds. Recovery rate versus regulatory target, active alerts, and bond release status. Portfolio-level compliance report on demand. CSV export.

**Interactive site map.** Zone polygons per site. Three view modes: recovery status, satellite imagery, and year-on-year change.

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

---

## Built by

Devansh Bhuta - Data Analyst and AI Engineer, Perth WA

Master of Business Analytics, University of Western Australia. Previous work includes a player recruitment analytics framework for the Perth Wildcats (National Basketball League) that reduced evaluation time by 80% and was featured on 10News Perth, 20 hours of monthly reporting automated for a SaaS business (DashboardWorX), and a 70% improvement in data accuracy at an AI content platform (WryteAI).

[LinkedIn](https://linkedin.com/in/devanshbhuta) - [GitHub](https://github.com/Dev4221)
