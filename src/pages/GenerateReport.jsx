import { useState, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { useSite } from '../SiteContext'

const reportTypes = [
  { id: 'compliance', label: 'Compliance summary', desc: 'For the Department of Mines and regulators' },
  { id: 'investor', label: 'Investor update', desc: 'For shareholders and board members' },
  { id: 'executive', label: 'Executive briefing', desc: 'For senior management' },
  { id: 'technical', label: 'Technical report', desc: 'For environmental scientists and consultants' },
]

const siteDataMap = {
  'roy-hill': {
    name: 'Roy Hill Iron Ore Mine', operator: 'Roy Hill Holdings', region: 'Pilbara, Western Australia',
    area: 2840, recovered: 61, early: 22, bare: 17, growthRate: 8.2, bond: 48000000, release: 'Q3 2027', status: 'on track',
    zones: `- Zone A1 (420ha): 80% recovered, bond milestone reached\n- Zone A2 (380ha): 72% recovered, on track\n- Zone B1 (290ha): 52% recovered, on track\n- Zone B2 (340ha): 44% recovered, weed encroachment detected\n- Zone B3 (260ha): 48% recovered, on track\n- Zone C1 (220ha): 38% recovered, on track\n- Zone C2 (180ha): 32% recovered, needs attention\n- Zone C3 (140ha): 29% recovered, vegetation loss from rainfall erosion`,
    alerts: `- Zone C3: 14 hectares of vegetation loss. Likely rainfall erosion. Recovery expected within 3 to 4 months.\n- Zone B2: Possible buffel grass weed encroachment across 8 hectares. Ground inspection required.\n- Zone A1: Bond milestone confirmed 12 days ago.`,
  },
  'cloudbreak': {
    name: 'Cloudbreak Iron Ore Mine', operator: 'Fortescue Metals Group', region: 'Pilbara, Western Australia',
    area: 4100, recovered: 71, early: 18, bare: 11, growthRate: 6.1, bond: 62000000, release: 'Q1 2027', status: 'on track',
    zones: `- Zone A1 (520ha): 82% recovered, bond milestone reached\n- Zone A2 (480ha): 76% recovered, on track\n- Zone B1 (380ha): 68% recovered, on track\n- Zone B2 (420ha): 62% recovered, on track\n- Zone C1 (340ha): 55% recovered, on track`,
    alerts: `- Zone A1: Bond milestone confirmed 3 days ago.\n- No active vegetation loss or weed alerts.`,
  },
  'brockman': {
    name: 'Brockman 4 Iron Ore Mine', operator: 'Rio Tinto', region: 'Pilbara, Western Australia',
    area: 2100, recovered: 44, early: 28, bare: 28, growthRate: 4.2, bond: 35000000, release: 'Q1 2029', status: 'behind schedule',
    zones: `- Zone A1 (320ha): 58% recovered, on track\n- Zone B1 (280ha): 48% recovered, on track\n- Zone C1 (240ha): 42% recovered, on track\n- Zone D2 (180ha): 24% recovered, below target`,
    alerts: `- Zone D2: Recovery rate +2.1%/yr vs 6% target. Replanting recommended before next wet season.`,
  },
  'christmas-creek': {
    name: 'Christmas Creek Iron Ore Mine', operator: 'Fortescue Metals Group', region: 'Pilbara, Western Australia',
    area: 3200, recovered: 29, early: 35, bare: 36, growthRate: 2.8, bond: 41000000, release: 'Q3 2030+', status: 'at risk, significantly behind schedule',
    zones: `- Zone A1 (380ha): 42% recovered, below target\n- Zone E1 (240ha): 12% recovered, critical\n- Zone E3 (220ha): 18% recovered, erosion damage\n- Zone F2 (180ha): 22% recovered, weed encroachment`,
    alerts: `- Zone E1: Critical, only 12% recovered. Urgent intervention required.\n- Zone E3: Erosion spreading across 95 hectares after recent rainfall.\n- Zone F2: Buffel grass across 62 hectares. Reportable event under Mine Closure Plan s.4.2.`,
  },
}

const apiUrl = import.meta.env.DEV ? 'http://localhost:3001/api/claude' : '/api/claude'

export default function GenerateReport() {
  const { selectedSite, reportAlerts, clearReportAlerts } = useSite()
  const [reportType, setReportType] = useState('compliance')
  const [tone, setTone] = useState('executive')
  const [reports, setReports] = useState({ executive: '', analyst: '' })
  const [loading, setLoading] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)

  const siteInfo = siteDataMap[selectedSite.id] || siteDataMap['roy-hill']
  const siteReportAlerts = reportAlerts.filter(a => a.siteName === siteInfo.name)

  useEffect(() => {
    setReports({ executive: '', analyst: '' })
    setHasGenerated(false)
  }, [selectedSite.id, reportType])

  const getSiteData = () => {
    const queuedAlertsText = siteReportAlerts.length > 0
      ? `\nAdditional alerts flagged for this report:\n${siteReportAlerts.map(a => `- ${a.title} (${a.area}): ${a.exec}`).join('\n')}`
      : ''
    return `
${siteInfo.name} - Rehabilitation Status Report
Operator: ${siteInfo.operator} | ${siteInfo.region}
Total area: ${siteInfo.area.toLocaleString()} hectares | Monitoring period: January 2019 to June 2026

Current status:
- ${siteInfo.recovered}% recovering well | ${siteInfo.early}% early stage | ${siteInfo.bare}% needs attention
- Annual recovery rate: +${siteInfo.growthRate}% per year (regulatory target: 6%)
- Bond lodged: $${(siteInfo.bond / 1000000).toFixed(0)},000,000 | Projected release: ${siteInfo.release}
- Status: ${siteInfo.status}

Zone details:
${siteInfo.zones}

Active alerts:
${siteInfo.alerts}
${queuedAlertsText}

Regulatory context:
- Governed by WA Mining Act 1978 and DMIRS rehabilitation guidelines
- Bond release requires 80% of disturbed area to meet vegetation recovery threshold
- Weed encroachment must be treated before bond release verification
`
  }

  const generateBothVersions = async () => {
    setLoading(true)
    setReports({ executive: '', analyst: '' })
    const selectedType = reportTypes.find(r => r.id === reportType)
    const basePrompt = `You are writing a professional ${selectedType.label} for the ${siteInfo.name} rehabilitation project.\n\n${getSiteData()}\n\nWrite a ${selectedType.label} with three clearly labelled sections:\n1. Current status\n2. Areas requiring attention\n3. Bond release outlook\n\nKeep each section to 2 to 3 sentences. Be specific and reference actual zones, percentages, and dollar figures. Do not use markdown headers with # symbols. Use plain section titles. Do not use long dashes or em dashes. Use regular hyphens or commas instead.`

    try {
      const [execRes, analRes] = await Promise.all([
        fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-haiku-4-5', max_tokens: 1024, messages: [{ role: 'user', content: basePrompt + '\n\nExecutive format: write in plain English. No jargon. Speak as if briefing a senior mining executive who is not a scientist. Always relate findings to dollars, dates, and practical actions. Use flowing prose, no bullet points.' }] }) }),
        fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-haiku-4-5', max_tokens: 1024, messages: [{ role: 'user', content: basePrompt + '\n\nAnalyst format: write for an environmental scientist or technical analyst. Use precise terminology including NDVI values, zone references, and regulatory citations. Where there are multiple data points, use a structured bullet list. Keep it concise and data-driven.' }] }) }),
      ])
      const [execData, analData] = await Promise.all([execRes.json(), analRes.json()])
      setReports({ executive: execData.content[0].text, analyst: analData.content[0].text })
      setHasGenerated(true)
    } catch (err) {
      setReports({ executive: 'Something went wrong. Please try again.', analyst: 'Something went wrong. Please try again.' })
    }
    setLoading(false)
  }

  const currentReport = tone === 'executive' ? reports.executive : reports.analyst

  const downloadPDF = () => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`<html><head><title>${siteInfo.name}</title><style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1a1a1a;line-height:1.6}h1{font-size:20px;margin-bottom:4px}.meta{font-size:11px;color:#666;margin-bottom:32px}p{font-size:13px;margin-bottom:12px}ul{font-size:13px;margin-bottom:12px;padding-left:20px}li{margin-bottom:4px}.footer{margin-top:40px;padding-top:16px;border-top:1px solid #ccc;font-size:10px;color:#888;font-style:italic}@media print{body{margin:20px}}</style></head><body><h1>${siteInfo.name} - ${reportTypes.find(r => r.id === reportType)?.label}</h1><div class="meta">Generated by RehabTrack | June 2026 | Based on Sentinel-2 satellite data | ${tone === 'executive' ? 'Executive version' : 'Analyst version'}</div>${currentReport.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '').join('')}<div class="footer">Generated by Claude AI | Grounded in Sentinel-2 NDVI data, DMIRS compliance guidelines, and WA Mining Act 1978 | Not a substitute for formal environmental assessment by a qualified consultant.</div></body></html>`)
    printWindow.document.close()
    printWindow.print()
  }

  return (
    <div className="flex h-full">

      <div className="w-64 bg-[var(--bg-secondary)] border-r border-[var(--border)] p-4 flex flex-col gap-4 flex-shrink-0 overflow-y-auto">
        <div>
          <div className="text-[12px] font-medium text-[var(--text-primary)] mb-1">Generate a site report</div>
          <div className="text-[9px] text-[var(--text-secondary)]">Claude writes both an Executive and Analyst version at once. Switch between them instantly with no need to regenerate.</div>
        </div>

        <div>
          <div className="text-[9px] text-[var(--text-muted)] mb-1.5">Site</div>
          <div className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded px-3 py-2 text-[10px] text-[var(--text-primary)]">
            {siteInfo.name} | {selectedSite.region}
          </div>
        </div>

        {siteReportAlerts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="text-[9px] text-[var(--text-muted)]">Alerts queued for this report</div>
              <button onClick={clearReportAlerts} className="text-[8px] text-[var(--text-muted)] hover:text-[var(--red)] transition-colors">Clear all</button>
            </div>
            <div className="flex flex-col gap-1">
              {siteReportAlerts.map((a, i) => (
                <div key={i} className="bg-[var(--bg-tertiary)] border border-[var(--amber)] rounded px-2 py-1.5">
                  <div className="text-[8px] text-[var(--amber)] font-medium">{a.zone}</div>
                  <div className="text-[8px] text-[var(--text-muted)] mt-0.5">{a.title}</div>
                </div>
              ))}
              <div className="text-[8px] text-[var(--green)] mt-1">These alerts will be included in the generated report.</div>
            </div>
          </div>
        )}

        <div>
          <div className="text-[9px] text-[var(--text-muted)] mb-1.5">Report type</div>
          <div className="flex flex-col gap-1.5">
            {reportTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={`text-left px-3 py-2 rounded border text-[9px] transition-colors ${
                  reportType === type.id
                    ? 'bg-[var(--green-bg)] border-[var(--green-border)] text-[var(--green)]'
                    : 'bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                <div className="font-medium">{type.label}</div>
                <div className="text-[8px] mt-0.5 opacity-70">{type.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <button onClick={generateBothVersions} disabled={loading} className="bg-[var(--green-bg)] border border-[var(--green-border)] rounded py-2.5 text-[10px] text-[var(--green)] font-medium disabled:opacity-50 mt-auto">
          {loading ? 'Writing both versions...' : 'Generate with Claude'}
        </button>

        {hasGenerated && (
          <button onClick={downloadPDF} className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded py-2 text-[9px] text-[var(--text-secondary)] flex items-center justify-center gap-1.5 hover:text-[var(--text-primary)] transition-colors">
            Download as PDF
          </button>
        )}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-[var(--bg-primary)]">

        {hasGenerated && (
          <div className="flex-shrink-0 px-6 pt-4 flex items-center gap-3">
            <div className="text-[11px] font-medium text-[var(--text-primary)]">
              {siteInfo.name} | {reportTypes.find(r => r.id === reportType)?.label}
            </div>
            <div className="ml-auto bg-[var(--bg-elevated)] border border-[var(--border)] rounded-full p-0.5 flex gap-0.5">
              <button onClick={() => setTone('executive')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${tone === 'executive' ? 'bg-[var(--green-bg)] text-[var(--green)]' : 'text-[var(--text-muted)]'}`}>Executive</button>
              <button onClick={() => setTone('analyst')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${tone === 'analyst' ? 'bg-[var(--green-bg)] text-[var(--green)]' : 'text-[var(--text-muted)]'}`}>Analyst</button>
            </div>
            <div className="text-[9px] text-[var(--text-muted)]">June 2026 | Sentinel-2</div>
          </div>
        )}

        <div className="flex-1 overflow-auto p-6">
          {!hasGenerated && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="text-[32px] mb-3">◧</div>
              <div className="text-[13px] font-medium text-[var(--text-primary)] mb-2">Choose a report type and click Generate</div>
              <div className="text-[10px] text-[var(--text-secondary)] max-w-sm">
                Claude will write both an Executive and Analyst version at the same time. Switch between them instantly with the toggle, no need to regenerate.
                {siteReportAlerts.length > 0 && <span className="block mt-2 text-[var(--amber)]">{siteReportAlerts.length} alert{siteReportAlerts.length > 1 ? 's' : ''} from the Alerts page will be included in this report.</span>}
              </div>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="text-[10px] text-[var(--green)] mb-2">Writing both versions of your report...</div>
              <div className="text-[9px] text-[var(--text-muted)]">Executive and Analyst versions | takes about 15 seconds</div>
            </div>
          )}

          {hasGenerated && currentReport && (
            <div className="max-w-2xl">
              <ReactMarkdown components={{
                h1: ({children}) => <div className="text-[13px] font-semibold text-[var(--text-primary)] mb-3 mt-5 pb-2 border-b border-[var(--border)]">{children}</div>,
                h2: ({children}) => <div className="text-[12px] font-semibold text-[var(--text-primary)] mb-2 mt-4">{children}</div>,
                h3: ({children}) => <div className="text-[11px] font-semibold text-[var(--text-secondary)] mb-2 mt-3">{children}</div>,
                p: ({children}) => <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed mb-3">{children}</p>,
                strong: ({children}) => <span className="text-[var(--text-primary)] font-medium">{children}</span>,
                em: ({children}) => <span className="text-[var(--text-secondary)] italic">{children}</span>,
                hr: () => <hr className="border-[var(--border)] my-4" />,
                ul: ({children}) => <ul className="mb-3 space-y-1 pl-3">{children}</ul>,
                ol: ({children}) => <ol className="mb-3 space-y-1 pl-3 list-decimal">{children}</ol>,
                li: ({children}) => <li className="text-[11px] text-[var(--text-secondary)] flex gap-2"><span className="text-[var(--green)] flex-shrink-0">·</span><span>{children}</span></li>,
              }}>{currentReport}</ReactMarkdown>
              <div className="mt-6 pt-4 border-t border-[var(--border)] text-[8px] text-[var(--text-muted)] italic">
                Generated by Claude AI | Grounded in Sentinel-2 NDVI data, DMIRS compliance guidelines, and WA Mining Act 1978 | Not a substitute for formal environmental assessment by a qualified consultant.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}