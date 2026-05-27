import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, LogIn, Dna, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'

export default function LoginPage() {
    const { login, continueAsGuest, loading: authLoading } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    function handleChange(e) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            await login({ email: form.email, password: form.password })
            navigate('/dashboard')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    function handleGuest() {
        continueAsGuest()
        navigate('/dashboard')
    }

    if (authLoading) {
        return (
            <div className="min-h-screen bg-cyber-dark flex items-center justify-center">
                <div className="text-cyber-text">Loading...</div>
            </div>
        )
    }

    return (
        <AuthLayout title="Welcome Back" subtitle="Sign in to your DNA-Stego account">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    label="Email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                />
                <Input
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    required
                />
                {error && (
                    <p className="text-xs text-cyber-red bg-cyber-red/10 border border-cyber-red/20 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}
                <Button type="submit" fullWidth loading={loading}>
                    <LogIn size={15} />
                    Sign In
                </Button>
            </form>

            <div className="relative flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-cyber-border" />
                <span className="text-xs text-cyber-muted">or</span>
                <div className="flex-1 h-px bg-cyber-border" />
            </div>

            <Button variant="ghost" fullWidth onClick={handleGuest}>
                Continue without account
            </Button>

            <p className="text-center text-xs text-cyber-muted mt-4">
                No account?{' '}
                <Link to="/signup" className="text-cyber-accent hover:underline">
                    Sign up
                </Link>
            </p>
        </AuthLayout>
    )
}

function AuthLayout({ title, subtitle, children }) {
    const navigate = useNavigate()
    return (
        <div className="min-h-screen bg-cyber-bg flex flex-col items-center justify-center px-4">
            {/* Background grid */}
            <div className="absolute inset-0 hex-bg opacity-10 pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative w-full max-w-md"
            >
                {/* Back */}
                <button
                    onClick={() => navigate('/')}
                    className="flex items-center gap-1.5 text-xs text-cyber-muted hover:text-cyber-text mb-6 transition-colors"
                >
                    <ArrowLeft size={13} />
                    Back to Home
                </button>

                {/* Card */}
                <div className="glass-panel gradient-border p-8">
                    {/* Logo */}
                    <div className="flex items-center gap-2.5 mb-6">
                        <div className="w-9 h-9 bg-cyber-accent rounded-lg flex items-center justify-center shadow-glow-accent">
                            <Dna size={18} className="text-cyber-bg" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-cyber-text">DNA-Stego</p>
                            <p className="text-[10px] text-cyber-muted font-mono">Secure Steganography</p>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-cyber-text mb-1">{title}</h2>
                    <p className="text-sm text-cyber-muted mb-6">{subtitle}</p>

                    {children}
                </div>
            </motion.div>
        </div>
    )
}
