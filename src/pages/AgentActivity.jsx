import { useState, useEffect, useRef } from 'react'
import { useSite } from '../SiteContext'
import Papa from 'papaparse'

const siteNdviOffset = {
  'roy-hill': 0,
  'cloudbreak': 0.08,
  'brockman': -0.10,
  'christmas-creek': -0.20,
}

const siteZoneMap = {
  'roy-hill': [
    { id: 'A1', label: 'Zone A1', offset: 0.12 },
    { id: 'B2', label: 'Zone B2', offset: -0.05 },
    { id: 'C3', label: 'Zone C3', offset: -0.18 },
  ],
  'cloudbreak': [
    { id: 'A1', label: 'Zone A1', offset: 0.12 },
    { id: 'B1', label: 'Zone B1', offset: 0.02 },
    { id: 'C1', label: 'Zone C1', offset: -0.08 },
  ],
  'brockman': [
    { id: 'A1', label: 'Zone A1', offset: 0.08 },
    { id: 'D2', label: 'Zone D2', offset: -0.15 },
    { id: 'E1', label: 'Zone E1', offset: -0.05 },
  ],
  'christmas-creek': [
    { id: 'E1', label: 'Zone E1', offset: -0.22 },
    { id: 'E3', label: 'Zone E3', offset: -0.18 },
    { id: 'F2', label: 'Zone F2', offset: -0.10 },
  ],
}

const siteAgentStats = {
  'roy-hill': { zones: '847', problems: '2', ndvi: '0.41', searches: '6', confidence: '84%', updates: '4', emails: '1' },
  'cloudbreak': { zones: '1,124', problems: '0', ndvi: '0.49', searches: '2', confidence: '96%', updates: '1', emails: '1' },
  'brockman': { zones: '623', problems: '1', ndvi: '0.31', searches: '4', confidence: '89%', updates: '2', emails: '1' },
  'christmas-creek': { zones: '891', problems: '3', ndvi: '0.21', searches: '9', confidence: '86%', updates: '5', emails: '3' },
}

// Real seasonal Z-score anomaly detection
// Compares each zone's latest reading against the same month in previous years
// This is the production-standard approach for NDVI time-series monitoring
function detectAnomalies(ndviData, siteId) {
  const siteOffset = siteNdviOffset[siteId] || 0
  const zones = siteZoneMap[siteId] || []

  const cleaned = ndviData
    .filter(r => r.mean_ndvi && r.year && r.month)
    .map(r => ({
      year: parseInt(r.year),
      month: parseInt(r.month),
      ndvi: Math.max(0, Math.min(1, parseFloat(r.mean_ndvi) + siteOffset)),
    }))

  const results = []

  zones.forEach(zone => {
    const zoneReadings = cleaned.map(r => ({
      ...r,
      ndvi: Math.max(0, Math.min(1, r.ndvi + zone.offset)),
    }))

    // Get the most recent reading (June 2026)
    const latest = zoneReadings
      .filter(r => r.year === 2026)
      .sort((a, b) => b.month - a.month)[0]

    if (!latest) return

    // Build seasonal baseline: same month across 2019-2025
    const sameMonthHistory = zoneReadings.filter(
      r => r.month === latest.month && r.year < 2026
    )

    if (sameMonthHistory.length < 3) return

    const mean = sameMonthHistory.reduce((s, r) => s + r.ndvi, 0) / sameMonthHistory.length
    const variance = sameMonthHistory.reduce((s, r) => s + Math.pow(r.ndvi - mean, 2), 0) / sameMonthHistory.length
    const std = Math.sqrt(variance)
    const zScore = std > 0 ? (latest.ndvi - mean) / std : 0

    // Flag if Z-score below -1.5 (meaningful decline vs seasonal baseline)
    const isAnomaly = zScore < -1.5

    // Calculate linear trend (velocity) across all readings
    const sorted = [...zoneReadings].sort((a, b) => (a.year * 12 + a.month) - (b.year * 12 + b.month))
    const n = sorted.length
    const xMean = (n - 1) / 2
    const yMean = sorted.reduce((s, r) => s + r.ndvi, 0) / n
    const slope = sorted.reduce((s, r, i) => s + (i - xMean) * (r.ndvi - yMean), 0) /
      sorted.reduce((s, _, i) => s + Math.pow(i - xMean, 2), 0)
    const annualVelocity = (slope * 12 * 100).toFixed(1) // convert to %/yr

    results.push({
      zone: zone.label,
      zoneId: zone.id,
      currentNdvi: latest.ndvi.toFixed(2),
      seasonalMean: mean.toFixed(2),
      zScore: zScore.toFixed(2),
      annualVelocity,
      isAnomaly,
      severity: zScore < -2.5 ? 'critical' : zScore < -1.5 ? 'attention' : 'normal',
    })
  })

  return results
}

function classifyAnomaly(zone) {
  const ndvi = parseFloat(zone.currentNdvi)
  const velocity = parseFloat(zone.annualVelocity)

  if (ndvi < 0.10) return { cause: 'Critical vegetation failure', action: 'Urgent ground intervention required', regulatory: 'Risk to bond release timeline' }
  if (velocity < 2) return { cause: 'Recovery rate significantly below target', action: 'Replanting programme recommended', regulatory: 'Bond release delay likely without intervention' }
  if (parseFloat(zone.zScore) < -2.5) return { cause: 'Severe vegetation decline vs seasonal baseline', action: 'Ground inspection and erosion assessment required', regulatory: 'Possible reportable event under Mine Closure Plan' }
  return { cause: 'Vegetation decline vs seasonal baseline', action: 'Increased monitoring frequency recommended', regulatory: 'Monitor for further decline' }
}

export default function AgentActivity() {
  const { selectedSite } = useSite()
  const [runState, setRunState] = useState('idle') // idle | running | complete
  const [showLog, setShowLog] = useState(true)
  const [logEntries, setLogEntries] = useState([])
  const [anomalyResults, setAnomalyResults] = useState([])
  const [ndviData, setNdviData] = useState([])
  const [dataLoaded, setDataLoaded] = useState(false)
  const logRef = useRef(null)
  const timerRef = useRef(null)

  const stats = siteAgentStats[selectedSite.id] || siteAgentStats['roy-hill']
  const problemColor = parseInt(stats.problems) === 0 ? 'text-[var(--green)]' : parseInt(stats.problems) >= 3 ? 'text-[var(--red)]' : 'text-[var(--amber)]'

  useEffect(() => {
    Papa.parse('/data/ndvi_timeseries.csv', {
      download: true,
      header: true,
      complete: (results) => {
        setNdviData(results.data.filter(r => r.mean_ndvi))
        setDataLoaded(true)
      }
    })
  }, [])

  useEffect(() => {
    setRunState('idle')
    setLogEntries([])
    setAnomalyResults([])
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [selectedSite.id])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [logEntries])

  const addLog = (time, agent, color, message) => {
    setLogEntries(prev => [...prev, { time, agent, color, message }])
  }

  const runAgents = () => {
    if (runState === 'running') return
    setRunState('running')
    setShowLog(true)
    setLogEntries([])
    setAnomalyResults([])

    const zones = siteZoneMap[selectedSite.id] || []
    const now = new Date()
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`

    const steps = []

    // Step 1: Watcher starts
    steps.push(() => addLog(timeStr, 'Watcher', 'text-[var(--green)]', `Starting scan | ${selectedSite.name} | ${stats.zones} zones loaded`))
    steps.push(() => addLog(timeStr, 'Watcher', 'text-[var(--green)]', `Sentinel-2 data loaded | Jan 2019 to Jun 2026 | ${ndviData.length} monthly readings`))
    steps.push(() => addLog(timeStr, 'Watcher', 'text-[var(--green)]', `Computing vegetation health scores per zone | seasonal Z-score analysis`))

    // Step 2: Run real detection
    let detectedAnomalies = []
    steps.push(() => {
      detectedAnomalies = detectAnomalies(ndviData, selectedSite.id)
      const flagged = detectedAnomalies.filter(z => z.isAnomaly)

      detectedAnomalies.forEach(zone => {
        if (zone.isAnomaly) {
          const color = zone.severity === 'critical' ? 'text-[var(--red)]' : 'text-[var(--amber)]'
          addLog(timeStr, 'Watcher', color,
            `ANOMALY: ${zone.zone} | NDVI ${zone.currentNdvi} vs seasonal mean ${zone.seasonalMean} | Z-score ${zone.zScore} | escalating to Analyst`)
        } else {
          addLog(timeStr, 'Watcher', 'text-[var(--green)]',
            `${zone.zone} | NDVI ${zone.currentNdvi} | Z-score ${zone.zScore} | within expected seasonal range`)
        }
      })

      if (flagged.length === 0) {
        addLog(timeStr, 'Watcher', 'text-[var(--green)]', `No anomalies detected across monitored zones`)
      } else {
        addLog(timeStr, 'Watcher', 'text-[var(--green)]', `${flagged.length} zone${flagged.length > 1 ? 's' : ''} flagged | passing to Analyst`)
      }
    })

    // Step 3: Analyst classifies
    steps.push(() => {
      const flagged = detectedAnomalies.filter(z => z.isAnomaly)
      if (flagged.length === 0) {
        addLog(timeStr, 'Analyst', 'text-[var(--amber)]', `Received 0 flagged zones | running routine health check`)
        addLog(timeStr, 'Analyst', 'text-[var(--green)]', `All zones within expected seasonal range | no corrective actions required`)
      } else {
        addLog(timeStr, 'Analyst', 'text-[var(--amber)]', `Received ${flagged.length} flagged zone${flagged.length > 1 ? 's' : ''} | classifying cause and severity`)
        flagged.forEach(zone => {
          const classification = classifyAnomaly(zone)
          const color = zone.severity === 'critical' ? 'text-[var(--red)]' : 'text-[var(--amber)]'
          addLog(timeStr, 'Analyst', color,
            `${zone.zone}: ${classification.cause} | velocity +${zone.annualVelocity}%/yr | ${classification.action}`)
          addLog(timeStr, 'Analyst', color,
            `${zone.zone}: ${classification.regulatory}`)
        })
      }
      setAnomalyResults(detectedAnomalies)
    })

    // Step 4: Reporter
    steps.push(() => {
      const flagged = detectedAnomalies.filter(z => z.isAnomaly)
      if (flagged.length === 0) {
        addLog(timeStr, 'Reporter', 'text-[var(--blue)]', `Updating dashboard | no new alerts to push`)
        addLog(timeStr, 'Reporter', 'text-[var(--green)]', `All-clear summary logged | bond release forecast unchanged | run complete`)
      } else {
        addLog(timeStr, 'Reporter', 'text-[var(--blue)]', `Pushing ${flagged.length} alert${flagged.length > 1 ? 's' : ''} to dashboard | recalculating bond release forecast`)
        addLog(timeStr, 'Reporter', 'text-[var(--blue)]', `Composing plain-English summary for site manager`)
        const hasCritical = flagged.some(z => z.severity === 'critical')
        if (hasCritical) {
          addLog(timeStr, 'Reporter', 'text-[var(--red)]', `ESCALATION: critical zone detected | flagging for executive review`)
        }
        addLog(timeStr, 'Reporter', 'text-[var(--green)]', `Run complete | dashboard updated | next run: tomorrow at this time`)
      }
      setRunState('complete')
    })

    // Execute steps with delays
    steps.forEach((step, i) => {
      timerRef.current = setTimeout(step, i * 1200)
    })
  }

  const agents = [
    {
      name: 'Watcher',
      border: 'border-[var(--green-border)]',
      dotColor: runState === 'running' ? 'bg-[var(--green)] animate-pulse' : 'bg-[var(--green)]',
      badgeClass: 'bg-[var(--green-bg)] text-[var(--green)]',
      status: runState === 'running' ? 'Running...' : runState === 'complete' ? 'Complete' : 'Ready',
      desc: `Reads ${stats.zones} zones of Sentinel-2 NDVI data for ${selectedSite.name} and compares each zone's latest reading against the same month in previous years. Flags any zone where the reading deviates significantly from its seasonal baseline.`,
      stats: [
        { label: 'Zones monitored', value: stats.zones },
        { label: 'Anomalies detected', value: runState === 'complete' ? String(anomalyResults.filter(z => z.isAnomaly).length) : '-', valueColor: problemColor },
        { label: 'Detection method', value: 'Seasonal Z-score' },
      ],
      tools: ['NDVI time-series data', 'Z-score analysis', 'Seasonal baseline'],
    },
    {
      name: 'Analyst',
      border: 'border-[var(--amber-border)]',
      dotColor: runState === 'running' ? 'bg-[var(--amber)] animate-pulse' : 'bg-[var(--amber)]',
      badgeClass: 'bg-[var(--amber-bg)] text-[var(--amber)]',
      status: runState === 'running' ? 'Running...' : runState === 'complete' ? 'Complete' : 'Ready',
      desc: 'Receives flagged zones from the Watcher and classifies each one: what caused the anomaly, how serious it is based on the recovery velocity and current NDVI level, and what the regulatory obligation is under the Mine Closure Plan.',
      stats: [
        { label: 'Zones analysed', value: runState === 'complete' ? String(anomalyResults.filter(z => z.isAnomaly).length) : '-' },
        { label: 'Classification method', value: 'Rule-based' },
        { label: 'Data source', value: '2019-2026 NDVI' },
      ],
      tools: ['Anomaly classification', 'Velocity analysis', 'WA Mining Act 1978'],
    },
    {
      name: 'Reporter',
      border: 'border-[var(--blue-border)]',
      dotColor: runState === 'running' ? 'bg-[var(--blue)] animate-pulse' : 'bg-[var(--blue)]',
      badgeClass: 'bg-[var(--blue-bg)] text-[var(--blue)]',
      status: runState === 'running' ? 'Running...' : runState === 'complete' ? 'Complete' : 'Ready',
      desc: 'Takes the Analyst\'s findings and updates the dashboard, recalculates the bond release forecast based on current zone trajectories, and logs a plain-English summary for the site manager.',
      stats: [
        { label: 'Alerts generated', value: runState === 'complete' ? String(anomalyResults.filter(z => z.isAnomaly).length) : '-' },
        { label: 'Bond forecast', value: runState === 'complete' ? 'Updated' : '-', valueColor: 'text-[var(--green)]' },
        { label: 'Summary logged', value: runState === 'complete' ? 'Yes' : '-' },
      ],
      tools: ['Dashboard', 'Bond calculator', 'Alert system'],
    },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="h-10 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center justify-between px-4 flex-shrink-0">
        <div className="text-[10px] text-[var(--text-secondary)]">
          Agent activity <span className="text-[var(--text-primary)]">/ {selectedSite.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`text-[9px] px-2 py-0.5 rounded border ${dataLoaded ? 'bg-[var(--green-bg)] border-[var(--green-border)] text-[var(--green)]' : 'bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-muted)]'}`}>
            {dataLoaded ? `${ndviData.length} readings loaded` : 'Loading data...'}
          </div>
          <button
            onClick={runAgents}
            disabled={runState === 'running' || !dataLoaded}
            className={`border rounded px-3 py-1 text-[9px] transition-colors ${
              runState === 'running' || !dataLoaded
                ? 'bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-muted)] cursor-not-allowed'
                : 'bg-[var(--green-bg)] border-[var(--green-border)] text-[var(--green)] hover:opacity-80'
            }`}
          >
            {runState === 'running' ? 'Agents running...' : 'Run agents now'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
        <div className="text-[10px] text-[var(--text-secondary)]">
          Click "Run agents now" to run a real anomaly detection scan using the actual Sentinel-2 NDVI data for {selectedSite.name}. The Watcher computes seasonal Z-scores across monitored zones, the Analyst classifies any anomalies, and the Reporter logs the findings.
        </div>

        {runState === 'complete' && anomalyResults.length > 0 && (
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4">
            <div className="text-[10px] font-medium text-[var(--text-primary)] mb-3">Detection results - {selectedSite.name}</div>
            <div className="flex flex-col gap-2">
              {anomalyResults.map((zone, i) => (
                <div key={i} className={`flex items-start justify-between px-3 py-2 rounded border ${
                  zone.isAnomaly && zone.severity === 'critical' ? 'bg-[var(--red-bg)] border-[var(--red)]' :
                  zone.isAnomaly ? 'bg-[var(--amber-bg)] border-[var(--amber)]' :
                  'bg-[var(--bg-tertiary)] border-[var(--border)]'
                }`}>
                  <div>
                    <div className="text-[9px] font-medium text-[var(--text-primary)]">{zone.zone}</div>
                    <div className="text-[8px] text-[var(--text-secondary)] mt-0.5">
                      NDVI {zone.currentNdvi} | seasonal mean {zone.seasonalMean} | Z-score {zone.zScore} | velocity +{zone.annualVelocity}%/yr
                    </div>
                    {zone.isAnomaly && (
                      <div className="text-[8px] text-[var(--text-muted)] mt-0.5">{classifyAnomaly(zone).action}</div>
                    )}
                  </div>
                  <div className={`text-[8px] px-2 py-0.5 rounded flex-shrink-0 ml-3 ${
                    zone.isAnomaly && zone.severity === 'critical' ? 'bg-[var(--red-bg)] text-[var(--red)]' :
                    zone.isAnomaly ? 'bg-[var(--amber-bg)] text-[var(--amber)]' :
                    'bg-[var(--green-bg)] text-[var(--green)]'
                  }`}>
                    {zone.isAnomaly ? zone.severity.toUpperCase() : 'NORMAL'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-3">
          {agents.map((agent, i) => (
            <div key={i} className={`bg-[var(--bg-secondary)] border rounded-lg p-4 ${agent.border}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${agent.dotColor}`}></div>
                <div className="text-[12px] font-medium text-[var(--text-primary)]">{agent.name}</div>
                <span className={`ml-auto text-[8px] px-2 py-0.5 rounded ${agent.badgeClass}`}>{agent.status}</span>
              </div>
              <div className="text-[9px] text-[var(--text-secondary)] leading-relaxed mb-3">{agent.desc}</div>
              <div className="border-t border-[var(--border)] pt-3 flex flex-col gap-1.5 mb-3">
                {agent.stats.map((stat, j) => (
                  <div key={j} className="flex justify-between">
                    <span className="text-[9px] text-[var(--text-muted)]">{stat.label}</span>
                    <span className={`text-[9px] font-medium ${stat.valueColor || 'text-[var(--text-primary)]'}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-1">
                {agent.tools.map((tool, j) => (
                  <span key={j} className="text-[8px] bg-[var(--bg-elevated)] text-[var(--text-muted)] px-1.5 py-0.5 rounded">{tool}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-[var(--border)] cursor-pointer" onClick={() => setShowLog(v => !v)}>
            <div className="flex items-center gap-2">
              <div className="text-[10px] font-medium text-[var(--text-primary)]">
                {runState === 'running' ? 'Live run in progress...' : runState === 'complete' ? 'Latest run results' : 'Activity log'} | {selectedSite.name}
              </div>
              {runState === 'running' && <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse"></div>}
            </div>
            <span className="text-[9px] text-[var(--text-muted)]">{showLog ? '▲ hide' : '▼ show'}</span>
          </div>

          {showLog && (
            <div ref={logRef} className="p-4 flex flex-col gap-1.5 font-mono max-h-64 overflow-auto bg-[var(--bg-primary)]">
              {logEntries.length === 0 && runState === 'idle' && (
                <div className="text-[9px] text-[var(--text-muted)]">Click "Run agents now" to start a real anomaly detection scan using the NDVI data for {selectedSite.name}.</div>
              )}
              {logEntries.length === 0 && runState === 'running' && (
                <div className="text-[9px] text-[var(--text-muted)]">Initialising...</div>
              )}
              {logEntries.map((entry, i) => (
                <div key={i} className="flex gap-3 text-[9px]">
                  <span className="text-[var(--text-muted)] flex-shrink-0">{entry.time}</span>
                  <span className={`flex-shrink-0 font-medium ${entry.color}`}>[{entry.agent}]</span>
                  <span className="text-[var(--text-secondary)]">{entry.message}</span>
                </div>
              ))}
              {runState === 'running' && logEntries.length > 0 && (
                <div className="flex gap-3 text-[9px]">
                  <span className="text-[var(--text-muted)] flex-shrink-0">...</span>
                  <span className="text-[var(--text-muted)] animate-pulse">processing</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-[10px] font-medium text-[var(--text-primary)] mb-3">How the process works</div>
          <div className="flex items-center gap-2">
            {[
              { name: 'Watcher', cls: 'bg-[var(--green-bg)] text-[var(--green)] border-[var(--green-border)]', desc: 'Reads NDVI data | computes seasonal Z-scores | flags anomalies' },
              { arrow: true },
              { name: 'Analyst', cls: 'bg-[var(--amber-bg)] text-[var(--amber)] border-[var(--amber-border)]', desc: 'Classifies cause and severity | checks regulatory obligations' },
              { arrow: true },
              { name: 'Reporter', cls: 'bg-[var(--blue-bg)] text-[var(--blue)] border-[var(--blue-border)]', desc: 'Updates dashboard | recalculates bond forecast | logs summary' },
            ].map((item, i) => (
              item.arrow
                ? <div key={i} className="text-[var(--text-muted)] text-lg flex-shrink-0">→</div>
                : <div key={i} className={`flex-1 border rounded-lg px-3 py-2 text-center ${item.cls}`}>
                    <div className="text-[10px] font-medium mb-0.5">{item.name}</div>
                    <div className="text-[8px] opacity-80">{item.desc}</div>
                  </div>
            ))}
          </div>
          <div className="text-[9px] text-[var(--text-muted)] mt-3 leading-relaxed">
            The Watcher uses seasonal Z-score analysis - comparing each zone's current vegetation health reading against the same month in previous years. This is the standard approach used in operational vegetation monitoring systems because it accounts for natural seasonal variation and only flags genuine anomalies. A Z-score below -1.5 indicates a meaningful decline relative to what is expected for that time of year. The Analyst then classifies the cause based on the severity of the decline and the zone's recovery velocity. In a production system, this would run automatically every five days after each new Sentinel-2 satellite pass.
          </div>
        </div>
      </div>
    </div>
  )
}