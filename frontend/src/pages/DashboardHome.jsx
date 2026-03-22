import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Dna, ArrowRight, Activity, Lock, ShieldCheck, ImagePlay } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import Button from '../components/ui/Button.jsx'
import CyberBadge from '../components/ui/CyberBadge.jsx'

const tools = [
    {
        id: 'dna-stego',
        icon: Dna,
        name: 'DNA Steganography',
        desc: 'Embed encrypted messages inside FASTA genome files using DNA nucleotide encoding.',
        tag: 'Active',
        tagColor: 'accent',
        route: '/dashboard/dna-stego',
        steps: ['Encrypt → Fernet AES', 'Binary → DNA bases', 'Inject into FASTA'],
        active: true,
    },
    {
        id: 'image-stego',
        icon: ImagePlay,
        name: 'Image Steganography',
        desc: 'Hide encrypted data inside image pixel channels using LSB substitution.',
        tag: 'Coming Soon',
        tagColor: 'muted',
        active: false,
    },
    {
        id: 'file-encrypt',
        icon: Lock,
        name: 'File Encryption',
        desc: 'Encrypt any file type using strong symmetric or asymmetric algorithms.',
        tag: 'Coming Soon',
        tagColor: 'muted',
        active: false,
    },
]

const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
}
const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function DashboardHome() {
    const { user, isGuest } = useAuth()
    const navigate = useNavigate()

    const greeting = user
        ? `Welcome back, ${user.username}.`
        : 'Welcome, Guest.'

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
            {/* Greeting */}
            <div className="flex items-start justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-cyber-text">{greeting}</h2>
                    <p className="text-cyber-muted text-sm mt-1">
                        {isGuest
                            ? 'You are in a guest session. Data is not persisted.'
                            : 'Your secure steganography workspace.'}
                    </p>
                </div>
                {isGuest && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                        <Activity size={13} className="text-amber-400" />
                        <span className="text-xs text-amber-400 font-mono">Temporary Session</span>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Available Tools', value: '1', accent: true },
                    { label: 'Upcoming Tools', value: '2', accent: false },
                    { label: 'Encryption', value: 'Fernet', accent: false },
                    { label: 'Covert Channel', value: 'FASTA', accent: false },
                ].map(({ label, value, accent }) => (
                    <div
                        key={label}
                        className={`glass-panel p-4 ${accent ? 'border-cyber-accent/30' : ''}`}
                    >
                        <p className={`text-xl font-bold font-mono ${accent ? 'text-cyber-accent' : 'text-cyber-text'}`}>
                            {value}
                        </p>
                        <p className="text-xs text-cyber-muted mt-0.5">{label}</p>
                    </div>
                ))}
            </div>

            {/* Tools grid */}
            <div>
                <h3 className="text-sm font-mono text-cyber-muted uppercase tracking-widest mb-4">
                    Security Tools
                </h3>
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {tools.map((tool) => (
                        <ToolCard key={tool.id} tool={tool} onLaunch={() => navigate(tool.route)} />
                    ))}
                </motion.div>
            </div>

            {/* Bottom info */}
            <div className="glass-panel p-5 flex items-start gap-4">
                <div className="p-2 bg-cyber-accentDim rounded-lg border border-cyber-accent/20 flex-shrink-0">
                    <ShieldCheck size={18} className="text-cyber-accent" />
                </div>
                <div>
                    <p className="text-sm font-medium text-cyber-text mb-0.5">Defense-in-Depth Pipeline</p>
                    <p className="text-xs text-cyber-muted leading-relaxed">
                        DNA-Stego combines <span className="text-cyber-accent">cryptography</span> (Fernet AES-128) and{' '}
                        <span className="text-cyber-accent">steganography</span> (DNA injection into FASTA) into a
                        double-layer security pipeline. An observer who discovers the FASTA file cannot read the
                        message without the encryption key.
                    </p>
                </div>
            </div>
        </div>
    )
}

function ToolCard({ tool, onLaunch }) {
    const { icon: Icon, name, desc, tag, tagColor, steps, active } = tool

    return (
        <motion.div
            variants={itemVariants}
            className={`glass-panel p-5 flex flex-col gap-4 transition-all duration-200 ${active
                    ? 'hover:border-cyber-accent/40 hover:shadow-glow-accent cursor-pointer gradient-border'
                    : 'opacity-70 cursor-default'
                }`}
            onClick={active ? onLaunch : undefined}
        >
            <div className="flex items-start justify-between">
                <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? 'bg-cyber-accentDim border border-cyber-accent/20' : 'bg-cyber-border'
                        }`}
                >
                    <Icon size={20} className={active ? 'text-cyber-accent' : 'text-cyber-muted'} />
                </div>
                <CyberBadge color={tagColor}>{tag}</CyberBadge>
            </div>

            <div>
                <h4 className="text-sm font-semibold text-cyber-text mb-1">{name}</h4>
                <p className="text-xs text-cyber-muted leading-relaxed">{desc}</p>
            </div>

            {steps && (
                <div className="space-y-1">
                    {steps.map((step, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-cyber-accent/60 flex-shrink-0" />
                            <span className="text-[11px] font-mono text-cyber-muted">{step}</span>
                        </div>
                    ))}
                </div>
            )}

            {active && (
                <Button variant="secondary" size="sm" fullWidth>
                    Launch Tool
                    <ArrowRight size={12} />
                </Button>
            )}
        </motion.div>
    )
}
