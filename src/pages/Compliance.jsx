const sites = [
    {
      name: 'Roy Hill',
      region: 'Pilbara',
      operator: 'Roy Hill Holdings',
      recovered: 61,
      target: 6,
      actual: 8.2,
      bond: 48000000,
      release: 'Q3 2027',
      status: 'on-track',
      alerts: 2,
    },
    {
      name: 'Cloudbreak',
      region: 'Pilbara',
      operator: 'Fortescue Metals',
      recovered: 71,
      target: 6,
      actual: 6.1,
      bond: 62000000,
      release: 'Q1 2027',
      status: 'on-track',
      alerts: 0,
    },
    {
      name: 'Brockman 4',
      region: 'Pilbara',
      operator: 'Rio Tinto',
      recovered: 44,
      target: 6,
      actual: 4.2,
      bond: 35000000,
      release: 'Q1 2029',
      status: 'slow',
      alerts: 1,
    },
    {
      name: 'Christmas Creek',
      region: 'Pilbara',
      operator: 'Fortescue Metals',
      recovered: 29,
      target: 6,
      actual: 2.8,
      bond: 41000000,
      release: 'Q3 2030+',
      status: 'at-risk',
      alerts: 3,
    },
  ]
  
  const statusStyles = {
    'on-track': { badge: 'bg-[#1a3a1a] text-[#3fb950] border-[#2ea043]', label: 'On track' },
    'slow': { badge: 'bg-[#2d2000] text-[#e3b341] border-[#d29922]', label: 'Slow' },
    'at-risk': { badge: 'bg-[#3d0000] text-[#f85149] border-[#cf222e]', label: 'At risk' },
  }
  
  const formatBond = (val) => `$${(val / 1000000).toFixed(0)}M`
  
  const totalBond = sites.reduce((a, s) => a + s.bond, 0)
  const onTrackBond = sites.filter(s => s.status === 'on-track').reduce((a, s) => a + s.bond, 0)
  const atRiskBond = sites.filter(s => s.status !== 'on-track').reduce((a, s) => a + s.bond, 0)
  
  export default function Compliance() {
    return (
      <div className="flex flex-col h-full">
  
        {/* Top bar */}
        <div className="h-10 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 flex-shrink-0">
          <div className="text-[10px] text-[#8b949e]">
            Compliance tracker <span className="text-[#e6edf3]">/ All WA sites</span>
          </div>
          <div className="flex gap-2">
            <div className="bg-[#1c2128] border border-[#30363d] rounded px-3 py-1 text-[9px] text-[#8b949e]">
              Download all
            </div>
            <div className="bg-[#1a3a1a] border border-[#2ea043] rounded px-3 py-1 text-[9px] text-[#3fb950]">
              Generate compliance report
            </div>
          </div>
        </div>
  
        <div className="flex-1 overflow-auto p-4 flex flex-col gap-4">
  
          {/* Intro */}
          <div className="text-[10px] text-[#8b949e]">
            A single view of all monitored sites, their current recovery status, and their bond positions. Updated automatically after every satellite pass.
          </div>
  
          {/* Summary cards */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'Total bonds held with government', value: formatBond(totalBond), color: 'text-[#e6edf3]' },
              { label: 'Bonds on track for 2027 release', value: formatBond(onTrackBond), color: 'text-[#3fb950]' },
              { label: 'Bonds at risk of delay', value: formatBond(atRiskBond), color: 'text-[#f85149]' },
              { label: 'Sites monitored', value: `${sites.length}`, color: 'text-[#e6edf3]' },
            ].map((card, i) => (
              <div key={i} className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 text-center">
                <div className="text-[8px] text-[#484f58] mb-2">{card.label}</div>
                <div className={`text-[22px] font-medium ${card.color}`}>{card.value}</div>
              </div>
            ))}
          </div>
  
          {/* Table */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
            <div className="grid grid-cols-7 px-4 py-2.5 bg-[#1c2128] border-b border-[#30363d]">
              {['Site', 'Land recovered', 'vs Annual target', 'Bond value', 'Expected release', 'Alerts', 'Status'].map((h, i) => (
                <div key={i} className="text-[9px] font-medium text-[#484f58]">{h}</div>
              ))}
            </div>
  
            {sites.map((site, i) => {
              const diff = site.actual - site.target
              const style = statusStyles[site.status]
              return (
                <div key={i} className="grid grid-cols-7 px-4 py-3 border-b border-[#30363d] last:border-0 items-center hover:bg-[#1c2128] transition-colors">
                  <div>
                    <div className="text-[10px] font-medium text-[#e6edf3]">{site.name}</div>
                    <div className="text-[8px] text-[#484f58]">{site.region} · {site.operator}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-medium text-[#e6edf3]">{site.recovered}%</div>
                    <div className="mt-1 h-1 w-24 bg-[#21262d] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${site.recovered}%`,
                          background: site.status === 'on-track' ? '#2ea043' : site.status === 'slow' ? '#d29922' : '#cf222e'
                        }}
                      ></div>
                    </div>
                  </div>
                  <div className={`text-[10px] font-medium ${diff >= 0 ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
                    {diff >= 0 ? '+' : ''}{diff.toFixed(1)}% {diff >= 0 ? 'ahead' : 'behind'}
                  </div>
                  <div className="text-[10px] text-[#e6edf3] font-medium">{formatBond(site.bond)}</div>
                  <div className={`text-[10px] font-medium ${site.status === 'on-track' ? 'text-[#3fb950]' : site.status === 'slow' ? 'text-[#e3b341]' : 'text-[#f85149]'}`}>
                    {site.release}
                  </div>
                  <div>
                    {site.alerts > 0 ? (
                      <span className="text-[9px] bg-[#3d0000] text-[#f85149] px-1.5 py-0.5 rounded-full">{site.alerts}</span>
                    ) : (
                      <span className="text-[9px] text-[#484f58]">None</span>
                    )}
                  </div>
                  <div>
                    <span className={`text-[9px] px-2 py-0.5 rounded border font-medium ${style.badge}`}>
                      {style.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
  
          {/* Footer note */}
          <div className="text-[9px] text-[#484f58]">
            Recovery data sourced from Sentinel-2 satellite imagery via Google Earth Engine. Bond values from publicly available company annual reports. Updated every 5 days after each satellite pass.
          </div>
  
        </div>
      </div>
    )
  }