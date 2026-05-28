import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AuthContext = createContext(null)
const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000'

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isGuest, setIsGuest] = useState(false)
    const [savedKey, setSavedKey] = useState(null)
    const [loading, setLoading] = useState(true)

    const isAuthenticated = user !== null

    useEffect(() => {
        const params = new URLSearchParams(window.location.search)
        const urlToken = params.get('token')

        if (urlToken) {
            localStorage.setItem('jwt_token', urlToken)
            window.history.replaceState({}, '', window.location.pathname)
            fetchUser(urlToken)
        } else {
            const saved = localStorage.getItem('jwt_token')
            if (saved) {
                fetchUser(saved)
            } else {
                setLoading(false)
            }
        }
    }, [])

    async function fetchUser(token) {
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
            } else {
                localStorage.removeItem('jwt_token')
            }
        } catch {
            localStorage.removeItem('jwt_token')
        } finally {
            setLoading(false)
        }
    }

    const loginWithGoogle = useCallback(() => {
        window.location.href = `${API_BASE}/auth/google/login`
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
