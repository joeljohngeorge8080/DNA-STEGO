import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Dna, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/ui/Button.jsx'

export default function LoginPage() {
    const { loginWithGoogle, continueAsGuest, loading } = useAuth()
    const navigate = useNavigate()

    function handleGuest() {
        continueAsGuest()
        navigate('/dashboard')
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-cyber-bg flex items-center justify-center">
                <div className="text-cyber-text font-mono animate-pulse">Authenticating...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-cyber-bg flex flex-col items-center justify-center px-4">
            <div className="absolute inset-0 hex-bg opacity-10 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative w-full max-w-md"
            >
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-1.5 text-xs text-cyber-muted hover:text-cyber-text mb-6 transition-colors"
                >
                    <ArrowLeft size={13} />
                    Back to Home
                </button>

                <div className="glass-panel gradient-border p-8">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5 mb-8">
                        <div className="w-9 h-9 bg-cyber-accent rounded-lg flex items-center justify-center shadow-glow-accent">
                            <Dna size={18} className="text-cyber-bg" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-cyber-text">DNA-Stego</p>
                            <p className="text-[10px] text-cyber-muted font-mono">Secure Steganography</p>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-cyber-text mb-1">Welcome</h2>
                    <p className="text-sm text-cyber-muted mb-8">
                        Sign in to save your encryption keys and access your history.
                    </p>

                    {/* Google Sign In Button */}
                    <button
                        onClick={loginWithGoogle}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white hover:bg-gray-50 text-gray-800 font-medium rounded-lg border border-gray-200 transition-all duration-200 shadow-sm hover:shadow-md mb-4"
                    >
                        {/* Google SVG icon */}
                        <svg width="18" height="18" viewBox="0 0 18 18">
                            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18l2.67-2.07z"/>
                            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.31z"/>
                        </svg>
                        Continue with Google
                    </button>

                    <div className="relative flex items-center gap-3 my-4">
                        <div className="flex-1 h-px bg-cyber-border" />
                        <span className="text-xs text-cyber-muted">or</span>
                        <div className="flex-1 h-px bg-cyber-border" />
                    </div>

                    <Button variant="ghost" fullWidth onClick={handleGuest}>
                        Continue without account
                    </Button>

                    <p className="text-center text-xs text-cyber-muted mt-6">
                        By signing in you agree to use this tool responsibly.
                    </p>
                </div>
            </motion.div>
        </div>
    )
}
