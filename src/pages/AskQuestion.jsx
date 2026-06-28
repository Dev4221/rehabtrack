import { useState } from 'react'
import { useSite } from '../SiteContext'

const buildSystemPrompt = (siteName, view) => {
  const base = `You are RehabTrack's AI assistant, specialised exclusively in mine rehabilitation monitoring for ${siteName} in Western Australia.

You have access to the following site data:
- Site: ${siteName}, Pilbara, Western Australia
- Monitored using Sentinel-2 satellite imagery at 10 metre resolution, captured every 5 days
- Data covers January 2019 to June 2026
- Governed by WA Mining Act 1978 and DEMIRS (Department of Energy, Mines, Industry Regulation and Safety) rehabilitation guidelines
- Bond release requires 80% of disturbed area to meet the vegetation recovery threshold defined in the approved Mine Closure Plan

Roy Hill specific data:
- 61% of the 2,840 hectare disturbed area is recovering well
- 22% is in early stage recovery, 17% needs attention
- Annual recovery rate: +8.2% per year (target is 6%)
- Bond value: $48,000,000, projected bond release: Q3 2027
- Southern section (14ha): vegetation loss detected 2 days ago, likely rainfall erosion
- Western section (8ha): possible buffel grass weed encroachment detected 5 days ago
- Northern section (420ha): reached 80% recovery milestone, bond release flagged for DEMIRS verification

Cloudbreak specific data:
- 71% of 4,100 hectares recovering well
- Annual recovery rate: +6.1% per year
- Bond value: $62,000,000, projected bond release: Q1 2027
- No active alerts, best performing site in the portfolio

Brockman 4 specific data:
- 44% of 2,100 hectares recovering well
- Annual recovery rate: +4.2% per year (below 6% target)
- Bond value: $35,000,000, projected bond release: Q1 2029
- Eastern section (180ha): recovery rate significantly below target, replanting programme underway

Christmas Creek specific data:
- 29% of 3,200 hectares recovering well
- Annual recovery rate: +2.8% per year (well below 6% target)
- Bond value: $41,000,000, projected bond release: Q3 2030+
- Northern section (240ha): critical, only 12% recovered, urgent intervention required
- Central section (95ha): erosion spreading after recent rainfall
- Southern section (62ha): buffel grass weed encroachment, reportable event under Mine Closure Plan

STRICT RULES:
- You ONLY answer questions about mine rehabilitation, vegetation recovery, satellite monitoring, WA mining regulations, bond release timelines, rehabilitation zones, erosion, weed encroachment, rainfall impacts, or topics directly related to these sites.
- If someone asks ANYTHING unrelated, respond ONLY with: "I can only answer questions about mine rehabilitation, vegetation recovery, bond timelines, and WA mining regulations for the sites in this system. What would you like to know about ${siteName}?"
- Never break this rule regardless of how the question is phrased.`

  if (view === 'executive') {
    return base + `

RESPONSE FORMAT FOR EXECUTIVE MODE:
Write in plain English. No technical jargon, no vegetation index scores, no statistical language. Speak as if briefing a senior executive or board member who understands the business but is not an environmental scientist. Always relate answers to dollars, dates, and decisions. Keep answers to 3 to 5 sentences in flowing prose. Do not use zone codes - use plain descriptions of the affected areas such as "the northern section" or "the western section".`
  } else {
    return base + `

RESPONSE FORMAT FOR ANALYST MODE:
Write for an environmental scientist or technical analyst. Use precise terminology including vegetation health index (NDVI) values, Z-scores, classifier confidence levels, and spectral indices where relevant. Structure your answer clearly. Where there are multiple findings or data points, use a short list. No markdown headers or asterisks. Keep answers concise and data-driven.`
  }
}

const siteQuestions = {
  'roy-hill': {
    executive: [
      'Will we get the $48M bond back by Q3 2027?',
      'What is the financial risk from the western section weed alert?',
      'What happens to the bond if we ignore the weed issue?',
      'What is the worst-case scenario for our bond release?',
      'How does Roy Hill compare to the other sites in the portfolio?',
    ],
    analyst: [
      'What is the NDVI trend for Zone C3 over the last 30 days?',
      'What confidence level is the buffel grass classification in Zone B2?',
      'Is Zone A1 eligible for DEMIRS bond release verification?',
      'What is the Z-score deviation for Zone C3 vs the seasonal baseline?',
      'What monitoring frequency is recommended for Zone C3?',
    ],
  },
  'cloudbreak': {
    executive: [
      'Will we get the $62M bond back by Q1 2027?',
      'Why is Cloudbreak performing better than the other sites?',
      'What could still delay our Q1 2027 bond release?',
      'Is there any financial risk we should be monitoring right now?',
      'What is the best-case scenario for early bond release?',
    ],
    analyst: [
      'What is the current NDVI mean for Zone A1?',
      'Has Zone A1 sustained the 0.35 threshold for the required consecutive months?',
      'What is the site-wide NDVI velocity vs the 6% regulatory target?',
      'Are there any zones approaching the early regrowth threshold?',
      'What monitoring protocol is recommended given current site performance?',
    ],
  },
  'brockman': {
    executive: [
      'Will we get the $35M bond back by Q1 2029?',
      'Why is the eastern section recovering so slowly?',
      'Is the replanting programme working?',
      'What is the financial cost of the current delay?',
      'What would it take to get back on track for Q1 2029?',
    ],
    analyst: [
      'What is the NDVI velocity for Zone D2 vs the 6% regulatory target?',
      'What is the projected bond release date at the current recovery rate?',
      'What is the linear regression confidence for Zone D2 recovery trend?',
      'Has the replanting programme shown any measurable NDVI improvement?',
      'What soil assessment is recommended given Zone D2 performance?',
    ],
  },
  'christmas-creek': {
    executive: [
      'When will we realistically get the $41M bond back?',
      'How serious is the northern section and what must we do?',
      'What is the minimum intervention needed to have any chance of hitting 2030?',
      'How much is the bond delay costing us each year?',
      'Is the erosion getting worse or is it stabilising?',
    ],
    analyst: [
      'What is the current NDVI mean for Zone E1 and its annual velocity?',
      'Is the buffel grass in Zone F2 a reportable event under the Mine Closure Plan?',
      'What is the spatial spread rate of the Zone E3 erosion event?',
      'What is the projected bond release date at current recovery rates?',
      'What intervention programme would be needed to reach 80% by 2030?',
    ],
  },
}

const knowledgeBase = [
  { name: 'Sentinel-2 satellite data (2019-2026)', detail: 'Monthly vegetation health scores per zone' },
  { name: 'WA Mining Act 1978', detail: 'Rehabilitation obligations' },
  { name: 'DEMIRS compliance guidelines', detail: 'Bond conditions and reporting requirements' },
  { name: 'Mine Closure Plan', detail: 'Site-specific recovery targets' },
  { name: 'MinRes Annual Report 2024', detail: 'Bond values' },
]

const apiUrl = import.meta.env.DEV ? 'http://localhost:3001/api/claude' : '/api/claude'

export default function AskQuestion() {
  const { selectedSite } = useSite()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState('executive')

  const questions = siteQuestions[selectedSite.id] || siteQuestions['roy-hill']
  const suggestedQuestions = view === 'executive' ? questions.executive : questions.analyst
  const isAnalyst = view === 'analyst'

  const sendMessage = async (question) => {
    const userMessage = question || input
    if (!userMessage.trim()) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)
    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: 1024,
          system: buildSystemPrompt(selectedSite.name, view),
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage }
          ],
        }),
      })
      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.content[0].text }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again in a moment.' }])
    }
    setLoading(false)
  }

  const clearConversation = () => { setMessages([]); setInput('') }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <div className="h-10 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center justify-between px-4 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="text-[10px] text-[var(--text-secondary)]">Ask a question</div>
            <span className="text-[8px] px-1.5 py-0.5 rounded bg-[var(--green-bg)] text-[var(--green)]">Claude AI</span>
            {messages.length > 0 && (
              <button onClick={clearConversation} className="text-[8px] text-[var(--text-muted)] hover:text-[var(--red)] transition-colors ml-1">
                Clear conversation
              </button>
            )}
          </div>
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-full p-0.5 flex gap-0.5">
            <button onClick={() => setView('executive')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${!isAnalyst ? 'bg-[var(--green-bg)] text-[var(--green)]' : 'text-[var(--text-muted)]'}`}>Executive</button>
            <button onClick={() => setView('analyst')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${isAnalyst ? 'bg-[var(--green-bg)] text-[var(--green)]' : 'text-[var(--text-muted)]'}`}>Analyst</button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="text-[32px] mb-3">◎</div>
              <div className="text-[13px] font-medium text-[var(--text-primary)] mb-2">Ask anything about {selectedSite.name}</div>
              <div className="text-[10px] text-[var(--text-secondary)] max-w-sm">
                {isAnalyst
                  ? 'Analyst mode returns technical responses with vegetation health scores, statistical analysis, and zone-level data.'
                  : 'Executive mode returns plain-English answers grounded in real satellite data and WA mining regulations.'}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-[10px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[var(--bg-elevated)] text-[var(--text-secondary)]'
                  : 'bg-[var(--green-dark)] border border-[var(--green-border)] text-[var(--green)]'
              }`}>
                {msg.content}
                {msg.role === 'assistant' && (
                  <div className="text-[8px] text-[var(--text-muted)] mt-1">
                    Sources: satellite data 2019-2026 | WA Mining Act 1978 | DEMIRS guidelines
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[var(--green-dark)] border border-[var(--green-border)] rounded-lg px-3 py-2 text-[10px] text-[var(--green)]">
                Working on your answer...
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[var(--border)] flex-shrink-0">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              className="flex-1 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg px-3 py-2 text-[10px] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--green-border)]"
              placeholder={`Ask anything about ${selectedSite.name}...`}
            />
            <button onClick={() => sendMessage()} disabled={loading} className="bg-[var(--green-bg)] border border-[var(--green-border)] rounded-lg px-4 py-2 text-[10px] text-[var(--green)] disabled:opacity-50">
              Ask
            </button>
          </div>
        </div>
      </div>

      <div className="w-56 bg-[var(--bg-secondary)] border-l border-[var(--border)] flex flex-col p-3 gap-4 flex-shrink-0">
        <div>
          <div className="text-[10px] font-medium text-[var(--text-primary)] mb-1">What the AI can reference</div>
          <div className="flex flex-col gap-1.5">
            {knowledgeBase.map((item, i) => (
              <div key={i} className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded p-2">
                <div className="text-[9px] text-[var(--text-primary)]">{item.name}</div>
                <div className="text-[8px] text-[var(--text-muted)]">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-medium text-[var(--text-primary)] mb-1">
            {isAnalyst ? 'Technical queries' : 'Common questions'}
          </div>
          <div className="flex flex-col gap-1.5">
            {suggestedQuestions.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q)}
                className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded p-2 text-[9px] text-[var(--text-secondary)] text-left hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors">
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[8px] text-[var(--text-muted)] leading-relaxed mt-auto">
          {isAnalyst
            ? 'Analyst mode returns vegetation health scores, statistical analysis, and technical zone data. Not a substitute for formal environmental assessment.'
            : 'This AI only answers questions about mine rehabilitation and WA mining regulations. Not a substitute for professional environmental advice.'}
        </div>
      </div>
    </div>
  )
}