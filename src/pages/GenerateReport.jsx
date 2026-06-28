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
    alerts: `- Zone C3: 14 hectares of vegetation loss. Likely rainfall erosion. Recovery expected within 3 to 4 months.\n- Zone B2: Possible buffel grass weed encroachment across 8 hectares. Ground inspection required within 2 weeks.\n- Zone A1: Bond milestone confirmed 12 days ago. Flagged for DEMIRS verification.`,
    zonesPlain: `- Southern section (140ha): vegetation loss from recent rainfall, recovering\n- Western section (340ha): possible invasive weed detected, inspection required\n- Northern section (420ha): fully recovered, bond milestone reached\n- Remaining zones: on track`,
  },
  'cloudbreak': {
    name: 'Cloudbreak Iron Ore Mine', operator: 'Fortescue Metals Group', region: 'Pilbara, Western Australia',
    area: 4100, recovered: 71, early: 18, bare: 11, growthRate: 6.1, bond: 62000000, release: 'Q1 2027', status: 'on track',
    zones: `- Zone A1 (520ha): 82% recovered, bond milestone reached\n- Zone A2 (480ha): 76% recovered, on track\n- Zone B1 (380ha): 68% recovered, on track\n- Zone B2 (420ha): 62% recovered, on track\n- Zone C1 (340ha): 55% recovered, on track`,
    alerts: `- Zone A1: Bond milestone confirmed 3 days ago. Flagged for DEMIRS verification.\n- No active vegetation loss or weed alerts.`,
    zonesPlain: `- All sections recovering at or above the required annual rate\n- Northern section (520ha): fully recovered, bond milestone reached`,
  },
  'brockman': {
    name: 'Brockman 4 Iron Ore Mine', operator: 'Rio Tinto', region: 'Pilbara, Western Australia',
    area: 2100, recovered: 44, early: 28, bare: 28, growthRate: 4.2, bond: 35000000, release: 'Q1 2029', status: 'behind schedule',
    zones: `- Zone A1 (320ha): 58% recovered, on track\n- Zone B1 (280ha): 48% recovered, on track\n- Zone C1 (240ha): 42% recovered, on track\n- Zone D2 (180ha): 24% recovered, below target`,
    alerts: `- Zone D2: Recovery rate +2.1%/yr vs 6% regulatory target. Replanting programme recommended before next wet season. Bond release at risk of 18-month delay.`,
    zonesPlain: `- Eastern section (180ha): recovering at less than half the required pace, replanting needed\n- Remaining sections: on track`,
  },
  'christmas-creek': {
    name: 'Christmas Creek Iron Ore Mine', operator: 'Fortescue Metals Group', region: 'Pilbara, Western Australia',
    area: 3200, recovered: 29, early: 35, bare: 36, growthRate: 2.8, bond: 41000000, release: 'Q3 2030+', status: 'at risk, significantly behind schedule',
    zones: `- Zone A1 (380ha): 42% recovered, below target\n- Zone E1 (240ha): 12% recovered, critical\n- Zone E3 (220ha): 18% recovered, erosion damage\n- Zone F2 (180ha): 22% recovered, weed encroachment`,
    alerts: `- Zone E1: Critical. Only 12% recovered after 4 years. Projected milestone 2035, five years past the bond release target. Urgent intervention required.\n- Zone E3: Erosion spreading across 95 hectares after recent rainfall. Immediate erosion control works required.\n- Zone F2: Buffel grass across 62 hectares. Reportable event under Mine Closure Plan section 4.2. Treatment required before bond release verification.`,
    zonesPlain: `- Northern section (240ha): critical, almost no recovery since 2022, urgent intervention required\n- Central section (220ha): erosion spreading after rainfall, immediate works required\n- Southern section (180ha): invasive weed detected, legally reportable, must be treated\n- Remaining sections: below target`,
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
Site: ${siteInfo.name}
Operator: ${siteInfo.operator} | ${siteInfo.region}
Total disturbed area: ${siteInfo.area.toLocaleString()} hectares
Monitoring period: January 2019 to June 2026

Recovery status:
- ${siteInfo.recovered}% recovering well | ${siteInfo.early}% early stage | ${siteInfo.bare}% bare or disturbed
- Annual recovery rate: +${siteInfo.growthRate}% per year (regulatory target: 6% per year)
- Bond lodged with government: $${(siteInfo.bond / 1000000).toFixed(0)},000,000
- Projected bond release: ${siteInfo.release}
- Overall status: ${siteInfo.status}

Zone details (technical):
${siteInfo.zones}

Zone details (plain English):
${siteInfo.zonesPlain}

Active alerts:
${siteInfo.alerts}
${queuedAlertsText}

Regulatory context:
- Governed by WA Mining Act 1978 and DEMIRS (Department of Energy, Mines, Industry Regulation and Safety) rehabilitation guidelines
- Bond release requires 80% of disturbed area to meet vegetation recovery threshold defined in the approved Mine Closure Plan
- Weed encroachment must be treated and verified before bond release can proceed
- Mine Closure Plan must be resubmitted to DEMIRS every three years
`
  }

  const getPrompt = (audience) => {
    const data = getSiteData()

    if (reportType === 'compliance') {
      if (audience === 'executive') {
        return `You are writing a formal compliance summary for ${siteInfo.name} to be submitted to the Department of Energy, Mines, Industry Regulation and Safety (DEMIRS).

${data}

Write a formal regulatory compliance summary. Use third-person, formal language. Do not use financial framing or bond release as the primary focus. The focus is on whether the rehabilitation programme is meeting its approved Mine Closure Plan targets.

Structure the report with these four clearly labelled sections:
1. Programme status - overall progress against Mine Closure Plan targets
2. Zone-level progress - each active zone, its current recovery status, and whether it is meeting its approved completion criteria
3. Active issues and corrective actions - what problems have been detected, what action is being taken, and the expected resolution timeline
4. Regulatory obligations outstanding - any reportable events, upcoming DEMIRS submissions, or conditions that must be met before bond release verification can proceed

Be specific. Reference actual zone names, percentages, hectares, and regulatory obligations. Do not use markdown headers with # symbols. Use plain section titles. Do not use long dashes or em dashes. Use hyphens or commas instead. Do not use asterisks.`
      } else {
        return `You are writing a technical compliance summary for ${siteInfo.name} for submission to DEMIRS.

${data}

Write a precise technical compliance summary for an environmental scientist or regulatory officer.

Structure with these four sections:
1. Programme status - recovery rate vs approved Mine Closure Plan targets, statistical trend analysis
2. Zone-level progress - NDVI (vegetation health index) values, recovery velocity, and compliance status per zone
3. Active anomalies and corrective actions - anomaly classification, confidence levels, regulatory obligations triggered, and recommended actions with timeframes
4. Outstanding regulatory conditions - reportable events under Mine Closure Plan section references, upcoming DEMIRS submission requirements

Use technical terminology. Include vegetation health scores (NDVI values), recovery velocities, and regulatory citations where relevant. Do not use markdown # headers. No long dashes or em dashes. No asterisks.`
      }
    }

    if (reportType === 'investor') {
      if (audience === 'executive') {
        return `You are writing an investor update for ${siteInfo.name} for shareholders and board members.

${data}

Write a clear, direct investor update focused entirely on bond capital, release timelines, and financial risk. This audience controls the capital and needs to understand the financial position, not the environmental science.

Structure with these three sections:
1. Bond position - open with one sentence verdict on whether the bond release is on track, at risk, or in trouble. State the bond value and the projected release date. State whether this has changed since the last period.
2. Site-by-site financial exposure - for each active area of concern, explain the financial consequence in plain terms: how much capital is at risk, what is causing the risk, and what it would cost to resolve it. Do not use zone codes. Use plain descriptions of the affected areas.
3. Management actions and outlook - what is being done to protect the bond release timeline, what decisions are required, and what the realistic range of outcomes is.

Write in plain English. No technical measurements. No zone codes. No jargon. Relate everything to dollars, dates, and decisions. Do not use markdown # headers. No long dashes or em dashes. No asterisks.`
      } else {
        return `You are writing a technical investor update for ${siteInfo.name}.

${data}

Write a structured investor update for a technically informed board member or financial analyst with environmental background.

Structure with three sections:
1. Bond position - recovery trajectory, NDVI (vegetation health index) velocity vs required threshold, projected release date with confidence assessment
2. Risk exposure by zone - zone-level recovery status, anomaly classifications, financial consequence of each active issue, and intervention cost ranges
3. Outlook - base case and downside scenario for bond release timing, key assumptions, and recommended actions with cost-benefit summary

Include technical measurements alongside financial figures. Do not use markdown # headers. No long dashes or em dashes. No asterisks.`
      }
    }

    if (reportType === 'executive') {
      if (audience === 'executive') {
        return `You are writing an executive briefing for ${siteInfo.name} for senior management.

${data}

Write a direct, action-oriented executive briefing. Senior management needs to know what has changed, what decisions are required, and what the cost of inaction is. They do not need a summary of things they already know.

Structure as follows:

Start with a KEY FINDINGS section containing exactly 3 to 5 bullet points. Each bullet must be a single clear statement of fact or risk. No filler. No "this report covers". Just the findings that matter most right now.

Then write these three sections:
1. What has changed since the last briefing - only new developments, not a repeat of the overall status
2. Decisions and approvals required - specific actions that require sign-off, with the consequence of delay stated for each
3. Cost of inaction - for each open issue, what happens financially and to the bond release timeline if nothing is done in the next 30 days

Write in plain English. Be direct. If something is serious, say so plainly. Do not soften findings. Do not use zone codes - use plain descriptions of the affected areas. Do not use markdown # headers. No long dashes or em dashes. No asterisks.`
      } else {
        return `You are writing a technical executive briefing for ${siteInfo.name}.

${data}

Write a structured executive briefing for a technically informed senior manager or chief environmental officer.

Start with KEY FINDINGS: 3 to 5 bullet points covering the most critical technical and operational findings.

Then:
1. Changes since last reporting period - NDVI (vegetation health index) trend deltas, new anomaly classifications, zone status changes
2. Required decisions and technical actions - specific interventions required, with cost ranges, regulatory deadlines, and consequence of delay
3. Financial and regulatory exposure - bond release risk quantified by zone, reportable events outstanding, upcoming DEMIRS submission obligations

Include vegetation health scores and technical measurements alongside operational recommendations. No markdown # headers. No long dashes or em dashes. No asterisks.`
      }
    }

    if (reportType === 'technical') {
      if (audience === 'executive') {
        return `You are writing a technical rehabilitation report for ${siteInfo.name} for environmental scientists and rehabilitation consultants.

${data}

Write a precise technical report for an environmental scientist or rehabilitation consultant. This audience does not need financial framing. They need accurate measurements, methodology references, and specific recommendations.

Structure with these four sections:
1. Vegetation recovery assessment - current recovery status per zone, annual velocity, comparison against Mine Closure Plan completion criteria
2. Anomaly analysis - classification of detected anomalies, likely causes based on historical pattern matching, confidence levels, and spread assessment
3. Regulatory compliance status - which zones meet the 80% vegetation recovery threshold, which are below, and what conditions must be met before DEMIRS can verify bond release
4. Recommended actions and monitoring programme - specific interventions per zone, recommended monitoring frequency, and expected outcomes

Use technical terminology appropriate for an environmental scientist. Include vegetation health index (NDVI) values, recovery velocities, zone references, and regulatory citations. Do not use financial framing. Do not use markdown # headers. No long dashes or em dashes. No asterisks.`
      } else {
        return `You are writing a detailed technical rehabilitation report for ${siteInfo.name}.

${data}

Write a comprehensive technical report for an environmental scientist conducting detailed zone-level analysis.

Structure with four sections:
1. Vegetation recovery assessment - NDVI (vegetation health index) mean values and velocity per zone, comparison against 0.35 threshold (the standard vegetation recovery benchmark), trend analysis against 5-year seasonal baseline
2. Anomaly analysis - Z-score deviations from seasonal baseline, classifier outputs with confidence levels, spectral band analysis for weed detection, erosion pattern assessment
3. Regulatory compliance mapping - zone-by-zone compliance against Mine Closure Plan completion criteria, reportable events triggered under specific plan sections, upcoming DEMIRS obligations
4. Recommended monitoring and intervention programme - specific actions per zone, monitoring frequency, technical specifications for interventions, success criteria

Maximum technical precision. Include all available measurements. Reference regulatory obligations by specific plan sections where applicable. No markdown # headers. No long dashes or em dashes. No asterisks.`
      }
    }

    return ''
  }

  const generateBothVersions = async () => {
    setLoading(true)
    setReports({ executive: '', analyst: '' })

    try {
      const [execRes, analRes] = await Promise.all([
        fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-haiku-4-5', max_tokens: 1200, messages: [{ role: 'user', content: getPrompt('executive') }] }) }),
        fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-haiku-4-5', max_tokens: 1200, messages: [{ role: 'user', content: getPrompt('analyst') }] }) }),
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
    printWindow.document.write(`<html><head><title>${siteInfo.name}</title><style>body{font-family:Georgia,serif;max-width:800px;margin:40px auto;padding:0 20px;color:#1a1a1a;line-height:1.6}h1{font-size:20px;margin-bottom:4px}.meta{font-size:11px;color:#666;margin-bottom:32px}p{font-size:13px;margin-bottom:12px}ul{font-size:13px;margin-bottom:12px;padding-left:20px}li{margin-bottom:4px}.footer{margin-top:40px;padding-top:16px;border-top:1px solid #ccc;font-size:10px;color:#888;font-style:italic}@media print{body{margin:20px}}</style></head><body><h1>${siteInfo.name} - ${reportTypes.find(r => r.id === reportType)?.label}</h1><div class="meta">Generated by RehabTrack | June 2026 | Based on Sentinel-2 satellite data | ${tone === 'executive' ? 'Executive version' : 'Analyst version'}</div>${currentReport.split('\n').map(line => line.trim() ? `<p>${line}</p>` : '').join('')}<div class="footer">Generated by Claude AI | Grounded in Sentinel-2 satellite data, DEMIRS compliance guidelines, and WA Mining Act 1978 | Not a substitute for formal environmental assessment by a qualified consultant.</div></body></html>`)
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
              <button key={type.id} onClick={() => setReportType(type.id)}
                className={`text-left px-3 py-2 rounded border text-[9px] transition-colors ${reportType === type.id ? 'bg-[var(--green-bg)] border-[var(--green-border)] text-[var(--green)]' : 'bg-[var(--bg-tertiary)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}>
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
                Claude writes both an Executive and Analyst version at the same time. Switch between them instantly, no need to regenerate.
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
                Generated by Claude AI | Grounded in Sentinel-2 satellite data, DEMIRS compliance guidelines, and WA Mining Act 1978 | Not a substitute for formal environmental assessment by a qualified consultant.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}