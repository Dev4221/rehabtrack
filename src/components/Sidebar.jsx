import { NavLink } from 'react-router-dom'
import { useSite } from '../SiteContext'

const navItems = [
  { section: 'Monitoring' },
  { path: '/', icon: '⊞', label: 'Overview' },
  { path: '/map', icon: '⊕', label: 'Site map' },
  { path: '/trends', icon: '◈', label: 'Vegetation trends' },
  { path: '/alerts', icon: '◉', label: 'Alerts', badge: '3', badgeRed: true },
  { section: 'AI tools' },
  { path: '/ask', icon: '◎', label: 'Ask a question', badge: 'AI' },
  { path: '/report', icon: '◧', label: 'Generate report', badge: 'AI' },
  { path: '/agents', icon: '◈', label: 'Agent activity', badge: 'AI' },
  { section: 'Finance' },
  { path: '/bond', icon: '◉', label: 'Bond calculator' },
  { path: '/compliance', icon: '◫', label: 'Compliance tracker' },
]

export default function Sidebar() {
  const { selectedSite, setSelectedSite, sites } = useSite()

  return (
    <div className="w-48 bg-[#161b22] border-r border-[#30363d] flex flex-col flex-shrink-0">

      <div className="px-3 py-3 border-b border-[#30363d]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#1a3a1a] flex items-center justify-center text-[#3fb950] text-xs">
            ⊛
          </div>
          <div>
            <div className="text-sm font-medium text-[#e6edf3]">RehabTrack</div>
            <div className="text-[9px] text-[#484f58]">WA Mine Intelligence</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-2">
        {navItems.map((item, i) => {
          if (item.section) {
            return (
              <div key={i} className="px-3 pt-3 pb-1 text-[9px] text-[#484f58] uppercase tracking-wider">
                {item.section}
              </div>
            )
          }
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-1.5 text-[11px] transition-colors ${
                  isActive
                    ? 'bg-[#1a3a1a] text-[#3fb950] border-l-2 border-[#2ea043]'
                    : 'text-[#8b949e] hover:text-[#e6edf3]'
                }`
              }
            >
              <span>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                  item.badgeRed
                    ? 'bg-[#3d0000] text-[#f85149]'
                    : 'bg-[#1a3a1a] text-[#3fb950]'
                }`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-3 border-t border-[#30363d]">
        <div className="text-[8px] text-[#484f58] mb-1.5 uppercase tracking-wider">Currently viewing</div>
        <div className="flex flex-col gap-1">
          {sites.map(site => (
            <button
              key={site.id}
              onClick={() => setSelectedSite(site)}
              className={`text-left px-2 py-1.5 rounded text-[9px] transition-colors ${
                selectedSite.id === site.id
                  ? 'bg-[#1a3a1a] text-[#3fb950] border border-[#2ea043]'
                  : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#1c2128]'
              }`}
            >
              {site.name}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}