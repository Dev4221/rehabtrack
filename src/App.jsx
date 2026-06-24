import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Alerts from './pages/Alerts'
import AskQuestion from './pages/AskQuestion'
import GenerateReport from './pages/GenerateReport'

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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App