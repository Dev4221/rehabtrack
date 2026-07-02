import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useSite } from '../SiteContext'
import { useNavigate } from 'react-router-dom'

const portfolioStats = {
  totalBond: 186,
  atRisk: 76,
  atRiskSites: 'Brockman 4 + Christmas Creek',
  onTrack: 110,
}

const siteData = {
  'roy-hill': {
    recovered: 61, early: 22, bare: 17, growthRate: 8.2,
    bond: 48000000, release: 'Q3 2027', status: 'on-track',
    operator: 'Roy Hill Holdings', area: 2840, region: 'Pilbara, WA',
    releaseColor: 'success', alertCount: 2,
    verdictExec: 'Bond release on track for Q3 2027. Two active issues require attention in the next two weeks.',
    verdictSub: '61% of the disturbed land is recovering well at +8.2% per year, ahead of the 6% government target.',
    whatNext: 'Confirm the western section weed inspection has been booked and review the southern section erosion alert.',
    verdictAnal: 'NDVI mean: 0.41 | Recovery velocity: +8.2%/yr | Baseline: 2019-2024 seasonal average',
    verdictAnalSub: 'Classifier output: 61% rehabilitating (NDVI > 0.35) | 22% early regrowth (0.15-0.35) | 17% bare (<0.15) | Sentinel-2 10m',
    analNote: '2 anomalies flagged: Zone C3 Z-score -2.8 (bare/disturbed, 91% confidence) | Zone B2 band ratio anomaly (buffel grass, 78% confidence)',
    kpiReleaseLabel: '$48M returned to operator',
    kpiAlertSub: 'detected by AI agents',
    kpiReleaseLabelAnal: 'NDVI velocity +8.2%/yr vs 6% target',
    kpiAlertSubAnal: 'Z-score threshold exceeded',
    alerts: [
      { sev: 'urgent', title: 'Southern section - vegetation loss', sub: 'Likely rainfall damage. Monitor weekly.', analTitle: 'Zone C3 - NDVI 0.12 (baseline 0.30)', analSub: 'Z-score: -2.8 | bare/disturbed | confidence 91%' },
      { sev: 'attention', title: 'Western section - possible weed', sub: 'Ground inspection needed within 2 weeks.', analTitle: 'Zone B2 - band ratio anomaly', analSub: 'Cenchrus ciliaris match 78% | MCP s.4.2 triggered' },
    ],
    askExec: { q: 'Will we get the $48M bond back on time?', a: 'Yes. Roy Hill is on track. At +8.2% per year the site will meet the government\'s requirements by Q3 2027 and the full $48M will be returned.' },
    askAnal: { q: 'What is Zone C3 Z-score vs seasonal baseline?', a: 'Zone C3 Z-score: -2.8 vs 5-year seasonal mean. NDVI dropped from 0.30 to 0.12 over 30 days. Classifier: bare/disturbed at 91% confidence.' },
  },
  'cloudbreak': {
    recovered: 71, early: 18, bare: 11, growthRate: 6.1,
    bond: 62000000, release: 'Q1 2027', status: 'on-track',
    operator: 'Fortescue Metals Group', area: 4100, region: 'Pilbara, WA',
    releaseColor: 'success', alertCount: 0,
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
    alerts: [],
    askExec: { q: 'Will we get the $62M bond back on time?', a: 'Yes. Cloudbreak is the best performing site in the portfolio. At +6.1% per year it will meet the government\'s requirements by Q1 2027 and the full $62M will be returned.' },
    askAnal: { q: 'Has Zone A1 met the NDVI release threshold?', a: 'Yes. Zone A1 NDVI mean of 0.58 has been sustained above the 0.35 rehabilitating threshold for 4 consecutive months. Bond milestone confirmed and flagged for DEMIRS verification.' },
  },
  'brockman': {
    recovered: 44, early: 28, bare: 28, growthRate: 4.2,
    bond: 35000000, release: 'Q1 2029', status: 'slow',
    operator: 'Rio Tinto', area: 2100, region: 'Pilbara, WA',
    releaseColor: 'warning', alertCount: 1,
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
    alerts: [
      { sev: 'attention', title: 'Eastern section - recovery rate below target', sub: 'Replanting programme needed before next wet season.', analTitle: 'Zone D2 - NDVI velocity +2.1%/yr', analSub: 'vs 6% target | projected milestone Q3 2031 | R2: 0.89' },
    ],
    askExec: { q: 'Will we get the $35M bond back by Q1 2029?', a: 'At risk. The eastern section is recovering at less than half the required rate. Without a replanting programme before the next wet season, the bond release will move from Q1 2029 to mid-2030 at the earliest.' },
    askAnal: { q: 'What is Zone D2 NDVI velocity vs regulatory target?', a: 'Zone D2 velocity: +2.1%/yr vs 6% regulatory target. Linear regression R2: 0.89. At current rate, projected milestone Q3 2031 vs target Q1 2029. Replanting programme recommended before wet season.' },
  },
  'christmas-creek': {
    recovered: 29, early: 35, bare: 36, growthRate: 2.8,
    bond: 41000000, release: 'Q3 2030+', status: 'at-risk',
    operator: 'Fortescue Metals Group', area: 3200, region: 'Pilbara, WA',
    releaseColor: 'danger', alertCount: 3,
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
    alerts: [
      { sev: 'urgent', title: 'Northern section - critical vegetation loss', sub: 'Urgent intervention required. Bond at risk past 2035.', analTitle: 'Zone E1 - NDVI 0.08, Z-score -3.4', analSub: 'annual velocity +1.2%/yr | projected 2035+ | urgent intervention' },
      { sev: 'urgent', title: 'Central section - erosion spreading', sub: 'Erosion control works needed this dry season.', analTitle: 'Zone E3 - erosion spread 40ha to 95ha', analSub: 'NDVI 0.22 to 0.09 over 45 days | Z-score -3.1' },
      { sev: 'attention', title: 'Southern section - weed encroachment', sub: 'Legally reportable. Bond release blocked until treated.', analTitle: 'Zone F2 - Cenchrus ciliaris 83% match', analSub: 'Reportable under MCP s.4.2 | treatment required' },
    ],
    askExec: { q: 'When will we realistically get the $41M bond back?', a: 'Not before 2030 at the earliest, and likely later without urgent intervention. The northern section alone is projected to miss the government threshold until 2035. Every year of delay costs approximately $2M in financing.' },
    askAnal: { q: 'What is Zone E1 recovery trajectory vs release threshold?', a: 'Zone E1 NDVI mean: 0.08, well below 0.15 early regrowth threshold. Annual velocity: +1.2%/yr. Z-score vs site average: -3.4. At current rate, projected milestone 2035+. Urgent ground intervention required.' },
  },
}

const allSites = [
  { id: 'roy-hill', name: 'Cloudbreak', recovered: 71, growthRate: 6.1, status: 'on-track' },
  { id: 'cloudbreak', name: 'Roy Hill', recovered: 61, growthRate: 8.2, status: 'on-track' },
  { id: 'brockman', name: 'Brockman 4', recovered: 44, growthRate: 4.2, status: 'slow' },
  { id: 'christmas-creek', name: 'Christmas Creek', recovered: 29, growthRate: 2.8, status: 'at-risk' },
]

const statusColors = { 'on-track': '#2ea043', 'slow': '#d29922', 'at-risk': '#f85149' }
const statusLabels = { 'on-track': 'on track', 'slow': 'slow', 'at-risk': 'at risk' }

export default function Dashboard() {
  const { selectedSite } = useSite()
  const navigate = useNavigate()
  const [view, setView] = useState('executive')
  const [ndviData, setNdviData] = useState([])
  const [year, setYear] = useState(2024)

  const isAnalyst = view === 'analyst'
  const site = siteData[selectedSite.id] || siteData['roy-hill']

  const siteNdviOffset = { 'roy-hill': 0, 'cloudbreak': 0.08, 'brockman': -0.10, 'christmas-creek': -0.20 }
  const offset = siteNdviOffset[selectedSite.id] || 0

  useEffect(() => {
    Papa.parse('/data/ndvi_timeseries.csv', {
      download: true, header: true,
      complete: (results) => {
        setNdviData(results.data.filter(r => r.mean_ndvi).map(r => ({
          ...r, mean_ndvi: parseFloat(r.mean_ndvi), year: parseInt(r.year), month: parseInt(r.month),
        })))
      }
    })
  }, [])

  const chartData = ndviData.filter(r => r.year === year).map(r => ({
    month: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][r.month - 1],
    ndvi: Math.max(0, Math.min(1, r.mean_ndvi + offset)),
  }))

  const verdictBg = site.status === 'on-track' ? 'bg-[var(--green-dark)]' : site.status === 'slow' ? 'bg-[var(--amber-bg)]' : 'bg-[var(--red-bg)]'
  const verdictBorder = site.status === 'on-track' ? 'border-[var(--green-border)]' : site.status === 'slow' ? 'border-[var(--amber-border)]' : 'border-[var(--red-border)]'
  const verdictText = site.status === 'on-track' ? 'text-[var(--green)]' : site.status === 'slow' ? 'text-[var(--amber)]' : 'text-[var(--red)]'

  const releaseCardStyle = {
    success: { bg: 'bg-[var(--green-dark)]', border: 'border-[var(--green-border)]', text: 'text-[var(--green)]', badge: 'bg-[var(--green-bg)] border-[var(--green-border)] text-[var(--green)]' },
    warning: { bg: 'bg-[var(--amber-bg)]', border: 'border-[var(--amber-border)]', text: 'text-[var(--amber)]', badge: 'bg-[var(--amber-bg)] border-[var(--amber-border)] text-[var(--amber)]' },
    danger: { bg: 'bg-[var(--red-bg)]', border: 'border-[var(--red-border)]', text: 'text-[var(--red)]', badge: 'bg-[var(--red-bg)] border-[var(--red-border)] text-[var(--red)]' },
  }
  const rc = releaseCardStyle[site.releaseColor]

  const alertCardStyle = {
    urgent: { bg: 'bg-[var(--red-bg)]', icon: '⚠', iconColor: 'text-[var(--red)]' },
    attention: { bg: 'bg-[var(--amber-bg)]', icon: '◈', iconColor: 'text-[var(--amber)]' },
  }

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

      {/* Context bar - Option A */}
      <div className="bg-[var(--bg-primary)] border-b border-[var(--border)] px-4 py-1.5 flex items-center gap-2 flex-shrink-0">
        <div className="text-[var(--text-muted)]">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        </div>
        <span className="text-[10px] text-[var(--text-secondary)]">Mining companies lodge bonds with the WA government before mining begins. The money is only returned once the land has recovered to the required standard.</span>
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--amber)]"></div>
          <span className="text-[10px] text-[var(--amber)] font-medium">Satellite data current to June 2026</span>
          <span className="text-[10px] text-[var(--text-muted)]">- live feed requires Google Earth Engine API</span>
        </div>
      </div>

      <div className="flex-1 overflow-auto">

        {/* Four KPI cards */}
        <div className="grid grid-cols-4 gap-3 px-4 pt-3">

          {/* Constant 1 - total portfolio */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3 relative">
            <div className="absolute top-2 right-2 text-[8px] bg-[var(--bg-elevated)] border border-[var(--border)] rounded px-1.5 py-0.5 text-[var(--text-muted)]">Portfolio</div>
            <div className="text-[9px] text-[var(--text-muted)] mb-2 mr-12">{isAnalyst ? 'Total bond liability' : 'Total bonds monitored'}</div>
            <div className="text-[24px] font-medium text-[var(--text-primary)] leading-none">${portfolioStats.totalBond}M</div>
            <div className="text-[9px] text-[var(--text-secondary)] mt-1.5">across 4 {isAnalyst ? 'tenements' : 'Pilbara mine sites'}</div>
            <div className="mt-2 pt-2 border-t border-[var(--border)] text-[8px] text-[var(--text-muted)]">
              {isAnalyst ? 'State Agreement tenements, Pilbara WA' : 'WA government holds until land recovers'}
            </div>
          </div>

          {/* Constant 2 - at risk */}
          <div className="bg-[var(--red-bg)] border border-[var(--red-border)] rounded-lg p-3 relative">
            <div className="absolute top-2 right-2 text-[8px] bg-[var(--red-bg)] border border-[var(--red-border)] rounded px-1.5 py-0.5 text-[var(--red)]">Portfolio</div>
            <div className="text-[9px] text-[var(--red)] mb-2 mr-12">{isAnalyst ? 'Bond release at risk' : 'Capital at risk of delay'}</div>
            <div className="text-[24px] font-medium text-[var(--red)] leading-none">${portfolioStats.atRisk}M</div>
            <div className="text-[9px] text-[var(--red)] mt-1.5 opacity-80">{portfolioStats.atRiskSites}</div>
            <div className="mt-2 pt-2 border-t border-[var(--red-border)] text-[8px] text-[var(--red)] opacity-70">
              {isAnalyst ? 'NDVI velocity below 6%/yr regulatory target' : 'Both sites behind the government target'}
            </div>
          </div>

          {/* Dynamic 1 - bond release */}
          <div className={`${rc.bg} border ${rc.border} rounded-lg p-3 relative`}>
            <div className={`absolute top-2 right-2 text-[8px] ${rc.badge} border rounded px-1.5 py-0.5`}>This site</div>
            <div className={`text-[9px] ${rc.text} mb-2 mr-14`}>{isAnalyst ? 'Projected bond release' : 'Bond release date'}</div>
            <div className={`text-[24px] font-medium ${rc.text} leading-none`}>{site.release}</div>
            <div className={`text-[9px] ${rc.text} mt-1.5 opacity-80`}>{isAnalyst ? site.kpiReleaseLabelAnal : site.kpiReleaseLabel}</div>
            <div className={`mt-2 pt-2 border-t ${rc.border} text-[8px] ${rc.text} opacity-70`}>Updates when you switch site</div>
          </div>

          {/* Dynamic 2 - alerts */}
          <div className={`${site.alertCount === 0 ? 'bg-[var(--green-dark)] border-[var(--green-border)]' : site.alertCount >= 3 ? 'bg-[var(--red-bg)] border-[var(--red-border)]' : 'bg-[var(--amber-bg)] border-[var(--amber-border)]'} border rounded-lg p-3 relative`}>
            <div className={`absolute top-2 right-2 text-[8px] border rounded px-1.5 py-0.5 ${site.alertCount === 0 ? 'bg-[var(--green-bg)] border-[var(--green-border)] text-[var(--green)]' : site.alertCount >= 3 ? 'bg-[var(--red-bg)] border-[var(--red-border)] text-[var(--red)]' : 'bg-[var(--amber-bg)] border-[var(--amber-border)] text-[var(--amber)]'}`}>This site</div>
            <div className={`text-[9px] mb-2 mr-14 ${site.alertCount === 0 ? 'text-[var(--green)]' : site.alertCount >= 3 ? 'text-[var(--red)]' : 'text-[var(--amber)]'}`}>
              {isAnalyst ? 'Active anomaly alerts' : 'Active alerts today'}
            </div>
            <div className={`text-[24px] font-medium leading-none ${site.alertCount === 0 ? 'text-[var(--green)]' : site.alertCount >= 3 ? 'text-[var(--red)]' : 'text-[var(--amber)]'}`}>{site.alertCount}</div>
            <div className={`text-[9px] mt-1.5 opacity-80 ${site.alertCount === 0 ? 'text-[var(--green)]' : site.alertCount >= 3 ? 'text-[var(--red)]' : 'text-[var(--amber)]'}`}>
              {isAnalyst ? site.kpiAlertSubAnal : site.kpiAlertSub}
            </div>
            <div className={`mt-2 pt-2 border-t text-[8px] opacity-70 ${site.alertCount === 0 ? 'border-[var(--green-border)] text-[var(--green)]' : site.alertCount >= 3 ? 'border-[var(--red-border)] text-[var(--red)]' : 'border-[var(--amber-border)] text-[var(--amber)]'}`}>
              Updates when you switch site
            </div>
          </div>
        </div>

        {/* Verdict banner */}
        <div className="px-4 pt-3">
          <div className={`${verdictBg} border ${verdictBorder} rounded-lg px-4 py-3`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className={`text-[12px] font-medium ${verdictText}`}>
                  {isAnalyst ? site.verdictAnal : verdictExec(site)}
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
                <div className={`text-[18px] font-medium ${verdictText}`}>${(site.bond / 1000000).toFixed(0)},000,000</div>
                <div className="text-[9px] text-[var(--text-secondary)]">{site.release} | {site.operator}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div className="grid grid-cols-3 gap-3 px-4 pt-3 pb-4">

          {/* Site recovery bars */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3">
            <div className="text-[11px] font-medium text-[var(--text-primary)] mb-3">
              {isAnalyst ? 'NDVI velocity by site' : 'Recovery by site'}
            </div>
            <div className="flex flex-col gap-2">
              {[
                { name: 'Cloudbreak', recovered: 71, growthRate: 6.1, status: 'on-track' },
                { name: 'Roy Hill', recovered: 61, growthRate: 8.2, status: 'on-track' },
                { name: 'Brockman 4', recovered: 44, growthRate: 4.2, status: 'slow' },
                { name: 'Christmas Creek', recovered: 29, growthRate: 2.8, status: 'at-risk' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-[var(--text-secondary)]">{s.name}</span>
                    <span className="text-[10px] font-medium" style={{ color: statusColors[s.status] }}>
                      {isAnalyst ? `+${s.growthRate}%/yr` : `${s.recovered}% - ${statusLabels[s.status]}`}
                    </span>
                  </div>
                  <div className="h-1 bg-[var(--bg-elevated)] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${s.recovered}%`, background: statusColors[s.status] }}></div>
                  </div>
                </div>
              ))}
              {isAnalyst && (
                <div className="mt-1 pt-2 border-t border-[var(--border)] text-[9px] text-[var(--text-muted)]">Regulatory minimum: 6%/yr</div>
              )}
            </div>
          </div>

          {/* Alerts panel */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-medium text-[var(--text-primary)]">
                {isAnalyst ? 'AI anomaly alerts' : 'Issues needing attention'}
              </span>
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-[var(--green-bg)] text-[var(--green)]">live</span>
            </div>
            <div className="text-[9px] text-[var(--text-secondary)] mb-2 leading-relaxed">
              {isAnalyst
                ? 'Z-score analysis against 5-year seasonal baseline. Alerts generated by Watcher agent, classified by Analyst agent.'
                : 'AI agents scan satellite data daily and flag anything that needs action before it becomes costly.'}
            </div>
            {site.alerts.length === 0 ? (
              <div className="text-[9px] text-[var(--text-muted)] py-3 text-center">No open alerts. All areas recovering as expected.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {site.alerts.map((alert, i) => {
                  const style = alertCardStyle[alert.sev]
                  return (
                    <div key={i} className={`flex gap-2 items-start py-1.5 ${i < site.alerts.length - 1 ? 'border-b border-[var(--border)]' : ''}`}>
                      <div className={`w-4 h-4 ${style.bg} rounded flex items-center justify-center flex-shrink-0 mt-0.5`}>
                        <span className={`text-[9px] ${style.iconColor}`}>{style.icon}</span>
                      </div>
                      <div>
                        <div className="text-[10px] font-medium text-[var(--text-primary)]">
                          {isAnalyst ? alert.analTitle : alert.title}
                        </div>
                        <div className="text-[9px] text-[var(--text-secondary)]">
                          {isAnalyst ? alert.analSub : alert.sub}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            {site.alerts.length > 0 && (
              <button onClick={() => navigate('/alerts')} className="mt-2 w-full text-[9px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-center pt-2 border-t border-[var(--border)]">
                View all alerts and recommended actions
              </button>
            )}
          </div>

          {/* Ask AI */}
          <div className="bg-[var(--bg-secondary)] border border-[var(--green-border)] rounded-lg p-3 flex flex-col">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <span className="text-[11px] font-medium text-[var(--text-primary)]">Ask a question</span>
              <span className="text-[8px] px-1.5 py-0.5 rounded bg-[var(--green-bg)] text-[var(--green)]">Claude AI</span>
            </div>
            <div className="flex-1 flex flex-col gap-2 overflow-hidden">
              <div className="bg-[var(--bg-elevated)] rounded px-2 py-1.5 text-[9px] text-[var(--text-secondary)] self-end max-w-[85%]">
                {isAnalyst ? site.askAnal.q : site.askExec.q}
              </div>
              <div className="bg-[var(--green-dark)] border border-[var(--green-border)] rounded px-2 py-1.5 text-[9px] text-[var(--green)] leading-relaxed">
                {isAnalyst ? site.askAnal.a : site.askExec.a}
              </div>
            </div>
            <div className="flex gap-2 mt-2 flex-shrink-0">
              <input
                className="flex-1 bg-[var(--bg-primary)] border border-[var(--border)] rounded px-2 py-1.5 text-[9px] text-[var(--text-muted)] focus:outline-none focus:border-[var(--green-border)] cursor-pointer"
                placeholder={isAnalyst ? 'Ask a technical question...' : 'Ask anything about this site...'}
                onClick={() => navigate('/ask')}
                readOnly
              />
              <button className="bg-[var(--green-bg)] border border-[var(--green-border)] rounded px-2 py-1.5 text-[9px] text-[var(--green)]" onClick={() => navigate('/ask')}>Ask</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function verdictExec(site) {
  return site.verdictExec
}