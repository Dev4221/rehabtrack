import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'

const zones = ['All zones', 'Zone A1', 'Zone A2', 'Zone B1', 'Zone B2', 'Zone B3', 'Zone C1', 'Zone C2', 'Zone C3']

const zoneOffsets = {
  'All zones': 0,
  'Zone A1': 0.12,
  'Zone A2': 0.08,
  'Zone B1': 0.02,
  'Zone B2': -0.05,
  'Zone B3': 0.01,
  'Zone C1': -0.08,
  'Zone C2': -0.12,
  'Zone C3': -0.18,
}

const zoneColors = {
  'All zones': '#3fb950',
  'Zone A1': '#3fb950',
  'Zone A2': '#2ea043',
  'Zone B1': '#e3b341',
  'Zone B2': '#d29922',
  'Zone B3': '#f0883e',
  'Zone C1': '#f85149',
  'Zone C2': '#cf222e',
  'Zone C3': '#a40e26',
}

export default function Trends() {
  const [ndviData, setNdviData] = useState([])
  const [selectedZone, setSelectedZone] = useState('All zones')
  const [view, setView] = useState('executive')
  const [chartType, setChartType] = useState('line')

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
            area_recovering: parseInt(r.area_recovering),
            area_early: parseInt(r.area_early),
            area_bare: parseInt(r.area_bare),
            label: `${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(r.month)-1]} ${r.year}`,
          }))
        setNdviData(cleaned)
      }
    })
  }, [])

  const offset = zoneOffsets[selectedZone] || 0
  const lineColor = zoneColors[selectedZone] || '#3fb950'

  const chartData = ndviData.map(r => ({
    label: r.label,
    score: Math.max(0, Math.min(1, r.mean_ndvi + offset)),
    recovering: r.area_recovering,
    early: r.area_early,
    bare: r.area_bare,
    notes: r.notes,
  }))

  return (
    <div className="flex flex-col h-full">

      <div className="h-10 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 flex-shrink-0">
        <div className="text-[10px] text-[#8b949e]">
          Vegetation trends <span className="text-[#e6edf3]">/ Roy Hill / 2019–2026</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#21262d] border border-[#30363d] rounded-full p-0.5 flex gap-0.5">
            <button onClick={() => setView('executive')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${view === 'executive' ? 'bg-[#1a3a1a] text-[#3fb950]' : 'text-[#484f58]'}`}>Plain English</button>
            <button onClick={() => setView('technical')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${view === 'technical' ? 'bg-[#1a3a1a] text-[#3fb950]' : 'text-[#484f58]'}`}>Technical</button>
          </div>
          <div className="bg-[#21262d] border border-[#30363d] rounded-full p-0.5 flex gap-0.5">
            <button onClick={() => setChartType('line')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${chartType === 'line' ? 'bg-[#1a3a1a] text-[#3fb950]' : 'text-[#484f58]'}`}>Line</button>
            <button onClick={() => setChartType('bar')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${chartType === 'bar' ? 'bg-[#1a3a1a] text-[#3fb950]' : 'text-[#484f58]'}`}>Bar</button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">

        <div className="text-[10px] text-[#8b949e]">
          {view === 'executive'
            ? 'This chart shows how vegetation coverage has changed across the site over time. Higher scores mean healthier, denser vegetation. The dotted line shows the target needed for bond release.'
            : 'Monthly NDVI time-series for Roy Hill 2019–2026. Sentinel-2 Band 8 / Band 4 ratio. Reference line at 0.35 indicates rehabilitating threshold used by Random Forest classifier.'}
        </div>

        <div className="flex gap-2 flex-wrap">
          {zones.map(zone => (
            <button
              key={zone}
              onClick={() => setSelectedZone(zone)}
              className={`px-3 py-1 rounded text-[9px] border transition-colors ${
                selectedZone === zone
                  ? 'bg-[#1a3a1a] border-[#2ea043] text-[#3fb950]'
                  : 'bg-[#161b22] border-[#30363d] text-[#8b949e] hover:text-[#e6edf3]'
              }`}
            >
              {zone}
            </button>
          ))}
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex flex-col" style={{ height: 280 }}>
          <div className="text-[10px] font-medium text-[#e6edf3] mb-1">
            {view === 'executive' ? 'Vegetation health over time' : 'NDVI time-series · 2019–2026'}
          </div>
          <div className="text-[9px] text-[#484f58] mb-3">
            {selectedZone} · Monthly · Sentinel-2
            {selectedZone !== 'All zones' && (
              <span className="ml-2 italic">· Estimated from site average. Per-zone satellite exports can be configured in the pipeline settings.</span>
            )}
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 7, fill: '#484f58' }} interval={5} />
                  <YAxis tick={{ fontSize: 7, fill: '#484f58' }} domain={[0, 1]} />
                  <Tooltip
                    contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 4, fontSize: 9 }}
                    formatter={(val) => [val.toFixed(2), view === 'executive' ? 'Vegetation score' : 'NDVI']}
                  />
                  <ReferenceLine y={0.35} stroke="#484f58" strokeDasharray="4 4" label={{ value: view === 'executive' ? 'Bond release target' : 'NDVI 0.35 threshold', position: 'insideTopRight', fontSize: 8, fill: '#484f58' }} />
                  <Line type="monotone" dataKey="score" stroke={lineColor} strokeWidth={2} dot={false} />
                </LineChart>
              ) : (
                <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 7, fill: '#484f58' }} interval={5} />
                  <YAxis tick={{ fontSize: 7, fill: '#484f58' }} domain={[0, 1]} />
                  <Tooltip
                    contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 4, fontSize: 9 }}
                    formatter={(val) => [val.toFixed(2), view === 'executive' ? 'Vegetation score' : 'NDVI']}
                  />
                  <ReferenceLine y={0.35} stroke="#484f58" strokeDasharray="4 4" />
                  <Bar dataKey="score" fill={lineColor} radius={[1, 1, 0, 0]} />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">

          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex flex-col" style={{ height: 220 }}>
            <div className="text-[10px] font-medium text-[#e6edf3] mb-1">
              {view === 'executive' ? 'How land is split over time' : 'Land classification breakdown'}
            </div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.filter((_, i) => i % 3 === 0)} margin={{ top: 5, right: 5, bottom: 5, left: -15 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 7, fill: '#484f58' }} interval={3} />
                  <YAxis tick={{ fontSize: 7, fill: '#484f58' }} />
                  <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 4, fontSize: 9 }} />
                  <Bar dataKey="recovering" stackId="a" fill="#2ea043" name={view === 'executive' ? 'Recovering well' : 'Rehabilitating'} />
                  <Bar dataKey="early" stackId="a" fill="#d29922" name={view === 'executive' ? 'Early stage' : 'Early regrowth'} />
                  <Bar dataKey="bare" stackId="a" fill="#cf222e" name={view === 'executive' ? 'Needs attention' : 'Bare/disturbed'} radius={[1, 1, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
            <div className="text-[10px] font-medium text-[#e6edf3] mb-3">Notable events on this site</div>
            <div className="flex flex-col gap-2">
              {[
                { date: 'Mar 2021', color: 'border-[#f85149] bg-[#3d0000]', title: 'Cyclone Ellie rainfall event', desc: view === 'executive' ? '340mm of rain in 48 hours caused surface erosion. Vegetation recovered within 4 months.' : 'NDVI dropped to 0.22 (from baseline 0.38). Z-score: −3.1σ. Recovery observed within 4 months.' },
                { date: 'Jun 2024', color: 'border-[#f85149] bg-[#3d0000]', title: 'Zone C3 vegetation loss', desc: view === 'executive' ? 'Heavy rainfall caused vegetation loss across 14 hectares. Currently recovering.' : 'NDVI=0.12 in Zone C3 (baseline 0.30). Z-score: −2.8σ. Classifier: bare/disturbed. Confidence 91%.' },
                { date: 'Jun 2026', color: 'border-[#2ea043] bg-[#1a3a1a]', title: 'Zone A1 milestone reached', desc: view === 'executive' ? "Zone A1 reached 80% recovery — the government's threshold for bond release." : 'Zone A1 NDVI mean 0.61 sustained above 0.35 for 3 consecutive months. Bond milestone confirmed.' },
                { date: 'Jun 2026', color: 'border-[#e3b341] bg-[#2d2000]', title: 'Zone B2 weed signature', desc: view === 'executive' ? 'Possible buffel grass detected in Zone B2. Ground inspection recommended.' : 'Spectral anomaly detected. Band ratio inconsistent with native Pilbara regrowth. Possible Cenchrus ciliaris.' },
              ].map((event, i) => (
                <div key={i} className={`border rounded px-3 py-2 ${event.color}`}>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[8px] text-[#484f58]">{event.date}</span>
                    <span className="text-[9px] font-medium text-[#e6edf3]">{event.title}</span>
                  </div>
                  <div className="text-[8px] text-[#8b949e] leading-relaxed">{event.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}