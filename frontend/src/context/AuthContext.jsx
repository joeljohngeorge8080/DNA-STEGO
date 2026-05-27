import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AuthContext = createContext(null)

// Use relative URLs in production (Vercel will proxy), absolute in dev
const API_BASE = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_BASE ?? 'http://localhost:8000')

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isGuest, setIsGuest] = useState(false)
    const [savedKey, setSavedKey] = useState(null)
    const [loading, setLoading] = useState(true)

    const isAuthenticated = user !== null

    // On mount: check for token in URL (callback from Google) or in localStorage
    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const token = params.get('token')

        if (token) {
            // Coming back from Google OAuth
            localStorage.setItem('jwt_token', token)
            // Clean URL
            window.history.replaceState({}, '', window.location.pathname)
            fetchUserFromToken(token)
        } else {
            // Check saved token
            const saved = localStorage.getItem('jwt_token')
            if (saved) {
                fetchUserFromToken(saved)
            } else {
                setLoading(false)
            }
        }
    }, [])

    async function fetchUserFromToken(token) {
        try {
            const res = await fetch(`${API_BASE}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
            })
            if (res.ok) {
                const data = await res.json()
                setUser({
                    username: data.name || data.email,
                    email: data.email,
                    picture: data.picture,
                    sub: data.sub,
                })
                setIsGuest(false)
            } else {
                localStorage.removeItem('jwt_token')
            }
        } catch (e) {
            localStorage.removeItem('jwt_token')
        } finally {
            setLoading(false)
        }
    }

    const loginWithGoogle = useCallback(() => {
        // Redirect browser to backend Google login route
        window.location.href = `${API_BASE}/auth/google/login`
    }, [])

    const loginWithGoogleToken = useCallback(() => {
        // Called after OAuth callback to fetch and set user info
        const token = localStorage.getItem('jwt_token')
        if (token) {
            fetchUserFromToken(token)
        } else {
            setLoading(false)
        }
    }, [])

    const continueAsGuest = useCallback(() => {
        setUser(null)
        setIsGuest(true)
        setSavedKey(null)
    }, [])

    const logout = useCallback(() => {
        localStorage.removeItem('jwt_token')
        setUser(null)
        setIsGuest(false)
        setSavedKey(null)
    }, [])

    const saveKey = useCallback((key) => {
        if (user !== null) setSavedKey(key)
    }, [user])

    const clearKey = useCallback(() => setSavedKey(null), [])

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isGuest,
            savedKey,
            loading,
            loginWithGoogle,
            loginWithGoogleToken,
            logout,
            continueAsGuest,
            saveKey,
            clearKey,
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
    return ctx
}
