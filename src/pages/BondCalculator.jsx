import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { useSite } from '../SiteContext'

export default function BondCalculator() {
  const { selectedSite } = useSite()

  const [bondValue, setBondValue] = useState(selectedSite.bond)
  const [currentPct, setCurrentPct] = useState(selectedSite.recovered)
  const [growthRate, setGrowthRate] = useState(selectedSite.growthRate)
  const [milestone, setMilestone] = useState(80)

  useEffect(() => {
    setBondValue(selectedSite.bond)
    setCurrentPct(selectedSite.recovered)
    setGrowthRate(selectedSite.growthRate)
  }, [selectedSite.id])

  const yearsToTarget = (milestone - currentPct) / growthRate
  const releaseYear = 2026 + yearsToTarget
  const releaseQuarter = releaseYear % 1 < 0.25 ? 'Q1' : releaseYear % 1 < 0.5 ? 'Q2' : releaseYear % 1 < 0.75 ? 'Q3' : 'Q4'
  const releaseYearInt = Math.floor(releaseYear)
  const annualFinancingCost = bondValue * 0.05
  const delayedGrowth = growthRate / 2
  const delayedYears = (milestone - currentPct) / delayedGrowth
  const delayedReleaseYear = 2026 + delayedYears

  const chartData = Array.from({ length: 12 }, (_, i) => {
    const year = 2026 + i * 0.5
    return {
      year: year.toFixed(1),
      current: Math.min(currentPct + growthRate * i * 0.5, 100),
      slow: Math.min(currentPct + delayedGrowth * i * 0.5, 100),
    }
  })

  const formatCurrency = (val) =>
    val >= 1000000
      ? `$${(val / 1000000).toFixed(1)}M`
      : `$${val.toLocaleString()}`

  const delayQuarter = delayedReleaseYear % 1 < 0.25 ? 'Q1' : delayedReleaseYear % 1 < 0.5 ? 'Q2' : delayedReleaseYear % 1 < 0.75 ? 'Q3' : 'Q4'
  const delayYearInt = Math.floor(delayedReleaseYear)

  return (
    <div className="flex flex-col h-full">

      <div className="h-10 bg-[#161b22] border-b border-[#30363d] flex items-center px-4 flex-shrink-0">
        <div className="text-[10px] text-[#8b949e]">
          Bond calculator <span className="text-[#e6edf3]">/ {selectedSite.name}</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">

        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 mb-4 text-[10px] text-[#8b949e] leading-relaxed">
          The rehabilitation bond is money lodged with the WA government as a guarantee that the land will be properly restored. Once the government confirms the rehabilitation is complete, the full amount is returned. Use this calculator to see when that is likely to happen - and what it means for your capital.
        </div>

        <div className="grid grid-cols-2 gap-4">

          <div className="flex flex-col gap-4">

            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
              <div className="text-[11px] font-medium text-[#e6edf3] mb-4">Site inputs - {selectedSite.name}</div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Bond value ($AUD)', value: bondValue, set: setBondValue, step: 1000000, format: formatCurrency },
                  { label: 'Land currently recovered', value: currentPct, set: setCurrentPct, step: 1, suffix: '%' },
                  { label: 'Annual recovery rate', value: growthRate, set: setGrowthRate, step: 0.1, suffix: '%/yr' },
                  { label: 'Government milestone target', value: milestone, set: setMilestone, step: 1, suffix: '%' },
                ].map((input, i) => (
                  <div key={i}>
                    <div className="text-[9px] text-[#484f58] mb-1.5">{input.label}</div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => input.set(v => Math.max(0, parseFloat((v - input.step).toFixed(1))))}
                        className="w-6 h-6 bg-[#21262d] border border-[#30363d] rounded text-[#8b949e] text-xs flex items-center justify-center"
                      >-</button>
                      <div className="flex-1 bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-[10px] text-[#e6edf3] text-center">
                        {input.format ? input.format(input.value) : `${input.value}${input.suffix || ''}`}
                      </div>
                      <button
                        onClick={() => input.set(v => parseFloat((v + input.step).toFixed(1)))}
                        className="w-6 h-6 bg-[#21262d] border border-[#30363d] rounded text-[#8b949e] text-xs flex items-center justify-center"
                      >+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#1a2d1a] border border-[#2ea043] rounded-lg p-3">
                <div className="text-[8px] text-[#68d391] mb-2">If recovery continues at current rate</div>
                <div className="text-[18px] font-medium text-[#3fb950]">{releaseQuarter} {releaseYearInt}</div>
                <div className="text-[8px] text-[#68d391] mt-1">{formatCurrency(bondValue)} returned</div>
              </div>
              <div className="bg-[#2d2000] border border-[#e3b341] rounded-lg p-3">
                <div className="text-[8px] text-[#fde68a] mb-2">If recovery rate halves</div>
                <div className="text-[18px] font-medium text-[#e3b341]">{delayQuarter} {delayYearInt}</div>
                <div className="text-[8px] text-[#fde68a] mt-1">Significant delay</div>
              </div>
              <div className="bg-[#1c2128] border border-[#30363d] rounded-lg p-3">
                <div className="text-[8px] text-[#484f58] mb-2">Annual financing cost of delay</div>
                <div className="text-[18px] font-medium text-[#e6edf3]">{formatCurrency(annualFinancingCost)}</div>
                <div className="text-[8px] text-[#484f58] mt-1">per year at 5% rate</div>
              </div>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
              <div className="text-[10px] font-medium text-[#e6edf3] mb-2">What this means</div>
              <div className="text-[10px] text-[#8b949e] leading-relaxed">
                The {formatCurrency(bondValue)} bond is money lodged with the WA government. When {milestone}% of the land is verified as recovered, the full amount is returned. At the current recovery rate of {growthRate}% per year, this happens in <span className="text-[#3fb950] font-medium">{releaseQuarter} {releaseYearInt}</span>. Every year of delay costs approximately <span className="text-[#e3b341] font-medium">{formatCurrency(annualFinancingCost)}</span> in financing costs.
              </div>
            </div>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 flex flex-col">
            <div className="text-[11px] font-medium text-[#e6edf3] mb-1">Projected recovery path</div>
            <div className="text-[9px] text-[#484f58] mb-4">Current rate vs slower scenario - {selectedSite.name}</div>

            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                  <XAxis dataKey="year" tick={{ fontSize: 8, fill: '#484f58' }} />
                  <YAxis tick={{ fontSize: 8, fill: '#484f58' }} domain={[Math.max(0, currentPct - 5), 100]} />
                  <Tooltip
                    contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 4, fontSize: 10 }}
                    formatter={(val, name) => [`${val.toFixed(1)}%`, name === 'current' ? 'Current rate' : 'Slower rate']}
                  />
                  <ReferenceLine y={milestone} stroke="#484f58" strokeDasharray="4 4" label={{ value: `${milestone}% target`, position: 'insideTopRight', fontSize: 8, fill: '#484f58' }} />
                  <Line type="monotone" dataKey="current" stroke="#3fb950" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="slow" stroke="#e3b341" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-2 text-[9px] text-[#8b949e]">
                <div className="w-4 h-0.5 bg-[#3fb950]"></div>
                Current rate (+{growthRate}%/yr)
              </div>
              <div className="flex items-center gap-2 text-[9px] text-[#8b949e]">
                <div className="w-4 h-0 border-t border-dashed border-[#e3b341]"></div>
                Slower rate (+{delayedGrowth.toFixed(1)}%/yr)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}