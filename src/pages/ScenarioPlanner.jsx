import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { useSite } from '../SiteContext'

const apiUrl = import.meta.env.DEV
  ? 'http://localhost:3001/api/claude'
  : '/api/claude'

const interventions = [
  {
    id: 'none',
    label: 'Do nothing',
    desc: 'No intervention, let the site recover at its current pace',
    costMin: 0,
    costMax: 0,
    growthBoost: 0,
    riskMultiplier: 1.2,
    color: '#f85149',
  },
  {
    id: 'weed',
    label: 'Treat weed encroachment',
    desc: 'Ground inspection and buffel grass treatment in affected zones',
    costMin: 80000,
    costMax: 150000,
    growthBoost: 0.8,
    riskMultiplier: 0.9,
    color: '#e3b341',
  },
  {
    id: 'replant',
    label: 'Replanting programme',
    desc: 'Native seed mix applied to underperforming zones',
    costMin: 400000,
    costMax: 800000,
    growthBoost: 2.1,
    riskMultiplier: 0.7,
    color: '#3fb950',
  },
  {
    id: 'erosion',
    label: 'Erosion control works',
    desc: 'Install rock check dams and revegetation on eroded slopes',
    costMin: 200000,
    costMax: 500000,
    growthBoost: 1.4,
    riskMultiplier: 0.75,
    color: '#58a6ff',
  },
  {
    id: 'full',
    label: 'Full intervention programme',
    desc: 'All of the above: weed treatment, replanting, and erosion control',
    costMin: 700000,
    costMax: 1400000,
    growthBoost: 4.2,
    riskMultiplier: 0.5,
    color: '#3fb950',
  },
]

const externalFactors = [
  { id: 'normal', label: 'Normal conditions', rainfallMult: 1, growthMult: 1 },
  { id: 'drought', label: 'Below average rainfall', rainfallMult: 0.6, growthMult: 0.7 },
  { id: 'good', label: 'Above average rainfall', rainfallMult: 1.4, growthMult: 1.3 },
  { id: 'cyclone', label: 'Cyclone event', rainfallMult: 2.5, growthMult: 0.4 },
]

export default function ScenarioPlanner() {
  const { selectedSite } = useSite()
  const [intervention, setIntervention] = useState('none')
  const [externalFactor, setExternalFactor] = useState('normal')
  const [timeframe, setTimeframe] = useState(3)
  const [analysis, setAnalysis] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasAnalysis, setHasAnalysis] = useState(false)

  const selectedIntervention = interventions.find(i => i.id === intervention)
  const selectedFactor = externalFactors.find(f => f.id === externalFactor)

  const baseGrowth = selectedSite.growthRate
  const adjustedGrowth = Math.max(0.5, (baseGrowth + selectedIntervention.growthBoost) * selectedFactor.growthMult)
  const milestone = 80
  const currentPct = selectedSite.recovered

  const yearsToTarget = Math.max(0, (milestone - currentPct) / adjustedGrowth)
  const releaseYear = 2026 + yearsToTarget
  const releaseQuarter = releaseYear % 1 < 0.25 ? 'Q1' : releaseYear % 1 < 0.5 ? 'Q2' : releaseYear % 1 < 0.75 ? 'Q3' : 'Q4'
  const releaseYearInt = Math.floor(releaseYear)

  const baseYearsToTarget = Math.max(0, (milestone - currentPct) / baseGrowth)
  const baseReleaseYear = 2026 + baseYearsToTarget
  const monthsSaved = Math.round((baseReleaseYear - releaseYear) * 12)
  const financingCostPerYear = selectedSite.bond * 0.05
  const financingCostSaved = Math.round((monthsSaved / 12) * financingCostPerYear)
  const interventionCostMid = Math.round((selectedIntervention.costMin + selectedIntervention.costMax) / 2)
  const netBenefit = financingCostSaved - interventionCostMid

  const chartData = Array.from({ length: Math.ceil(timeframe * 2) + 1 }, (_, i) => {
    const year = 2026 + i * 0.5
    return {
      year: year.toFixed(1),
      withIntervention: Math.min(100, currentPct + adjustedGrowth * i * 0.5),
      withoutIntervention: Math.min(100, currentPct + baseGrowth * i * 0.5),
    }
  })

  const runAnalysis = async () => {
    setLoading(true)
    setAnalysis('')
    setHasAnalysis(true)

    const costStr = selectedIntervention.costMin === 0
      ? 'no upfront cost'
      : `an upfront cost of $${selectedIntervention.costMin.toLocaleString()} to $${selectedIntervention.costMax.toLocaleString()}`

    const prompt = `You are a senior mining rehabilitation advisor analysing a scenario for ${selectedSite.name} in the Pilbara, WA.

Current site status:
- Land recovered: ${selectedSite.recovered}%
- Annual recovery rate: +${selectedSite.growthRate}%/yr
- Bond value: $${(selectedSite.bond/1000000).toFixed(0)}M lodged with WA government
- Current projected bond release: ${selectedSite.release}
- Site status: ${selectedSite.status}

Scenario being analysed:
- Intervention: ${selectedIntervention.label}, ${selectedIntervention.desc}
- External conditions: ${selectedFactor.label}
- Timeframe: ${timeframe} years
- Upfront cost: ${costStr}
- Adjusted recovery rate with intervention: +${adjustedGrowth.toFixed(1)}%/yr
- Projected bond release with this scenario: ${releaseQuarter} ${releaseYearInt}
${monthsSaved > 0 ? `- Months saved vs doing nothing: ${monthsSaved} months` : monthsSaved < 0 ? `- Months delayed vs current trajectory: ${Math.abs(monthsSaved)} months` : '- No change to timeline'}
${netBenefit > 0 ? `- Estimated net financial benefit: $${netBenefit.toLocaleString()} (financing costs saved minus intervention cost)` : `- Estimated net cost: $${Math.abs(netBenefit).toLocaleString()}`}

Write a 3-paragraph plain-English analysis of this scenario:
1. What will happen to the site under these conditions
2. The financial case for or against this intervention
3. What you recommend and why

Be specific and use the actual numbers, zones, and dollar figures. Be direct and honest. If the scenario is bad, say so. Do not use markdown headers. Do not use long dashes or em dashes. Use regular hyphens or commas instead. No asterisks or bold text.`

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
      setAnalysis(data.content[0].text)
    } catch (err) {
      setAnalysis('Something went wrong. Please try again.')
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full">

      <div className="h-10 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 flex-shrink-0">
        <div className="text-[10px] text-[#8b949e]">
          Scenario planner <span className="text-[#e6edf3]">/ {selectedSite.name}</span>
        </div>
        <span className="text-[8px] px-2 py-0.5 rounded bg-[#1a3a1a] text-[#3fb950]">Claude AI</span>
      </div>

      <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">

        <div className="text-[10px] text-[#8b949e]">
          Model different intervention decisions and external conditions to see how they affect the bond release timeline and financial outcome. Claude analyses each scenario and gives you a plain-English recommendation.
        </div>

        <div className="grid grid-cols-3 gap-4">

          <div className="flex flex-col gap-3">

            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
              <div className="text-[10px] font-medium text-[#e6edf3] mb-3">What do you do?</div>
              <div className="flex flex-col gap-2">
                {interventions.map(i => (
                  <button
                    key={i.id}
                    onClick={() => { setIntervention(i.id); setHasAnalysis(false) }}
                    className={`text-left px-3 py-2 rounded border text-[9px] transition-colors ${
                      intervention === i.id
                        ? 'bg-[#1a3a1a] border-[#2ea043] text-[#3fb950]'
                        : 'bg-[#1c2128] border-[#30363d] text-[#8b949e] hover:text-[#e6edf3]'
                    }`}
                  >
                    <div className="font-medium">{i.label}</div>
                    <div className="text-[8px] mt-0.5 opacity-70">{i.desc}</div>
                    {i.costMin > 0 && (
                      <div className="text-[8px] mt-1 text-[#484f58]">
                        Cost: ${i.costMin.toLocaleString()} to ${i.costMax.toLocaleString()}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
              <div className="text-[10px] font-medium text-[#e6edf3] mb-3">External conditions</div>
              <div className="flex flex-col gap-2">
                {externalFactors.map(f => (
                  <button
                    key={f.id}
                    onClick={() => { setExternalFactor(f.id); setHasAnalysis(false) }}
                    className={`text-left px-3 py-2 rounded border text-[9px] transition-colors ${
                      externalFactor === f.id
                        ? 'bg-[#1a3a1a] border-[#2ea043] text-[#3fb950]'
                        : 'bg-[#1c2128] border-[#30363d] text-[#8b949e] hover:text-[#e6edf3]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
              <div className="text-[10px] font-medium text-[#e6edf3] mb-2">Timeframe: {timeframe} years</div>
              <input
                type="range" min="1" max="10" value={timeframe}
                onChange={e => { setTimeframe(parseInt(e.target.value)); setHasAnalysis(false) }}
                className="w-full accent-[#2ea043]"
              />
              <div className="flex justify-between text-[8px] text-[#484f58] mt-1">
                <span>1 yr</span>
                <span>5 yrs</span>
                <span>10 yrs</span>
              </div>
            </div>

          </div>

          <div className="flex flex-col gap-3">

            <div className={`rounded-lg p-4 border ${
              monthsSaved > 6 ? 'bg-[#1a2d1a] border-[#2ea043]' :
              monthsSaved < -6 ? 'bg-[#3d0000] border-[#f85149]' :
              'bg-[#2d2000] border-[#e3b341]'
            }`}>
              <div className="text-[9px] text-[#8b949e] mb-1">Projected bond release</div>
              <div className={`text-2xl font-medium mb-2 ${
                monthsSaved > 6 ? 'text-[#3fb950]' :
                monthsSaved < -6 ? 'text-[#f85149]' :
                'text-[#e3b341]'
              }`}>
                {releaseQuarter} {releaseYearInt}
              </div>
              <div className="text-[9px] text-[#8b949e]">
                {monthsSaved > 0
                  ? `${monthsSaved} months earlier than current trajectory`
                  : monthsSaved < 0
                  ? `${Math.abs(monthsSaved)} months later than current trajectory`
                  : 'No change to current timeline'
                }
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
                <div className="text-[8px] text-[#484f58] mb-1">Recovery rate</div>
                <div className="text-[16px] font-medium text-[#e6edf3]">+{adjustedGrowth.toFixed(1)}%</div>
                <div className="text-[8px] text-[#484f58]">per year</div>
              </div>
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
                <div className="text-[8px] text-[#484f58] mb-1">Intervention cost</div>
                <div className="text-[16px] font-medium text-[#e6edf3]">
                  {selectedIntervention.costMin === 0 ? '$0' : `$${(interventionCostMid/1000).toFixed(0)}k`}
                </div>
                <div className="text-[8px] text-[#484f58]">estimated midpoint</div>
              </div>
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
                <div className="text-[8px] text-[#484f58] mb-1">Financing cost saved</div>
                <div className={`text-[16px] font-medium ${financingCostSaved > 0 ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
                  {financingCostSaved > 0 ? `$${(financingCostSaved/1000).toFixed(0)}k` : '$0'}
                </div>
                <div className="text-[8px] text-[#484f58]">at 5%/yr on bond</div>
              </div>
              <div className={`rounded-lg p-3 border ${netBenefit > 0 ? 'bg-[#1a2d1a] border-[#2ea043]' : 'bg-[#1c2128] border-[#30363d]'}`}>
                <div className="text-[8px] text-[#484f58] mb-1">Net benefit</div>
                <div className={`text-[16px] font-medium ${netBenefit > 0 ? 'text-[#3fb950]' : 'text-[#e3b341]'}`}>
                  {netBenefit > 0 ? `+$${(netBenefit/1000).toFixed(0)}k` : netBenefit === 0 ? '$0' : `-$${(Math.abs(netBenefit)/1000).toFixed(0)}k`}
                </div>
                <div className="text-[8px] text-[#484f58]">saved minus cost</div>
              </div>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex-1 flex flex-col" style={{ minHeight: 180 }}>
              <div className="text-[10px] font-medium text-[#e6edf3] mb-1">Recovery projection</div>
              <div className="text-[9px] text-[#484f58] mb-2">With intervention vs without | {timeframe} year outlook</div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -15 }}>
                    <XAxis dataKey="year" tick={{ fontSize: 7, fill: '#484f58' }} interval={1} />
                    <YAxis tick={{ fontSize: 7, fill: '#484f58' }} domain={[currentPct - 2, Math.min(100, currentPct + adjustedGrowth * timeframe + 5)]} />
                    <Tooltip
                      contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 4, fontSize: 9 }}
                      formatter={(val, name) => [`${val.toFixed(1)}%`, name === 'withIntervention' ? selectedIntervention.label : 'No intervention']}
                    />
                    <ReferenceLine y={80} stroke="#484f58" strokeDasharray="4 4" label={{ value: '80% target', position: 'insideTopRight', fontSize: 8, fill: '#484f58' }} />
                    <Line type="monotone" dataKey="withIntervention" stroke={selectedIntervention.color} strokeWidth={2} dot={false} name="withIntervention" />
                    <Line type="monotone" dataKey="withoutIntervention" stroke="#484f58" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="withoutIntervention" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <button
              onClick={runAnalysis}
              disabled={loading}
              className="bg-[#1a3a1a] border border-[#2ea043] rounded py-2.5 text-[10px] text-[#3fb950] font-medium disabled:opacity-50"
            >
              {loading ? 'Analysing scenario...' : 'Get Claude AI analysis'}
            </button>

          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-medium text-[#e6edf3]">AI recommendation</div>
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-[#1a3a1a] text-[#3fb950]">Claude AI</span>
            </div>

            {!hasAnalysis && !loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="text-[28px] mb-3">◎</div>
                <div className="text-[10px] text-[#484f58]">
                  Choose an intervention and conditions, then click "Get Claude AI analysis" for a plain-English recommendation.
                </div>
              </div>
            )}

            {loading && (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="text-[10px] text-[#3fb950]">Analysing scenario...</div>
              </div>
            )}

            {hasAnalysis && analysis && (
              <div className="flex-1 overflow-auto">
                <div className="text-[10px] text-[#8b949e] leading-relaxed whitespace-pre-line">
                  {analysis}
                </div>
                <div className="mt-4 pt-3 border-t border-[#30363d] text-[8px] text-[#484f58] italic">
                  Analysis by Claude AI, based on {selectedSite.name} satellite data and WA Mining Act 1978. Not a substitute for professional environmental or financial advice.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}