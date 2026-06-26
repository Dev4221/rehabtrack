import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useSite } from '../SiteContext'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { selectedSite } = useSite()
  const navigate = useNavigate()
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

  const siteNdviOffset = {
    'roy-hill': 0,
    'cloudbreak': 0.08,
    'brockman': -0.10,
    'christmas-creek': -0.20,
  }

  const offset = siteNdviOffset[selectedSite.id] || 0

  const chartData = ndviData
    .filter(r => r.year === year)
    .map(r => ({
      month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][r.month - 1],
      ndvi: Math.max(0, Math.min(1, r.mean_ndvi + offset)),
      recovering: parseInt(r.area_recovering),
    }))

  const recovering = selectedSite.recovered
  const early = selectedSite.id === 'roy-hill' ? 22 : selectedSite.id === 'cloudbreak' ? 18 : selectedSite.id === 'brockman' ? 28 : 35
  const bare = 100 - recovering - early

  const statusColor = selectedSite.status === 'on-track' ? 'text-[var(--green)]' : selectedSite.status === 'slow' ? 'text-[var(--amber)]' : 'text-[var(--red)]'
  const statusBorder = selectedSite.status === 'on-track' ? 'border-[var(--green-border)]' : selectedSite.status === 'slow' ? 'border-[var(--amber-border)]' : 'border-[var(--red-border)]'
  const statusBg = selectedSite.status === 'on-track' ? 'bg-[var(--green-dark)]' : selectedSite.status === 'slow' ? 'bg-[var(--amber-bg)]' : 'bg-[var(--red-bg)]'
  const statusText = selectedSite.status === 'on-track'
    ? 'This site is on track to meet its rehabilitation target'
    : selectedSite.status === 'slow'
    ? 'This site is recovering slower than required'
    : 'This site is at risk of missing its bond release target'
  const statusSub = selectedSite.status === 'on-track'
    ? `${recovering}% of the disturbed land is showing strong vegetation recovery.`
    : `${recovering}% recovered, below the required pace. Action needed to stay on schedule.`

  const isAnalyst = view === 'analyst'

  return (
    <div className="flex flex-col h-full">

      <div className="h-10 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center justify-between px-4 flex-shrink-0">
        <div className="text-[10px] text-[var(--text-secondary)]">
          Overview <span className="text-[var(--text-primary)]">/ {selectedSite.name} / {year}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-full p-0.5 flex gap-0.5">
            <button
              onClick={() => setView('executive')}
              className={`px-3 py-1 rounded-full text-[9px] transition-colors ${!isAnalyst ? 'bg-[var(--green-bg)] text-[var(--green)]' : 'text-[var(--text-muted)]'}`}
            >
              Executive
            </button>
            <button
              onClick={() => setView('analyst')}
              className={`px-3 py-1 rounded-full text-[9px] transition-colors ${isAnalyst ? 'bg-[var(--green-bg)] text-[var(--green)]' : 'text-[var(--text-muted)]'}`}
            >
              Analyst
            </button>
          </div>
          <div className={`flex items-center gap-1 bg-[var(--bg-tertiary)] border rounded px-2 py-1 text-[9px] ${selectedSite.alerts > 0 ? 'border-[var(--red-border)] text-[var(--red)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${selectedSite.alerts > 0 ? 'bg-[var(--red)]' : 'bg-[var(--text-muted)]'}`}></div>
            {selectedSite.alerts > 0 ? `${selectedSite.alerts} issues need attention` : 'All clear'}
          </div>
          <button
            onClick={() => navigate('/report')}
            className="bg-[var(--green-bg)] border border-[var(--green-border)] rounded px-2 py-1 text-[9px] text-[var(--green)]"
          >
            Generate report
          </button>
        </div>
      </div>

      <div className={`mx-4 mt-4 ${statusBg} border ${statusBorder} rounded-lg px-4 py-3 flex items-center justify-between flex-shrink-0`}>
        <div>
          <div className={`text-[12px] font-medium ${statusColor}`}>
            {isAnalyst
              ? `NDVI mean: ${(0.41 + offset).toFixed(2)} | Growth rate: +${selectedSite.growthRate}%/yr | Z-score baseline: 2019`
              : statusText}
          </div>
          <div className="text-[10px] text-[var(--green)] mt-1">
            {isAnalyst
              ? `Random Forest classifier: ${recovering}% rehabilitating | ${early}% early regrowth | ${bare}% bare | Sentinel-2 10m resolution`
              : statusSub}
          </div>
        </div>
        <div className="text-right flex-shrink-0 ml-4">
          <div className="text-[9px] text-[var(--green)]">Bond lodged with government</div>
          <div className={`text-xl font-medium ${statusColor}`}>${(selectedSite.bond / 1000000).toFixed(0)},000,000</div>
          <div className="text-[9px] text-[var(--green)]">{selectedSite.release} | {selectedSite.operator}</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 px-4 mt-3 flex-shrink-0">
        {[
          {
            exec: 'How much land is recovering?',
            anal: 'Rehabilitated area',
            value: `${recovering}%`,
            sub: isAnalyst ? 'NDVI > 0.35 threshold' : 'of the disturbed area',
            trend: selectedSite.status === 'on-track' ? 'Ahead of schedule' : selectedSite.status === 'slow' ? 'Behind schedule' : 'Significantly behind',
            trendColor: statusColor,
          },
          {
            exec: 'How fast is it growing?',
            anal: 'Annual NDVI velocity',
            value: `+${selectedSite.growthRate}%`,
            sub: isAnalyst ? 'Slope of linear regression' : 'per year',
            trend: `Target is 6% | ${selectedSite.growthRate >= 6 ? 'ahead of' : 'below'} schedule`,
            trendColor: selectedSite.growthRate >= 6 ? 'text-[var(--green)]' : 'text-[var(--red)]',
          },
          {
            exec: 'Total area monitored',
            anal: 'Disturbed area (ha)',
            value: selectedSite.area.toLocaleString(),
            sub: isAnalyst ? 'Hectares in rehabilitation' : 'hectares',
            trend: selectedSite.region,
            trendColor: 'text-[var(--text-muted)]',
          },
          {
            exec: 'Last satellite check',
            anal: 'Last Sentinel-2 pass',
            value: '5 days',
            sub: isAnalyst ? 'Sentinel-2 | Band 8 / Band 4' : 'ago',
            trend: 'Next check in 2 days',
            trendColor: 'text-[var(--text-muted)]',
          },
        ].map((card, i) => (
          <div key={i} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3">
            <div className="text-[9px] text-[var(--text-muted)] mb-1">{isAnalyst ? card.anal : card.exec}</div>
            <div className="text-xl font-medium text-[var(--text-primary)]">{card.value}</div>
            <div className="text-[9px] text-[var(--text-secondary)] mt-0.5">{card.sub}</div>
            <div className={`text-[9px] mt-1 ${card.trendColor}`}>{card.trend}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3 px-4 mt-3 flex-1 min-h-0 pb-4">

        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <div className="text-[11px] font-medium text-[var(--text-primary)]">
              {isAnalyst ? 'NDVI time-series' : 'Vegetation recovery over time'}
            </div>
            <div className="text-[9px] text-[var(--text-muted)]">{year}</div>
          </div>
          <div className="mb-2 flex-shrink-0">
            <input
              type="range" min="2019" max="2026" value={year}
              onChange={e => setYear(parseInt(e.target.value))}
              className="w-full accent-[var(--green-border)]"
            />
            <div className="flex justify-between text-[8px] text-[var(--text-muted)] mt-0.5">
              {[2019,2020,2021,2022,2023,2024,2025,2026].map(y => (
                <span key={y} className={y === year ? 'text-[var(--green)]' : ''}>{y}</span>
              ))}
            </div>
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                <XAxis dataKey="month" tick={{ fontSize: 8, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 8, fill: 'var(--text-muted)' }} domain={[0, 1]} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 10 }}
                  formatter={(val) => [val.toFixed(2), isAnalyst ? 'NDVI' : 'Recovery score']}
                />
                <Bar dataKey="ndvi" fill="var(--green-border)" radius={[2,2,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 pt-2 border-t border-[var(--border)] flex-shrink-0">
            {[
              { label: isAnalyst ? 'Rehabilitating (NDVI > 0.35)' : 'Recovering well', pct: recovering, color: '#2ea043' },
              { label: isAnalyst ? 'Early regrowth (NDVI 0.15 to 0.35)' : 'Early stage', pct: early, color: '#d29922' },
              { label: isAnalyst ? 'Bare or disturbed (NDVI < 0.15)' : 'Needs attention', pct: bare, color: '#cf222e' },
            ].map((row, i) => (
              <div key={i} className="mb-1.5">
                <div className="flex justify-between text-[8px] mb-0.5">
                  <span className="text-[var(--text-secondary)]">{row.label}</span>
                  <span className="text-[var(--text-primary)] font-medium">{row.pct}%</span>
                </div>
                <div className="h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: row.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--green-border)] rounded-lg p-3 flex flex-col">
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <div className="text-[11px] font-medium text-[var(--text-primary)]">Ask a question</div>
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-[var(--green-bg)] text-[var(--green)]">Claude AI</span>
          </div>
          <div className="flex-1 flex flex-col gap-2 overflow-auto min-h-0">
            <div className="bg-[var(--bg-elevated)] rounded px-2 py-1.5 text-[9px] text-[var(--text-secondary)] self-end max-w-[85%]">
              Will we get the bond money back on time?
            </div>
            <div className="bg-[var(--green-dark)] border border-[var(--green-border)] rounded px-2 py-1.5 text-[9px] text-[var(--green)] leading-relaxed max-w-[92%]">
              {selectedSite.status === 'on-track'
                ? `Yes. ${selectedSite.name} is on track. At +${selectedSite.growthRate}%/yr, the site will meet the government's requirements by ${selectedSite.release} and the full $${(selectedSite.bond/1000000).toFixed(0)}M will be returned.`
                : selectedSite.status === 'slow'
                ? `At risk. ${selectedSite.name} is recovering at +${selectedSite.growthRate}%/yr, below the 6% annual target. Bond release is expected ${selectedSite.release}, later than planned.`
                : `Significant risk. ${selectedSite.name} is recovering at only +${selectedSite.growthRate}%/yr, well below the 6% target. Bond release is projected ${selectedSite.release} without urgent intervention.`
              }
            </div>
          </div>
          <div className="flex gap-2 mt-2 flex-shrink-0">
            <input
              className="flex-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-[9px] text-[var(--text-muted)] focus:outline-none focus:border-[var(--green-border)]"
              placeholder="Ask anything about this site..."
              onClick={() => navigate('/ask')}
              readOnly
            />
            <button
              className="bg-[var(--green-bg)] border border-[var(--green-border)] rounded px-2 py-1.5 text-[9px] text-[var(--green)]"
              onClick={() => navigate('/ask')}
            >
              Ask
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3 flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-medium text-[var(--text-primary)]">
                {isAnalyst ? 'AI anomaly alerts' : 'Issues needing attention'}
              </div>
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-[var(--green-bg)] text-[var(--green)]">live</span>
            </div>
            {selectedSite.alerts === 0 ? (
              <div className="text-[9px] text-[var(--text-muted)] py-4 text-center">No open alerts. All areas recovering as expected.</div>
            ) : (
              <>
                <div className="flex gap-2 py-1.5 border-b border-[var(--border)] items-start">
                  <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-[9px] bg-[var(--red-bg)] text-[var(--red)]">⚠</div>
                  <div>
                    <div className="text-[9px] text-[var(--text-primary)] font-medium">
                      {selectedSite.id === 'christmas-creek' ? 'Zone E1 - critical vegetation loss (240ha)' : 'Zone C3 - vegetation loss (14ha)'}
                    </div>
                    <div className="text-[8px] text-[var(--text-secondary)] mt-0.5">
                      {isAnalyst
                        ? selectedSite.id === 'christmas-creek' ? 'NDVI mean 0.08. Annual velocity +1.2%/yr. Z-score: -3.4.' : 'NDVI=0.12 (baseline 0.30, z=-2.8). Confidence 91%.'
                        : selectedSite.id === 'christmas-creek' ? 'Critical. Only 12% recovered. Urgent intervention required.' : 'Likely rainfall damage. Should recover in 4 months.'}
                    </div>
                    <div className="text-[8px] text-[var(--text-muted)] mt-0.5">2 days ago | monitor weekly</div>
                  </div>
                </div>
                {selectedSite.alerts >= 2 && (
                  <div className="flex gap-2 py-1.5 border-b border-[var(--border)] items-start">
                    <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-[9px] bg-[var(--amber-bg)] text-[var(--amber)]">◈</div>
                    <div>
                      <div className="text-[9px] text-[var(--text-primary)] font-medium">
                        {selectedSite.id === 'christmas-creek' ? 'Zone E3 - erosion spreading (95ha)' : 'Zone B2 - possible weed growth (8ha)'}
                      </div>
                      <div className="text-[8px] text-[var(--text-secondary)] mt-0.5">
                        {isAnalyst
                          ? selectedSite.id === 'christmas-creek' ? 'NDVI dropped from 0.22 to 0.09 over 45 days. Spatial spread: 40ha to 95ha.' : 'Spectral anomaly vs native regrowth. Confidence 78%.'
                          : selectedSite.id === 'christmas-creek' ? 'Erosion spreading beyond original area. Control works needed urgently.' : 'May be buffel grass. Reportable if confirmed.'}
                      </div>
                      <div className="text-[8px] text-[var(--text-muted)] mt-0.5">4 days ago | action required</div>
                    </div>
                  </div>
                )}
                {selectedSite.alerts >= 3 && (
                  <div className="flex gap-2 py-1.5 items-start">
                    <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-[9px] bg-[var(--amber-bg)] text-[var(--amber)]">◈</div>
                    <div>
                      <div className="text-[9px] text-[var(--text-primary)] font-medium">Zone F2 - weed encroachment (62ha)</div>
                      <div className="text-[8px] text-[var(--text-secondary)] mt-0.5">
                        {isAnalyst ? 'Spectral match 83% Cenchrus ciliaris. Reportable under MCP s.4.2.' : 'Buffel grass spreading from haul road boundary. Reportable event.'}
                      </div>
                      <div className="text-[8px] text-[var(--text-muted)] mt-0.5">6 days ago | treatment required</div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3">
            <div className="text-[11px] font-medium text-[var(--text-primary)] mb-2">Bond forecast</div>
            {[
              { label: 'Bond lodged with government', value: `$${(selectedSite.bond/1000000).toFixed(0)},000,000` },
              { label: isAnalyst ? 'NDVI velocity (linear regression)' : 'Annual recovery rate', value: `+${selectedSite.growthRate}% / yr` },
              { label: 'Expected release', value: selectedSite.release, valueColor: statusColor },
              { label: 'Capital to be returned', value: `$${(selectedSite.bond/1000000).toFixed(0)}M`, valueColor: statusColor, big: true },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center py-1.5 border-b border-[var(--border)] last:border-0">
                <span className="text-[9px] text-[var(--text-secondary)]">{row.label}</span>
                <span className={`font-medium ${row.big ? 'text-base' : 'text-[10px]'} ${row.valueColor || 'text-[var(--text-primary)]'}`}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}