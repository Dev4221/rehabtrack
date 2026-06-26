import { NavLink } from 'react-router-dom'
import { useSite } from '../SiteContext'
import { useTheme } from '../ThemeContext'

export default function Sidebar() {
  const { selectedSite, setSelectedSite, sites } = useSite()
  const { theme, setTheme } = useTheme()

  const navItems = [
    { section: 'Monitoring' },
    { path: '/', icon: '⊞', label: 'Overview' },
    { path: '/map', icon: '⊕', label: 'Site map' },
    { path: '/trends', icon: '◈', label: 'Vegetation trends' },
    { path: '/alerts', icon: '◉', label: 'Alerts', badge: selectedSite.alerts > 0 ? `${selectedSite.alerts}` : null, badgeRed: true },
    { section: 'AI tools' },
    { path: '/ask', icon: '◎', label: 'Ask a question', badge: 'AI' },
    { path: '/report', icon: '◧', label: 'Generate report', badge: 'AI' },
    { path: '/scenario', icon: '◑', label: 'Scenario planner', badge: 'AI' },
    { path: '/agents', icon: '◈', label: 'Agent activity', badge: 'AI' },
    { section: 'Finance' },
    { path: '/bond', icon: '◉', label: 'Bond calculator' },
    { path: '/compliance', icon: '◫', label: 'Compliance tracker' },
  ]

  return (
    <div className="w-48 bg-[var(--bg-secondary)] border-r border-[var(--border)] flex flex-col flex-shrink-0">

      <div className="px-3 py-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[var(--green-bg)] flex items-center justify-center text-[var(--green)] text-xs">
            ⊛
          </div>
          <div>
            <div className="text-sm font-medium text-[var(--text-primary)]">RehabTrack</div>
            <div className="text-[9px] text-[var(--text-muted)]">WA Mine Intelligence</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-2 overflow-y-auto">
        {navItems.map((item, i) => {
          if (item.section) {
            return (
              <div key={i} className="px-3 pt-3 pb-1 text-[9px] text-[var(--text-muted)] uppercase tracking-wider">
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
                    ? 'bg-[var(--green-bg)] text-[var(--green)] border-l-2 border-[var(--green-border)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`
              }
            >
              <span>{item.icon}</span>
              <span className="flex-1">{item.label}</span>
              {item.badge && (
                <span className={`text-[8px] px-1.5 py-0.5 rounded-full ${
                  item.badgeRed
                    ? 'bg-[var(--red-bg)] text-[var(--red)]'
                    : 'bg-[var(--green-bg)] text-[var(--green)]'
                }`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      <div className="p-3 border-t border-[var(--border)]">
        <div className="text-[8px] text-[var(--text-muted)] mb-1.5 uppercase tracking-wider">Currently viewing</div>
        <div className="flex flex-col gap-1 mb-3">
          {sites.map(site => (
            <button
              key={site.id}
              onClick={() => setSelectedSite(site)}
              className={`text-left px-2 py-1.5 rounded text-[9px] transition-colors ${
                selectedSite.id === site.id
                  ? 'bg-[var(--green-bg)] text-[var(--green)] border border-[var(--green-border)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              {site.name}
            </button>
          ))}
        </div>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full flex items-center justify-center gap-2 px-2 py-1.5 rounded text-[9px] bg-[var(--bg-elevated)] border border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          {theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'}
        </button>
      </div>

    </div>
  )
}