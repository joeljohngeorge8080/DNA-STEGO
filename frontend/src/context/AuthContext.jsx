/**
 * AuthContext — Mock Cognito Integration
 *
 * Replace the mock functions with real Amazon Cognito SDK calls:
 *   import { signIn, signUp, signOut, getCurrentUser } from 'aws-amplify/auth'
 *
 * State:
 *   user         → { username, email } | null
 *   isAuthenticated → true when logged in
 *   isGuest      → true when "Skip" was clicked (temp session)
 */

import { createContext, useContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isGuest, setIsGuest] = useState(false)

    const isAuthenticated = user !== null

    // ── Mock sign-up (replace with Cognito signUp) ──
    const signup = useCallback(async ({ username, email, password }) => {
        // TODO: await signUp({ username, password, options: { userAttributes: { email } } })
        const newUser = { username, email }
        setUser(newUser)
        setIsGuest(false)
        return newUser
    }, [])

    // ── Mock sign-in (replace with Cognito signIn) ──
    const login = useCallback(async ({ email, password }) => {
        // TODO: await signIn({ username: email, password })
        const loggedIn = { username: email.split('@')[0], email }
        setUser(loggedIn)
        setIsGuest(false)
        return loggedIn
    }, [])

    // ── Guest session ──
    const continueAsGuest = useCallback(() => {
        setUser(null)
        setIsGuest(true)
    }, [])

    // ── Sign out ──
    const logout = useCallback(async () => {
        // TODO: await signOut()
        setUser(null)
        setIsGuest(false)
    }, [])

    return (
        <AuthContext.Provider
            value={{ user, isAuthenticated, isGuest, login, signup, logout, continueAsGuest }}
        >
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const ctx = useContext(AuthContext)
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
    return ctx
}
