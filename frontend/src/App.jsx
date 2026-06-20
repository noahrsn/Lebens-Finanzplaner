import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
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

function App() {
  return (
    <BrowserRouter>
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
