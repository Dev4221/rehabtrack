import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

const reportTypes = [
  { id: 'compliance', label: 'Compliance summary', desc: 'For the Department of Mines and regulators' },
  { id: 'investor', label: 'Investor update', desc: 'For shareholders and board members' },
  { id: 'executive', label: 'Executive briefing', desc: 'For senior management' },
  { id: 'technical', label: 'Technical report', desc: 'For environmental scientists and consultants' },
]

const SITE_DATA = `
Roy Hill Iron Ore Mine — Rehabilitation Status Report
Site: Roy Hill, Pilbara, Western Australia
Operator: Roy Hill Holdings
Total disturbed area: 2,840 hectares
Monitoring period: January 2019 to June 2026

Current status:
- 61% of disturbed land is recovering well (vegetation density above threshold)
- 22% is in early stage recovery
- 17% needs attention
- Annual recovery rate: +8.2% per year (regulatory target: 6% per year)
- Rehabilitation bond lodged: $48,000,000
- Projected bond release: Q3 2027

Zone details:
- Zone A1 (420ha, northern section): 80% recovered — bond milestone reached
- Zone A2 (380ha, eastern section): 72% recovered — on track
- Zone B1 (290ha, central section): 52% recovered — on track
- Zone B2 (340ha, western section): 44% recovered — weed encroachment detected (buffel grass suspected)
- Zone B3 (260ha, central western): 48% recovered — on track
- Zone C1 (220ha, southern section): 38% recovered — on track
- Zone C2 (180ha, south eastern): 32% recovered — needs attention
- Zone C3 (140ha, southern section): 29% recovered — vegetation loss from rainfall erosion
- Zone D1 (300ha): infrastructure — not applicable

Active alerts:
- Zone C3: 14 hectares of vegetation loss detected 2 days ago. Likely rainfall erosion. Expected natural recovery 3-4 months.
- Zone B2: 8 hectares showing possible buffel grass weed encroachment. Ground inspection required. Reportable under Mine Closure Plan s.4.2 if confirmed.
- Zone A1: Bond milestone confirmed 12 days ago.

Regulatory context:
- Governed by WA Mining Act 1978 and DMIRS rehabilitation guidelines
- Bond release requires 80% of disturbed area to meet vegetation recovery threshold
- Weed encroachment must be treated before bond release verification
`

const apiUrl = import.meta.env.DEV
  ? 'http://localhost:3001/api/claude'
  : '/api/claude'

export default function GenerateReport() {
  const [reportType, setReportType] = useState('compliance')
  const [tone, setTone] = useState('plain')
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(false)

  const generateReport = async () => {
    setLoading(true)
    setReport('')

    const selectedType = reportTypes.find(r => r.id === reportType)

    const prompt = `You are writing a professional ${selectedType.label} for the Roy Hill mine rehabilitation project.

${SITE_DATA}

Write a ${selectedType.label} with three clearly labelled sections:
1. Current status
2. Areas requiring attention
3. Bond release outlook

${tone === 'plain'
  ? 'Write in plain English. No jargon. Speak as if addressing a non-technical reader. Always relate findings to dollars, dates, and practical actions.'
  : 'Write in technical language appropriate for environmental scientists. Include specific metrics, zone references, and regulatory citations where relevant.'
}

Keep each section to 2-3 sentences. Be specific — reference actual zones, percentages, and dollar figures from the data provided. Do not use markdown headers with # symbols. Use plain section titles like "Current Status" followed by a line break.`

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
    <div className="flex h-full">

      <div className="w-64 bg-[#161b22] border-r border-[#30363d] p-4 flex flex-col gap-4 flex-shrink-0">
        <div>
          <div className="text-[12px] font-medium text-[#e6edf3] mb-1">Generate a site report</div>
          <div className="text-[9px] text-[#8b949e]">Claude writes a professional document from real satellite data. Takes about 10 seconds.</div>
        </div>

        <div>
          <div className="text-[9px] text-[#484f58] mb-1.5">Site</div>
          <div className="bg-[#1c2128] border border-[#30363d] rounded px-3 py-2 text-[10px] text-[#e6edf3]">
            Roy Hill Iron Ore — Pilbara WA
          </div>
        </div>

        <div>
          <div className="text-[9px] text-[#484f58] mb-1.5">Report type</div>
          <div className="flex flex-col gap-1.5">
            {reportTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setReportType(type.id)}
                className={`text-left px-3 py-2 rounded border text-[9px] transition-colors ${
                  reportType === type.id
                    ? 'bg-[#1a3a1a] border-[#2ea043] text-[#3fb950]'
                    : 'bg-[#1c2128] border-[#30363d] text-[#8b949e] hover:text-[#e6edf3]'
                }`}
              >
                <div className="font-medium">{type.label}</div>
                <div className="text-[8px] mt-0.5 opacity-70">{type.desc}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[9px] text-[#484f58] mb-1.5">Language</div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setTone('plain')}
              className={`flex-1 py-1.5 rounded border text-[9px] transition-colors ${tone === 'plain' ? 'bg-[#1a3a1a] border-[#2ea043] text-[#3fb950]' : 'bg-[#1c2128] border-[#30363d] text-[#8b949e]'}`}
            >
              Plain English
            </button>
            <button
              onClick={() => setTone('technical')}
              className={`flex-1 py-1.5 rounded border text-[9px] transition-colors ${tone === 'technical' ? 'bg-[#1a3a1a] border-[#2ea043] text-[#3fb950]' : 'bg-[#1c2128] border-[#30363d] text-[#8b949e]'}`}
            >
              Technical
            </button>
          </div>
        </div>

        <button
          onClick={generateReport}
          disabled={loading}
          className="bg-[#1a3a1a] border border-[#2ea043] rounded py-2.5 text-[10px] text-[#3fb950] font-medium disabled:opacity-50 mt-auto"
        >
          {loading ? 'Writing report...' : 'Generate with Claude'}
        </button>

        {report && (
          <button className="bg-[#1c2128] border border-[#30363d] rounded py-2 text-[9px] text-[#8b949e] flex items-center justify-center gap-1.5">
            ↓ Download as PDF
          </button>
        )}
      </div>

      <div className="flex-1 p-6 overflow-auto bg-[#0d1117]">
        {!report && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-[32px] mb-3">◧</div>
            <div className="text-[13px] font-medium text-[#e6edf3] mb-2">Choose a report type and click Generate</div>
            <div className="text-[10px] text-[#8b949e] max-w-sm">
              Claude will write a professional document based on the real satellite data for this site. Ready to send to regulators, investors, or your board.
            </div>
          </div>
        )}

        {loading && (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="text-[10px] text-[#3fb950] mb-2">Writing your report...</div>
            <div className="text-[9px] text-[#484f58]">This takes about 10 seconds</div>
          </div>
        )}

        {report && (
          <div className="max-w-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-[13px] font-medium text-[#e6edf3]">
                  Roy Hill Rehabilitation — {reportTypes.find(r => r.id === reportType)?.label}
                </div>
                <div className="text-[9px] text-[#484f58] mt-1">
                  Generated by Claude · June 2026 · Based on Sentinel-2 satellite data
                </div>
              </div>
            </div>

            <ReactMarkdown
              components={{
                h1: ({children}) => <div className="text-[13px] font-semibold text-[#e6edf3] mb-3 mt-5 pb-2 border-b border-[#30363d]">{children}</div>,
                h2: ({children}) => <div className="text-[12px] font-semibold text-[#e6edf3] mb-2 mt-4">{children}</div>,
                h3: ({children}) => <div className="text-[11px] font-semibold text-[#c9d1d9] mb-2 mt-3">{children}</div>,
                p: ({children}) => <p className="text-[11px] text-[#8b949e] leading-relaxed mb-3">{children}</p>,
                strong: ({children}) => <span className="text-[#e6edf3] font-medium">{children}</span>,
                em: ({children}) => <span className="text-[#c9d1d9] italic">{children}</span>,
                hr: () => <hr className="border-[#30363d] my-4" />,
                ul: ({children}) => <ul className="mb-3 space-y-1 pl-3">{children}</ul>,
                ol: ({children}) => <ol className="mb-3 space-y-1 pl-3 list-decimal">{children}</ol>,
                li: ({children}) => <li className="text-[11px] text-[#8b949e] flex gap-2"><span className="text-[#3fb950] flex-shrink-0">·</span><span>{children}</span></li>,
              }}
            >
              {report}
            </ReactMarkdown>

            <div className="mt-6 pt-4 border-t border-[#30363d] text-[8px] text-[#484f58] italic">
              Generated by Claude AI · Grounded in Sentinel-2 NDVI data, DMIRS compliance guidelines, and WA Mining Act 1978 · This document is a data-driven summary and is not a substitute for formal environmental assessment by a qualified consultant.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}