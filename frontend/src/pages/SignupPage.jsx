import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, Lock, User, LogIn, Dna, ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'

export default function SignupPage() {
    const { signup, confirmSignup, resendConfirmationCode } = useAuth()
    const navigate = useNavigate()
    const [step, setStep] = useState('signup') // 'signup' | 'confirm'
    const [form, setForm] = useState({ username: '', email: '', password: '', confirmationCode: '' })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(null)

    function handleChange(e) {
        setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
    }

    async function handleSignup(e) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const result = await signup({
                username: form.username,
                email: form.email,
                password: form.password
            })

            if (result.isSignUpComplete) {
                // Auto sign in after confirmation
                navigate('/login')
            } else {
                setStep('confirm')
                setSuccess('Account created! Please check your email for the confirmation code.')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleConfirm(e) {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const result = await confirmSignup({
                username: form.username,
                confirmationCode: form.confirmationCode
            })

            if (result.isSignUpComplete) {
                setSuccess('Account confirmed successfully! You can now sign in.')
                setTimeout(() => navigate('/login'), 2000)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleResendCode() {
        setLoading(true)
        setError(null)
        try {
            await resendConfirmationCode({ username: form.username })
            setSuccess('Confirmation code sent! Please check your email.')
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (step === 'confirm') {
        return (
            <AuthLayout title="Confirm Your Account" subtitle="Enter the confirmation code sent to your email">
                <form onSubmit={handleConfirm} className="space-y-4">
                    <Input
                        label="Confirmation Code"
                        name="confirmationCode"
                        type="text"
                        placeholder="Enter 6-digit code"
                        value={form.confirmationCode}
                        onChange={handleChange}
                        required
                    />

                    {error && (
                        <p className="text-xs text-cyber-red bg-cyber-red/10 border border-cyber-red/20 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}

                    {success && (
                        <p className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2">
                            {success}
                        </p>
                    )}

                    <Button type="submit" fullWidth loading={loading}>
                        <CheckCircle size={15} />
                        Confirm Account
                    </Button>

                    <Button
                        type="button"
                        variant="ghost"
                        fullWidth
                        onClick={handleResendCode}
                        loading={loading}
                    >
                        Resend Code
                    </Button>
                </form>

                <p className="text-center text-xs text-cyber-muted mt-4">
                    <Link to="/login" className="text-cyber-accent hover:underline">
                        Back to Sign In
                    </Link>
                </p>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout title="Create Account" subtitle="Join DNA-Stego with AWS Cognito">
            <form onSubmit={handleSignup} className="space-y-4">
                <Input
                    label="Username"
                    name="username"
                    type="text"
                    placeholder="Choose a username"
                    value={form.username}
                    onChange={handleChange}
                    required
                />
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

                {success && (
                    <p className="text-xs text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg px-3 py-2">
                        {success}
                    </p>
                )}

                <Button type="submit" fullWidth loading={loading}>
                    <User size={15} />
                    Create Account
                </Button>
            </form>

            <p className="text-center text-xs text-cyber-muted mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-cyber-accent hover:underline">
                    Sign in
                </Link>
            </p>
        </AuthLayout>
    )
}

// AuthLayout component (shared between login and signup)
function AuthLayout({ title, subtitle, children }) {
    return (
        <div className="min-h-screen bg-cyber-dark flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <div className="bg-cyber-card border border-cyber-border rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-flex items-center justify-center w-16 h-16 bg-cyber-accent/10 rounded-full mb-4"
                        >
                            <Dna className="w-8 h-8 text-cyber-accent" />
                        </motion.div>
                        <h1 className="text-2xl font-bold text-cyber-text mb-2">{title}</h1>
                        <p className="text-cyber-muted">{subtitle}</p>
                    </div>

                    {children}

                    <div className="mt-8 pt-6 border-t border-cyber-border">
                        <Link
                            to="/"
                            className="inline-flex items-center gap-2 text-xs text-cyber-muted hover:text-cyber-text transition-colors"
                        >
                            <ArrowLeft size={12} />
                            Back to home
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
