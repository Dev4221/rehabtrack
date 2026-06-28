import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSite } from '../SiteContext'

const allAlerts = {
  'roy-hill': [
    {
      id: 1, severity: 'urgent', zone: 'Zone C3',
      title: 'Southern section - vegetation loss detected', area: '14 hectares',
      exec: '14 hectares in the southern section have lost significant vegetation cover over the past 30 days. Based on rainfall records and the history of this area, this is most likely surface erosion from last week\'s heavy rainfall. The vegetation should recover naturally within 3 to 4 months. Weekly satellite monitoring is recommended to confirm recovery is underway and to catch any further spread before it becomes a compliance issue.',
      tech: [
        'NDVI: 0.30 to 0.12 over 30 days',
        'Z-score: -2.8 from seasonal baseline',
        'Classifier: bare/disturbed (confidence 91%)',
        'Cause: likely surface erosion from rainfall event',
        'Recommended action: weekly Sentinel-2 monitoring',
      ],
      action: 'Weekly satellite monitoring - no site visit required at this stage',
      days: '2 days ago', resolved: false,
    },
    {
      id: 2, severity: 'attention', zone: 'Zone B2',
      title: 'Western section - possible weed growth', area: '8 hectares',
      exec: '8 hectares in the western section show a vegetation pattern inconsistent with the native plants expected in a rehabilitated Pilbara environment. The satellite signature is consistent with buffel grass, a declared invasive weed under WA law. If confirmed by a ground inspection, this becomes a reportable event under the Mine Closure Plan and must be treated before bond release verification can proceed. A ground inspection by an accredited environmental consultant is recommended within two weeks.',
      tech: [
        'Band 4/Band 8 ratio inconsistent with native Pilbara regrowth',
        'Possible Cenchrus ciliaris (buffel grass)',
        'Confidence: 78%',
        'Reportable under Mine Closure Plan s.4.2 if confirmed',
        'Recommended action: ground inspection within 2 weeks',
      ],
      action: 'Ground inspection by accredited environmental consultant within 2 weeks - estimated cost $5,000 to $15,000',
      days: '5 days ago', resolved: false,
    },
    {
      id: 3, severity: 'resolved', zone: 'Zone A1',
      title: 'Northern section - recovery milestone reached', area: '420 hectares',
      exec: 'The northern section has reached the government\'s vegetation threshold. This section of the site is verified as recovered. Bond release for this area has been flagged for DEMIRS verification.',
      tech: [
        'NDVI mean: 0.61, sustained above 0.35 threshold for 3 consecutive months',
        'Classifier: rehabilitating (confidence 96%)',
        'Bond milestone confirmed and flagged for DEMIRS verification',
      ],
      action: 'Verified - awaiting DEMIRS confirmation',
      days: '12 days ago', resolved: true,
    },
  ],
  'cloudbreak': [
    {
      id: 1, severity: 'resolved', zone: 'Zone A1',
      title: 'Northern section - recovery milestone reached', area: '520 hectares',
      exec: 'The northern section has reached the government\'s vegetation threshold and is verified as recovered. Bond release for this area has been flagged for DEMIRS verification.',
      tech: [
        'NDVI mean: 0.58, sustained above 0.35 threshold for 4 consecutive months',
        'Classifier: rehabilitating (confidence 94%)',
        'Bond milestone confirmed and flagged for DEMIRS verification',
      ],
      action: 'Verified - awaiting DEMIRS confirmation',
      days: '3 days ago', resolved: true,
    },
  ],
  'brockman': [
    {
      id: 1, severity: 'attention', zone: 'Zone D2',
      title: 'Eastern section - recovery rate below target', area: '180 hectares',
      exec: '180 hectares in the eastern section are recovering at less than half the required annual rate. At this pace, the bond release target for this zone will be missed by 18 months, pushing the $35M bond release from Q1 2029 to mid-2030 at the earliest. A targeted replanting programme before the next wet season is the recommended course of action. Without intervention, the delay will compound as each wet season passes without adequate ground cover.',
      tech: [
        'NDVI velocity: +2.1%/yr vs 6% regulatory target',
        'Linear regression R2: 0.89',
        'Projected milestone: Q3 2031 vs target Q1 2029',
        'Recommended action: replanting programme before wet season',
      ],
      action: 'Replanting programme before next wet season - estimated cost $400,000 to $800,000',
      days: '1 week ago', resolved: false,
    },
  ],
  'christmas-creek': [
    {
      id: 1, severity: 'urgent', zone: 'Zone E1',
      title: 'Northern section - critical vegetation loss', area: '240 hectares',
      exec: '240 hectares in the northern section have shown almost no vegetation recovery since 2022. At the current rate, this zone will not meet the government\'s threshold until 2035, five years past the bond release target. Every year of delay costs approximately $2 million in financing on the $41M bond. A full ground intervention programme is required immediately. This is the single highest-priority issue on this site.',
      tech: [
        'NDVI mean: 0.08, well below 0.15 early regrowth threshold',
        'Annual velocity: +1.2%/yr',
        'Z-score vs site average: -3.4',
        'Projected milestone: 2035+',
        'Recommended action: urgent ground intervention programme',
      ],
      action: 'Urgent ground intervention programme - engage specialist rehabilitation contractor immediately',
      days: '2 days ago', resolved: false,
    },
    {
      id: 2, severity: 'urgent', zone: 'Zone E3',
      title: 'Central section - erosion spreading', area: '95 hectares',
      exec: 'Erosion from last month\'s heavy rainfall has spread from 40 hectares to 95 hectares and is continuing to expand. Areas where vegetation had begun to establish are now bare soil. Without erosion control works this dry season, the damage could set the site back 2 to 3 years and materially worsen the bond release outlook. Rock check dams and revegetation works on the affected slopes are required as a matter of urgency.',
      tech: [
        'NDVI: 0.22 to 0.09 over 45 days',
        'Spatial spread: 40ha to 95ha',
        'Z-score: -3.1',
        'Pattern consistent with rill formation on waste dump slopes',
        'Recommended action: erosion control works, immediate',
      ],
      action: 'Erosion control works this dry season - estimated cost $200,000 to $500,000',
      days: '4 days ago', resolved: false,
    },
    {
      id: 3, severity: 'attention', zone: 'Zone F2',
      title: 'Southern section - weed encroachment', area: '62 hectares',
      exec: '62 hectares show signs of buffel grass spreading from the unsealed haul road boundary. This is a reportable event under the Mine Closure Plan and must be formally notified to DEMIRS. Bond release verification cannot proceed for this area until the weed is treated and cleared. Treatment should be prioritised ahead of the next growing season to prevent further spread.',
      tech: [
        'Band ratio: 0.71 vs 0.52 native baseline',
        'Cenchrus ciliaris spectral match: 83%',
        'Reportable under Mine Closure Plan s.4.2',
        'Treatment required prior to bond verification',
      ],
      action: 'Weed treatment and DEMIRS notification required - estimated cost $80,000 to $150,000',
      days: '6 days ago', resolved: false,
    },
  ],
}

const newAlertTemplates = {
  'roy-hill': {
    id: 99, severity: 'attention', zone: 'Zone B3',
    title: 'Northern boundary - unusual vegetation pattern', area: '12 hectares',
    exec: '12 hectares near the northern boundary show a new vegetation pattern detected in today\'s satellite pass. It may be early-stage weed encroachment or an artefact from recent rainfall. A ground check is recommended within the next 2 weeks to confirm which it is before the pattern spreads further.',
    tech: [
      'Band 4/Band 8 ratio: 0.68 vs 0.51 baseline',
      'Z-score: -1.9',
      'Confidence: 64%',
      'Possible early Cenchrus ciliaris',
      'Recommended action: ground validation within 2 weeks',
    ],
    action: 'Ground check within 2 weeks - estimated cost $3,000 to $8,000',
    days: 'Just now', resolved: false,
  },
  'cloudbreak': {
    id: 99, severity: 'attention', zone: 'Zone C1',
    title: 'Western section - vegetation density drop', area: '22 hectares',
    exec: '22 hectares in the western section show a slight reduction in vegetation density compared to last month. This is within the normal seasonal range but warrants monitoring over the next two satellite passes to confirm it is not an early erosion signal.',
    tech: [
      'NDVI delta: -0.04 over 30 days',
      'Z-score: -1.6, within 2-sigma seasonal range',
      'Flagged for trend monitoring',
      'Next pass: 5 days',
    ],
    action: 'Monitor next two satellite passes - no action required at this stage',
    days: 'Just now', resolved: false,
  },
  'brockman': {
    id: 99, severity: 'urgent', zone: 'Zone D2',
    title: 'Eastern section - recovery rate declining further', area: '180 hectares',
    exec: 'The latest satellite pass shows the eastern section\'s recovery rate has dropped from +2.1% to +1.8% per year. The replanting programme does not appear to be taking hold. Immediate review of the programme is recommended before the next wet season, as each season without ground cover will compound the delay.',
    tech: [
      'NDVI velocity: +1.8%/yr (previously +2.1%/yr)',
      'Replanting survival rate estimated at 34%',
      'Projected milestone: Q2 2032',
      'Recommended action: immediate programme review and soil assessment',
    ],
    action: 'Immediate programme review and soil assessment - engage rehabilitation specialist',
    days: 'Just now', resolved: false,
  },
  'christmas-creek': {
    id: 99, severity: 'urgent', zone: 'Zone G1',
    title: 'North-western section - new erosion event', area: '38 hectares',
    exec: '38 hectares in the north-western section show fresh erosion damage from last week\'s rainfall event. This is a newly affected area not previously flagged. Given the site\'s existing problems, this additional setback makes the 2030 bond release target even less likely without a significant intervention programme.',
    tech: [
      'NDVI: 0.19 to 0.07 over 14 days',
      'Z-score: -3.8',
      'Rill erosion pattern confirmed',
      'New affected area, not previously in alert system',
      'Recommended action: immediate site inspection',
    ],
    action: 'Emergency site inspection and erosion assessment - arrange within 48 hours',
    days: 'Just now', resolved: false,
  },
}

const severityStyles = {
  urgent: { border: 'border-[var(--red)]', badge: 'bg-[var(--red-bg)] text-[var(--red)]', label: 'URGENT' },
  attention: { border: 'border-[var(--amber)]', badge: 'bg-[var(--amber-bg)] text-[var(--amber)]', label: 'NEEDS ATTENTION' },
  resolved: { border: 'border-[var(--green-border)]', badge: 'bg-[var(--green-bg)] text-[var(--green)]', label: 'RESOLVED' },
}

export default function Alerts() {
  const { selectedSite, addAlertToReport, reportAlerts } = useSite()
  const navigate = useNavigate()
  const [view, setView] = useState('executive')
  const [filter, setFilter] = useState('all')
  const [resolvedIds, setResolvedIds] = useState([])
  const [unresolvedIds, setUnresolvedIds] = useState([])
  const [hasNewAlert, setHasNewAlert] = useState(false)
  const [detecting, setDetecting] = useState(false)

  const isAnalyst = view === 'analyst'
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

  const detectNewAlerts = () => {
    setDetecting(true)
    setTimeout(() => { setHasNewAlert(true); setDetecting(false) }, 2500)
  }

  const isAddedToReport = (id) => reportAlerts.some(a => a.key === `${selectedSite.id}-${id}`)

  return (
    <div className="flex flex-col h-full">
      <div className="h-10 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center justify-between px-4 flex-shrink-0">
        <div className="text-[10px] text-[var(--text-secondary)]">
          Alerts <span className="text-[var(--text-primary)]">/ {selectedSite.name}</span>
        </div>
        <div className="flex items-center gap-2">
          {reportAlerts.length > 0 && (
            <button onClick={() => navigate('/report')} className="bg-[var(--blue-bg)] border border-[var(--blue-border)] rounded px-3 py-1 text-[9px] text-[var(--blue)]">
              {reportAlerts.length} alert{reportAlerts.length > 1 ? 's' : ''} queued for report
            </button>
          )}
          <button
            onClick={detectNewAlerts}
            disabled={detecting || hasNewAlert}
            className={`px-3 py-1 rounded text-[9px] border transition-colors ${
              detecting || hasNewAlert
                ? 'bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-muted)] cursor-not-allowed'
                : 'bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            {detecting ? 'Scanning satellite...' : hasNewAlert ? 'Scan complete' : 'Detect new alerts'}
          </button>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-full p-0.5 flex gap-0.5">
            <button onClick={() => setView('executive')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${!isAnalyst ? 'bg-[var(--green-bg)] text-[var(--green)]' : 'text-[var(--text-muted)]'}`}>Executive</button>
            <button onClick={() => setView('analyst')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${isAnalyst ? 'bg-[var(--green-bg)] text-[var(--green)]' : 'text-[var(--text-muted)]'}`}>Analyst</button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="mb-4">
          <div className="text-[13px] font-medium text-[var(--text-primary)] mb-1">
            {isAnalyst ? 'AI anomaly alerts' : 'Areas that need attention'}
          </div>
          <div className="text-[10px] text-[var(--text-secondary)]">
            {isAnalyst
              ? 'Anomaly detection via Z-score analysis against a 5-year seasonal baseline. Alerts are generated by the Watcher agent and validated by the Analyst agent using the Claude API.'
              : 'These alerts are generated automatically by AI agents that scan the satellite data every day. Each alert explains what was detected, what it means for the bond, and what action is recommended.'}
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          {[
            { key: 'all', label: `All alerts (${siteAlerts.length})` },
            { key: 'open', label: `Open (${siteAlerts.filter(a => !a.resolved).length})` },
            { key: 'resolved', label: `Resolved (${siteAlerts.filter(a => a.resolved).length})` },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded text-[10px] border transition-colors ${
                filter === f.key
                  ? 'bg-[var(--green-bg)] border-[var(--green-border)] text-[var(--green)]'
                  : 'bg-[var(--bg-secondary)] border-[var(--border)] text-[var(--text-secondary)]'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-[var(--text-muted)] text-[10px]">
            No alerts in this category for {selectedSite.name}. The AI agents will notify you if anything changes.
          </div>
        )}

        <div className="flex flex-col gap-3">
          {filtered.map(alert => {
            const style = severityStyles[alert.resolved ? 'resolved' : alert.severity]
            const added = isAddedToReport(alert.id)
            return (
              <div key={alert.id} className={`bg-[var(--bg-secondary)] border rounded-lg p-4 ${style.border} ${alert.id === 99 ? 'ring-1 ring-[var(--green-border)]' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] px-2 py-0.5 rounded font-medium ${style.badge}`}>
                      {alert.resolved ? 'RESOLVED' : style.label}
                    </span>
                    {alert.id === 99 && (
                      <span className="text-[8px] px-2 py-0.5 rounded bg-[var(--blue-bg)] text-[var(--blue)]">NEW</span>
                    )}
                    <div className="text-[12px] font-medium text-[var(--text-primary)]">{alert.title}</div>
                  </div>
                  <div className="text-[9px] text-[var(--text-muted)] flex-shrink-0 ml-4">{alert.days}</div>
                </div>

                {isAnalyst ? (
                  <ul className="mb-3 flex flex-col gap-1">
                    {(Array.isArray(alert.tech) ? alert.tech : [alert.tech]).map((point, i) => (
                      <li key={i} className="flex gap-2 text-[9px] text-[var(--text-secondary)]">
                        <span className="text-[var(--green)] flex-shrink-0 mt-0.5">-</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-[10px] text-[var(--text-secondary)] leading-relaxed mb-3">
                    {alert.exec}
                  </div>
                )}

                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-2 flex-wrap">
                    {!alert.resolved ? (
                      <>
                        <button onClick={() => markResolved(alert.id)}
                          className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-3 py-1 text-[9px] text-[var(--text-secondary)] hover:text-[var(--green)] hover:border-[var(--green-border)] transition-colors">
                          Mark as resolved
                        </button>
                        <button onClick={() => navigate('/map')}
                          className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-3 py-1 text-[9px] text-[var(--text-secondary)] hover:text-[var(--blue)] hover:border-[var(--blue-border)] transition-colors">
                          View on map
                        </button>
                        <button onClick={() => addAlertToReport(alert, selectedSite.name)} disabled={added}
                          className={`border rounded px-3 py-1 text-[9px] transition-colors ${
                            added
                              ? 'bg-[var(--green-bg)] border-[var(--green-border)] text-[var(--green)] cursor-not-allowed'
                              : 'bg-[var(--green-bg)] border-[var(--green-border)] text-[var(--green)] hover:opacity-80'
                          }`}>
                          {added ? 'Added to report' : 'Add to report'}
                        </button>
                      </>
                    ) : (
                      <button onClick={() => unmarkResolved(alert.id)}
                        className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-3 py-1 text-[9px] text-[var(--text-secondary)] hover:text-[var(--amber)] hover:border-[var(--amber-border)] transition-colors">
                        Reopen alert
                      </button>
                    )}
                  </div>
                  <div className="text-[9px] text-[var(--text-muted)] text-right flex-shrink-0 max-w-[240px] leading-relaxed">
                    {alert.action}
                  </div>
                </div>

                {added && (
                  <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-center justify-between">
                    <div className="text-[8px] text-[var(--green)]">Added to next report</div>
                    <button onClick={() => navigate('/report')} className="text-[8px] text-[var(--blue)] hover:text-[var(--text-primary)] transition-colors">
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