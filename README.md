# RehabTrack

**Mine Rehabilitation Intelligence for Western Australia's Iron Ore Industry**

Live demo: https://rehabtrack-ivory.vercel.app

![RehabTrack Dashboard](https://raw.githubusercontent.com/Dev4221/rehabtrack/main/public/dashboard.png)

---

## The problem

Western Australia's iron ore operators carry a rehabilitation obligation that does not end at mine closure. It follows the land. Under the Mining Act 1978, operators must lodge an Unconditional Performance Bond with the state government before mining begins. That bond is held by the Department of Energy, Mines, Industry Regulation and Safety (DEMIRS) and is only released once the land meets the vegetation recovery targets defined in the approved Mine Closure Plan, which must be resubmitted to DEMIRS every three years.

The bond is not a fee. It is capital. It earns nothing while it sits with the government, and the operator carries the cost of that tied-up money for every year the land falls short of its recovery targets.

Across the four Pilbara sites RehabTrack monitors, that locked capital totals $186 million.

The gap is not in effort. Most operators are investing seriously in rehabilitation. The gap is in visibility. Vegetation recovery unfolds across thousands of hectares of remote land, checked through quarterly ground inspections and annual reports to regulators. Problems such as soil erosion after heavy rainfall, invasive weeds spreading from a haul road boundary, or a replanting programme failing to take hold can begin quietly and grow for months before anyone confirms them on the ground.

By the time the problem is documented, the recovery timeline has already shifted. The bond release date moves. The cost of fixing it grows. And the next submission to DEMIRS reflects a programme that is behind where it should be.

---

## What the data actually shows

Sentinel-2 is a European Space Agency satellite that photographs the Pilbara at 10 metre resolution every five days. That imagery is freely available and has been for over a decade. It contains a detailed, repeatable record of vegetation health across every rehabilitation zone on every major iron ore site in the region.

RehabTrack processes that imagery and compares each reading against the same zone's historical pattern to flag anything that looks unusual, before it shows up in a quarterly inspection report.

Here is what the data shows across the four sites in this system:

**Roy Hill, Zone C3.** Following heavy rainfall in June 2024, vegetation health in this zone dropped sharply over 30 days. The satellite recorded the change two days after the event. A ground inspection would not have confirmed it for weeks. The zone has since been flagged for weekly monitoring.

**Roy Hill, Zone B2.** The spectral signature of the vegetation in this zone does not match the native plants expected in a rehabilitated Pilbara environment. The pattern is consistent with buffel grass, a declared invasive weed under WA law. If confirmed on the ground, this is a reportable event under the Mine Closure Plan, and the zone cannot progress toward bond release verification until it is treated.

**Christmas Creek, Zone E1.** This zone has shown almost no vegetation recovery for five consecutive months. At its current rate, it will not reach the government's release threshold until 2035. The bond release target for the site is 2030. That is a five-year gap and a material risk to the $41 million bond.

**Cloudbreak, Zone A1.** This zone has sustained healthy vegetation levels for four consecutive months and has reached the government's milestone. The $62 million bond lodged for this site is on track for release in Q1 2027.

These are not projections. They are readings from actual satellite passes over actual sites.

---

## Why this matters to a business

**Locked capital has a real cost.** A $48 million bond held at 5% annual financing represents roughly $2.4 million per year in opportunity cost. Identifying a problem six weeks earlier than a ground inspection, and treating it before it spreads, directly compresses that timeline. The Scenario Planner in RehabTrack calculates the financial impact of each intervention option before any budget is committed.

**Regulators expect continuous progress.** DEMIRS assesses rehabilitation against the approved Mine Closure Plan at each triennial review. A system that produces a continuous, auditable record of vegetation recovery across every zone gives operators a stronger foundation for that submission than one assembled from periodic site visits. It also reduces the risk of a DEMIRS finding that requires an increase in the bond amount.

**The same data serves different audiences.** A Chief Financial Officer needs to understand the bond release date and what is putting it at risk. An environmental scientist needs the underlying vegetation measurements and confidence levels. A regulator needs zone-level records referenced against the Mine Closure Plan. RehabTrack generates all three from the same underlying data, at the same time, using AI. The same report does not need to be reformatted three times by an analyst.

**Better decisions before money is spent.** Before committing to a $400,000 to $800,000 replanting programme, a site manager can model the projected bond release date, the months recovered, and the net financial benefit against the cost, under normal conditions, drought, or a cyclone event. That analysis takes seconds. Currently, it takes weeks of manual modelling if it happens at all.

---

## How this is different from existing services

Environmental consultancies such as Stantec and specialist monitoring platforms such as Satsense and Decipher offer satellite imagery and vegetation analysis as a professional service. A specialist interprets the data, prepares a report, and delivers findings to the operator on a schedule.

That model is valuable. It is also limited in a specific way. The insight is only as current as the last report, and it is only as useful as the person reading it has the background to understand. A board member reviewing a quarterly summary cannot interrogate a vegetation index chart. A financial controller approving a rehabilitation budget cannot assess whether a replanting programme is tracking to plan from a PDF appendix.

RehabTrack is not a replacement for that expert assessment. It is a layer that makes the underlying data accessible to the people who control the capital and make the decisions, without requiring a briefing first.

A Chief Executive, a board member, an investor, or a regulator can open the dashboard today and understand the status of four active rehabilitation programmes, the financial exposure behind each one, the issues requiring action, and what the outcomes look like under different scenarios.

The satellite data has always existed. The analytical capability has always existed. The missing piece has been a way to connect that data directly to the people whose decisions it should be informing.

---

## Features

**Satellite monitoring.** Vegetation health scores across all zones from January 2019 to June 2026. Anomaly detection against a five-year historical baseline. Zone-level breakdowns per site with notable event overlays.

**AI anomaly alerts.** Three agents work in sequence. The Watcher scans satellite imagery and flags unusual changes. The Analyst searches historical records and WA mining regulation context to classify what happened and how serious it is. The Reporter surfaces findings to the dashboard. A live simulation shows the full process running in real time.

**Ask a question.** A conversational AI interface powered by Claude (Anthropic). Ask anything about the selected site in plain English or technical mode. Answers are grounded in satellite data, DEMIRS guidelines, and the WA Mining Act 1978. The system only answers questions relevant to mine rehabilitation.

**Generate report.** An Executive version and an Analyst version generated at the same time from the same data. Plain English with financial figures for business leaders. Technical measurements, zone references, and regulatory citations for environmental teams. Downloadable as PDF.

**Scenario planner.** Model any intervention decision against any external condition. The system outputs the projected bond release date, months recovered versus doing nothing, financing costs saved, and net benefit after the cost of the intervention.

**Bond calculator.** An interactive financial model per site. Shows projected release under current and downside recovery scenarios. Updates automatically when switching between sites.

**Compliance tracker.** A portfolio view of all four sites and $186 million in bonds. Recovery rate versus regulatory target, active alerts, and bond release status per site. Portfolio-level compliance report on demand. Export to spreadsheet.

**Interactive site map.** Zone boundaries per site with three view modes: recovery status, satellite imagery, and year-on-year change.

**Full light and dark mode.**

---

## Stack

React 19, Vite, Tailwind CSS, React Router, Recharts, Leaflet, Claude API (Anthropic), Vercel, Google Earth Engine, Python, Pandas

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

Master of Business Analytics, University of Western Australia. Previous work includes a player recruitment analytics framework for the Perth Wildcats (National Basketball League) that reduced evaluation time by 80% and was featured on 10News Perth, 20 hours of monthly reporting automated at a SaaS business (DashboardWorX), and a 70% improvement in data accuracy at an AI content platform (WryteAI).

[LinkedIn](https://linkedin.com/in/devanshbhuta) - [GitHub](https://github.com/Dev4221)
