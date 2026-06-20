import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Eingabe from './pages/Eingabe'
import Dashboard from './pages/Dashboard'
import MeineFinanzen from './pages/MeineFinanzen'
import Prognosen from './pages/Prognosen'
import FinanzSzenarien from './pages/FinanzSzenarien'
import KiAssist from './pages/KiAssist'
import Layout from './components/Layout'
import PrivateRoute from './components/PrivateRoute'
import FAQ from './pages/FAQ'

function TopRightLink() {
  const location = useLocation()
  const isFaqPage = location.pathname === '/faq'
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:5000') + '/api/me', {
      credentials: 'include',
    })
      .then(res => setIsLoggedIn(res.ok))
      .catch(() => setIsLoggedIn(false))
  }, [location.pathname])

  const faqTarget = isLoggedIn ? '/dashboard' : '/'
  const faqButton = isLoggedIn ? 'Dashboard' : 'Login'

  return (
    <Link
      to={isFaqPage ? faqTarget : '/faq'}
      className="fixed top-4 right-4 z-50 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm border border-slate-200 hover:text-emerald-600 hover:border-emerald-200 transition-colors"
    >
      {isFaqPage ? faqButton : 'FAQ'}
    </Link>
  )
}

function App() {
  return (
    <BrowserRouter>
      <TopRightLink />
      <Routes>
        {/* Public routes — anyone can visit */}
        <Route path="/" element={<Login />} />
        <Route path="/registrieren" element={<Register />} />
        <Route path="/passwort-vergessen" element={<ForgotPassword />} />
        <Route path="/passwort-zuruecksetzen" element={<ResetPassword />} />
        <Route path="/faq" element={<FAQ />} />

        {/* Protected routes — only logged-in users can visit */}
        <Route path="/eingabe" element={
          <PrivateRoute><Eingabe /></PrivateRoute>
        } />
        <Route path="/dashboard" element={
          <PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>
        } />
        <Route path="/finanzen" element={
          <PrivateRoute><Layout><MeineFinanzen /></Layout></PrivateRoute>
        } />
        <Route path="/prognosen" element={
          <PrivateRoute><Layout><Prognosen /></Layout></PrivateRoute>
        } />
        <Route path="/szenarien" element={
          <PrivateRoute><Layout><FinanzSzenarien /></Layout></PrivateRoute>
        } />
        <Route path="/ki-assist" element={
          <PrivateRoute><Layout><KiAssist /></Layout></PrivateRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
