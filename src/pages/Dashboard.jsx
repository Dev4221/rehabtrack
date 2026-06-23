import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard() {
  const [ndviData, setNdviData] = useState([])
  const [view, setView] = useState('executive')
  const [year, setYear] = useState(2024)

  useEffect(() => {
    Papa.parse('/data/ndvi_timeseries.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const cleaned = results.data
          .filter(r => r.mean_ndvi)
          .map(r => ({
            ...r,
            mean_ndvi: parseFloat(r.mean_ndvi),
            year: parseInt(r.year),
            month: parseInt(r.month),
          }))
        setNdviData(cleaned)
      }
    })
  }, [])

  const chartData = ndviData
    .filter(r => r.year === year)
    .map(r => ({
      month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][r.month - 1],
      ndvi: r.mean_ndvi,
      recovering: parseInt(r.area_recovering),
    }))

    const recovering = 61
    const early = 22
    const bare = 17
    

  return (
    <div className="flex flex-col h-full">

      {/* Top bar */}
      <div className="h-10 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 flex-shrink-0">
        <div className="text-[10px] text-[#8b949e]">
          Overview <span className="text-[#e6edf3]">/ Roy Hill / {year}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="bg-[#21262d] border border-[#30363d] rounded-full p-0.5 flex gap-0.5">
            <button
              onClick={() => setView('executive')}
              className={`px-3 py-1 rounded-full text-[9px] transition-colors ${view === 'executive' ? 'bg-[#1a3a1a] text-[#3fb950]' : 'text-[#484f58]'}`}
            >
              Plain English
            </button>
            <button
              onClick={() => setView('technical')}
              className={`px-3 py-1 rounded-full text-[9px] transition-colors ${view === 'technical' ? 'bg-[#1a3a1a] text-[#3fb950]' : 'text-[#484f58]'}`}
            >
              Technical
            </button>
          </div>
          <div className="flex items-center gap-1 bg-[#1c2128] border border-[#3d0000] rounded px-2 py-1 text-[9px] text-[#f85149]">
            <div className="w-1.5 h-1.5 rounded-full bg-[#f85149]"></div>
            2 issues need attention
          </div>
          <div className="bg-[#1a3a1a] border border-[#2ea043] rounded px-2 py-1 text-[9px] text-[#3fb950]">
            Download report
          </div>
        </div>
      </div>

      {/* Summary banner */}
      <div className="mx-4 mt-4 bg-[#1a2d1a] border border-[#2ea043] rounded-lg px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div>
          <div className="text-[12px] font-medium text-[#3fb950]">
            {view === 'executive'
              ? 'This site is on track to meet its rehabilitation target'
              : 'Site NDVI: 0.41 mean · Growth rate: +8.2%/yr · Z-score baseline: 2019'}
          </div>
          <div className="text-[10px] text-[#68d391] mt-1">
            {view === 'executive'
              ? '61% of the disturbed land is showing strong vegetation recovery. Two small areas need attention.'
              : 'Random Forest classifier: 61% rehabilitating · 22% early regrowth · 17% bare. Sentinel-2 10m resolution.'}
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <div className="text-[9px] text-[#68d391]">Bond on track to release</div>
          <div className="text-xl font-medium text-[#3fb950]">$48,000,000</div>
          <div className="text-[9px] text-[#68d391]">Q3 2027 · 19 months away</div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-4 gap-3 px-4 mt-3 flex-shrink-0">
        {[
          {
            exec: 'How much land is recovering?',
            tech: 'Rehabilitated area',
            value: `${recovering}%`,
            sub: view === 'executive' ? 'of the disturbed area' : 'NDVI > 0.35 threshold',
            trend: 'Up from 53% a year ago',
            trendColor: 'text-[#3fb950]'
          },
          {
            exec: 'How fast is it growing?',
            tech: 'Annual NDVI velocity',
            value: '+8.2%',
            sub: view === 'executive' ? 'per year' : 'slope of linear regression',
            trend: 'Target is 6% — ahead of schedule',
            trendColor: 'text-[#3fb950]'
          },
          {
            exec: 'Areas that need attention',
            tech: 'Anomalous zones',
            value: '22 ha',
            sub: view === 'executive' ? 'across 2 zones' : 'Z-score > 2σ deviation',
            trend: 'Action recommended this quarter',
            trendColor: 'text-[#e3b341]'
          },
          {
            exec: 'Last satellite check',
            tech: 'Last Sentinel-2 pass',
            value: '5 days',
            sub: view === 'executive' ? 'ago' : 'Sentinel-2 · Band 8 / Band 4',
            trend: 'Next check in 2 days',
            trendColor: 'text-[#484f58]'
          }
        ].map((card, i) => (
          <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
            <div className="text-[9px] text-[#484f58] mb-1">
              {view === 'executive' ? card.exec : card.tech}
            </div>
            <div className="text-xl font-medium text-[#e6edf3]">{card.value}</div>
            <div className="text-[9px] text-[#8b949e] mt-0.5">{card.sub}</div>
            <div className={`text-[9px] mt-1 ${card.trendColor}`}>{card.trend}</div>
          </div>
        ))}
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-3 gap-3 px-4 mt-3 flex-1 min-h-0 pb-4">

        {/* Chart panel */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <div className="text-[11px] font-medium text-[#e6edf3]">
              {view === 'executive' ? 'Vegetation recovery over time' : 'NDVI time-series'}
            </div>
            <div className="text-[9px] text-[#484f58]">{year}</div>
          </div>

          {/* Year slider */}
          <div className="mb-2 flex-shrink-0">
            <input
              type="range"
              min="2019"
              max="2026"
              value={year}
              onChange={e => setYear(parseInt(e.target.value))}
              className="w-full accent-[#2ea043]"
            />
            <div className="flex justify-between text-[8px] text-[#484f58] mt-0.5">
              {[2019,2020,2021,2022,2023,2024,2025,2026].map(y => (
                <span key={y} className={y === year ? 'text-[#3fb950]' : ''}>{y}</span>
              ))}
            </div>
          </div>

          {/* Bar chart */}
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="month" tick={{ fontSize: 8, fill: '#484f58' }} />
                <YAxis tick={{ fontSize: 8, fill: '#484f58' }} domain={[0, 1]} />
                <Tooltip
                  contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 4, fontSize: 10 }}
                  formatter={(val) => [val.toFixed(2), view === 'executive' ? 'Recovery score' : 'NDVI']}
                />
                <Bar dataKey="ndvi" fill="#2ea043" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Progress bars */}
          <div className="mt-2 pt-2 border-t border-[#30363d] flex-shrink-0">
            {[
              { label: view === 'executive' ? 'Recovering well' : 'Rehabilitating (NDVI>0.35)', pct: recovering, color: '#2ea043' },
              { label: view === 'executive' ? 'Early stage' : 'Early regrowth (NDVI 0.15–0.35)', pct: early, color: '#d29922' },
              { label: view === 'executive' ? 'Needs attention' : 'Bare/disturbed (NDVI<0.15)', pct: bare, color: '#cf222e' },
            ].map((row, i) => (
              <div key={i} className="mb-1.5">
                <div className="flex justify-between text-[8px] mb-0.5">
                  <span className="text-[#8b949e]">{row.label}</span>
                  <span className="text-[#e6edf3] font-medium">{row.pct}%</span>
                </div>
                <div className="h-1 bg-[#21262d] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: row.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Chat panel */}
        <div className="bg-[#161b22] border border-[#2ea043] rounded-lg p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <div className="text-[11px] font-medium text-[#e6edf3]">Ask a question</div>
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#1a3a1a] text-[#3fb950]">Claude AI</span>
          </div>
          <div className="flex-1 flex flex-col gap-2 overflow-auto min-h-0">
            <div className="bg-[#21262d] rounded px-2 py-1.5 text-[9px] text-[#8b949e] self-end max-w-[85%]">
              Will we get the bond money back on time?
            </div>
            <div className="bg-[#1a2d1a] border border-[#2a4a2a] rounded px-2 py-1.5 text-[9px] text-[#b8e6b8] leading-relaxed max-w-[95%]">
              Yes — at the current pace the site will meet the government's requirements by Q3 2027 and the full $48M will be returned. Two areas need attention: Zone C3 (rainfall damage) and Zone B2 (possible weeds). Ignoring them could delay release by 12–18 months.
            </div>
            <div className="bg-[#21262d] rounded px-2 py-1.5 text-[9px] text-[#8b949e] self-end max-w-[85%]">
              What does the weed issue mean for us?
            </div>
            <div className="bg-[#1a2d1a] border border-[#2a4a2a] rounded px-2 py-1.5 text-[9px] text-[#b8e6b8] leading-relaxed max-w-[95%]">
              Zone B2 may have buffel grass — an invasive weed. Under WA mining law this is reportable and could pause the bond release verification. A ground inspection this month would confirm it.
            </div>
          </div>
          <div className="flex gap-2 mt-2 flex-shrink-0">
            <input
              className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-[9px] text-[#484f58] focus:outline-none focus:border-[#2ea043]"
              placeholder="Ask anything about this site..."
            />
            <button className="bg-[#1a3a1a] border border-[#2ea043] rounded px-2 py-1.5 text-[9px] text-[#3fb950]">
              Ask
            </button>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-3">

          {/* Alerts panel */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-medium text-[#e6edf3]">
                {view === 'executive' ? 'Issues needing attention' : 'AI anomaly alerts'}
              </div>
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#1a3a1a] text-[#3fb950]">live</span>
            </div>
            {[
              { color: 'bg-[#3d0000] text-[#f85149]', icon: '⚠', title: 'Zone C3 — vegetation loss (14ha)', sub: '2 days ago · monitor weekly', exec: 'Likely rainfall damage. Should recover in 4 months.', tech: 'NDVI=0.12 (baseline 0.30, z=−2.8σ) · confidence 91%' },
              { color: 'bg-[#2d2000] text-[#e3b341]', icon: '◈', title: 'Zone B2 — possible weed growth (8ha)', sub: '5 days ago · ground check needed', exec: 'May be buffel grass. Reportable if confirmed.', tech: 'Spectral anomaly vs native regrowth · confidence 78%' },
              { color: 'bg-[#1a3a1a] text-[#3fb950]', icon: '✓', title: 'Zone A1 — milestone reached ✓', sub: '12 days ago · verified', exec: '80% recovered — bond milestone confirmed.', tech: 'NDVI mean 0.61 > 0.35 threshold · verified' },
            ].map((alert, i) => (
              <div key={i} className="flex gap-2 py-1.5 border-b border-[#30363d] last:border-0 items-start">
                <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-[9px] ${alert.color}`}>
                  {alert.icon}
                </div>
                <div>
                  <div className="text-[9px] text-[#e6edf3] font-medium">{alert.title}</div>
                  <div className="text-[8px] text-[#8b949e] mt-0.5">
                    {view === 'executive' ? alert.exec : alert.tech}
                  </div>
                  <div className="text-[8px] text-[#484f58] mt-0.5">{alert.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Bond panel */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
            <div className="text-[11px] font-medium text-[#e6edf3] mb-2">Bond forecast</div>
            {[
              { label: 'Bond lodged with government', value: '$48,000,000' },
              { label: view === 'executive' ? 'Annual recovery rate' : 'NDVI velocity (linear regression)', value: '+8.2% / yr' },
              { label: 'Expected release', value: 'Q3 2027', valueColor: 'text-[#3fb950]' },
              { label: 'Capital to be returned', value: '$48M', valueColor: 'text-[#3fb950]', big: true },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center py-1.5 border-b border-[#30363d] last:border-0">
                <span className="text-[9px] text-[#8b949e]">{row.label}</span>
                <span className={`font-medium ${row.big ? 'text-base' : 'text-[10px]'} ${row.valueColor || 'text-[#e6edf3]'}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  )
}