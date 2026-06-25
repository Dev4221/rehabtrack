import { useState } from 'react'
import { useSite } from '../SiteContext'

const allAlerts = {
  'roy-hill': [
    {
      id: 1, severity: 'urgent', zone: 'Zone C3',
      title: 'Zone C3 - vegetation loss detected', area: '14 hectares',
      exec: '14 hectares in the southern section have lost significant vegetation cover over the past 30 days. Based on recent rainfall data and the history of this zone, this is most likely surface erosion caused by heavy rain last week. The vegetation should recover naturally within 3-4 months but needs weekly monitoring to make sure it does not spread.',
      tech: 'NDVI dropped from 0.30 to 0.12 over 30 days (z=-2.8 from seasonal baseline). Random Forest classifier: bare/disturbed. Confidence: 91%. Recommended: weekly Sentinel-2 monitoring.',
      action: 'Weekly monitoring', days: '2 days ago', resolved: false,
    },
    {
      id: 2, severity: 'attention', zone: 'Zone B2',
      title: 'Zone B2 - possible weed growth', area: '8 hectares',
      exec: '8 hectares in the western section show a vegetation pattern that does not match the native plants expected here. This could be buffel grass - a declared invasive weed under WA law. If confirmed by a ground inspection, this needs to be treated before bond release verification can proceed.',
      tech: 'Spectral signature anomaly: Band 4/Band 8 ratio inconsistent with native Pilbara regrowth. Possible Cenchrus ciliaris. Confidence: 78%. Reportable under Mine Closure Plan s.4.2.',
      action: 'Ground inspection', days: '5 days ago', resolved: false,
    },
    {
      id: 3, severity: 'resolved', zone: 'Zone A1',
      title: 'Zone A1 - recovery milestone reached',
      area: '420 hectares',
      exec: 'Zone A1 has reached the government\'s vegetation threshold. This section of the site is verified as recovered. Bond release for this zone has been flagged for regulatory verification.',
      tech: 'NDVI mean 0.61 sustained above 0.35 threshold for 3 consecutive months. Random Forest: rehabilitating (confidence 96%). Bond milestone confirmed.',
      action: 'Verified', days: '12 days ago', resolved: true,
    },
  ],
  'cloudbreak': [
    {
      id: 1, severity: 'resolved', zone: 'Zone A1',
      title: 'Zone A1 - recovery milestone reached',
      area: '520 hectares',
      exec: 'Zone A1 has reached the government\'s vegetation threshold and is verified as recovered. Bond release for this zone has been flagged for regulatory verification.',
      tech: 'NDVI mean 0.58 sustained above 0.35 threshold for 4 consecutive months. Random Forest: rehabilitating (confidence 94%). Bond milestone confirmed.',
      action: 'Verified', days: '3 days ago', resolved: true,
    },
  ],
  'brockman': [
    {
      id: 1, severity: 'attention', zone: 'Zone D2',
      title: 'Zone D2 - recovery rate below target',
      area: '180 hectares',
      exec: '180 hectares in the eastern section are recovering at less than half the required annual rate. At this pace, the bond release target for this zone will be missed by 18 months. A targeted replanting programme is recommended before the next wet season.',
      tech: 'NDVI velocity: +2.1%/yr vs 6% regulatory target. Linear regression R2=0.89. Projected milestone: Q3 2031 vs target Q1 2029.',
      action: 'Replanting programme', days: '1 week ago', resolved: false,
    },
  ],
  'christmas-creek': [
    {
      id: 1, severity: 'urgent', zone: 'Zone E1',
      title: 'Zone E1 - critical vegetation loss',
      area: '240 hectares',
      exec: '240 hectares in the northern section have shown almost no vegetation recovery since 2022. At the current rate, this zone will not meet the government\'s threshold until 2035 at the earliest - 5 years past the bond release target. Urgent intervention is required.',
      tech: 'NDVI mean 0.08 - well below 0.15 early regrowth threshold. Annual velocity: +1.2%/yr. Projected milestone: 2035+. Z-score vs site average: -3.4.',
      action: 'Urgent intervention', days: '2 days ago', resolved: false,
    },
    {
      id: 2, severity: 'urgent', zone: 'Zone E3',
      title: 'Zone E3 - erosion spreading',
      area: '95 hectares',
      exec: 'Erosion from last month\'s heavy rainfall is spreading beyond the original affected area. 95 hectares now show bare soil where vegetation had begun to establish. Without intervention this could set the site back 2-3 years.',
      tech: 'NDVI dropped from 0.22 to 0.09 over 45 days. Spatial spread: 40ha to 95ha. Z-score: -3.1. Erosion pattern consistent with rill formation on waste dump slopes.',
      action: 'Erosion control works', days: '4 days ago', resolved: false,
    },
    {
      id: 3, severity: 'attention', zone: 'Zone F2',
      title: 'Zone F2 - weed encroachment',
      area: '62 hectares',
      exec: '62 hectares show signs of buffel grass spreading from the unsealed haul road boundary. This is a reportable event under the Mine Closure Plan and must be treated before any bond release verification can proceed.',
      tech: 'Spectral anomaly: Band ratio 0.71 vs 0.52 native baseline. Cenchrus ciliaris spectral match 83%. Reportable under MCP s.4.2. Treatment required prior to verification.',
      action: 'Weed treatment', days: '6 days ago', resolved: false,
    },
  ],
}

const severityStyles = {
  urgent: { border: 'border-[#f85149]', badge: 'bg-[#3d0000] text-[#f85149]', label: 'URGENT' },
  attention: { border: 'border-[#e3b341]', badge: 'bg-[#2d2000] text-[#e3b341]', label: 'NEEDS ATTENTION' },
  resolved: { border: 'border-[#2ea043]', badge: 'bg-[#1a3a1a] text-[#3fb950]', label: 'RESOLVED' },
}

export default function Alerts() {
  const { selectedSite } = useSite()
  const [view, setView] = useState('executive')
  const [filter, setFilter] = useState('all')
  const [resolvedIds, setResolvedIds] = useState([])

  const siteAlerts = (allAlerts[selectedSite.id] || []).map(a => ({
    ...a,
    resolved: a.resolved || resolvedIds.includes(`${selectedSite.id}-${a.id}`),
  }))

  const filtered = siteAlerts.filter(a => {
    if (filter === 'open') return !a.resolved
    if (filter === 'resolved') return a.resolved
    return true
  })

  const markResolved = (id) => {
    setResolvedIds(prev => [...prev, `${selectedSite.id}-${id}`])
  }

  return (
    <div className="flex flex-col h-full">

      <div className="h-10 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 flex-shrink-0">
        <div className="text-[10px] text-[#8b949e]">
          Alerts <span className="text-[#e6edf3]">/ {selectedSite.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[#21262d] border border-[#30363d] rounded-full p-0.5 flex gap-0.5">
            <button onClick={() => setView('executive')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${view === 'executive' ? 'bg-[#1a3a1a] text-[#3fb950]' : 'text-[#484f58]'}`}>Plain English</button>
            <button onClick={() => setView('technical')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${view === 'technical' ? 'bg-[#1a3a1a] text-[#3fb950]' : 'text-[#484f58]'}`}>Technical</button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="mb-4">
          <div className="text-[13px] font-medium text-[#e6edf3] mb-1">
            {view === 'executive' ? 'Areas that need attention' : 'AI anomaly alerts'}
          </div>
          <div className="text-[10px] text-[#8b949e]">
            {view === 'executive'
              ? 'These alerts are generated automatically by AI agents that scan the satellite data every day. Each alert includes a plain-English explanation of what was detected and what to do next.'
              : 'Anomaly detection via Z-score analysis against 5-year seasonal baseline. Explanations generated by Claude AI with RAG context retrieval.'}
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {[
            { key: 'all', label: `All alerts (${siteAlerts.length})` },
            { key: 'open', label: `Open (${siteAlerts.filter(a => !a.resolved).length})` },
            { key: 'resolved', label: `Resolved (${siteAlerts.filter(a => a.resolved).length})` },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded text-[10px] border transition-colors ${filter === f.key ? 'bg-[#1a3a1a] border-[#2ea043] text-[#3fb950]' : 'bg-[#161b22] border-[#30363d] text-[#8b949e]'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-[#484f58] text-[10px]">
            No alerts in this category for {selectedSite.name}. The AI agents will notify you if anything changes.
          </div>
        )}

        <div className="flex flex-col gap-3">
          {filtered.map(alert => {
            const style = severityStyles[alert.severity]
            return (
              <div key={alert.id} className={`bg-[#161b22] border rounded-lg p-4 ${style.border}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] px-2 py-0.5 rounded font-medium ${style.badge}`}>{style.label}</span>
                    <div className="text-[12px] font-medium text-[#e6edf3]">{alert.title}</div>
                  </div>
                  <div className="text-[9px] text-[#484f58] flex-shrink-0 ml-4">{alert.days}</div>
                </div>
                <div className="text-[10px] text-[#8b949e] leading-relaxed mb-3">
                  {view === 'executive' ? alert.exec : alert.tech}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {!alert.resolved && (
                      <>
                        <button onClick={() => markResolved(alert.id)} className="bg-[#21262d] border border-[#30363d] rounded px-3 py-1 text-[9px] text-[#8b949e] hover:text-[#e6edf3] transition-colors">
                          Mark as resolved
                        </button>
                        <button className="bg-[#21262d] border border-[#30363d] rounded px-3 py-1 text-[9px] text-[#8b949e] hover:text-[#e6edf3] transition-colors">
                          View on map
                        </button>
                        <button className="bg-[#1a3a1a] border border-[#2ea043] rounded px-3 py-1 text-[9px] text-[#3fb950]">
                          Add to report
                        </button>
                      </>
                    )}
                  </div>
                  <div className="text-[9px] text-[#484f58]">Recommended action: {alert.action}</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}