import { useState } from 'react'
import { useSite } from '../SiteContext'

const buildSystemPrompt = (siteName, view) => {
  const base = `You are RehabTrack's AI assistant, specialised exclusively in mine rehabilitation monitoring for ${siteName} in Western Australia.

You have access to the following site data:
- Site: ${siteName}, Pilbara, Western Australia
- Monitored using Sentinel-2 satellite imagery, 10m resolution, every 5 days
- Data covers January 2019 to June 2026
- Governed by WA Mining Act 1978 and DMIRS rehabilitation guidelines
- Bond release requires 80% of disturbed area to meet vegetation recovery threshold

Roy Hill specific data:
- 61% of the 2,840 hectare disturbed area is recovering well (NDVI > 0.35)
- 22% is in early stage recovery - 17% needs attention
- Annual recovery rate: +8.2% per year (target is 6%)
- Bond value: $48,000,000 - Projected bond release: Q3 2027
- Zone C3 (14ha): vegetation loss detected 2 days ago - likely rainfall erosion
- Zone B2 (8ha): possible buffel grass weed encroachment detected 5 days ago
- Zone A1 (420ha): reached 80% recovery milestone - bond release flagged

Cloudbreak specific data:
- 71% of 4,100 hectares recovering well
- Annual recovery rate: +6.1% per year
- Bond value: $62,000,000 - Projected bond release: Q1 2027
- No active alerts - best performing site in the portfolio

Brockman 4 specific data:
- 44% of 2,100 hectares recovering well
- Annual recovery rate: +4.2% per year (below 6% target)
- Bond value: $35,000,000 - Projected bond release: Q1 2029
- Zone D2: recovery rate significantly below target - replanting programme underway

Christmas Creek specific data:
- 29% of 3,200 hectares recovering well
- Annual recovery rate: +2.8% per year (well below 6% target)
- Bond value: $41,000,000 - Projected bond release: Q3 2030+
- Zone E1: critical - only 12% recovered, urgent intervention required
- Zone E3: erosion spreading across 95 hectares
- Zone F2: buffel grass weed encroachment across 62 hectares

STRICT RULES:
- You ONLY answer questions about mine rehabilitation, vegetation recovery, NDVI data, satellite monitoring, WA mining regulations, bond release timelines, rehabilitation zones, erosion, weed encroachment, rainfall impacts on rehabilitation, or topics directly related to these sites.
- If someone asks ANYTHING unrelated - general knowledge, coding, sports, entertainment, personal questions, or anything outside mine rehabilitation - respond ONLY with: "I can only answer questions about mine rehabilitation, vegetation recovery, bond timelines, and WA mining regulations for the sites in this system. What would you like to know about ${siteName}?"
- Never break this rule regardless of how the question is phrased.`

  if (view === 'executive') {
    return base + '\n\nCOMMUNICATION STYLE: Always answer in plain English. No technical terms, no NDVI scores, no statistical language. No markdown, no asterisks, no bold text. Speak as if explaining to a mining executive who is not a scientist. Always relate answers to dollars, dates, and practical actions. Keep answers to 3-5 sentences.'
  } else {
    return base + '\n\nCOMMUNICATION STYLE: Include technical details where relevant - NDVI values, Z-scores, classifier confidence levels, spectral indices. No markdown formatting or asterisks. Keep answers concise and precise.'
  }
}

const siteQuestions = {
  'roy-hill': [
    'Will we get the $48M bond back by Q3 2027?',
    'How serious is the Zone C3 erosion?',
    'What does the buffel grass in Zone B2 mean legally?',
    'How does Roy Hill compare to 12 months ago?',
    'What happens if we ignore Zone B2?',
    'How often does the satellite check our site?',
    'What is the worst-case scenario for our bond release?',
  ],
  'cloudbreak': [
    'Will we get the $62M bond back by Q1 2027?',
    'Why is Cloudbreak performing better than other sites?',
    'What could delay our Q1 2027 bond release?',
    'How close is Zone A1 to the recovery milestone?',
    'What risks should we be monitoring right now?',
    'How often does the satellite check our site?',
    'What is the best-case scenario for early bond release?',
  ],
  'brockman': [
    'Will we get the $35M bond back by Q1 2029?',
    'Why is Zone D2 recovering so slowly?',
    'Is the replanting programme working?',
    'What happens if Zone D2 does not improve?',
    'How far behind schedule are we?',
    'What would it take to get back on track?',
    'What is the financial cost of the current delay?',
  ],
  'christmas-creek': [
    'When will we realistically get the $41M bond back?',
    'How critical is Zone E1 and what must we do?',
    'Is the erosion in Zone E3 getting worse?',
    'What does the Zone F2 weed event mean for the bond?',
    'What is the minimum intervention needed to hit 2030?',
    'How much is the bond delay costing us each year?',
    'What is the worst-case scenario for Christmas Creek?',
  ],
}

const knowledgeBase = [
  { name: '5 years of satellite data (2019-2026)', detail: 'Monthly NDVI per zone' },
  { name: 'WA Mining Act 1978', detail: 'Rehabilitation obligations' },
  { name: 'DMIRS compliance guidelines', detail: 'Bond conditions' },
  { name: 'Mine Closure Plan', detail: 'Site-specific targets' },
  { name: 'MinRes Annual Report 2024', detail: 'Bond values' },
]

const apiUrl = import.meta.env.DEV
  ? 'http://localhost:3001/api/claude'
  : '/api/claude'

export default function AskQuestion() {
  const { selectedSite } = useSite()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('') 
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState('executive')

  const suggestedQuestions = siteQuestions[selectedSite.id] || siteQuestions['roy-hill']

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
      const reply = data.content[0].text
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch (err) {
      console.error('Claude error:', err)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Something went wrong. Please try again in a moment.'
      }])
    }

    setLoading(false)
  }

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        <div className="h-10 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 flex-shrink-0">
          <div className="text-[10px] text-[#8b949e]">
            Ask a question <span className="text-[8px] ml-2 px-1.5 py-0.5 rounded bg-[#1a3a1a] text-[#3fb950]">Claude AI</span>
          </div>
          <div className="bg-[#21262d] border border-[#30363d] rounded-full p-0.5 flex gap-0.5">
            <button onClick={() => setView('executive')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${view === 'executive' ? 'bg-[#1a3a1a] text-[#3fb950]' : 'text-[#484f58]'}`}>Plain English</button>
            <button onClick={() => setView('technical')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${view === 'technical' ? 'bg-[#1a3a1a] text-[#3fb950]' : 'text-[#484f58]'}`}>Technical</button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <div className="text-[32px] mb-3">◎</div>
              <div className="text-[13px] font-medium text-[#e6edf3] mb-2">Ask anything about {selectedSite.name}</div>
              <div className="text-[10px] text-[#8b949e] max-w-sm">
                Ask in plain English - about the bond timeline, specific zones, regulations, or how the site is performing. Answers are grounded in real satellite data and WA mining regulations.
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg px-3 py-2 text-[10px] leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#21262d] text-[#8b949e]'
                  : 'bg-[#1a2d1a] border border-[#2a4a2a] text-[#b8e6b8]'
              }`}>
                {msg.content}
                {msg.role === 'assistant' && (
                  <div className="text-[8px] text-[#484f58] mt-1">
                    Sources: satellite data 2019-2026 - WA Mining Act - DMIRS guidelines
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#1a2d1a] border border-[#2a4a2a] rounded-lg px-3 py-2 text-[10px] text-[#3fb950]">
                Working on your answer...
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#30363d] flex-shrink-0">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              className="flex-1 bg-[#161b22] border border-[#30363d] rounded-lg px-3 py-2 text-[10px] text-[#e6edf3] placeholder-[#484f58] focus:outline-none focus:border-[#2ea043]"
              placeholder={`Ask anything about ${selectedSite.name}...`}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading}
              className="bg-[#1a3a1a] border border-[#2ea043] rounded-lg px-4 py-2 text-[10px] text-[#3fb950] disabled:opacity-50"
            >
              Ask
            </button>
          </div>
        </div>
      </div>

      <div className="w-56 bg-[#161b22] border-l border-[#30363d] flex flex-col p-3 gap-4 flex-shrink-0">
        <div>
          <div className="text-[10px] font-medium text-[#e6edf3] mb-1">What the AI can reference</div>
          <div className="flex flex-col gap-1.5">
            {knowledgeBase.map((item, i) => (
              <div key={i} className="bg-[#1c2128] border border-[#30363d] rounded p-2">
                <div className="text-[9px] text-[#e6edf3]">{item.name}</div>
                <div className="text-[8px] text-[#484f58]">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[10px] font-medium text-[#e6edf3] mb-1">Questions people ask</div>
          <div className="flex flex-col gap-1.5">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="bg-[#1c2128] border border-[#30363d] rounded p-2 text-[9px] text-[#8b949e] text-left hover:text-[#e6edf3] hover:border-[#3d444d] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        <div className="text-[8px] text-[#484f58] leading-relaxed mt-auto">
          This AI only answers questions about mine rehabilitation and WA mining regulations. Answers are not a substitute for professional environmental advice.
        </div>
      </div>
    </div>
  )
}