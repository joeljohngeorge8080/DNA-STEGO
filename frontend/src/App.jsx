import { Routes, Route, Navigate, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext.jsx'
import { Component, useEffect, useState } from 'react'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import DashboardLayout from './components/layout/DashboardLayout.jsx'
import DashboardHome from './pages/DashboardHome.jsx'
import DnaStego from './pages/tools/DnaStego.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-cyber-bg flex items-center justify-center p-8">
          <div className="max-w-2xl w-full bg-cyber-red/10 border border-cyber-red/30 rounded-xl p-6">
            <h2 className="text-cyber-red font-mono text-lg mb-3">Runtime Error</h2>
            <pre className="text-xs text-cyber-muted font-mono whitespace-pre-wrap break-all bg-cyber-bg rounded-lg p-4">
              {this.state.error?.toString()}
              {'\n\n'}
              {this.state.error?.stack}
            </pre>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, isGuest } = useAuth()
  if (!isAuthenticated && !isGuest) {
    return <Navigate to="/" replace />
  }
  return children
}

// OAuth Callback Handler
function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { loginWithGoogleToken, isAuthenticated } = useAuth()
  const [checking, setChecking] = useState(true)
  
  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      // Save token and fetch user info
      localStorage.setItem('jwt_token', token)
      loginWithGoogleToken()
    }
  }, [searchParams, loginWithGoogleToken])
  
  // Watch for authentication to complete
  useEffect(() => {
    const checkAuth = async () => {
      // Wait a moment for state to update
      await new Promise(resolve => setTimeout(resolve, 500))
      setChecking(false)
    }
    checkAuth()
  }, [])
  
  // Redirect to dashboard once authenticated
  useEffect(() => {
    if (!checking && isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [checking, isAuthenticated, navigate])
  
  return (
    <div className="min-h-screen bg-cyber-bg flex items-center justify-center p-8">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-cyber-purple border-t-cyber-cyan mb-4"></div>
        <p className="text-cyber-muted font-mono text-sm">Authenticating with Google...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        
        {/* OAuth Callback */}
        <Route path="/auth/callback" element={<OAuthCallback />} />

        {/* Protected Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardHome />} />
          <Route path="dna-stego" element={<DnaStego />} />
          {/* Future tool routes go here */}
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}