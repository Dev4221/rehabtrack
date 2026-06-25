import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useSite } from '../SiteContext'

export default function Dashboard() {
  const { selectedSite } = useSite()
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

  const recovering = selectedSite.recovered
  const early = selectedSite.id === 'roy-hill' ? 22 : selectedSite.id === 'cloudbreak' ? 18 : selectedSite.id === 'brockman' ? 28 : 35
  const bare = 100 - recovering - early

  const statusColor = selectedSite.status === 'on-track' ? 'text-[#3fb950]' : selectedSite.status === 'slow' ? 'text-[#e3b341]' : 'text-[#f85149]'
  const statusBorder = selectedSite.status === 'on-track' ? 'border-[#2ea043]' : selectedSite.status === 'slow' ? 'border-[#d29922]' : 'border-[#cf222e]'
  const statusBg = selectedSite.status === 'on-track' ? 'bg-[#1a2d1a]' : selectedSite.status === 'slow' ? 'bg-[#2d2000]' : 'bg-[#3d0000]'
  const statusText = selectedSite.status === 'on-track' ? 'This site is on track to meet its rehabilitation target' : selectedSite.status === 'slow' ? 'This site is recovering slower than required' : 'This site is at risk of missing its bond release target'
  const statusSub = selectedSite.status === 'on-track' ? `${recovering}% of the disturbed land is showing strong vegetation recovery.` : `${recovering}% recovered — below the required pace. Action needed to stay on schedule.`

  return (
    <div className="flex flex-col h-full">

      <div className="h-10 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 flex-shrink-0">
        <div className="text-[10px] text-[#8b949e]">
          Overview <span className="text-[#e6edf3]">/ {selectedSite.name} / {year}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#21262d] border border-[#30363d] rounded-full p-0.5 flex gap-0.5">
            <button onClick={() => setView('executive')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${view === 'executive' ? 'bg-[#1a3a1a] text-[#3fb950]' : 'text-[#484f58]'}`}>Plain English</button>
            <button onClick={() => setView('technical')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${view === 'technical' ? 'bg-[#1a3a1a] text-[#3fb950]' : 'text-[#484f58]'}`}>Technical</button>
          </div>
          <div className={`flex items-center gap-1 bg-[#1c2128] border rounded px-2 py-1 text-[9px] ${selectedSite.alerts > 0 ? 'border-[#3d0000] text-[#f85149]' : 'border-[#30363d] text-[#484f58]'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${selectedSite.alerts > 0 ? 'bg-[#f85149]' : 'bg-[#484f58]'}`}></div>
            {selectedSite.alerts > 0 ? `${selectedSite.alerts} issues need attention` : 'All clear'}
          </div>
          <div className="bg-[#1a3a1a] border border-[#2ea043] rounded px-2 py-1 text-[9px] text-[#3fb950]">
            Download report
          </div>
        </div>
      </div>

      <div className={`mx-4 mt-4 ${statusBg} border ${statusBorder} rounded-lg px-4 py-3 flex items-center justify-between flex-shrink-0`}>
        <div>
          <div className={`text-[12px] font-medium ${statusColor}`}>{statusText}</div>
          <div className="text-[10px] text-[#68d391] mt-1">{statusSub}</div>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <div className="text-[9px] text-[#68d391]">Bond lodged with government</div>
          <div className={`text-xl font-medium ${statusColor}`}>${(selectedSite.bond / 1000000).toFixed(0)}M</div>
          <div className="text-[9px] text-[#68d391]">{selectedSite.release} · {selectedSite.operator}</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 px-4 mt-3 flex-shrink-0">
        {[
          {
            exec: 'How much land is recovering?',
            tech: 'Rehabilitated area',
            value: `${recovering}%`,
            sub: view === 'executive' ? 'of the disturbed area' : 'NDVI > 0.35 threshold',
            trend: selectedSite.status === 'on-track' ? 'Ahead of schedule' : selectedSite.status === 'slow' ? 'Behind schedule' : 'Significantly behind',
            trendColor: statusColor,
          },
          {
            exec: 'How fast is it growing?',
            tech: 'Annual NDVI velocity',
            value: `+${selectedSite.growthRate}%`,
            sub: view === 'executive' ? 'per year' : 'slope of linear regression',
            trend: `Target is 6% — ${selectedSite.growthRate >= 6 ? 'ahead' : 'behind'} schedule`,
            trendColor: selectedSite.growthRate >= 6 ? 'text-[#3fb950]' : 'text-[#f85149]',
          },
          {
            exec: 'Total site area',
            tech: 'Disturbed area (ha)',
            value: `${selectedSite.area.toLocaleString()}`,
            sub: view === 'executive' ? 'hectares monitored' : 'hectares in rehabilitation',
            trend: `${selectedSite.region}`,
            trendColor: 'text-[#484f58]',
          },
          {
            exec: 'Last satellite check',
            tech: 'Last Sentinel-2 pass',
            value: '5 days',
            sub: view === 'executive' ? 'ago' : 'Sentinel-2 · Band 8 / Band 4',
            trend: 'Next check in 2 days',
            trendColor: 'text-[#484f58]',
          },
        ].map((card, i) => (
          <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
            <div className="text-[9px] text-[#484f58] mb-1">{view === 'executive' ? card.exec : card.tech}</div>
            <div className="text-xl font-medium text-[#e6edf3]">{card.value}</div>
            <div className="text-[9px] text-[#8b949e] mt-0.5">{card.sub}</div>
            <div className={`text-[9px] mt-1 ${card.trendColor}`}>{card.trend}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 px-4 mt-3 flex-1 min-h-0 pb-4">

        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <div className="text-[11px] font-medium text-[#e6edf3]">{view === 'executive' ? 'Vegetation recovery over time' : 'NDVI time-series'}</div>
            <div className="text-[9px] text-[#484f58]">{year}</div>
          </div>
          <div className="mb-2 flex-shrink-0">
            <input
              type="range" min="2019" max="2026" value={year}
              onChange={e => setYear(parseInt(e.target.value))}
              className="w-full accent-[#2ea043]"
            />
            <div className="flex justify-between text-[8px] text-[#484f58] mt-0.5">
              {[2019,2020,2021,2022,2023,2024,2025,2026].map(y => (
                <span key={y} className={y === year ? 'text-[#3fb950]' : ''}>{y}</span>
              ))}
            </div>
          </div>
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
          <div className="mt-2 pt-2 border-t border-[#30363d] flex-shrink-0">
            {[
              { label: view === 'executive' ? 'Recovering well' : 'Rehabilitating (NDVI>0.35)', pct: recovering, color: '#38a169' },
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

        <div className="bg-[#161b22] border border-[#2ea043] rounded-lg p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <div className="text-[11px] font-medium text-[#e6edf3]">Ask a question</div>
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#1a3a1a] text-[#3fb950]">Claude AI</span>
          </div>
          <div className="flex-1 flex flex-col gap-2 overflow-auto min-h-0">
            <div className="bg-[#21262d] rounded px-2 py-1.5 text-[9px] text-[#8b949e] self-end max-w-[85%]">
              Will we get the bond money back on time?
            </div>
            <div className="bg-[#1a2d1a] border border-[#2a4a2a] rounded px-2 py-1.5 text-[9px] text-[#b8e6b8] leading-relaxed max-w-[92%]">
              {selectedSite.status === 'on-track'
                ? `Yes — ${selectedSite.name} is on track. At +${selectedSite.growthRate}%/yr, the site will meet the government's requirements by ${selectedSite.release} and the full $${(selectedSite.bond/1000000).toFixed(0)}M will be returned.`
                : selectedSite.status === 'slow'
                ? `At risk — ${selectedSite.name} is recovering at +${selectedSite.growthRate}%/yr, below the 6% annual target. At this rate the bond release is expected ${selectedSite.release}, later than planned.`
                : `Significant risk — ${selectedSite.name} is recovering at only +${selectedSite.growthRate}%/yr, well below the 6% target. Bond release is projected ${selectedSite.release} without intervention.`
              }
            </div>
          </div>
          <div className="flex gap-2 mt-2 flex-shrink-0">
            <input
              className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-[9px] text-[#484f58] focus:outline-none focus:border-[#2ea043]"
              placeholder="Ask anything about this site..."
              onClick={() => window.location.href = '/ask'}
              readOnly
            />
            <button
              className="bg-[#1a3a1a] border border-[#2ea043] rounded px-2 py-1.5 text-[9px] text-[#3fb950]"
              onClick={() => window.location.href = '/ask'}
            >
              Ask
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-medium text-[#e6edf3]">{view === 'executive' ? 'Issues needing attention' : 'AI anomaly alerts'}</div>
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#1a3a1a] text-[#3fb950]">live</span>
            </div>
            {selectedSite.alerts === 0 ? (
              <div className="text-[9px] text-[#484f58] py-4 text-center">No open alerts — all areas recovering as expected</div>
            ) : (
              <>
                <div className="flex gap-2 py-1.5 border-b border-[#30363d] items-start">
                  <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-[9px] bg-[#3d0000] text-[#f85149]">⚠</div>
                  <div>
                    <div className="text-[9px] text-[#e6edf3] font-medium">Zone C3 — vegetation loss (14ha)</div>
                    <div className="text-[8px] text-[#8b949e] mt-0.5">{view === 'executive' ? 'Likely rainfall damage. Should recover in 4 months.' : 'NDVI=0.12 (baseline 0.30, z=−2.8σ) · confidence 91%'}</div>
                    <div className="text-[8px] text-[#484f58] mt-0.5">2 days ago · monitor weekly</div>
                  </div>
                </div>
                {selectedSite.alerts >= 2 && (
                  <div className="flex gap-2 py-1.5 border-b border-[#30363d] items-start">
                    <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-[9px] bg-[#2d2000] text-[#e3b341]">◈</div>
                    <div>
                      <div className="text-[9px] text-[#e6edf3] font-medium">Zone B2 — possible weed growth (8ha)</div>
                      <div className="text-[8px] text-[#8b949e] mt-0.5">{view === 'executive' ? 'May be buffel grass. Reportable if confirmed.' : 'Spectral anomaly vs native regrowth · confidence 78%'}</div>
                      <div className="text-[8px] text-[#484f58] mt-0.5">5 days ago · ground check needed</div>
                    </div>
                  </div>
                )}
                <div className="flex gap-2 py-1.5 items-start">
                  <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-[9px] bg-[#1a3a1a] text-[#3fb950]">✓</div>
                  <div>
                    <div className="text-[9px] text-[#e6edf3] font-medium">Zone A1 — milestone reached ✓</div>
                    <div className="text-[8px] text-[#8b949e] mt-0.5">{view === 'executive' ? '80% recovered — bond milestone confirmed.' : 'NDVI mean 0.61 > 0.35 threshold · verified'}</div>
                    <div className="text-[8px] text-[#484f58] mt-0.5">12 days ago · verified</div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
            <div className="text-[11px] font-medium text-[#e6edf3] mb-2">Bond forecast</div>
            {[
              { label: 'Bond lodged', value: `$${(selectedSite.bond/1000000).toFixed(0)},000,000` },
              { label: 'Recovery rate', value: `+${selectedSite.growthRate}% / yr` },
              { label: 'Expected release', value: selectedSite.release, valueColor: statusColor },
              { label: 'Capital to be returned', value: `$${(selectedSite.bond/1000000).toFixed(0)}M`, valueColor: statusColor, big: true },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center py-1.5 border-b border-[#30363d] last:border-0">
                <span className="text-[9px] text-[#8b949e]">{row.label}</span>
                <span className={`font-medium ${row.big ? 'text-base' : 'text-[10px]'} ${row.valueColor || 'text-[#e6edf3]'}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}