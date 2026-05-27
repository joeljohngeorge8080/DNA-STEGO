/**
 * AuthContext — AWS Cognito Integration
 *
 * Real Amazon Cognito authentication using AWS Amplify SDK
 */

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { signIn, signUp, signOut, getCurrentUser, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth'
import '../aws-config' // Initialize AWS Amplify

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const [isGuest, setIsGuest] = useState(false)
    const [savedKey, setSavedKey] = useState(null)   // stores last AES key for logged-in users
    const [loading, setLoading] = useState(true)

    const isAuthenticated = user !== null

    // Check for existing authenticated user on app load
    useEffect(() => {
        checkAuthState()
    }, [])

    const checkAuthState = async () => {
        try {
            const currentUser = await getCurrentUser()
            setUser({
                username: currentUser.username,
                email: currentUser.signInDetails?.loginId || '',
                userId: currentUser.userId
            })
        } catch (error) {
            // User is not authenticated
            setUser(null)
        } finally {
            setLoading(false)
        }
    }

    // ── Save an encryption key in session (only for authenticated users) ──
    const saveKey = useCallback((key) => {
        // Guests never get their keys persisted
        if (user !== null) {
            setSavedKey(key)
        }
    }, [user])

    const clearKey = useCallback(() => setSavedKey(null), [])

    // ── Real Cognito sign-up ──
    const signup = useCallback(async ({ username, email, password }) => {
        try {
            const result = await signUp({
                username,
                password,
                options: {
                    userAttributes: {
                        email
                    }
                }
            })

            // Return signup result for confirmation handling
            return {
                isSignUpComplete: result.isSignUpComplete,
                userId: result.userId,
                nextStep: result.nextStep
            }
        } catch (error) {
            throw new Error(error.message || 'Sign up failed')
        }
    }, [])

    // ── Confirm sign-up with verification code ──
    const confirmSignup = useCallback(async ({ username, confirmationCode }) => {
        try {
            const result = await confirmSignUp({
                username,
                confirmationCode
            })

            return {
                isSignUpComplete: result.isSignUpComplete,
                nextStep: result.nextStep
            }
        } catch (error) {
            throw new Error(error.message || 'Confirmation failed')
        }
    }, [])

    // ── Resend confirmation code ──
    const resendConfirmationCode = useCallback(async ({ username }) => {
        try {
            await resendSignUpCode({ username })
        } catch (error) {
            throw new Error(error.message || 'Failed to resend code')
        }
    }, [])

    // ── Real Cognito sign-in ──
    const login = useCallback(async ({ email, password }) => {
        try {
            const result = await signIn({
                username: email,
                password
            })

            if (result.isSignedIn) {
                const currentUser = await getCurrentUser()
                const loggedInUser = {
                    username: currentUser.username,
                    email: currentUser.signInDetails?.loginId || email,
                    userId: currentUser.userId
                }
                setUser(loggedInUser)
                setIsGuest(false)
                setSavedKey(null)
                return loggedInUser
            } else {
                // Handle additional sign-in steps (MFA, etc.)
                throw new Error('Additional sign-in step required: ' + result.nextStep.signInStep)
            }
        } catch (error) {
            throw new Error(error.message || 'Sign in failed')
        }
    }, [])

    // ── Guest session ──
    const continueAsGuest = useCallback(() => {
        setUser(null)
        setIsGuest(true)
        setSavedKey(null)
    }, [])

    // ── Sign out ──
    const logout = useCallback(async () => {
        try {
            await signOut()
        } catch (error) {
            console.error('Sign out error:', error)
        } finally {
            setUser(null)
            setIsGuest(false)
            setSavedKey(null)
        }
    }, [])

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isGuest,
                savedKey,
                loading,
                login,
                signup,
                confirmSignup,
                resendConfirmationCode,
                logout,
                continueAsGuest,
                saveKey,
                clearKey,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                isGuest,
                savedKey,
                login,
                signup,
                logout,
                continueAsGuest,
                saveKey,
                clearKey,
            }}
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
