import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import MeineFinanzen from './pages/MeineFinanzen'
import Prognosen from './pages/Prognosen'
import FinanzSzenarien from './pages/FinanzSzenarien'
import Layout from './components/Layout'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registrieren" element={<Register />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/finanzen" element={<Layout><MeineFinanzen /></Layout>} />
        <Route path="/prognosen" element={<Layout><Prognosen /></Layout>} />
        <Route path="/szenarien" element={<Layout><FinanzSzenarien /></Layout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
