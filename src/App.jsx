import { useEffect } from 'react'
import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Gigs from './pages/Gigs'
import Money from './pages/Money'
import Invoices from './pages/Invoices'
import Insights from './pages/Insights'
import Profile from './pages/Profile'
import People from './pages/People'
import Epk from './pages/Epk'
import PublicProfile from './pages/PublicProfile'
import Welcome from './components/Welcome'
import { useStore } from './store/useStore'
import { HomeIcon, KanbanIcon, EuroIcon, ChartIcon, UserIcon, UsersIcon } from './components/Icons'

const tabs = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/gigs', label: 'Gigs', icon: KanbanIcon },
  { to: '/money', label: 'Money', icon: EuroIcon },
  { to: '/people', label: 'People', icon: UsersIcon },
  { to: '/insights', label: 'Insights', icon: ChartIcon },
  { to: '/profile', label: 'Profile', icon: UserIcon },
]

export default function App() {
  const { state } = useStore()
  const location = useLocation()
  const theme = state.settings.theme || 'dark'
  const isPublicEpk = location.pathname.startsWith('/epk') || location.pathname.startsWith('/u/')

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  return (
    <div className="mx-auto max-w-md min-h-screen pb-24">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/gigs" element={<Gigs />} />
        <Route path="/money" element={<Money />} />
        <Route path="/people" element={<People />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/epk" element={<Epk />} />
        <Route path="/u/:slug" element={<PublicProfile />} />
      </Routes>

      {!isPublicEpk && !state.settings.onboarded && <Welcome />}

      {!isPublicEpk && (
        <nav className="tabbar">
          <div className="mx-auto max-w-md flex">
            {tabs.map((t) => (
              <NavLink key={t.to} to={t.to} end={t.to === '/'}
                className={({ isActive }) => (isActive ? 'active' : '')}>
                <t.icon size={20} />
                {t.label}
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </div>
  )
}
