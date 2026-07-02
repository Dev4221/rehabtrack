import { useState, useEffect } from 'react'
import { useSite } from '../SiteContext'
import { useNavigate } from 'react-router-dom'

const portfolioStats = {
  totalBond: 186,
  atRisk: 76,
  atRiskSites: 'Brockman 4 + Christmas Creek',
}

const allSiteCards = [
  {
    id: 'cloudbreak',
    name: 'Cloudbreak',
    bond: 62000000,
    recovered: 71,
    growthRate: 6.1,
    release: 'Q1 2027',
    releaseColor: 'green',
    status: 'on-track',
    toGo: 9,
    alerts: [],
    noActionText: 'No action required. All areas recovering as expected.',
  },
  {
    id: 'roy-hill',
    name: 'Roy Hill',
    bond: 48000000,
    recovered: 61,
    growthRate: 8.2,
    release: 'Q3 2027',
    releaseColor: 'green',
    status: 'on-track',
    toGo: 19,
    alerts: [
      { sev: 'urgent', text: 'Southern section - monitor weekly' },
      { sev: 'attention', text: 'Western section weed - inspect within 2 weeks' },
    ],
  },
  {
    id: 'brockman',
    name: 'Brockman 4',
    bond: 35000000,
    recovered: 44,
    growthRate: 4.2,
    release: 'Q1 2029',
    releaseColor: 'amber',
    status: 'slow',
    toGo: 36,
    alerts: [
      { sev: 'attention', text: 'Eastern section replanting needed before wet season' },
    ],
  },
  {
    id: 'christmas-creek',
    name: 'Christmas Creek',
    bond: 41000000,
    recovered: 29,
    growthRate: 2.8,
    release: '2030+',
    releaseColor: 'red',
    status: 'at-risk',
    toGo: 51,
    alerts: [
      { sev: 'urgent', text: 'Northern section critical - urgent intervention' },
      { sev: 'urgent', text: 'Central erosion spreading - control works needed' },
      { sev: 'attention', text: 'Southern weed - legally reportable, bond blocked' },
    ],
  },
]

const siteData = {
  'roy-hill': {
    recovered: 61, growthRate: 8.2, bond: 48000000,
    release: 'Q3 2027', status: 'on-track', operator: 'Roy Hill Holdings',
    alertCount: 2, releaseColor: 'green',
    verdictExec: 'Bond release on track for Q3 2027. Two active issues require attention in the next two weeks.',
    verdictSub: '61% of the disturbed land is recovering well at +8.2% per year, ahead of the 6% government target.',
    whatNext: 'Confirm the western section weed inspection has been booked and review the southern section erosion alert.',
    verdictAnal: 'NDVI mean: 0.41 | Recovery velocity: +8.2%/yr | Baseline: 2019-2024 seasonal average',
    verdictAnalSub: 'Classifier output: 61% rehabilitating (NDVI > 0.35) | 22% early regrowth | 17% bare | Sentinel-2 10m',
    analNote: '2 anomalies: Zone C3 Z-score -2.8 (bare/disturbed, 91% confidence) | Zone B2 band ratio anomaly (buffel grass, 78% confidence)',
    kpiReleaseLabel: '$48M returned to operator',
    kpiAlertSub: 'detected by AI agents',
    kpiReleaseLabelAnal: 'NDVI velocity +8.2%/yr vs 6% target',
    kpiAlertSubAnal: 'Z-score threshold exceeded',
    askExec: { q: 'Will we get the $48M bond back on time?', a: 'Yes. Roy Hill is on track. At +8.2% per year the site will meet the government\'s requirements by Q3 2027 and the full $48M will be returned.' },
    askAnal: { q: 'What is Zone C3 Z-score vs seasonal baseline?', a: 'Zone C3 Z-score: -2.8 vs 5-year seasonal mean. NDVI dropped from 0.30 to 0.12 over 30 days. Classifier: bare/disturbed at 91% confidence.' },
  },
  'cloudbreak': {
    recovered: 71, growthRate: 6.1, bond: 62000000,
    release: 'Q1 2027', status: 'on-track', operator: 'Fortescue Metals Group',
    alertCount: 0, releaseColor: 'green',
    verdictExec: 'Best performing site in the portfolio. Bond release on track for Q1 2027 with no active issues.',
    verdictSub: '71% of the disturbed land is recovering well at +6.1% per year, meeting the 6% government target.',
    whatNext: 'No action required. Monitor Zone A1 bond release verification progress with DEMIRS.',
    verdictAnal: 'NDVI mean: 0.49 | Recovery velocity: +6.1%/yr | Baseline: 2019-2024 seasonal average',
    verdictAnalSub: 'Classifier output: 71% rehabilitating (NDVI > 0.35) | 18% early regrowth | 11% bare | Sentinel-2 10m',
    analNote: 'Zone A1 NDVI mean 0.58 sustained above 0.35 threshold for 4 consecutive months. Bond milestone confirmed.',
    kpiReleaseLabel: '$62M returned to operator',
    kpiAlertSub: 'no issues detected',
    kpiReleaseLabelAnal: 'NDVI velocity +6.1%/yr vs 6% target',
    kpiAlertSubAnal: 'all zones within seasonal baseline',
    askExec: { q: 'Will we get the $62M bond back on time?', a: 'Yes. Cloudbreak is the best performing site in the portfolio. At +6.1% per year it will meet the government\'s requirements by Q1 2027 and the full $62M will be returned.' },
    askAnal: { q: 'Has Zone A1 met the NDVI release threshold?', a: 'Yes. Zone A1 NDVI mean of 0.58 has been sustained above the 0.35 rehabilitating threshold for 4 consecutive months. Bond milestone confirmed and flagged for DEMIRS verification.' },
  },
  'brockman': {
    recovered: 44, growthRate: 4.2, bond: 35000000,
    release: 'Q1 2029', status: 'slow', operator: 'Rio Tinto',
    alertCount: 1, releaseColor: 'amber',
    verdictExec: 'Eastern section recovering at less than half the required pace. Bond release at risk of an 18-month delay without intervention.',
    verdictSub: '44% of the disturbed land is recovering at +4.2% per year, below the 6% government target.',
    whatNext: 'Approve the eastern section replanting programme before the next wet season to avoid further delay.',
    verdictAnal: 'NDVI mean: 0.31 | Recovery velocity: +4.2%/yr | Baseline: 2019-2024 seasonal average',
    verdictAnalSub: 'Classifier output: 44% rehabilitating | 28% early regrowth | 28% bare | Sentinel-2 10m',
    analNote: 'Zone D2 velocity +2.1%/yr vs 6% target. Linear regression R2: 0.89. Projected milestone: Q3 2031 vs target Q1 2029.',
    kpiReleaseLabel: '$35M - delay risk without intervention',
    kpiAlertSub: 'eastern section below target',
    kpiReleaseLabelAnal: 'NDVI velocity +4.2%/yr vs 6% target',
    kpiAlertSubAnal: 'Zone D2 velocity +2.1%/yr',
    askExec: { q: 'Will we get the $35M bond back by Q1 2029?', a: 'At risk. The eastern section is recovering at less than half the required rate. Without a replanting programme before the next wet season, the bond release will move from Q1 2029 to mid-2030 at the earliest.' },
    askAnal: { q: 'What is Zone D2 NDVI velocity vs regulatory target?', a: 'Zone D2 velocity: +2.1%/yr vs 6% regulatory target. Linear regression R2: 0.89. At current rate, projected milestone Q3 2031 vs target Q1 2029. Replanting programme recommended before wet season.' },
  },
  'christmas-creek': {
    recovered: 29, growthRate: 2.8, bond: 41000000,
    release: 'Q3 2030+', status: 'at-risk', operator: 'Fortescue Metals Group',
    alertCount: 3, releaseColor: 'red',
    verdictExec: 'Highest risk site in the portfolio. At the current recovery rate, the $41M bond will not be released until 2030 at the earliest - five years late.',
    verdictSub: '29% of the disturbed land is recovering at only +2.8% per year, well below the 6% government target.',
    whatNext: 'Authorise emergency intervention for the northern section and notify DEMIRS of the southern section weed event.',
    verdictAnal: 'NDVI mean: 0.21 | Recovery velocity: +2.8%/yr | Baseline: 2019-2024 seasonal average',
    verdictAnalSub: 'Classifier output: 29% rehabilitating | 35% early regrowth | 36% bare | Sentinel-2 10m',
    analNote: '3 anomalies: Zone E1 NDVI 0.08, Z-score -3.4, projected 2035+ | Zone E3 erosion 40ha to 95ha | Zone F2 Cenchrus ciliaris 83%, MCP s.4.2 reportable.',
    kpiReleaseLabel: '$41M - five years behind target',
    kpiAlertSub: 'including 2 urgent, 1 reportable',
    kpiReleaseLabelAnal: 'NDVI velocity +2.8%/yr vs 6% target',
    kpiAlertSubAnal: 'Zone E1 Z-score -3.4 | MCP s.4.2 triggered',
    askExec: { q: 'When will we realistically get the $41M bond back?', a: 'Not before 2030 at the earliest, and likely later without urgent intervention. The northern section alone is projected to miss the government threshold until 2035. Every year of delay costs approximately $2M in financing.' },
    askAnal: { q: 'What is Zone E1 recovery trajectory vs release threshold?', a: 'Zone E1 NDVI mean: 0.08, well below 0.15 early regrowth threshold. Annual velocity: +1.2%/yr. Z-score vs site average: -3.4. At current rate, projected milestone 2035+. Urgent ground intervention required.' },
  },
}

const colorMap = {
  green: {
    bg: 'bg-[var(--green-dark)]', border: 'border-[var(--green-border)]',
    text: 'text-[var(--green)]', badge: 'bg-[var(--green-bg)] border-[var(--green-border)] text-[var(--green)]',
    cardBg: 'rgba(46,160,67,0.04)', cardBorder: 'rgba(46,160,67,0.25)',
    bar: '#2ea043', alertBorder: 'rgba(46,160,67,0.2)',
  },
  amber: {
    bg: 'bg-[var(--amber-bg)]', border: 'border-[var(--amber-border)]',
    text: 'text-[var(--amber)]', badge: 'bg-[var(--amber-bg)] border-[var(--amber-border)] text-[var(--amber)]',
    cardBg: 'rgba(210,153,34,0.06)', cardBorder: 'rgba(210,153,34,0.35)',
    bar: '#d29922', alertBorder: 'rgba(210,153,34,0.2)',
  },
  red: {
    bg: 'bg-[var(--red-bg)]', border: 'border-[var(--red-border)]',
    text: 'text-[var(--red)]', badge: 'bg-[var(--red-bg)] border-[var(--red-border)] text-[var(--red)]',
    cardBg: 'rgba(248,81,73,0.06)', cardBorder: 'rgba(248,81,73,0.4)',
    bar: '#f85149', alertBorder: 'rgba(248,81,73,0.2)',
  },
}

export default function Dashboard() {
  const { selectedSite } = useSite()
  const navigate = useNavigate()
  const [view, setView] = useState('executive')

  const isAnalyst = view === 'analyst'
  const site = siteData[selectedSite.id] || siteData['roy-hill']
  const c = colorMap[site.releaseColor]

  const alertCardColor = site.alertCount === 0
    ? 'bg-[var(--green-dark)] border-[var(--green-border)]'
    : site.alertCount >= 3
    ? 'bg-[var(--red-bg)] border-[var(--red-border)]'
    : 'bg-[var(--amber-bg)] border-[var(--amber-border)]'

  const alertTextColor = site.alertCount === 0
    ? 'text-[var(--green)]'
    : site.alertCount >= 3
    ? 'text-[var(--red)]'
    : 'text-[var(--amber)]'

  const alertBorderColor = site.alertCount === 0
    ? 'border-[var(--green-border)]'
    : site.alertCount >= 3
    ? 'border-[var(--red-border)]'
    : 'border-[var(--amber-border)]'

  return (
    <div className="flex flex-col h-full overflow-hidden">

      {/* Topbar */}
      <div className="h-10 bg-[var(--bg-secondary)] border-b border-[var(--border)] flex items-center justify-between px-4 flex-shrink-0">
        <div className="text-[10px] text-[var(--text-secondary)]">
          Overview / <span className="text-[var(--text-primary)]">{selectedSite.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-[var(--bg-elevated)] border border-[var(--border)] rounded-full p-0.5 flex gap-0.5">
            <button onClick={() => setView('executive')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${!isAnalyst ? 'bg-[var(--green-bg)] text-[var(--green)]' : 'text-[var(--text-muted)]'}`}>Executive</button>
            <button onClick={() => setView('analyst')} className={`px-3 py-1 rounded-full text-[9px] transition-colors ${isAnalyst ? 'bg-[var(--green-bg)] text-[var(--green)]' : 'text-[var(--text-muted)]'}`}>Analyst</button>
          </div>
          <div className={`flex items-center gap-1 bg-[var(--bg-tertiary)] border rounded px-2 py-1 text-[9px] ${site.alertCount > 0 ? 'border-[var(--red-border)] text-[var(--red)]' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${site.alertCount > 0 ? 'bg-[var(--red)]' : 'bg-[var(--text-muted)]'}`}></div>
            {site.alertCount > 0 ? `${site.alertCount} issues need attention` : 'All clear'}
          </div>
          <button onClick={() => navigate('/report')} className="bg-[var(--green-bg)] border border-[var(--green-border)] rounded px-2 py-1 text-[9px] text-[var(--green)]">Generate report</button>
        </div>
      </div>

      {/* Context bar */}
      <div className="bg-[var(--bg-primary)] border-b border-[var(--border)] px-4 py-1.5 flex items-center gap-2 flex-shrink-0">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--text-muted)] flex-shrink-0"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <span className="text-[10px] text-[var(--text-secondary)]">Mining companies lodge bonds with the WA government before mining begins. The money is only returned once the land has recovered to the required standard.</span>
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--amber)]"></div>
          <span className="text-[10px] text-[var(--amber)] font-medium">Satellite data current to June 2026</span>
          <span className="text-[10px] text-[var(--text-muted)]">- live feed requires Google Earth Engine API</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 flex flex-col gap-3">

        {/* Layer 1: Four KPI cards */}
        <div className="grid grid-cols-4 gap-3 flex-shrink-0">

          {/* Constant 1 */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3 relative">
            <div className="absolute top-2 right-2 text-[8px] bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-1.5 py-0.5 text-[var(--text-muted)]">Portfolio</div>
            <div className="text-[9px] text-[var(--text-muted)] mb-2 mr-12">{isAnalyst ? 'Total bond liability' : 'Total bonds monitored'}</div>
            <div className="text-[22px] font-medium text-[var(--text-primary)] leading-none">${portfolioStats.totalBond}M</div>
            <div className="text-[9px] text-[var(--text-secondary)] mt-1.5">across 4 {isAnalyst ? 'tenements' : 'Pilbara mine sites'}</div>
            <div className="mt-2 pt-2 border-t border-[var(--border)] text-[8px] text-[var(--text-muted)]">
              {isAnalyst ? 'State Agreement tenements, Pilbara WA' : 'WA government holds until land recovers'}
            </div>
          </div>

          {/* Constant 2 */}
          <div className="bg-[var(--red-bg)] border border-[var(--red-border)] rounded-lg p-3 relative">
            <div className="absolute top-2 right-2 text-[8px] bg-[var(--red-bg)] border border-[var(--red-border)] rounded px-1.5 py-0.5 text-[var(--red)]">Portfolio</div>
            <div className="text-[9px] text-[var(--red)] mb-2 mr-12">{isAnalyst ? 'Bond release at risk' : 'Capital at risk of delay'}</div>
            <div className="text-[22px] font-medium text-[var(--red)] leading-none">${portfolioStats.atRisk}M</div>
            <div className="text-[9px] text-[var(--red)] mt-1.5 opacity-80">{portfolioStats.atRiskSites}</div>
            <div className="mt-2 pt-2 border-t border-[var(--red-border)] text-[8px] text-[var(--red)] opacity-70">
              {isAnalyst ? 'NDVI velocity below 6%/yr regulatory target' : 'Both sites behind the government target'}
            </div>
          </div>

          {/* Dynamic 1 - bond release */}
          <div className={`${c.bg} border ${c.border} rounded-lg p-3 relative`}>
            <div className={`absolute top-2 right-2 text-[8px] ${c.badge} border rounded px-1.5 py-0.5`}>This site</div>
            <div className={`text-[9px] ${c.text} mb-2 mr-14`}>{isAnalyst ? 'Projected bond release' : 'Bond release date'}</div>
            <div className={`text-[22px] font-medium ${c.text} leading-none`}>{site.release}</div>
            <div className={`text-[9px] ${c.text} mt-1.5 opacity-80`}>{isAnalyst ? site.kpiReleaseLabelAnal : site.kpiReleaseLabel}</div>
            <div className={`mt-2 pt-2 border-t ${c.border} text-[8px] ${c.text} opacity-70`}>Updates when you switch site</div>
          </div>

          {/* Dynamic 2 - alerts */}
          <div className={`${alertCardColor} border rounded-lg p-3 relative`}>
            <div className={`absolute top-2 right-2 text-[8px] ${alertCardColor} ${alertBorderColor} border rounded px-1.5 py-0.5 ${alertTextColor}`}>This site</div>
            <div className={`text-[9px] mb-2 mr-14 ${alertTextColor}`}>{isAnalyst ? 'Active anomaly alerts' : 'Active alerts today'}</div>
            <div className={`text-[22px] font-medium leading-none ${alertTextColor}`}>{site.alertCount}</div>
            <div className={`text-[9px] mt-1.5 opacity-80 ${alertTextColor}`}>{isAnalyst ? site.kpiAlertSubAnal : site.kpiAlertSub}</div>
            <div className={`mt-2 pt-2 border-t ${alertBorderColor} text-[8px] opacity-70 ${alertTextColor}`}>Updates when you switch site</div>
          </div>

        </div>

        {/* Layer 2: Verdict banner */}
        <div className={`${c.bg} border ${c.border} rounded-lg px-4 py-3 flex-shrink-0`}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className={`text-[12px] font-medium ${c.text}`}>
                {isAnalyst ? site.verdictAnal : site.verdictExec}
              </div>
              <div className="text-[10px] text-[var(--text-secondary)] mt-1">
                {isAnalyst ? site.verdictAnalSub : site.verdictSub}
              </div>
              {isAnalyst ? (
                <div className="mt-2 pt-2 border-t border-[var(--border)] text-[9px] text-[var(--text-muted)]">
                  {site.analNote}
                </div>
              ) : (
                <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-baseline gap-2">
                  <span className="text-[9px] text-[var(--text-muted)] flex-shrink-0">What to do next</span>
                  <span className="text-[10px] text-[var(--text-primary)]">{site.whatNext}</span>
                </div>
              )}
            </div>
            <div className="text-right flex-shrink-0 ml-6">
              <div className="text-[9px] text-[var(--text-secondary)]">This site's bond</div>
              <div className={`text-[18px] font-medium ${c.text}`}>${(site.bond / 1000000).toFixed(0)},000,000</div>
              <div className="text-[9px] text-[var(--text-secondary)]">{site.release} | {site.operator}</div>
            </div>
          </div>
        </div>

        {/* Layer 3: 2x2 site cards + Ask AI */}
        <div className="grid grid-cols-3 gap-3 flex-1 min-h-0">

          {/* 2x2 card grid */}
          <div className="col-span-2 grid grid-cols-2 gap-3">
            {allSiteCards.map((s) => {
              const sc = colorMap[s.releaseColor]
              const isSelected = selectedSite.id === s.id
              return (
                <div
                  key={s.id}
                  style={{ background: sc.cardBg, borderColor: sc.cardBorder }}
                  className={`border rounded-lg p-3 flex flex-col cursor-pointer transition-all ${isSelected ? 'ring-1 ring-[var(--green)]' : ''}`}
                  onClick={() => navigate('/')}
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="text-[10px] font-medium text-[var(--text-primary)]">{s.name}</div>
                      <div className="text-[9px] text-[var(--text-muted)]">${(s.bond / 1000000).toFixed(0)}M bond</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {s.alerts.length > 0 && (
                        <div
                          style={{ background: s.status === 'at-risk' ? 'rgba(248,81,73,0.15)' : 'rgba(210,153,34,0.15)', borderColor: s.status === 'at-risk' ? 'rgba(248,81,73,0.4)' : 'rgba(210,153,34,0.4)' }}
                          className="border rounded px-1.5 py-0.5 flex items-center gap-1"
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${s.status === 'at-risk' ? 'bg-[var(--red)]' : 'bg-[var(--amber)]'}`}></div>
                          <span className={`text-[8px] font-medium ${s.status === 'at-risk' ? 'text-[var(--red)]' : 'text-[var(--amber)]'}`}>{s.alerts.length} alert{s.alerts.length > 1 ? 's' : ''}</span>
                        </div>
                      )}
                      <div
                        style={{ background: `${sc.cardBg}`, borderColor: sc.cardBorder }}
                        className="border rounded px-1.5 py-0.5"
                      >
                        <span className="text-[8px] font-medium" style={{ color: sc.bar }}>{s.release}</span>
                      </div>
                    </div>
                  </div>

                  {/* Recovery percentage */}
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-[18px] font-medium" style={{ color: sc.bar }}>{s.recovered}%</span>
                    <span className="text-[8px] text-[var(--text-muted)]">
                      {isAnalyst ? 'rehabilitating (NDVI > 0.35)' : 'of land meets government standard'}
                    </span>
                  </div>

                  {/* Progress bar with 80% threshold marker */}
                  <div className="h-1 bg-[var(--bg-elevated)] rounded-full mb-1 relative">
                    <div className="h-full rounded-full" style={{ width: `${s.recovered}%`, background: sc.bar }}></div>
                    <div className="absolute top-[-2px] h-[8px] w-[1.5px] bg-[var(--text-muted)] opacity-40" style={{ left: '80%' }}></div>
                  </div>

                  {/* Rate and gap */}
                  <div className="flex justify-between mb-2">
                    <span className="text-[8px]" style={{ color: s.status === 'on-track' ? 'var(--text-muted)' : sc.bar }}>
                      {s.toGo}% to go
                    </span>
                    <span className="text-[8px]" style={{ color: sc.bar }}>
                      {isAnalyst ? `+${s.growthRate}%/yr` : `+${s.growthRate}%/yr`}
                      {s.growthRate < 6 ? (isAnalyst ? ' - below 6% target' : ' - below target') : ' - above target'}
                    </span>
                  </div>

                  {/* Alert footer */}
                  <div className="border-t pt-2 flex flex-col gap-1" style={{ borderColor: sc.alertBorder }}>
                    {s.alerts.length === 0 ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sc.bar }}></div>
                        <span className="text-[8px]" style={{ color: sc.bar }}>No action required</span>
                      </div>
                    ) : (
                      s.alerts.map((alert, i) => (
                        <div key={i} className="flex items-start gap-1.5">
                          <span className="text-[8px] flex-shrink-0" style={{ color: alert.sev === 'urgent' ? '#f85149' : '#d29922' }}>
                            {alert.sev === 'urgent' ? '⚠' : '◈'}
                          </span>
                          <span className="text-[8px] text-[var(--text-secondary)] leading-tight">{alert.text}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Ask AI panel */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--green-border)] rounded-lg p-3 flex flex-col">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <span className="text-[11px] font-medium text-[var(--text-primary)]">Ask a question</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-[var(--green-bg)] text-[var(--green)]">Claude AI</span>
            </div>
            <div className="flex flex-col gap-2 flex-1 overflow-hidden">
              <div className="bg-[var(--bg-elevated)] rounded px-2 py-1.5 text-[9px] text-[var(--text-secondary)] self-end max-w-[85%]">
                {isAnalyst ? site.askAnal.q : site.askExec.q}
              </div>
              <div className="bg-[var(--green-dark)] border border-[var(--green-border)] rounded px-2 py-1.5 text-[9px] text-[var(--green)] leading-relaxed">
                {isAnalyst ? site.askAnal.a : site.askExec.a}
              </div>
            </div>
            <div className="flex gap-2 mt-3 flex-shrink-0">
              <input
                className="flex-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-[9px] text-[var(--text-muted)] focus:outline-none focus:border-[var(--green-border)] cursor-pointer"
                placeholder={isAnalyst ? 'Ask a technical question...' : 'Ask anything about this site...'}
                onClick={() => navigate('/ask')}
                readOnly
              />
              <button onClick={() => navigate('/ask')} className="bg-[var(--green-bg)] border border-[var(--green-border)] rounded px-2 py-1.5 text-[9px] text-[var(--green)]">Ask</button>
            </div>
            <div className="mt-3 pt-3 border-t border-[var(--border)] flex-shrink-0">
              <div className="text-[9px] text-[var(--text-muted)] mb-2">Common questions</div>
              <div className="flex flex-col gap-1.5">
                {(isAnalyst ? [
                  `What is the NDVI velocity for ${selectedSite.name}?`,
                  'Which site has the lowest recovery rate?',
                  'What anomalies were detected today?',
                ] : [
                  `Will we get the bond back for ${selectedSite.name}?`,
                  'Which site is most at risk?',
                  'What do I need to action today?',
                ]).map((q, i) => (
                  <button
                    key={i}
                    onClick={() => navigate('/ask')}
                    className="text-left text-[8px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] rounded px-2 py-1.5 transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}