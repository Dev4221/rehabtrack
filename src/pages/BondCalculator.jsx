import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { useSite } from '../SiteContext'

export default function BondCalculator() {
  const { selectedSite } = useSite()
  const [view, setView] = useState('executive')
  const [bondValue, setBondValue] = useState(selectedSite.bond)
  const [currentPct, setCurrentPct] = useState(selectedSite.recovered)
  const [growthRate, setGrowthRate] = useState(selectedSite.growthRate)
  const [milestone, setMilestone] = useState(80)

  const isAnalyst = view === 'analyst'

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
  const delayQuarter = delayedReleaseYear % 1 < 0.25 ? 'Q1' : delayedReleaseYear % 1 < 0.5 ? 'Q2' : delayedReleaseYear % 1 < 0.75 ? 'Q3' : 'Q4'
  const delayYearInt = Math.floor(delayedReleaseYear)

  const chartData = Array.from({ length: 12 }, (_, i) => {
    const year = 2026 + i * 0.5
    return { year: year.toFixed(1), current: Math.min(currentPct + growthRate * i * 0.5, 100), slow: Math.min(currentPct + delayedGrowth * i * 0.5, 100) }
  })

  const formatCurrency = (val) => val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : `$${val.toLocaleString()}`

  return (
    <div className="flex flex-col h-full">

      <div className="h-10 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center justify-between px-4 flex-shrink-0">
        <div className="text-[10px] text-[var(--text-secondary)]">
          Bond calculator <span className="text-[var(--text-primary)]">/ {selectedSite.name}</span>
        </div>
        <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-full p-0.5 flex gap-0.5">
          <button onClick={() => setView('executive')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${!isAnalyst ? 'bg-[var(--green-bg)] text-[var(--green)]' : 'text-[var(--text-muted)]'}`}>Executive</button>
          <button onClick={() => setView('analyst')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${isAnalyst ? 'bg-[var(--green-bg)] text-[var(--green)]' : 'text-[var(--text-muted)]'}`}>Analyst</button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">

        <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4 mb-4 text-[10px] text-[var(--text-secondary)] leading-relaxed">
          {isAnalyst
            ? `Bond modelling tool for ${selectedSite.name}. Inputs: bond value, current recovery percentage, annual NDVI velocity, and government milestone threshold. Outputs: projected release date under current trajectory and a 50% velocity reduction scenario. Financing cost calculated at 5%/yr on lodged bond value.`
            : `The rehabilitation bond is money lodged with the WA government as a guarantee that the land will be properly restored. Once the government confirms the rehabilitation is complete, the full amount is returned. Use this calculator to see when that is likely to happen and what it means for your capital.`
          }
        </div>

        <div className="grid grid-cols-2 gap-4">

          <div className="flex flex-col gap-4">

            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4">
              <div className="text-[11px] font-medium text-[var(--text-primary)] mb-4">
                {isAnalyst ? `Model inputs | ${selectedSite.name}` : `Site inputs | ${selectedSite.name}`}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { execLabel: 'Bond value ($AUD)', analLabel: 'Bond value (lodged)', value: bondValue, set: setBondValue, step: 1000000, format: formatCurrency },
                  { execLabel: 'Land currently recovered', analLabel: 'Current recovery (%)', value: currentPct, set: setCurrentPct, step: 1, suffix: '%' },
                  { execLabel: 'Annual recovery rate', analLabel: 'NDVI velocity (%/yr)', value: growthRate, set: setGrowthRate, step: 0.1, suffix: '%/yr' },
                  { execLabel: 'Government milestone target', analLabel: 'Release threshold (%)', value: milestone, set: setMilestone, step: 1, suffix: '%' },
                ].map((input, i) => (
                  <div key={i}>
                    <div className="text-[9px] text-[var(--text-muted)] mb-1.5">{isAnalyst ? input.analLabel : input.execLabel}</div>
                    <div className="flex items-center gap-1">
                      <button onClick={() => input.set(v => Math.max(0, parseFloat((v - input.step).toFixed(1))))} className="w-6 h-6 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-[var(--text-secondary)] text-xs flex items-center justify-center">-</button>
                      <div className="flex-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-[10px] text-[var(--text-primary)] text-center">
                        {input.format ? input.format(input.value) : `${input.value}${input.suffix || ''}`}
                      </div>
                      <button onClick={() => input.set(v => parseFloat((v + input.step).toFixed(1)))} className="w-6 h-6 bg-[var(--bg-elevated)] border border-[var(--border)] rounded text-[var(--text-secondary)] text-xs flex items-center justify-center">+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[var(--green-dark)] border border-[var(--green-border)] rounded-lg p-3">
                <div className="text-[8px] text-[var(--green)] mb-2">{isAnalyst ? 'Base case projection' : 'If recovery continues at current rate'}</div>
                <div className="text-[18px] font-medium text-[var(--green)]">{releaseQuarter} {releaseYearInt}</div>
                <div className="text-[8px] text-[var(--green)] mt-1">{isAnalyst ? `NDVI velocity: +${growthRate}%/yr` : `${formatCurrency(bondValue)} returned`}</div>
              </div>
              <div className="bg-[var(--amber-bg)] border border-[var(--amber-border)] rounded-lg p-3">
                <div className="text-[8px] text-[var(--amber)] mb-2">{isAnalyst ? 'Downside case (50% velocity reduction)' : 'If recovery rate halves'}</div>
                <div className="text-[18px] font-medium text-[var(--amber)]">{delayQuarter} {delayYearInt}</div>
                <div className="text-[8px] text-[var(--amber)] mt-1">{isAnalyst ? `NDVI velocity: +${delayedGrowth.toFixed(1)}%/yr` : 'Significant delay'}</div>
              </div>
              <div className="bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg p-3">
                <div className="text-[8px] text-[var(--text-muted)] mb-2">{isAnalyst ? 'Opportunity cost (5%/yr)' : 'Annual financing cost of delay'}</div>
                <div className="text-[18px] font-medium text-[var(--text-primary)]">{formatCurrency(annualFinancingCost)}</div>
                <div className="text-[8px] text-[var(--text-muted)] mt-1">per year at 5% rate</div>
              </div>
            </div>

            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4">
              <div className="text-[10px] font-medium text-[var(--text-primary)] mb-2">{isAnalyst ? 'Model summary' : 'What this means'}</div>
              {isAnalyst ? (
                <ul className="flex flex-col gap-1">
                  {[
                    `Bond value: ${formatCurrency(bondValue)} lodged with DMIRS`,
                    `Release threshold: ${milestone}% of disturbed area must meet NDVI > 0.35`,
                    `Base case: ${releaseQuarter} ${releaseYearInt} at +${growthRate}%/yr`,
                    `Downside case: ${delayQuarter} ${delayYearInt} at +${delayedGrowth.toFixed(1)}%/yr`,
                    `Opportunity cost: ${formatCurrency(annualFinancingCost)}/yr at 5% financing rate`,
                  ].map((point, i) => (
                    <li key={i} className="flex gap-2 text-[9px] text-[var(--text-secondary)]">
                      <span className="text-[var(--green)] flex-shrink-0">-</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-[10px] text-[var(--text-secondary)] leading-relaxed">
                  The {formatCurrency(bondValue)} bond is money lodged with the WA government. When {milestone}% of the land is verified as recovered, the full amount is returned. At the current recovery rate of {growthRate}% per year, this happens in <span className="text-[var(--green)] font-medium">{releaseQuarter} {releaseYearInt}</span>. Every year of delay costs approximately <span className="text-[var(--amber)] font-medium">{formatCurrency(annualFinancingCost)}</span> in financing costs.
                </div>
              )}
            </div>
          </div>

          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-4 flex flex-col">
            <div className="text-[11px] font-medium text-[var(--text-primary)] mb-1">{isAnalyst ? 'Recovery trajectory model' : 'Projected recovery path'}</div>
            <div className="text-[9px] text-[var(--text-muted)] mb-4">{isAnalyst ? `Base case vs downside scenario | ${selectedSite.name}` : `Current rate vs slower scenario | ${selectedSite.name}`}</div>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                  <XAxis dataKey="year" tick={{ fontSize: 8, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 8, fill: 'var(--text-muted)' }} domain={[Math.max(0, currentPct - 5), 100]} />
                  <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 4, fontSize: 10 }} formatter={(val, name) => [`${val.toFixed(1)}%`, name === 'current' ? isAnalyst ? `Base case (+${growthRate}%/yr)` : 'Current rate' : isAnalyst ? `Downside (+${delayedGrowth.toFixed(1)}%/yr)` : 'Slower rate']} />
                  <ReferenceLine y={milestone} stroke="var(--text-muted)" strokeDasharray="4 4" label={{ value: isAnalyst ? `${milestone}% threshold` : `${milestone}% target`, position: 'insideTopRight', fontSize: 8, fill: 'var(--text-muted)' }} />
                  <Line type="monotone" dataKey="current" stroke="var(--green)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="slow" stroke="var(--amber)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-3">
              <div className="flex items-center gap-2 text-[9px] text-[var(--text-secondary)]">
                <div className="w-4 h-0.5 bg-[var(--green)]"></div>
                {isAnalyst ? `Base case (+${growthRate}%/yr)` : `Current rate (+${growthRate}%/yr)`}
              </div>
              <div className="flex items-center gap-2 text-[9px] text-[var(--text-secondary)]">
                <div className="w-4 h-0 border-t border-dashed border-[var(--amber)]"></div>
                {isAnalyst ? `Downside (+${delayedGrowth.toFixed(1)}%/yr)` : `Slower rate (+${delayedGrowth.toFixed(1)}%/yr)`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}