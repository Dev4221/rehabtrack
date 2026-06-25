import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
      title: 'Zone A1 - recovery milestone reached', area: '420 hectares',
      exec: 'Zone A1 has reached the government\'s vegetation threshold. This section of the site is verified as recovered. Bond release for this zone has been flagged for regulatory verification.',
      tech: 'NDVI mean 0.61 sustained above 0.35 threshold for 3 consecutive months. Random Forest: rehabilitating (confidence 96%). Bond milestone confirmed.',
      action: 'Verified', days: '12 days ago', resolved: true,
    },
  ],
  'cloudbreak': [
    {
      id: 1, severity: 'resolved', zone: 'Zone A1',
      title: 'Zone A1 - recovery milestone reached', area: '520 hectares',
      exec: 'Zone A1 has reached the government\'s vegetation threshold and is verified as recovered. Bond release for this zone has been flagged for regulatory verification.',
      tech: 'NDVI mean 0.58 sustained above 0.35 threshold for 4 consecutive months. Random Forest: rehabilitating (confidence 94%). Bond milestone confirmed.',
      action: 'Verified', days: '3 days ago', resolved: true,
    },
  ],
  'brockman': [
    {
      id: 1, severity: 'attention', zone: 'Zone D2',
      title: 'Zone D2 - recovery rate below target', area: '180 hectares',
      exec: '180 hectares in the eastern section are recovering at less than half the required annual rate. At this pace, the bond release target for this zone will be missed by 18 months. A targeted replanting programme is recommended before the next wet season.',
      tech: 'NDVI velocity: +2.1%/yr vs 6% regulatory target. Linear regression R2=0.89. Projected milestone: Q3 2031 vs target Q1 2029.',
      action: 'Replanting programme', days: '1 week ago', resolved: false,
    },
  ],
  'christmas-creek': [
    {
      id: 1, severity: 'urgent', zone: 'Zone E1',
      title: 'Zone E1 - critical vegetation loss', area: '240 hectares',
      exec: '240 hectares in the northern section have shown almost no vegetation recovery since 2022. At the current rate, this zone will not meet the government\'s threshold until 2035 at the earliest - 5 years past the bond release target. Urgent intervention is required.',
      tech: 'NDVI mean 0.08 - well below 0.15 early regrowth threshold. Annual velocity: +1.2%/yr. Projected milestone: 2035+. Z-score vs site average: -3.4.',
      action: 'Urgent intervention', days: '2 days ago', resolved: false,
    },
    {
      id: 2, severity: 'urgent', zone: 'Zone E3',
      title: 'Zone E3 - erosion spreading', area: '95 hectares',
      exec: 'Erosion from last month\'s heavy rainfall is spreading beyond the original affected area. 95 hectares now show bare soil where vegetation had begun to establish. Without intervention this could set the site back 2-3 years.',
      tech: 'NDVI dropped from 0.22 to 0.09 over 45 days. Spatial spread: 40ha to 95ha. Z-score: -3.1. Erosion pattern consistent with rill formation on waste dump slopes.',
      action: 'Erosion control works', days: '4 days ago', resolved: false,
    },
    {
      id: 3, severity: 'attention', zone: 'Zone F2',
      title: 'Zone F2 - weed encroachment', area: '62 hectares',
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

const newAlertTemplates = {
  'roy-hill': {
    id: 99, severity: 'attention', zone: 'Zone B3',
    title: 'Zone B3 - unusual spectral pattern detected', area: '12 hectares',
    exec: '12 hectares in Zone B3 show a new vegetation pattern detected in today\'s satellite pass. The AI agents have flagged this for review - it may be early-stage weed encroachment or an artefact from recent rainfall. A ground check is recommended within the next 2 weeks.',
    tech: 'Band 4/Band 8 ratio anomaly detected: 0.68 vs 0.51 baseline. Z-score: -1.9. Confidence: 64%. Possible early Cenchrus ciliaris. Recommend ground validation.',
    action: 'Ground check', days: 'Just now', resolved: false,
  },
  'cloudbreak': {
    id: 99, severity: 'attention', zone: 'Zone C1',
    title: 'Zone C1 - vegetation density drop detected', area: '22 hectares',
    exec: '22 hectares in Zone C1 show a slight reduction in vegetation density compared to last month. This is within the normal seasonal range but warrants monitoring over the next two satellite passes to confirm it is not an early erosion signal.',
    tech: 'NDVI delta: -0.04 over 30 days. Z-score: -1.6. Within 2-sigma seasonal range. Flagged for trend monitoring. Next pass: 5 days.',
    action: 'Monitor next pass', days: 'Just now', resolved: false,
  },
  'brockman': {
    id: 99, severity: 'urgent', zone: 'Zone D2',
    title: 'Zone D2 - recovery rate declining further', area: '180 hectares',
    exec: 'The latest satellite pass shows Zone D2\'s recovery rate has dropped from +2.1% to +1.8% per year. The replanting programme does not appear to be taking hold. Immediate review of the programme is recommended before the next wet season.',
    tech: 'NDVI velocity regression updated: +1.8%/yr (prev +2.1%/yr). Replanting survival rate estimated at 34%. Projected milestone now Q2 2032. Immediate intervention review required.',
    action: 'Programme review', days: 'Just now', resolved: false,
  },
  'christmas-creek': {
    id: 99, severity: 'urgent', zone: 'Zone G1',
    title: 'Zone G1 - new erosion event detected', area: '38 hectares',
    exec: '38 hectares in Zone G1 show fresh erosion damage from last week\'s rainfall event. This is a new affected area that has not been flagged before. Given the site\'s existing problems, this additional setback makes the 2030 bond release target even less likely without significant intervention.',
    tech: 'NDVI dropped from 0.19 to 0.07 over 14 days. Z-score: -3.8. Rill erosion pattern confirmed. New affected area - not previously in alert system. Immediate site inspection required.',
    action: 'Emergency inspection', days: 'Just now', resolved: false,
  },
}

export default function Alerts() {
  const { selectedSite } = useSite()
  const navigate = useNavigate()
  const [view, setView] = useState('executive')
  const [filter, setFilter] = useState('all')
  const [resolvedIds, setResolvedIds] = useState([])
  const [unresolvedIds, setUnresolvedIds] = useState([])
  const [hasNewAlert, setHasNewAlert] = useState(false)
  const [addedToReport, setAddedToReport] = useState([])
  const [detecting, setDetecting] = useState(false)

  const baseAlerts = allAlerts[selectedSite.id] || []
  const newAlert = hasNewAlert ? [newAlertTemplates[selectedSite.id]] : []

  const siteAlerts = [...baseAlerts, ...newAlert].map(a => ({
    ...a,
    resolved: unresolvedIds.includes(`${selectedSite.id}-${a.id}`)
      ? false
      : (a.resolved || resolvedIds.includes(`${selectedSite.id}-${a.id}`)),
  }))

  const filtered = siteAlerts.filter(a => {
    if (filter === 'open') return !a.resolved
    if (filter === 'resolved') return a.resolved
    return true
  })

  const markResolved = (id) => {
    setResolvedIds(prev => [...prev, `${selectedSite.id}-${id}`])
    setUnresolvedIds(prev => prev.filter(x => x !== `${selectedSite.id}-${id}`))
  }

  const unmarkResolved = (id) => {
    setUnresolvedIds(prev => [...prev, `${selectedSite.id}-${id}`])
    setResolvedIds(prev => prev.filter(x => x !== `${selectedSite.id}-${id}`))
  }

  const addToReport = (id) => {
    setAddedToReport(prev => [...prev, `${selectedSite.id}-${id}`])
  }

  const detectNewAlerts = () => {
    setDetecting(true)
    setTimeout(() => {
      setHasNewAlert(true)
      setDetecting(false)
    }, 2500)
  }

  const isAddedToReport = (id) => addedToReport.includes(`${selectedSite.id}-${id}`)

  return (
    <div className="flex flex-col h-full">

      <div className="h-10 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 flex-shrink-0">
        <div className="text-[10px] text-[#8b949e]">
          Alerts <span className="text-[#e6edf3]">/ {selectedSite.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={detectNewAlerts}
            disabled={detecting || hasNewAlert}
            className={`px-3 py-1 rounded text-[9px] border transition-colors ${
              detecting
                ? 'bg-[#1c2128] border-[#30363d] text-[#484f58]'
                : hasNewAlert
                ? 'bg-[#1c2128] border-[#30363d] text-[#484f58] cursor-not-allowed'
                : 'bg-[#1c2128] border-[#30363d] text-[#8b949e] hover:text-[#e6edf3]'
            }`}
          >
            {detecting ? 'Scanning satellite...' : hasNewAlert ? 'Scan complete' : 'Detect new alerts'}
          </button>
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
            const style = severityStyles[alert.resolved ? 'resolved' : alert.severity]
            const reportKey = `${selectedSite.id}-${alert.id}`
            return (
              <div key={alert.id} className={`bg-[#161b22] border rounded-lg p-4 ${style.border} ${alert.id === 99 ? 'ring-1 ring-[#2ea043]' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] px-2 py-0.5 rounded font-medium ${style.badge}`}>
                      {alert.resolved ? 'RESOLVED' : style.label}
                    </span>
                    {alert.id === 99 && (
                      <span className="text-[8px] px-2 py-0.5 rounded bg-[#0d2a4a] text-[#58a6ff]">NEW</span>
                    )}
                    <div className="text-[12px] font-medium text-[#e6edf3]">{alert.title}</div>
                  </div>
                  <div className="text-[9px] text-[#484f58] flex-shrink-0 ml-4">{alert.days}</div>
                </div>

                <div className="text-[10px] text-[#8b949e] leading-relaxed mb-3">
                  {view === 'executive' ? alert.exec : alert.tech}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-2 flex-wrap">
                    {!alert.resolved ? (
                      <>
                        <button
                          onClick={() => markResolved(alert.id)}
                          className="bg-[#21262d] border border-[#30363d] rounded px-3 py-1 text-[9px] text-[#8b949e] hover:text-[#3fb950] hover:border-[#2ea043] transition-colors"
                        >
                          Mark as resolved
                        </button>
                        <button
                          onClick={() => navigate('/map')}
                          className="bg-[#21262d] border border-[#30363d] rounded px-3 py-1 text-[9px] text-[#8b949e] hover:text-[#58a6ff] hover:border-[#1f6feb] transition-colors"
                        >
                          View on map
                        </button>
                        <button
                          onClick={() => addToReport(alert.id)}
                          disabled={isAddedToReport(reportKey)}
                          className={`border rounded px-3 py-1 text-[9px] transition-colors ${
                            isAddedToReport(reportKey)
                              ? 'bg-[#1a3a1a] border-[#2ea043] text-[#3fb950] cursor-not-allowed'
                              : 'bg-[#1a3a1a] border-[#2ea043] text-[#3fb950] hover:bg-[#1f4d1f]'
                          }`}
                        >
                          {isAddedToReport(reportKey) ? 'Added to report' : 'Add to report'}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => unmarkResolved(alert.id)}
                        className="bg-[#21262d] border border-[#30363d] rounded px-3 py-1 text-[9px] text-[#8b949e] hover:text-[#e3b341] hover:border-[#d29922] transition-colors"
                      >
                        Reopen alert
                      </button>
                    )}
                  </div>
                  <div className="text-[9px] text-[#484f58]">Recommended action: {alert.action}</div>
                </div>

                {isAddedToReport(reportKey) && (
                  <div className="mt-2 pt-2 border-t border-[#30363d] flex items-center justify-between">
                    <div className="text-[8px] text-[#3fb950]">Added to next report</div>
                    <button
                      onClick={() => navigate('/report')}
                      className="text-[8px] text-[#58a6ff] hover:text-[#e6edf3] transition-colors"
                    >
                      Go to Generate report
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}