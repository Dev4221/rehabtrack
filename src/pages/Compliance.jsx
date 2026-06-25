import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { useSite } from '../SiteContext'

const sites = [
  { name: 'Roy Hill', region: 'Pilbara', operator: 'Roy Hill Holdings', recovered: 61, target: 6, actual: 8.2, bond: 48000000, release: 'Q3 2027', status: 'on-track', alerts: 2 },
  { name: 'Cloudbreak', region: 'Pilbara', operator: 'Fortescue Metals', recovered: 71, target: 6, actual: 6.1, bond: 62000000, release: 'Q1 2027', status: 'on-track', alerts: 0 },
  { name: 'Brockman 4', region: 'Pilbara', operator: 'Rio Tinto', recovered: 44, target: 6, actual: 4.2, bond: 35000000, release: 'Q1 2029', status: 'slow', alerts: 1 },
  { name: 'Christmas Creek', region: 'Pilbara', operator: 'Fortescue Metals', recovered: 29, target: 6, actual: 2.8, bond: 41000000, release: 'Q3 2030+', status: 'at-risk', alerts: 3 },
]

const statusStyles = {
  'on-track': { badge: 'bg-[#1a3a1a] text-[#3fb950] border-[#2ea043]', label: 'On track' },
  'slow': { badge: 'bg-[#2d2000] text-[#e3b341] border-[#d29922]', label: 'Slow' },
  'at-risk': { badge: 'bg-[#3d0000] text-[#f85149] border-[#cf222e]', label: 'At risk' },
}

const formatBond = (val) => `$${(val / 1000000).toFixed(0)}M`
const totalBond = sites.reduce((a, s) => a + s.bond, 0)
const onTrackBond = sites.filter(s => s.status === 'on-track').reduce((a, s) => a + s.bond, 0)
const atRiskBond = sites.filter(s => s.status !== 'on-track').reduce((a, s) => a + s.bond, 0)

const apiUrl = import.meta.env.DEV
  ? 'http://localhost:3001/api/claude'
  : '/api/claude'

export default function Compliance() {
  const { selectedSite } = useSite()
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(false)
  const [showReport, setShowReport] = useState(false)

  const downloadAll = () => {
    const headers = ['Site', 'Region', 'Operator', 'Land Recovered (%)', 'Annual Rate (%)', 'Target (%)', 'vs Target', 'Bond Value ($)', 'Expected Release', 'Active Alerts', 'Status']
    const rows = sites.map(s => [
      s.name, s.region, s.operator, s.recovered, s.actual, s.target,
      `${(s.actual - s.target).toFixed(1)}% ${s.actual >= s.target ? 'ahead' : 'behind'}`,
      s.bond, s.release, s.alerts, statusStyles[s.status].label
    ])
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'rehabtrack_compliance_all_sites.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const generateComplianceReport = async () => {
    setLoading(true)
    setReport('')
    setShowReport(true)

    const prompt = `You are writing a regulatory compliance summary for Western Australian mine rehabilitation bonds.

Current status across all monitored sites:

Roy Hill (Roy Hill Holdings): 61% recovered, +8.2%/yr, $48M bond, Q3 2027 release, 2 active alerts. Status: On track.
Cloudbreak (Fortescue Metals): 71% recovered, +6.1%/yr, $62M bond, Q1 2027 release, 0 alerts. Status: On track.
Brockman 4 (Rio Tinto): 44% recovered, +4.2%/yr, $35M bond, Q1 2029 release, 1 alert. Status: Slow, below 6%/yr target.
Christmas Creek (Fortescue Metals): 29% recovered, +2.8%/yr, $41M bond, Q3 2030+ release, 3 alerts. Status: At risk, significantly below target.

Total bonds held: $186M. On track for 2027: $110M. At risk of delay: $76M.

Write a professional compliance summary with three sections:
1. Portfolio overview
2. Sites requiring immediate attention
3. Recommended actions

Write in plain English. No jargon. Reference specific sites, dollar figures, and dates. Do not use long dashes or em dashes. Use regular hyphens or commas instead. Keep each section to 2 to 3 sentences.`

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: 1024,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await response.json()
      setReport(data.content[0].text)
    } catch (err) {
      setReport('Something went wrong generating the report. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full">

      <div className="h-10 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 flex-shrink-0">
        <div className="text-[10px] text-[#8b949e]">
          Compliance tracker <span className="text-[#e6edf3]">/ All WA sites</span>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadAll} className="bg-[#1c2128] border border-[#30363d] rounded px-3 py-1 text-[9px] text-[#8b949e] hover:text-[#e6edf3] transition-colors">
            Download all as CSV
          </button>
          <button onClick={generateComplianceReport} className="bg-[#1a3a1a] border border-[#2ea043] rounded px-3 py-1 text-[9px] text-[#3fb950]">
            {loading ? 'Generating...' : 'Generate compliance report'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">

        <div className="text-[10px] text-[#8b949e]">
          A portfolio view of all monitored sites, their current recovery status, and their bond positions. This is a management-level view. Select a specific site in the sidebar for detailed zone-level analysis. Updated after every satellite pass.
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total bonds held with government', value: formatBond(totalBond), color: 'text-[#e6edf3]' },
            { label: 'Bonds on track for 2027 release', value: formatBond(onTrackBond), color: 'text-[#3fb950]' },
            { label: 'Bonds at risk of delay', value: formatBond(atRiskBond), color: 'text-[#f85149]' },
            { label: 'Sites monitored', value: `${sites.length}`, color: 'text-[#e6edf3]' },
          ].map((card, i) => (
            <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 text-center">
              <div className="text-[8px] text-[#484f58] mb-2">{card.label}</div>
              <div className={`text-[22px] font-medium ${card.color}`}>{card.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 px-4 py-2.5 bg-[#1c2128] border-b border-[#30363d]">
            {['Site', 'Land recovered', 'vs Annual target', 'Bond value', 'Expected release', 'Alerts', 'Status'].map((h, i) => (
              <div key={i} className="text-[9px] font-medium text-[#484f58]">{h}</div>
            ))}
          </div>

          {sites.map((site, i) => {
            const diff = site.actual - site.target
            const style = statusStyles[site.status]
            const isSelected = selectedSite.name === site.name
            return (
              <div key={i} className={`grid grid-cols-7 px-4 py-3 border-b border-[#30363d] last:border-0 items-center transition-colors ${isSelected ? 'bg-[#1a2d1a]' : 'hover:bg-[#1c2128]'}`}>
                <div>
                  <div className="flex items-center gap-1.5">
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#3fb950] flex-shrink-0"></div>}
                    <div className="text-[10px] font-medium text-[#e6edf3]">{site.name}</div>
                  </div>
                  <div className="text-[8px] text-[#484f58]">{site.region} | {site.operator}</div>
                </div>
                <div>
                  <div className="text-[10px] font-medium text-[#e6edf3]">{site.recovered}%</div>
                  <div className="mt-1 h-1 w-24 bg-[#21262d] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${site.recovered}%`, background: site.status === 'on-track' ? '#2ea043' : site.status === 'slow' ? '#d29922' : '#cf222e' }}></div>
                  </div>
                </div>
                <div className={`text-[10px] font-medium ${diff >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
                  {diff >= 0 ? '+' : ''}{diff.toFixed(1)}% {diff >= 0 ? 'ahead' : 'behind'}
                </div>
                <div className="text-[10px] text-[#e6edf3] font-medium">{formatBond(site.bond)}</div>
                <div className={`text-[10px] font-medium ${site.status === 'on-track' ? 'text-[#3fb950]' : site.status === 'slow' ? 'text-[#e3b341]' : 'text-[#f85149]'}`}>
                  {site.release}
                </div>
                <div>
                  {site.alerts > 0
                    ? <span className="text-[9px] bg-[#3d0000] text-[#f85149] px-1.5 py-0.5 rounded-full">{site.alerts}</span>
                    : <span className="text-[9px] text-[#484f58]">None</span>
                  }
                </div>
                <div>
                  <span className={`text-[9px] px-2 py-0.5 rounded border font-medium ${style.badge}`}>{style.label}</span>
                </div>
              </div>
            )
          })}
        </div>

        {showReport && (
          <div className="bg-[#161b22] border border-[#2ea043] rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[12px] font-medium text-[#e6edf3]">Portfolio Compliance Report | June 2026</div>
                <div className="text-[9px] text-[#484f58] mt-0.5">Generated by Claude | All WA sites</div>
              </div>
              <button onClick={() => setShowReport(false)} className="text-[9px] text-[#484f58] hover:text-[#e6edf3]">Close</button>
            </div>
            {loading ? (
              <div className="text-[10px] text-[#3fb950]">Writing your compliance report...</div>
            ) : (
              <ReactMarkdown
                components={{
                  h1: ({children}) => <div className="text-[12px] font-semibold text-[#e6edf3] mb-2 mt-4">{children}</div>,
                  h2: ({children}) => <div className="text-[11px] font-semibold text-[#e6edf3] mb-2 mt-3">{children}</div>,
                  p: ({children}) => <p className="text-[10px] text-[#8b949e] leading-relaxed mb-2">{children}</p>,
                  strong: ({children}) => <span className="text-[#e6edf3] font-medium">{children}</span>,
                  ul: ({children}) => <ul className="mb-2 space-y-1 pl-3">{children}</ul>,
                  li: ({children}) => <li className="text-[10px] text-[#8b949e] flex gap-2"><span className="text-[#3fb950] flex-shrink-0">·</span><span>{children}</span></li>,
                }}
              >
                {report}
              </ReactMarkdown>
            )}
            <div className="mt-4 pt-3 border-t border-[#30363d] text-[8px] text-[#484f58] italic">
              Generated by Claude AI | Based on Sentinel-2 satellite data and publicly available bond information | Not a substitute for formal regulatory assessment.
            </div>
          </div>
        )}

        <div className="text-[9px] text-[#484f58]">
          Recovery data from Sentinel-2 satellite imagery via Google Earth Engine. Bond values from publicly available company annual reports. Updated every 5 days after each satellite pass.
        </div>
      </div>
    </div>
  )
}