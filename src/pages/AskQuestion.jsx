import { useState } from 'react'
import ReactMarkdown from 'react-markdown'

const SYSTEM_PROMPT = `You are RehabTrack's AI assistant for the Roy Hill iron ore mine in Western Australia.

You have access to the following site data:
- 61% of the 2,840 hectare disturbed area is recovering well (NDVI > 0.35)
- 22% is in early stage recovery
- 17% needs attention
- Annual recovery rate: +8.2% per year (target is 6%)
- Bond value: $48,000,000 lodged with WA government
- Projected bond release: Q3 2027
- Zone C3 (14ha): vegetation loss detected 2 days ago — likely rainfall erosion
- Zone B2 (8ha): possible buffel grass weed encroachment detected 5 days ago
- Zone A1 (420ha): reached 80% recovery milestone — bond release flagged
- Satellite: Sentinel-2, 10m resolution, every 5 days
- Data covers 2019 to June 2026

You answer questions in plain English unless asked for technical details.
Never use jargon. Always relate answers to dollars, dates, and practical actions.
Keep answers concise — 3 to 5 sentences maximum.
Always cite which zones or data you are referring to.
Do not use markdown bold or asterisks in your answers. Write in plain sentences only.`

const suggestedQuestions = [
  'Will we get the bond money back on time?',
  'Which areas are most at risk of delaying the bond release?',
  'What does the weed issue in Zone B2 mean for us legally?',
  'How does this site compare to 12 months ago?',
  'What would happen if we did nothing about Zone C3?',
  'How often does the satellite check our site?',
  'What is the worst-case scenario for our bond release?',
]

const knowledgeBase = [
  { name: '5 years of satellite data (2019–2026)', detail: 'Monthly NDVI per zone' },
  { name: 'WA Mining Act 1978', detail: 'Rehabilitation obligations' },
  { name: 'DMIRS compliance guidelines', detail: 'Bond conditions' },
  { name: 'Mine Closure Plan', detail: 'Site-specific targets' },
  { name: 'MinRes Annual Report 2024', detail: 'Bond values' },
]

const apiUrl = import.meta.env.DEV
  ? 'http://localhost:3001/api/claude'
  : '/api/claude'

export default function AskQuestion() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState('executive')

  const sendMessage = async (question) => {
    const userMessage = question || input
    if (!userMessage.trim()) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setLoading(true)

    try {
      const systemPrompt = view === 'executive'
        ? SYSTEM_PROMPT + '\n\nIMPORTANT: Always answer in plain English. No technical terms, no NDVI scores, no statistical language. No markdown, no asterisks, no bold text. Speak as if explaining to a mining executive who is not a scientist.'
        : SYSTEM_PROMPT + '\n\nIMPORTANT: Include technical details — NDVI values, Z-scores, classifier confidence levels, spectral indices where relevant. No markdown formatting.'

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5',
          max_tokens: 1024,
          system: systemPrompt,
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
              <div className="text-[13px] font-medium text-[#e6edf3] mb-2">Ask anything about this site</div>
              <div className="text-[10px] text-[#8b949e] max-w-sm">
                Ask in plain English — about the bond timeline, specific zones, regulations, or how the site is performing. The AI answers using real satellite data and WA mining regulations.
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
                    Sources: satellite data 2019–2026 · WA Mining Act · DMIRS guidelines
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
              placeholder="Ask anything — for example: Will we get the bond back by 2027?"
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
          Answers are based on real satellite data and WA regulations. Not a substitute for professional environmental advice.
        </div>
      </div>
    </div>
  )
}