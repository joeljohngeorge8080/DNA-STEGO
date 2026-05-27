import { useNavigate } from 'react-router-dom'
import { Dna, Lock, Eye, ShieldCheck, ArrowRight, Zap } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/ui/Button.jsx'
import Prism from '../components/Prism.jsx'

const features = [
    {
        icon: Lock,
        title: 'Military-Grade Encryption',
        desc: 'Messages are Fernet-encrypted (AES-128-CBC) before steganographic embedding.',
    },
    {
        icon: Dna,
        title: 'DNA Steganography',
        desc: 'Binary data is mapped to nucleotides (A·C·G·T) and injected into real FASTA files.',
    },
    {
        icon: ShieldCheck,
        title: 'Defense-in-Depth',
        desc: 'Even if the FASTA file is found, the message is still cryptographically protected.',
    },
]

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function LandingPage() {
    const { continueAsGuest } = useAuth()
    const navigate = useNavigate()

    function handleGuest() {
        continueAsGuest()
        navigate('/dashboard')
    }

    return (
        <div className="relative min-h-screen bg-cyber-bg overflow-hidden">
            {/* WebGL Background */}
            <div className="absolute inset-0 z-0 opacity-70">
                <Prism
                    animationType="rotate"
                    timeScale={0.4}
                    height={3.0}
                    baseWidth={5.0}
                    scale={3.2}
                    hueShift={0}
                    colorFrequency={0.8}
                    noise={0}
                    glow={0.8}
                />
            </div>

            {/* Hex grid overlay */}
            <div className="absolute inset-0 z-0 hex-bg opacity-20" />

            {/* Content */}
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Nav */}
                <nav className="flex items-center justify-between px-6 py-5 border-b border-cyber-border/30">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-cyber-accent rounded-lg flex items-center justify-center shadow-glow-accent">
                            <Dna size={17} className="text-cyber-bg" />
                        </div>
                        <span className="font-bold text-cyber-text text-sm tracking-tight">DNA-Stego</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
                        <Button variant="secondary" size="sm" onClick={() => navigate('/login')}>Get Started</Button>
                    </div>
                </nav>

                {/* Hero */}
                <motion.section
                    className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={itemVariants}>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyber-accent/30 bg-cyber-accentDim text-cyber-accent text-xs font-mono mb-8">
                            <Zap size={10} className="fill-current" />
                            Steganography + Encryption Pipeline
                        </div>
                    </motion.div>

                    <motion.h1
                        variants={itemVariants}
                        className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
                    >
                        <span className="text-cyber-text">Hide Data in</span>
                        <br />
                        <span className="text-cyber-accent text-glow-accent">DNA Sequences</span>
                    </motion.h1>

                    <motion.p
                        variants={itemVariants}
                        className="max-w-xl text-cyber-muted text-lg leading-relaxed mb-10"
                    >
                        Embed encrypted messages inside biological FASTA files using DNA steganography.
                        Undetectable. Secure. Built for cybersecurity research.
                    </motion.p>

                    <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3">
                        <Button size="lg" onClick={() => navigate('/login')}>
                            Get Started
                            <ArrowRight size={16} />
                        </Button>
                        <Button variant="secondary" size="lg" onClick={handleGuest}>
                            Try Without Login
                        </Button>
                    </motion.div>
                </motion.section>

                {/* Feature cards */}
                <motion.section
                    className="px-6 pb-20"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
                        {features.map(({ icon: Icon, title, desc }, i) => (
                            <motion.div
                                key={i}
                                variants={itemVariants}
                                className="glass-panel p-5 gradient-border hover:shadow-glow-accent/20 transition-shadow duration-300"
                            >
                                <div className="w-9 h-9 rounded-lg bg-cyber-accentDim border border-cyber-accent/20 flex items-center justify-center mb-4">
                                    <Icon size={18} className="text-cyber-accent" />
                                </div>
                                <h3 className="text-sm font-semibold text-cyber-text mb-1.5">{title}</h3>
                                <p className="text-xs text-cyber-muted leading-relaxed">{desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.section>

                {/* Footer */}
                <footer className="border-t border-cyber-border/30 px-6 py-4 text-center">
                    <p className="text-xs text-cyber-muted/50 font-mono">
                        DNA-Stego · Secure Steganography Pipeline · Built with FastAPI + React
                    </p>
                </footer>
            </div>
        </div>
    )
}
