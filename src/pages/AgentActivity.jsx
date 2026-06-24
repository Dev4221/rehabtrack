import { useState } from 'react'

const logEntries = [
  { time: '09:14:01', agent: 'Watcher', color: 'text-[#3fb950]', message: 'Starting daily scan — Roy Hill · 847 zones loaded from GEE' },
  { time: '09:14:05', agent: 'Watcher', color: 'text-[#3fb950]', message: 'Sentinel-2 imagery fetched — Jun 18 2026 pass · cloud cover 4%' },
  { time: '09:14:09', agent: 'Watcher', color: 'text-[#3fb950]', message: 'Vegetation scores computed across all 847 zones · mean score 0.41' },
  { time: '09:14:12', agent: 'Watcher', color: 'text-[#f85149]', message: 'PROBLEM DETECTED: Zone C3 — vegetation dropped significantly in 30 days → escalating to Analyst' },
  { time: '09:14:13', agent: 'Watcher', color: 'text-[#f85149]', message: 'PROBLEM DETECTED: Zone B2 — unusual plant growth pattern detected → escalating to Analyst' },
  { time: '09:14:14', agent: 'Analyst', color: 'text-[#e3b341]', message: 'Received 2 flagged zones · searching knowledge base for historical context' },
  { time: '09:14:16', agent: 'Analyst', color: 'text-[#e3b341]', message: 'Found: Zone C3 had similar events in 2021 and 2022 — both caused by heavy rainfall' },
  { time: '09:14:19', agent: 'Analyst', color: 'text-[#e3b341]', message: 'AI conclusion: Zone C3 — rainfall erosion. Recovery expected in 4 months. Severity: HIGH' },
  { time: '09:14:22', agent: 'Analyst', color: 'text-[#e3b341]', message: 'Found: Zone B2 spectral pattern matches buffel grass (invasive weed). WA Mining Act s.4.2 applies.' },
  { time: '09:14:24', agent: 'Analyst', color: 'text-[#e3b341]', message: 'AI conclusion: Zone B2 — likely weed encroachment. Ground inspection required. Severity: MEDIUM' },
  { time: '09:14:25', agent: 'Reporter', color: 'text-[#58a6ff]', message: 'Pushing 2 alerts to dashboard · recalculating bond release forecast' },
  { time: '09:14:27', agent: 'Reporter', color: 'text-[#58a6ff]', message: 'Composing alert email to site manager — plain English summary of both issues' },
  { time: '09:14:29', agent: 'Reporter', color: 'text-[#3fb950]', message: 'Email sent ✓ · Dashboard updated ✓ · Run complete · Next run: tomorrow 09:14 AWST' },
]

const agents = [
  {
    name: 'Watcher',
    color: 'border-[#2ea043]',
    dotColor: 'bg-[#3fb950]',
    badgeColor: 'bg-[#1a3a1a] text-[#3fb950]',
    status: 'Active',
    desc: 'Checks the satellite data every day. Looks at vegetation levels across all 847 zones and flags anything that has changed unusually compared to the same time last year.',
    stats: [
      { label: 'Zones checked today', value: '847' },
      { label: 'Problems flagged', value: '2', valueColor: 'text-[#f85149]' },
      { label: 'Time taken', value: '14 seconds' },
    ],
    tools: ['Google Earth Engine', 'scikit-learn', 'Python'],
  },
  {
    name: 'Analyst',
    color: 'border-[#d29922]',
    dotColor: 'bg-[#e3b341]',
    badgeColor: 'bg-[#2d2000] text-[#e3b341]',
    status: 'Active',
    desc: 'Takes the problems flagged by the Watcher and works out what caused them. It searches through 5 years of historical data and WA mining regulations to explain what is happening and how serious it is.',
    stats: [
      { label: 'Problems analysed', value: '2' },
      { label: 'Knowledge base searches', value: '6' },
      { label: 'Average confidence', value: '84%', valueColor: 'text-[#e3b341]' },
    ],
    tools: ['Claude AI', 'FAISS knowledge base', 'WA Mining Act'],
  },
  {
    name: 'Reporter',
    color: 'border-[#1f6feb]',
    dotColor: 'bg-[#58a6ff]',
    badgeColor: 'bg-[#0d2a4a] text-[#58a6ff]',
    status: 'Active',
    desc: 'Takes the findings and does three things: updates this dashboard with the new alerts, recalculates the bond release forecast, and sends an email to the site manager with a plain-English summary.',
    stats: [
      { label: 'Dashboard updates', value: '4' },
      { label: 'Emails sent', value: '1' },
      { label: 'Bond forecast', value: 'Recalculated', valueColor: 'text-[#3fb950]' },
    ],
    tools: ['Claude AI', 'Email', 'React state'],
  },
]

export default function AgentActivity() {
  const [running, setRunning] = useState(false)
  const [showLog, setShowLog] = useState(true)

  return (
    <div className="flex flex-col h-full">

      {/* Top bar */}
      <div className="h-10 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 flex-shrink-0">
        <div className="text-[10px] text-[#8b949e]">
          Agent activity <span className="text-[#e6edf3]">/ Roy Hill</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[9px] text-[#484f58] bg-[#1c2128] border border-[#30363d] rounded px-3 py-1">
            Last run: 2 hours ago · Next: 09:14 AWST tomorrow
          </div>
          <button
            onClick={() => setRunning(r => !r)}
            className="bg-[#1a3a1a] border border-[#2ea043] rounded px-3 py-1 text-[9px] text-[#3fb950]"
          >
            {running ? 'Running...' : 'Run agents now'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">

        {/* Intro */}
        <div className="text-[10px] text-[#8b949e]">
          RehabTrack uses three AI agents that work together automatically every day — no one needs to trigger them. This page shows you what they are doing and what they have found.
        </div>

        {/* Agent cards */}
        <div className="grid grid-cols-3 gap-3">
          {agents.map((agent, i) => (
            <div key={i} className={`bg-[#161b22] border rounded-lg p-4 ${agent.color}`}>
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2 h-2 rounded-full ${agent.dotColor}`}></div>
                <div className="text-[12px] font-medium text-[#e6edf3]">{agent.name}</div>
                <span className={`ml-auto text-[8px] px-2 py-0.5 rounded ${agent.badgeColor}`}>
                  {agent.status}
                </span>
              </div>

              <div className="text-[9px] text-[#8b949e] leading-relaxed mb-3">
                {agent.desc}
              </div>

              <div className="border-t border-[#30363d] pt-3 flex flex-col gap-1.5 mb-3">
                {agent.stats.map((stat, j) => (
                  <div key={j} className="flex justify-between">
                    <span className="text-[9px] text-[#484f58]">{stat.label}</span>
                    <span className={`text-[9px] font-medium ${stat.valueColor || 'text-[#e6edf3]'}`}>{stat.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-1">
                {agent.tools.map((tool, j) => (
                  <span key={j} className="text-[8px] bg-[#21262d] text-[#484f58] px-1.5 py-0.5 rounded">
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Activity log */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
          <div
            className="flex items-center justify-between px-4 py-2.5 border-b border-[#30363d] cursor-pointer"
            onClick={() => setShowLog(v => !v)}
          >
            <div className="text-[10px] font-medium text-[#e6edf3]">
              Today's activity log — 09:14 AWST
            </div>
            <span className="text-[9px] text-[#484f58]">{showLog ? '▲ hide' : '▼ show'}</span>
          </div>

          {showLog && (
            <div className="p-4 flex flex-col gap-1.5 font-mono">
              {logEntries.map((entry, i) => (
                <div key={i} className="flex gap-3 text-[9px]">
                  <span className="text-[#484f58] flex-shrink-0">{entry.time}</span>
                  <span className={`flex-shrink-0 font-medium ${entry.color}`}>[{entry.agent}]</span>
                  <span className="text-[#8b949e]">{entry.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How it works */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
          <div className="text-[10px] font-medium text-[#e6edf3] mb-3">How the agents work together</div>
          <div className="flex items-center gap-2">
            {[
              { name: 'Watcher', color: 'bg-[#1a3a1a] text-[#3fb950] border-[#2ea043]', desc: 'Scans satellite data · flags problems' },
              { arrow: true },
              { name: 'Analyst', color: 'bg-[#2d2000] text-[#e3b341] border-[#d29922]', desc: 'Explains problems · checks regulations' },
              { arrow: true },
              { name: 'Reporter', color: 'bg-[#0d2a4a] text-[#58a6ff] border-[#1f6feb]', desc: 'Updates dashboard · emails manager' },
            ].map((item, i) => (
              item.arrow ? (
                <div key={i} className="text-[#484f58] text-lg flex-shrink-0">→</div>
              ) : (
                <div key={i} className={`flex-1 border rounded-lg px-3 py-2 text-center ${item.color}`}>
                  <div className="text-[10px] font-medium mb-0.5">{item.name}</div>
                  <div className="text-[8px] opacity-80">{item.desc}</div>
                </div>
              )
            ))}
          </div>
          <div className="text-[9px] text-[#484f58] mt-3">
            The agents run automatically every day at 09:14 AWST. No one needs to trigger them. When a problem is found, the site manager receives an email within minutes.
          </div>
        </div>

      </div>
    </div>
  )
}