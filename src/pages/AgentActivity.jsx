import { useState, useEffect, useRef } from 'react'
import { useSite } from '../SiteContext'

const siteLogEntries = {
  'roy-hill': [
    { time: '09:14:01', agent: 'Watcher', color: 'text-[var(--green)]', message: 'Starting daily scan | Roy Hill | 847 zones loaded from GEE' },
    { time: '09:14:05', agent: 'Watcher', color: 'text-[var(--green)]', message: 'Sentinel-2 imagery fetched | Jun 18 2026 pass | cloud cover 4%' },
    { time: '09:14:09', agent: 'Watcher', color: 'text-[var(--green)]', message: 'Vegetation scores computed across all 847 zones | mean NDVI 0.41' },
    { time: '09:14:12', agent: 'Watcher', color: 'text-[var(--red)]', message: 'PROBLEM DETECTED: Zone C3 | vegetation dropped significantly in 30 days | escalating to Analyst' },
    { time: '09:14:13', agent: 'Watcher', color: 'text-[var(--red)]', message: 'PROBLEM DETECTED: Zone B2 | unusual plant growth pattern detected | escalating to Analyst' },
    { time: '09:14:14', agent: 'Analyst', color: 'text-[var(--amber)]', message: 'Received 2 flagged zones | searching knowledge base for historical context' },
    { time: '09:14:16', agent: 'Analyst', color: 'text-[var(--amber)]', message: 'Found: Zone C3 had similar events in 2021 and 2022, both caused by heavy rainfall' },
    { time: '09:14:19', agent: 'Analyst', color: 'text-[var(--amber)]', message: 'Conclusion: Zone C3 | rainfall erosion | recovery expected in 4 months | severity: HIGH' },
    { time: '09:14:22', agent: 'Analyst', color: 'text-[var(--amber)]', message: 'Found: Zone B2 spectral pattern matches buffel grass. WA Mining Act s.4.2 applies.' },
    { time: '09:14:24', agent: 'Analyst', color: 'text-[var(--amber)]', message: 'Conclusion: Zone B2 | likely weed encroachment | ground inspection required | severity: MEDIUM' },
    { time: '09:14:25', agent: 'Reporter', color: 'text-[var(--blue)]', message: 'Pushing 2 alerts to dashboard | recalculating bond release forecast' },
    { time: '09:14:27', agent: 'Reporter', color: 'text-[var(--blue)]', message: 'Composing alert email to site manager | plain English summary of both issues' },
    { time: '09:14:29', agent: 'Reporter', color: 'text-[var(--green)]', message: 'Email sent | dashboard updated | run complete | next run: tomorrow 09:14 AWST' },
  ],
  'cloudbreak': [
    { time: '09:14:01', agent: 'Watcher', color: 'text-[var(--green)]', message: 'Starting daily scan | Cloudbreak | 1,124 zones loaded from GEE' },
    { time: '09:14:06', agent: 'Watcher', color: 'text-[var(--green)]', message: 'Sentinel-2 imagery fetched | Jun 18 2026 pass | cloud cover 2%' },
    { time: '09:14:11', agent: 'Watcher', color: 'text-[var(--green)]', message: 'Vegetation scores computed across all 1,124 zones | mean NDVI 0.49' },
    { time: '09:14:14', agent: 'Watcher', color: 'text-[var(--green)]', message: 'No anomalies detected | all zones within expected seasonal range' },
    { time: '09:14:15', agent: 'Analyst', color: 'text-[var(--amber)]', message: 'Received 0 flagged zones | running routine health check' },
    { time: '09:14:18', agent: 'Analyst', color: 'text-[var(--green)]', message: 'Zone A1 confirmed above 0.35 threshold for 4th consecutive month | bond milestone verified' },
    { time: '09:14:20', agent: 'Analyst', color: 'text-[var(--green)]', message: 'Site trajectory: on track for Q1 2027 bond release at +6.1%/yr' },
    { time: '09:14:21', agent: 'Reporter', color: 'text-[var(--blue)]', message: 'Updating dashboard | no new alerts to push' },
    { time: '09:14:23', agent: 'Reporter', color: 'text-[var(--green)]', message: 'Weekly summary email sent to site manager | all clear | next run: tomorrow 09:14 AWST' },
  ],
  'brockman': [
    { time: '09:14:01', agent: 'Watcher', color: 'text-[var(--green)]', message: 'Starting daily scan | Brockman 4 | 623 zones loaded from GEE' },
    { time: '09:14:05', agent: 'Watcher', color: 'text-[var(--green)]', message: 'Sentinel-2 imagery fetched | Jun 18 2026 pass | cloud cover 8%' },
    { time: '09:14:09', agent: 'Watcher', color: 'text-[var(--green)]', message: 'Vegetation scores computed across all 623 zones | mean NDVI 0.31' },
    { time: '09:14:12', agent: 'Watcher', color: 'text-[var(--amber)]', message: 'SLOW RECOVERY: Zone D2 | velocity +2.1%/yr vs required 6%/yr | escalating to Analyst' },
    { time: '09:14:13', agent: 'Analyst', color: 'text-[var(--amber)]', message: 'Received 1 flagged zone | searching historical data for Zone D2' },
    { time: '09:14:16', agent: 'Analyst', color: 'text-[var(--amber)]', message: 'Found: Zone D2 below target since Jan 2021 | replanting programme initiated Aug 2023' },
    { time: '09:14:19', agent: 'Analyst', color: 'text-[var(--amber)]', message: 'Conclusion: Zone D2 | replanting showing slow uptake | soil treatment recommended | severity: MEDIUM' },
    { time: '09:14:21', agent: 'Analyst', color: 'text-[var(--amber)]', message: 'Projected bond release at current rate: Q1 2031, 2 years beyond target' },
    { time: '09:14:22', agent: 'Reporter', color: 'text-[var(--blue)]', message: 'Pushing 1 alert to dashboard | updating bond release forecast' },
    { time: '09:14:24', agent: 'Reporter', color: 'text-[var(--blue)]', message: 'Alert email sent to site manager and Rio Tinto rehabilitation team' },
    { time: '09:14:26', agent: 'Reporter', color: 'text-[var(--green)]', message: 'Run complete | next run: tomorrow 09:14 AWST' },
  ],
  'christmas-creek': [
    { time: '09:14:01', agent: 'Watcher', color: 'text-[var(--green)]', message: 'Starting daily scan | Christmas Creek | 891 zones loaded from GEE' },
    { time: '09:14:06', agent: 'Watcher', color: 'text-[var(--green)]', message: 'Sentinel-2 imagery fetched | Jun 18 2026 pass | cloud cover 11%' },
    { time: '09:14:11', agent: 'Watcher', color: 'text-[var(--green)]', message: 'Vegetation scores computed across all 891 zones | mean NDVI 0.21' },
    { time: '09:14:13', agent: 'Watcher', color: 'text-[var(--red)]', message: 'CRITICAL: Zone E1 | NDVI 0.08 | 5th consecutive month below threshold | escalating to Analyst' },
    { time: '09:14:14', agent: 'Watcher', color: 'text-[var(--red)]', message: 'PROBLEM DETECTED: Zone E3 | erosion spreading | area now 95ha vs 40ha last month | escalating to Analyst' },
    { time: '09:14:15', agent: 'Watcher', color: 'text-[var(--amber)]', message: 'PROBLEM DETECTED: Zone F2 | spectral anomaly consistent with weed encroachment | escalating to Analyst' },
    { time: '09:14:16', agent: 'Analyst', color: 'text-[var(--amber)]', message: 'Received 3 flagged zones | highest alert count for this site in 12 months' },
    { time: '09:14:19', agent: 'Analyst', color: 'text-[var(--red)]', message: 'Zone E1: NDVI 0.08 vs 0.35 threshold | projected milestone 2035+ | urgent intervention required' },
    { time: '09:14:22', agent: 'Analyst', color: 'text-[var(--red)]', message: 'Zone E3: erosion spreading at 55ha/month | rill formation confirmed | erosion control works urgent' },
    { time: '09:14:25', agent: 'Analyst', color: 'text-[var(--amber)]', message: 'Zone F2: spectral match 83% Cenchrus ciliaris | reportable under MCP s.4.2 | ground inspection required' },
    { time: '09:14:27', agent: 'Reporter', color: 'text-[var(--blue)]', message: 'Pushing 3 alerts to dashboard | flagging site as AT RISK' },
    { time: '09:14:29', agent: 'Reporter', color: 'text-[var(--blue)]', message: 'Urgent alert email sent to site manager, Fortescue rehabilitation team, and DMIRS contact' },
    { time: '09:14:31', agent: 'Reporter', color: 'text-[var(--red)]', message: 'ESCALATION: bond release risk flagged to executive team | $41M bond at risk of delay past 2030' },
    { time: '09:14:33', agent: 'Reporter', color: 'text-[var(--green)]', message: 'Run complete | next run: tomorrow 09:14 AWST' },
  ],
}

const siteAgentStats = {
  'roy-hill': { zones: '847', problems: '2', ndvi: '0.41', searches: '6', confidence: '84%', updates: '4', emails: '1' },
  'cloudbreak': { zones: '1,124', problems: '0', ndvi: '0.49', searches: '2', confidence: '96%', updates: '1', emails: '1' },
  'brockman': { zones: '623', problems: '1', ndvi: '0.31', searches: '4', confidence: '89%', updates: '2', emails: '1' },
  'christmas-creek': { zones: '891', problems: '3', ndvi: '0.21', searches: '9', confidence: '86%', updates: '5', emails: '3' },
}

export default function AgentActivity() {
  const { selectedSite } = useSite()
  const [running, setRunning] = useState(false)
  const [showLog, setShowLog] = useState(true)
  const [visibleEntries, setVisibleEntries] = useState([])
  const [isSimulating, setIsSimulating] = useState(false)
  const logRef = useRef(null)
  const timerRef = useRef(null)

  const allEntries = siteLogEntries[selectedSite.id] || siteLogEntries['roy-hill']
  const stats = siteAgentStats[selectedSite.id] || siteAgentStats['roy-hill']
  const problemColor = parseInt(stats.problems) === 0 ? 'text-[var(--green)]' : parseInt(stats.problems) >= 3 ? 'text-[var(--red)]' : 'text-[var(--amber)]'

  useEffect(() => {
    setVisibleEntries(allEntries)
    setRunning(false)
    setIsSimulating(false)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [selectedSite.id])

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight
  }, [visibleEntries])

  const runAgents = () => {
    if (isSimulating) return
    setRunning(true)
    setIsSimulating(true)
    setShowLog(true)
    setVisibleEntries([])
    allEntries.forEach((entry, i) => {
      timerRef.current = setTimeout(() => {
        setVisibleEntries(prev => [...prev, entry])
        if (i === allEntries.length - 1) setTimeout(() => { setRunning(false); setIsSimulating(false) }, 1000)
      }, i * 900)
    })
  }

  const agents = [
    {
      name: 'Watcher',
      border: 'border-[var(--green-border)]',
      dotColor: running ? 'bg-[var(--green)] animate-pulse' : 'bg-[var(--green)]',
      badgeClass: 'bg-[var(--green-bg)] text-[var(--green)]',
      status: running ? 'Running...' : 'Active',
      desc: `Checks the satellite data every day. Looks at vegetation levels across all ${stats.zones} zones at ${selectedSite.name} and flags anything that has changed unusually compared to the same time last year.`,
      stats: [
        { label: 'Zones checked today', value: running ? '...' : stats.zones },
        { label: 'Problems flagged', value: running ? '...' : stats.problems, valueColor: problemColor },
        { label: 'Mean NDVI score', value: running ? '...' : stats.ndvi },
      ],
      tools: ['Google Earth Engine', 'scikit-learn', 'Python'],
    },
    {
      name: 'Analyst',
      border: 'border-[var(--amber-border)]',
      dotColor: running ? 'bg-[var(--amber)] animate-pulse' : 'bg-[var(--amber)]',
      badgeClass: 'bg-[var(--amber-bg)] text-[var(--amber)]',
      status: running ? 'Running...' : 'Active',
      desc: 'Takes the problems flagged by the Watcher and works out what caused them. It searches through 5 years of historical data and WA mining regulations to explain what is happening and how serious it is.',
      stats: [
        { label: 'Problems analysed', value: running ? '...' : stats.problems },
        { label: 'Knowledge base searches', value: running ? '...' : stats.searches },
        { label: 'Average confidence', value: running ? '...' : stats.confidence, valueColor: 'text-[var(--amber)]' },
      ],
      tools: ['Claude AI', 'FAISS knowledge base', 'WA Mining Act'],
    },
    {
      name: 'Reporter',
      border: 'border-[var(--blue-border)]',
      dotColor: running ? 'bg-[var(--blue)] animate-pulse' : 'bg-[var(--blue)]',
      badgeClass: 'bg-[var(--blue-bg)] text-[var(--blue)]',
      status: running ? 'Running...' : 'Active',
      desc: 'Takes the findings and does three things: updates this dashboard with the new alerts, recalculates the bond release forecast, and sends an email to the site manager with a plain-English summary.',
      stats: [
        { label: 'Dashboard updates', value: running ? '...' : stats.updates },
        { label: 'Emails sent', value: running ? '...' : stats.emails },
        { label: 'Bond forecast', value: running ? '...' : 'Recalculated', valueColor: 'text-[var(--green)]' },
      ],
      tools: ['Claude AI', 'Email', 'React state'],
    },
  ]

  return (
    <div className="flex flex-col h-full">

      <div className="h-10 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center justify-between px-4 flex-shrink-0">
        <div className="text-[10px] text-[var(--text-secondary)]">
          Agent activity <span className="text-[var(--text-primary)]">/ {selectedSite.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[9px] text-[var(--text-muted)] bg-[var(--bg-tertiary)] border border-[var(--border)] rounded px-3 py-1">
            Last run: today 09:14 AWST | Next: tomorrow 09:14 AWST
          </div>
          <button
            onClick={runAgents}
            disabled={isSimulating}
            className={`border rounded px-3 py-1 text-[9px] transition-colors ${
              isSimulating
                ? 'bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-muted)] cursor-not-allowed'
                : 'bg-[var(--green-bg)] border-[var(--green-border)] text-[var(--green)] hover:opacity-80'
            }`}
          >
            {isSimulating ? 'Agents running...' : 'Run agents now'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">

        <div className="text-[10px] text-[var(--text-secondary)]">
          RehabTrack uses three AI agents that work together automatically every day. No one needs to trigger them. This page shows what they found at {selectedSite.name} during today's run. Click "Run agents now" to watch a live simulation.
        </div>

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
                {isSimulating ? 'Live run in progress...' : "Today's activity log"} | 09:14 AWST | {selectedSite.name}
              </div>
              {isSimulating && <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse"></div>}
            </div>
            <span className="text-[9px] text-[var(--text-muted)]">{showLog ? '▲ hide' : '▼ show'}</span>
          </div>

          {showLog && (
            <div ref={logRef} className="p-4 flex flex-col gap-1.5 font-mono max-h-64 overflow-auto bg-[var(--bg-primary)]">
              {visibleEntries.length === 0 && isSimulating && <div className="text-[9px] text-[var(--text-muted)]">Initialising agents...</div>}
              {visibleEntries.map((entry, i) => (
                <div key={i} className="flex gap-3 text-[9px]">
                  <span className="text-[var(--text-muted)] flex-shrink-0">{entry.time}</span>
                  <span className={`flex-shrink-0 font-medium ${entry.color}`}>[{entry.agent}]</span>
                  <span className="text-[var(--text-secondary)]">{entry.message}</span>
                </div>
              ))}
              {isSimulating && visibleEntries.length > 0 && (
                <div className="flex gap-3 text-[9px]">
                  <span className="text-[var(--text-muted)] flex-shrink-0">...</span>
                  <span className="text-[var(--text-muted)] animate-pulse">processing</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4">
          <div className="text-[10px] font-medium text-[var(--text-primary)] mb-3">How the agents work together</div>
          <div className="flex items-center gap-2">
            {[
              { name: 'Watcher', cls: 'bg-[var(--green-bg)] text-[var(--green)] border-[var(--green-border)]', desc: 'Scans satellite data | flags problems' },
              { arrow: true },
              { name: 'Analyst', cls: 'bg-[var(--amber-bg)] text-[var(--amber)] border-[var(--amber-border)]', desc: 'Explains problems | checks regulations' },
              { arrow: true },
              { name: 'Reporter', cls: 'bg-[var(--blue-bg)] text-[var(--blue)] border-[var(--blue-border)]', desc: 'Updates dashboard | emails manager' },
            ].map((item, i) => (
              item.arrow
                ? <div key={i} className="text-[var(--text-muted)] text-lg flex-shrink-0">→</div>
                : <div key={i} className={`flex-1 border rounded-lg px-3 py-2 text-center ${item.cls}`}>
                    <div className="text-[10px] font-medium mb-0.5">{item.name}</div>
                    <div className="text-[8px] opacity-80">{item.desc}</div>
                  </div>
            ))}
          </div>
          <div className="text-[9px] text-[var(--text-muted)] mt-3">
            The agents run automatically every day at 09:14 AWST. No one needs to trigger them. When a problem is found, the site manager receives an email within minutes.
          </div>
        </div>
      </div>
    </div>
  )
}