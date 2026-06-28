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
  'on-track': { badge: 'bg-[var(--green-bg)] text-[var(--green)] border-[var(--green-border)]', label: 'On track' },
  'slow': { badge: 'bg-[var(--amber-bg)] text-[var(--amber)] border-[var(--amber-border)]', label: 'Slow' },
  'at-risk': { badge: 'bg-[var(--red-bg)] text-[var(--red)] border-[var(--red-border)]', label: 'At risk' },
}

const formatBond = (val) => `$${(val / 1000000).toFixed(0)}M`
const totalBond = sites.reduce((a, s) => a + s.bond, 0)
const onTrackBond = sites.filter(s => s.status === 'on-track').reduce((a, s) => a + s.bond, 0)
const atRiskBond = sites.filter(s => s.status !== 'on-track').reduce((a, s) => a + s.bond, 0)

const apiUrl = import.meta.env.DEV ? 'http://localhost:3001/api/claude' : '/api/claude'

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

    const prompt = `You are writing a portfolio compliance report for a board of directors covering all Western Australian mine rehabilitation sites under management.

Portfolio status as of June 2026:

Roy Hill (Roy Hill Holdings, Pilbara): 61% recovered, +8.2%/yr recovery rate, $48M bond lodged, Q3 2027 projected release, 2 active alerts. Status: On track. Two issues require attention - possible invasive weed in the western section and vegetation loss in the southern section from recent rainfall.

Cloudbreak (Fortescue Metals Group, Pilbara): 71% recovered, +6.1%/yr, $62M bond, Q1 2027 projected release, 0 alerts. Status: On track. Best performing site in the portfolio. Northern section has reached the government's recovery milestone.

Brockman 4 (Rio Tinto, Pilbara): 44% recovered, +4.2%/yr, $35M bond, Q1 2029 projected release, 1 alert. Status: Behind schedule. Eastern section recovering at +2.1%/yr against a 6% target. Bond release at risk of 18-month delay without intervention.

Christmas Creek (Fortescue Metals Group, Pilbara): 29% recovered, +2.8%/yr, $41M bond, Q3 2030+ projected release, 3 alerts. Status: At risk. Three active issues: critical vegetation failure in the northern section (240ha, projected milestone 2035), erosion spreading in the central section (95ha), and a reportable invasive weed event in the southern section (62ha) that must be notified to DEMIRS.

Total bonds held with government: $186M. On track for near-term release: $110M. At risk of significant delay: $76M.

Write a professional portfolio compliance report structured for a board of directors. Use the following structure:

Portfolio verdict - one clear paragraph opening with the overall position: what proportion of the portfolio is on track, what is at risk, and the single most important issue requiring board attention right now.

Site status - for each site, one short paragraph covering current recovery position, bond release outlook, and any issues requiring a management decision. Do not use zone codes or technical measurements. Use plain language.

Board actions required - a numbered list of specific decisions or approvals the board or executive team needs to make, in order of urgency. For each action, state the consequence of delay in plain terms.

Write in plain English suitable for a board paper. No technical jargon. Reference specific dollar figures and dates. Do not use long dashes or em dashes. Use hyphens or commas instead. Do not use markdown # headers. No asterisks.`

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-haiku-4-5', max_tokens: 1200, messages: [{ role: 'user', content: prompt }] }),
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
      <div className="h-10 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center justify-between px-4 flex-shrink-0">
        <div className="text-[10px] text-[var(--text-secondary)]">
          Compliance tracker <span className="text-[var(--text-primary)]">/ All WA sites</span>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadAll} className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded px-3 py-1 text-[9px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
            Download all as CSV
          </button>
          <button onClick={generateComplianceReport} className="bg-[var(--green-bg)] border border-[var(--green-border)] rounded px-3 py-1 text-[9px] text-[var(--green)]">
            {loading ? 'Generating...' : 'Generate compliance report'}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
        <div className="text-[10px] text-[var(--text-secondary)]">
          A portfolio view of all monitored sites, their current recovery status, and their bond positions. Select a specific site in the sidebar for detailed zone-level analysis. Updated after every satellite pass.
        </div>

        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total bonds held with government', value: formatBond(totalBond), color: 'text-[var(--text-primary)]' },
            { label: 'Bonds on track for near-term release', value: formatBond(onTrackBond), color: 'text-[var(--green)]' },
            { label: 'Bonds at risk of delay', value: formatBond(atRiskBond), color: 'text-[var(--red)]' },
            { label: 'Sites monitored', value: `${sites.length}`, color: 'text-[var(--text-primary)]' },
          ].map((card, i) => (
            <div key={i} className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3 text-center">
              <div className="text-[8px] text-[var(--text-muted)] mb-2">{card.label}</div>
              <div className={`text-[22px] font-medium ${card.color}`}>{card.value}</div>
            </div>
          ))}
        </div>

        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg overflow-hidden">
          <div className="grid grid-cols-7 px-4 py-2.5 bg-[var(--bg-tertiary)] border-b border-[var(--border)]">
            {['Site', 'Land recovered', 'vs Annual target', 'Bond value', 'Expected release', 'Alerts', 'Status'].map((h, i) => (
              <div key={i} className="text-[9px] font-medium text-[var(--text-muted)]">{h}</div>
            ))}
          </div>

          {sites.map((site, i) => {
            const diff = site.actual - site.target
            const style = statusStyles[site.status]
            const isSelected = selectedSite.name === site.name
            return (
              <div key={i} className={`grid grid-cols-7 px-4 py-3 border-b border-[var(--border)] last:border-0 items-center transition-colors ${isSelected ? 'bg-[var(--green-dark)]' : 'hover:bg-[var(--bg-tertiary)]'}`}>
                <div>
                  <div className="flex items-center gap-1.5">
                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)] flex-shrink-0"></div>}
                    <div className="text-[10px] font-medium text-[var(--text-primary)]">{site.name}</div>
                  </div>
                  <div className="text-[8px] text-[var(--text-muted)]">{site.region} | {site.operator}</div>
                </div>
                <div>
                  <div className="text-[10px] font-medium text-[var(--text-primary)]">{site.recovered}%</div>
                  <div className="mt-1 h-1 w-24 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${site.recovered}%`, background: site.status === 'on-track' ? '#2ea043' : site.status === 'slow' ? '#d29922' : '#cf222e' }}></div>
                  </div>
                </div>
                <div className={`text-[10px] font-medium ${diff >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                  {diff >= 0 ? '+' : ''}{diff.toFixed(1)}% {diff >= 0 ? 'ahead' : 'behind'}
                </div>
                <div className="text-[10px] text-[var(--text-primary)] font-medium">{formatBond(site.bond)}</div>
                <div className={`text-[10px] font-medium ${site.status === 'on-track' ? 'text-[var(--green)]' : site.status === 'slow' ? 'text-[var(--amber)]' : 'text-[var(--red)]'}`}>
                  {site.release}
                </div>
                <div>
                  {site.alerts > 0
                    ? <span className="text-[9px] bg-[var(--red-bg)] text-[var(--red)] px-1.5 py-0.5 rounded-full">{site.alerts}</span>
                    : <span className="text-[9px] text-[var(--text-muted)]">None</span>
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
          <div className="bg-[var(--bg-secondary)] border border-[var(--green-border)] rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-[12px] font-medium text-[var(--text-primary)]">Portfolio Compliance Report | June 2026</div>
                <div className="text-[9px] text-[var(--text-muted)] mt-0.5">Generated by Claude AI | All WA sites</div>
              </div>
              <button onClick={() => setShowReport(false)} className="text-[9px] text-[var(--text-muted)] hover:text-[var(--text-primary)]">Close</button>
            </div>
            {loading ? (
              <div className="text-[10px] text-[var(--green)]">Writing your compliance report...</div>
            ) : (
              <ReactMarkdown components={{
                h1: ({children}) => <div className="text-[12px] font-semibold text-[var(--text-primary)] mb-2 mt-4">{children}</div>,
                h2: ({children}) => <div className="text-[11px] font-semibold text-[var(--text-primary)] mb-2 mt-3">{children}</div>,
                p: ({children}) => <p className="text-[10px] text-[var(--text-secondary)] leading-relaxed mb-2">{children}</p>,
                strong: ({children}) => <span className="text-[var(--text-primary)] font-medium">{children}</span>,
                ul: ({children}) => <ul className="mb-2 space-y-1 pl-3">{children}</ul>,
                ol: ({children}) => <ol className="mb-2 space-y-1 pl-3 list-decimal">{children}</ol>,
                li: ({children}) => <li className="text-[10px] text-[var(--text-secondary)] flex gap-2"><span className="text-[var(--green)] flex-shrink-0">·</span><span>{children}</span></li>,
              }}>{report}</ReactMarkdown>
            )}
            <div className="mt-4 pt-3 border-t border-[var(--border)] text-[8px] text-[var(--text-muted)] italic">
              Generated by Claude AI | Based on Sentinel-2 satellite data and publicly available bond information | Not a substitute for formal regulatory assessment.
            </div>
          </div>
        )}

        <div className="text-[9px] text-[var(--text-muted)]">
          Recovery data from Sentinel-2 satellite imagery via Google Earth Engine. Bond values from publicly available company annual reports. Updated every 5 days after each satellite pass.
        </div>
      </div>
    </div>
  )
}