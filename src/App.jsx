import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import AskQuestion from './pages/AskQuestion'
import GenerateReport from './pages/GenerateReport'
import BondCalculator from './pages/BondCalculator'
import Compliance from './pages/Compliance'
import AgentActivity from './pages/AgentActivity'
import Trends from './pages/Trends'
import SiteMap from './pages/SiteMap'

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-[#0d1117] text-[#e6edf3] overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/ask" element={<AskQuestion />} />
            <Route path="/report" element={<GenerateReport />} />
            <Route path="/bond" element={<BondCalculator />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/agents" element={<AgentActivity />} />
            <Route path="/trends" element={<Trends />} />
            <Route path="/map" element={<SiteMap />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App