import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { useSite } from '../SiteContext'

const siteZones = {
  'roy-hill': ['All zones', 'Zone A1', 'Zone A2', 'Zone B1', 'Zone B2', 'Zone B3', 'Zone C1', 'Zone C2', 'Zone C3'],
  'cloudbreak': ['All zones', 'Zone A1', 'Zone A2', 'Zone B1', 'Zone B2', 'Zone C1'],
  'brockman': ['All zones', 'Zone A1', 'Zone B1', 'Zone C1', 'Zone D2', 'Zone E1'],
  'christmas-creek': ['All zones', 'Zone A1', 'Zone B1', 'Zone C1', 'Zone E1', 'Zone E3', 'Zone F2'],
}

const siteNdviOffset = {
  'roy-hill': 0,
  'cloudbreak': 0.08,
  'brockman': -0.10,
  'christmas-creek': -0.20,
}

const zoneOffsets = {
  'All zones': 0, 'Zone A1': 0.12, 'Zone A2': 0.08, 'Zone B1': 0.02,
  'Zone B2': -0.05, 'Zone B3': 0.01, 'Zone C1': -0.08, 'Zone C2': -0.12,
  'Zone C3': -0.18, 'Zone D2': -0.15, 'Zone E1': -0.22, 'Zone E3': -0.18, 'Zone F2': -0.10,
}

const zoneColors = {
  'All zones': '#3fb950', 'Zone A1': '#3fb950', 'Zone A2': '#2ea043',
  'Zone B1': '#e3b341', 'Zone B2': '#d29922', 'Zone B3': '#f0883e',
  'Zone C1': '#f85149', 'Zone C2': '#cf222e', 'Zone C3': '#a40e26',
  'Zone D2': '#f85149', 'Zone E1': '#a40e26', 'Zone E3': '#cf222e', 'Zone F2': '#d29922',
}

const siteEvents = {
  'roy-hill': [
    {
      date: 'Mar 2021',
      borderColor: 'var(--red)', bgColor: 'var(--red-bg)',
      title: 'Cyclone Ellie rainfall event',
      exec: '340mm of rain in 48 hours caused surface erosion. Vegetation recovered within 4 months.',
      tech: ['NDVI dropped from 0.38 to 0.22 site-wide', 'Z-score: -3.1 from seasonal baseline', 'Recovery to baseline observed within 4 months'],
    },
    {
      date: 'Jun 2024',
      borderColor: 'var(--red)', bgColor: 'var(--red-bg)',
      title: 'Zone C3 vegetation loss',
      exec: 'Heavy rainfall caused vegetation loss across 14 hectares. Currently recovering.',
      tech: ['Zone C3 NDVI: 0.12 (baseline 0.30)', 'Z-score: -2.8', 'Classifier: bare/disturbed (confidence 91%)'],
    },
    {
      date: 'Jun 2026',
      borderColor: 'var(--green-border)', bgColor: 'var(--green-bg)',
      title: 'Zone A1 milestone reached',
      exec: "Zone A1 reached 80% recovery, the government's threshold for bond release.",
      tech: ['Zone A1 NDVI mean: 0.61', 'Sustained above 0.35 threshold for 3 consecutive months', 'Bond milestone confirmed by DMIRS'],
    },
    {
      date: 'Jun 2026',
      borderColor: 'var(--amber-border)', bgColor: 'var(--amber-bg)',
      title: 'Zone B2 weed signature',
      exec: 'Possible buffel grass detected in Zone B2. Ground inspection recommended.',
      tech: ['Band ratio anomaly detected', 'Inconsistent with native Pilbara regrowth', 'Possible Cenchrus ciliaris (confidence 78%)'],
    },
  ],
  'cloudbreak': [
    {
      date: 'Feb 2020',
      borderColor: 'var(--red)', bgColor: 'var(--red-bg)',
      title: 'Heavy rainfall erosion event',
      exec: 'Significant rainfall event caused surface erosion across 3 zones. Recovery was faster than expected.',
      tech: ['Site-wide NDVI dropped from 0.48 to 0.31', 'Recovery to baseline within 3 months', 'No lasting impact on bond release trajectory'],
    },
    {
      date: 'Mar 2026',
      borderColor: 'var(--green-border)', bgColor: 'var(--green-bg)',
      title: 'Zone A1 milestone reached',
      exec: "Zone A1 reached 82% recovery, ahead of the government's threshold.",
      tech: ['Zone A1 NDVI mean: 0.64', 'Sustained above 0.35 threshold for 4 consecutive months', 'Bond milestone confirmed'],
    },
    {
      date: 'Jun 2026',
      borderColor: 'var(--green-border)', bgColor: 'var(--green-bg)',
      title: 'Ahead of bond release schedule',
      exec: 'Cloudbreak is the best performing site in the portfolio, on track for Q1 2027 bond release.',
      tech: ['Site NDVI velocity: +6.1%/yr', 'All zones above 0.35 threshold except Zone C1', 'Projected release: Q1 2027'],
    },
  ],
  'brockman': [
    {
      date: 'Jan 2021',
      borderColor: 'var(--red)', bgColor: 'var(--red-bg)',
      title: 'Slow recovery identified in Zone D2',
      exec: 'Zone D2 was identified as significantly underperforming. Recovery rate is less than half the required pace.',
      tech: ['Zone D2 NDVI velocity: +2.1%/yr vs site average +4.2%/yr', 'Projected milestone: Q3 2031', 'Flagged for intervention planning'],
    },
    {
      date: 'Aug 2023',
      borderColor: 'var(--amber-border)', bgColor: 'var(--amber-bg)',
      title: 'Replanting programme initiated',
      exec: 'A targeted replanting programme was started in Zone D2 to accelerate recovery. Results expected by 2025.',
      tech: ['Native seed mix applied across 120ha of Zone D2', 'Monitoring frequency increased to weekly', 'Survival rate tracking underway'],
    },
    {
      date: 'Jun 2026',
      borderColor: 'var(--amber-border)', bgColor: 'var(--amber-bg)',
      title: 'Behind schedule, Q1 2029 release at risk',
      exec: 'Brockman 4 is recovering below the required annual target. Bond release may be delayed without intervention.',
      tech: ['Site NDVI velocity: +4.2%/yr vs 6% target', 'Zone D2 remains critical at +2.1%/yr', 'Projected release: Q1 2029 to Q1 2031 depending on Zone D2 outcomes'],
    },
  ],
  'christmas-creek': [
    {
      date: 'Mar 2022',
      borderColor: 'var(--red)', bgColor: 'var(--red-bg)',
      title: 'Major erosion event in Zone E3',
      exec: 'A severe rainfall event caused widespread erosion across 40 hectares in Zone E3. The damage has since spread to 95 hectares.',
      tech: ['Zone E3 NDVI: 0.28 to 0.11', 'Rill erosion pattern confirmed via satellite', 'Affected area spread from 40ha to 95ha'],
    },
    {
      date: 'Nov 2023',
      borderColor: 'var(--red)', bgColor: 'var(--red-bg)',
      title: 'Zone E1 critical status confirmed',
      exec: 'Zone E1 was formally classified as critical after 3 consecutive years of minimal recovery. Urgent intervention required.',
      tech: ['Zone E1 NDVI mean: 0.08, below 0.15 early regrowth threshold', 'Annual velocity: +1.2%/yr', 'Projected milestone: 2035+'],
    },
    {
      date: 'Jun 2026',
      borderColor: 'var(--red)', bgColor: 'var(--red-bg)',
      title: 'Bond release significantly at risk',
      exec: 'Christmas Creek is the worst performing site in the portfolio. At the current pace, the $41M bond will not be released until 2030 at the earliest.',
      tech: ['Site NDVI velocity: +2.8%/yr', '3 zones below recovery threshold', 'Projected release: Q3 2030+'],
    },
  ],
}

export default function Trends() {
  const { selectedSite } = useSite()
  const [ndviData, setNdviData] = useState([])
  const [selectedZone, setSelectedZone] = useState('All zones')
  const [view, setView] = useState('executive')
  const [chartType, setChartType] = useState('line')

  const isAnalyst = view === 'analyst'

  useEffect(() => { setSelectedZone('All zones') }, [selectedSite.id])

  useEffect(() => {
    Papa.parse('/data/ndvi_timeseries.csv', {
      download: true, header: true,
      complete: (results) => {
        const cleaned = results.data.filter(r => r.mean_ndvi).map(r => ({
          ...r,
          mean_ndvi: parseFloat(r.mean_ndvi),
          year: parseInt(r.year), month: parseInt(r.month),
          area_recovering: parseInt(r.area_recovering),
          area_early: parseInt(r.area_early), area_bare: parseInt(r.area_bare),
          label: `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(r.month)-1]} ${r.year}`,
        }))
        setNdviData(cleaned)
      }
    })
  }, [])

  const siteOffset = siteNdviOffset[selectedSite.id] || 0
  const zoneOffset = zoneOffsets[selectedZone] || 0
  const totalOffset = siteOffset + zoneOffset
  const lineColor = zoneColors[selectedZone] || '#3fb950'
  const zones = siteZones[selectedSite.id] || siteZones['roy-hill']
  const events = siteEvents[selectedSite.id] || siteEvents['roy-hill']

  const chartData = ndviData.map(r => ({
    label: r.label,
    score: Math.max(0, Math.min(1, r.mean_ndvi + totalOffset)),
    recovering: r.area_recovering, early: r.area_early, bare: r.area_bare,
  }))

  return (
    <div className="flex flex-col h-full">

      <div className="h-10 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center justify-between px-4 flex-shrink-0">
        <div className="text-[10px] text-[var(--text-secondary)]">
          Vegetation trends <span className="text-[var(--text-primary)]">/ {selectedSite.name} / 2019-2026</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-full p-0.5 flex gap-0.5">
            <button onClick={() => setView('executive')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${!isAnalyst ? 'bg-[var(--green-bg)] text-[var(--green)]' : 'text-[var(--text-muted)]'}`}>Executive</button>
            <button onClick={() => setView('analyst')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${isAnalyst ? 'bg-[var(--green-bg)] text-[var(--green)]' : 'text-[var(--text-muted)]'}`}>Analyst</button>
          </div>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-full p-0.5 flex gap-0.5">
            <button onClick={() => setChartType('line')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${chartType === 'line' ? 'bg-[var(--green-bg)] text-[var(--green)]' : 'text-[var(--text-muted)]'}`}>Line</button>
            <button onClick={() => setChartType('bar')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${chartType === 'bar' ? 'bg-[var(--green-bg)] text-[var(--green)]' : 'text-[var(--text-muted)]'}`}>Bar</button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">

        <div className="text-[10px] text-[var(--text-secondary)]">
          {isAnalyst
            ? `Monthly NDVI time-series for ${selectedSite.name}, 2019-2026. Sentinel-2 Band 8/Band 4 ratio. Reference line at 0.35 indicates the rehabilitating threshold used by the Random Forest classifier.`
            : `This chart shows how vegetation coverage has changed across ${selectedSite.name} over time. Higher scores mean healthier, denser vegetation. The dotted line shows the target needed for bond release.`}
        </div>

        <div className="flex gap-2 flex-wrap">
          {zones.map(zone => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-3 py-1 rounded text-[9px] border transition-colors ${
                selectedZone === zone
                  ? 'bg-[var(--green-bg)] border-[var(--green-border)] text-[var(--green)]'
                  : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4 flex flex-col" style={{ height: 280 }}>
          <div className="text-[10px] font-medium text-[var(--text-primary)] mb-1">
            {isAnalyst ? 'NDVI time-series, 2019-2026' : 'Vegetation health over time'}
          </div>
          <div className="text-[9px] text-[var(--text-muted)] mb-3">
            {selectedZone} | Monthly | Sentinel-2
            {selectedZone !== 'All zones' && (
              <span className="ml-2 italic">| Estimated from site average. Per-zone satellite exports can be configured in the pipeline settings.</span>
            )}
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 7, fill: 'var(--text-muted)' }} interval={5} />
                  <YAxis tick={{ fontSize: 7, fill: 'var(--text-muted)' }} domain={[0, 1]} />
                  <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 9 }} formatter={(val) => [val.toFixed(2), isAnalyst ? 'NDVI' : 'Vegetation score']} />
                  <ReferenceLine y={0.35} stroke="var(--text-muted)" strokeDasharray="4 4" label={{ value: isAnalyst ? 'NDVI 0.35 threshold' : 'Bond release target', position: 'insideTopRight', fontSize: 8, fill: 'var(--text-muted)' }} />
                  <Line type="monotone" dataKey="score" stroke={lineColor} strokeWidth={2} dot={false} />
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 7, fill: 'var(--text-muted)' }} interval={5} />
                  <YAxis tick={{ fontSize: 7, fill: 'var(--text-muted)' }} domain={[0, 1]} />
                  <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 9 }} formatter={(val) => [val.toFixed(2), isAnalyst ? 'NDVI' : 'Vegetation score']} />
                  <ReferenceLine y={0.35} stroke="var(--text-muted)" strokeDasharray="4 4" />
                  <Bar dataKey="score" fill={lineColor} radius={[1, 1, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">

          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4 flex flex-col" style={{ height: 220 }}>
            <div className="text-[10px] font-medium text-[var(--text-primary)] mb-1">
              {isAnalyst ? 'Land classification breakdown' : 'How land is split over time'}
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.filter((_, i) => i % 3 === 0)} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 7, fill: 'var(--text-muted)' }} interval={3} />
                  <YAxis tick={{ fontSize: 7, fill: 'var(--text-muted)' }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 9 }} />
                  <Bar dataKey="recovering" stackId="a" fill="#2ea043" name={isAnalyst ? 'Rehabilitating (NDVI > 0.35)' : 'Recovering well'} />
                  <Bar dataKey="early" stackId="a" fill="#d29922" name={isAnalyst ? 'Early regrowth (NDVI 0.15 to 0.35)' : 'Early stage'} />
                  <Bar dataKey="bare" stackId="a" fill="#cf222e" name={isAnalyst ? 'Bare or disturbed (NDVI < 0.15)' : 'Needs attention'} radius={[1, 1, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4">
            <div className="text-[10px] font-medium text-[var(--text-primary)] mb-3">Notable events on this site</div>
            <div className="flex flex-col gap-2">
              {events.map((event, i) => (
                <div
                  key={i}
                  className="border rounded px-3 py-2"
                  style={{ borderColor: event.borderColor, backgroundColor: event.bgColor }}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[8px] text-[var(--text-muted)]">{event.date}</span>
                    <span className="text-[9px] font-medium text-[var(--text-primary)]">{event.title}</span>
                  </div>
                  {isAnalyst ? (
                    <ul className="flex flex-col gap-0.5 mt-1">
                      {event.tech.map((point, j) => (
                        <li key={j} className="flex gap-1.5 text-[8px] text-[var(--text-secondary)]">
                          <span className="text-[var(--green)] flex-shrink-0">-</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-[8px] text-[var(--text-secondary)] leading-relaxed">{event.exec}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}