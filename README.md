# RehabTrack

**Mine Rehabilitation Intelligence for Western Australia's Iron Ore Industry**

Live demo: https://rehabtrack-ivory.vercel.app

![RehabTrack Dashboard](https://raw.githubusercontent.com/Dev4221/rehabtrack/main/public/dashboard.png)

---

## Executive summary

When an iron ore mine finishes operating, the company is legally required to restore the land to its natural state - replanting vegetation, stabilising soil, and returning the environment to something close to what it was before mining began. This process is called rehabilitation.

Before mining starts, the company lodges a large financial bond with the Western Australian government as a guarantee that the rehabilitation will actually happen. That money, sometimes tens of millions of dollars, is locked up and earns nothing until the government verifies the land has recovered. Only then is the bond returned.

Across the four Pilbara sites in this system, $186 million in bonds are waiting to be released. The problem is not effort. The operators are investing in the work. The problem is visibility. Rehabilitation unfolds across thousands of remote hectares and is currently monitored through quarterly ground inspections. By the time a problem - erosion after heavy rainfall, invasive weeds spreading from a haul road, a replanting programme failing to establish - is confirmed on the ground, weeks or months have passed. The recovery timeline has already shifted. The cost of fixing it has grown. $2.4 million per year in tied-up capital stays locked up longer than it needs to.

RehabTrack processes real satellite imagery against a five-year historical baseline to surface these problems before they reach a quarterly inspection report. Instead of finding out about an issue weeks later, the system flags it within days of it appearing in the satellite data and tells the right person, in plain language, what it is and what to do about it.

---

## What the data shows

The European Space Agency's Sentinel-2 satellite photographs the Pilbara every five days, capturing detailed images of vegetation health across the land surface. That level of detail is precise enough to detect changes in individual rehabilitation zones within a mine site.

RehabTrack uses seven years of this imagery, from January 2019 to June 2026, to build a historical picture of how each zone behaves across seasons and years. New readings are compared against that baseline to identify anything that looks genuinely unusual, not just low for winter.

Across the four sites currently in the system:

**Roy Hill.** The southern section lost significant vegetation cover over 30 days following a rainfall event in June 2024. The satellite recorded the change two days after it occurred. A ground inspection would not have confirmed it for weeks.

**Roy Hill.** The western section shows a vegetation pattern inconsistent with the native plants expected in a rehabilitated Pilbara environment. The pattern matches buffel grass, a declared invasive weed under WA law. Under the Mine Closure Plan, this is a reportable event that must be resolved before bond release can proceed.

**Christmas Creek.** The northern section is recovering so slowly that it will not reach the government's threshold until 2035. The bond release target for the site is 2030. That five-year gap puts $41 million at risk.

**Cloudbreak.** The northern section has reached the government's recovery milestone. The $62 million bond is on track for release in Q1 2027.

These are readings from actual satellite passes. Not projections.

---

## Why it matters

**Delay has a measurable cost.** A $48 million bond at standard financing rates represents roughly $2.4 million per year in tied-up capital. Catching a problem six weeks earlier than a ground inspection, and treating it before it spreads, directly compresses that timeline.

**The same data needs to reach different audiences differently.** A Chief Financial Officer needs to know whether the bond release is on track and what is putting it at risk. An environmental scientist needs the underlying vegetation measurements. A regulator needs zone-level compliance records. RehabTrack generates all three from the same data simultaneously. No analyst spends days reformatting the same numbers for three different audiences.

**Financial modelling before spending money.** Before approving a replanting programme costing $400,000 to $800,000, a site manager can model the projected bond release date, months recovered, and net financial benefit against the cost across different rainfall scenarios. That analysis is available in seconds.

**An auditable record for regulators.** The Department of Energy, Mines, Industry Regulation and Safety (DEMIRS) assesses rehabilitation progress at each three-yearly Mine Closure Plan review. A continuous record of zone-level vegetation recovery is a stronger basis for that submission than one assembled from periodic site visits.

---

## How this differs from what exists today

Environmental consultancies such as Stantec and specialist monitoring platforms such as Satsense and Decipher provide satellite data and vegetation analysis as a professional service. A specialist interprets the data, prepares a report, and delivers it on a schedule.

That model works. Its limitation is that the insight is only as current as the last report. A board member reviewing a quarterly summary cannot assess whether a rehabilitation programme is on track from a PDF appendix. A financial controller approving a rehabilitation budget cannot see what the data actually shows.

RehabTrack removes the gap between the data and the people whose decisions it should be informing. A Chief Executive, a board member, an investor, or a regulator can open the dashboard today and immediately understand the status of four active rehabilitation programmes, the financial exposure behind each one, the issues requiring action, and what the outcomes look like under different scenarios.

---

## Features

**Satellite monitoring.** Vegetation health scores across all zones from January 2019 to June 2026. Anomaly detection against a five-year seasonal baseline. Zone-level breakdowns per site.

**AI anomaly detection.** Three agents run in sequence against real satellite data. The first agent, called the Watcher, reads the satellite data and checks each area of the mine against how it has looked at the same time of year in previous years. If something has declined significantly more than expected, it raises an alert. The second agent, the Analyst, determines what caused the problem, how serious it is, and what the legal obligation is under the Mine Closure Plan. The third agent, the Reporter, logs the findings and updates the dashboard. This is real detection running against real data.

**Ask a question.** Conversational AI powered by Claude (Anthropic). Ask anything about the selected site in plain English or technical mode. Restricted to mine rehabilitation topics only. Ask about the sources behind any answer and the AI will explain what data it is drawing from.

**Generate report.** Four distinct report types - compliance summary for regulators, investor update for shareholders, executive briefing for senior management, and technical report for environmental scientists. Each type has a different structure and language. Executive and Analyst versions generated simultaneously from the same data. Download as PDF.

**Scenario planner.** Model any intervention against any external condition. See the projected bond release date, months recovered, financing costs saved, and net financial benefit. Available in Executive and Analyst modes with structured bullet point output for each audience.

**Bond calculator.** Interactive financial model per site showing projected release under current and downside scenarios.

**Compliance tracker.** Portfolio view of all four sites and $186 million in bonds. Generates a board-level compliance report opening with a portfolio verdict and closing with numbered actions required from the board.

**Interactive site map.** Zone boundaries per site with three view modes: recovery status, satellite imagery, and year-on-year change.

**Full light and dark mode.**

---

## How the anomaly detection works

For each monitored zone, the system takes the most recent vegetation health reading and compares it against the same calendar month across all previous years in the dataset. This matters because vegetation naturally looks different in winter than in summer. Comparing against the same month in previous years separates genuine problems from normal seasonal variation.

The comparison produces a score that measures how far the current reading has fallen below what is historically expected for that time of year. If the drop is large enough to be meaningful rather than just natural variation, the system flags it, classifies the likely cause, and surfaces it to the dashboard.

In a production system, this would run automatically every five days triggered by each new satellite pass. The current implementation runs against the static dataset exported from Google Earth Engine. Live satellite ingestion would require a Google Earth Engine service account, which sits outside the scope of this prototype.

---

## Technical decisions worth noting

**Why compare against the same month rather than a fixed threshold?** Vegetation health varies naturally across seasons. A fixed threshold would generate false alerts in winter and miss real problems in summer. Comparing against the same month in previous years isolates genuine anomalies from expected seasonal patterns. This is the approach used in operational vegetation monitoring systems globally.

**Why rule-based classification rather than a machine learning model?** Seven years of monthly readings across a small number of zones is not enough data to train a reliable automated classifier. Rule-based logic with clear, auditable thresholds is more appropriate at this scale and produces outputs that can be explained to a regulator. A machine learning approach becomes appropriate once verified ground-truth data exists across multiple seasons and sites.

**Why four distinct report types with separate prompts?** A compliance summary for DEMIRS has a completely different structure, tone, and regulatory framing than an investor update for a board. The same instructions with a label change produces output that sounds like one but reads like the other. Each report type has its own instructions specifying the audience, section structure, language, and what to include and exclude.

**Why a guardrail on the Ask AI page?** Without topic restriction the conversational AI will answer any question, which turns a specialist tool into a generic chatbot. The system instructions restrict Claude to rehabilitation and regulatory topics only and explicitly handle attempts by users to bypass those restrictions by claiming special permissions or rephrasing questions to look unrelated.

**Why parallel API calls for report generation?** Generating the Executive and Analyst versions one after the other would take twice as long. Both are generated at the same time and stored on the client. Switching between versions is instant with no additional cost.

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

## License

MIT
