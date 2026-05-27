import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Lock, Unlock, Download, Key, Dna, ChevronDown,
    ShieldCheck, ShieldOff, FileText, Info, CheckCircle,
} from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import FileUpload from '../../components/ui/FileUpload.jsx'
import TextArea from '../../components/ui/TextArea.jsx'
import Input from '../../components/ui/Input.jsx'
import ResultDisplay from '../../components/ui/ResultDisplay.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import {
    encryptMessage,
    downloadStegoFile,
    decryptMessage,
    triggerDownload,
} from '../../services/api.js'

const tabs = [
    { id: 'encrypt', label: 'Encrypt', icon: Lock },
    { id: 'decrypt', label: 'Decrypt', icon: Unlock },
]

export default function DnaStego() {
    const [activeTab, setActiveTab] = useState('encrypt')

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2.5 mb-2">
                    <div className="p-2 rounded-lg bg-cyber-accentDim border border-cyber-accent/20">
                        <Dna size={18} className="text-cyber-accent" />
                    </div>
                    <h2 className="text-lg font-semibold text-cyber-text">DNA Steganography</h2>
                </div>
                <p className="text-sm text-cyber-muted leading-relaxed">
                    Encrypt a secret message, convert it into a DNA sequence (A·C·G·T), and embed it
                    inside a FASTA file. Choose whether to protect it with an AES key or keep it key-free.
                </p>
            </div>

            {/* Pipeline steps visualization */}
            <PipelineSteps />

            {/* Tab switcher */}
            <div className="flex gap-1 p-1 bg-cyber-surface rounded-xl border border-cyber-border">
                {tabs.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === id
                                ? 'bg-cyber-accent text-cyber-bg shadow-glow-accent'
                                : 'text-cyber-muted hover:text-cyber-text'
                            }`}
                    >
                        <Icon size={15} />
                        {label}
                    </button>
                ))}
            </div>

            {/* Tab panels */}
            <AnimatePresence mode="wait">
                {activeTab === 'encrypt' ? (
                    <motion.div
                        key="encrypt"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                    >
                        <EncryptPanel />
                    </motion.div>
                ) : (
                    <motion.div
                        key="decrypt"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                    >
                        <DecryptPanel />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Encrypt Panel                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */
function EncryptPanel() {
    const { isAuthenticated, isGuest, saveKey, savedKey } = useAuth()

    const [message, setMessage] = useState('')
    const [fastaFile, setFastaFile] = useState(null)
    const [useDefaultFasta, setUseDefaultFasta] = useState(false)
    const [useEncryption, setUseEncryption] = useState(true)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)

    // Need a message + either a file OR the default-FASTA toggle
    const canSubmit = message.trim().length > 0 && (fastaFile !== null || useDefaultFasta)

    async function handleEncrypt() {
        setLoading(true)
        setResult(null)
        setError(null)
        try {
            const data = await encryptMessage(
                message,
                useDefaultFasta ? null : fastaFile,
                useEncryption,
            )
            setResult(data)

            // Save key into user session if logged in and encryption was used
            if (data.key && isAuthenticated) {
                saveKey(data.key)
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleDownload() {
        try {
            const blob = await downloadStegoFile(result.stego_file)
            triggerDownload(blob, 'dna_stego_output.fasta')
        } catch (err) {
            setError('Download failed: ' + err.message)
        }
    }

    return (
        <div className="glass-panel p-6 space-y-5">
            <SectionTitle icon={Lock} title="Encrypt Message" color="accent" />

            {/* Secret message */}
            <TextArea
                label="Secret Message"
                placeholder="Enter the message you want to hide..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                hint="Your message will be converted into a DNA sequence and embedded into the FASTA file"
            />

            {/* ── Protection Mode Toggle ─────────────────────────────────── */}
            <div className="space-y-2">
                <p className="text-xs font-mono text-cyber-muted uppercase tracking-widest">
                    Protection Mode
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <OptionCard
                        active={useEncryption}
                        onClick={() => setUseEncryption(true)}
                        icon={ShieldCheck}
                        title="With AES Key"
                        desc="The FASTA file can only be decoded using the generated key"
                        color="accent"
                    />
                    <OptionCard
                        active={!useEncryption}
                        onClick={() => setUseEncryption(false)}
                        icon={ShieldOff}
                        title="Key-Free"
                        desc="Anyone with the FASTA file can decode the message without a key"
                        color="blue"
                    />
                </div>
                {useEncryption && (
                    <InfoBanner color="accent">
                        {isAuthenticated
                            ? 'Your encryption key will be saved in this session.'
                            : isGuest
                                ? 'Guest session — your key will NOT be saved. Copy it manually.'
                                : 'Log in to save your key automatically.'}
                    </InfoBanner>
                )}
                {!useEncryption && (
                    <InfoBanner color="blue">
                        No key is generated. Leave the Decrypt key field blank when decoding.
                    </InfoBanner>
                )}
            </div>

            {/* ── Cover FASTA Source ─────────────────────────────────────── */}
            <div className="space-y-2">
                <p className="text-xs font-mono text-cyber-muted uppercase tracking-widest">
                    Cover FASTA File
                </p>
                <label className="flex items-center gap-2.5 cursor-pointer select-none group">
                    <div
                        className={`w-9 h-5 rounded-full transition-colors duration-200 relative ${useDefaultFasta ? 'bg-cyber-accent' : 'bg-cyber-border'
                            }`}
                        onClick={() => {
                            setUseDefaultFasta((v) => !v)
                            if (!useDefaultFasta) setFastaFile(null)
                        }}
                    >
                        <div
                            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${useDefaultFasta ? 'left-4' : 'left-0.5'
                                }`}
                        />
                    </div>
                    <span className="text-sm text-cyber-text">
                        Use server default FASTA&nbsp;
                        <span className="text-cyber-muted text-xs">(NCBI GRCh38.p14 human genome)</span>
                    </span>
                </label>

                {!useDefaultFasta && (
                    <FileUpload
                        label=""
                        accept=".fasta,.fa,.fna"
                        hint="Upload your own cover genome / sequence file"
                        onFile={setFastaFile}
                    />
                )}
                {useDefaultFasta && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-cyber-accentDim border border-cyber-accent/20">
                        <FileText size={14} className="text-cyber-accent flex-shrink-0" />
                        <span className="text-xs font-mono text-cyber-muted">
                            default.fasta — Homo sapiens GRCh38.p14 chromosomes 1-3
                        </span>
                    </div>
                )}
            </div>

            <Button fullWidth loading={loading} disabled={!canSubmit} onClick={handleEncrypt}>
                <Dna size={15} />
                Generate Stego FASTA
            </Button>

            {/* Saved key banner */}
            {savedKey && isAuthenticated && result?.key && (
                <InfoBanner color="accent">
                    <CheckCircle size={13} className="inline mr-1.5" />
                    Encryption key saved to your session.
                </InfoBanner>
            )}

            {/* Error */}
            {error && (
                <ResultDisplay
                    title="Error"
                    type="error"
                    items={[{ label: 'Details', value: error, mono: false }]}
                />
            )}

            {/* Success */}
            {result && (
                <ResultDisplay
                    title="Encoding Successful"
                    type="success"
                    items={[
                        ...(result.key
                            ? [{
                                label: 'Encryption Key',
                                value: result.key,
                                copyable: true,
                                mono: true,
                                hint: isGuest
                                    ? '⚠ Guest session — save this key now, it will not be stored'
                                    : isAuthenticated
                                        ? '✓ Key saved to your session'
                                        : undefined,
                            }]
                            : [{
                                label: 'Protection Mode',
                                value: 'Key-Free — no AES key required to decode',
                                mono: false,
                            }]),
                        {
                            label: 'Output File',
                            value: result.stego_file,
                            copyable: false,
                            mono: true,
                        },
                    ]}
                    actions={
                        <Button variant="secondary" size="sm" onClick={handleDownload}>
                            <Download size={13} />
                            Download Stego FASTA
                        </Button>
                    }
                />
            )}
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Decrypt Panel                                                              */
/* ─────────────────────────────────────────────────────────────────────────── */
function DecryptPanel() {
    const { savedKey, isAuthenticated } = useAuth()

    const [stegoFile, setStegoFile] = useState(null)
    const [key, setKey] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)

    // Only the file is required — key is optional
    const canSubmit = stegoFile !== null

    // Auto-fill saved key when user is authenticated and has one
    function handleUseSavedKey() {
        if (savedKey) setKey(savedKey)
    }

    async function handleDecrypt() {
        setLoading(true)
        setResult(null)
        setError(null)
        try {
            const data = await decryptMessage(stegoFile, key.trim())
            setResult(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="glass-panel p-6 space-y-5">
            <SectionTitle icon={Unlock} title="Decrypt Message" color="blue" />

            <FileUpload
                label="Stego FASTA File"
                accept=".fasta,.fa,.fna"
                hint="Upload the encoded FASTA file you received"
                onFile={setStegoFile}
            />

            {/* Key input — optional */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-mono text-cyber-muted uppercase tracking-widest">
                        Decryption Key&nbsp;
                        <span className="normal-case text-[10px] text-cyber-muted/60">(optional)</span>
                    </label>
                    {isAuthenticated && savedKey && (
                        <button
                            onClick={handleUseSavedKey}
                            className="text-[11px] text-cyber-accent hover:text-cyber-accent/80 font-mono transition-colors"
                        >
                            Use saved key ↗
                        </button>
                    )}
                </div>
                <Input
                    placeholder="Paste AES key here — or leave blank for key-free files..."
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    type="password"
                    hint={
                        key.trim()
                            ? 'Key will be used for AES decryption'
                            : 'No key entered — file must have been encoded key-free'
                    }
                />
                <InfoBanner color="blue">
                    <Info size={12} className="inline mr-1.5 flex-shrink-0" />
                    If the file was encoded <strong>without</strong> an encryption key, leave this field blank.
                </InfoBanner>
            </div>

            <Button
                fullWidth
                variant="secondary"
                loading={loading}
                disabled={!canSubmit}
                onClick={handleDecrypt}
            >
                <Key size={15} />
                Decode Message
            </Button>

            {/* Error */}
            {error && (
                <ResultDisplay
                    title="Decryption Failed"
                    type="error"
                    items={[{ label: 'Details', value: error, mono: false }]}
                />
            )}

            {/* Success */}
            {result && (
                <ResultDisplay
                    title="Message Recovered"
                    type="success"
                    items={[
                        {
                            label: 'Decoded Message',
                            value: result.message,
                            copyable: true,
                            mono: false,
                        },
                    ]}
                />
            )}
        </div>
    )
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Sub-components                                                             */
/* ─────────────────────────────────────────────────────────────────────────── */

function OptionCard({ active, onClick, icon: Icon, title, desc, color }) {
    const activeClass =
        color === 'accent'
            ? 'border-cyber-accent bg-cyber-accentDim text-cyber-accent'
            : 'border-cyber-blue bg-cyber-blue/10 text-cyber-blue'
    const inactiveClass = 'border-cyber-border bg-cyber-surface text-cyber-muted hover:border-cyber-muted/40'

    return (
        <button
            onClick={onClick}
            className={`text-left p-3.5 rounded-xl border transition-all duration-200 ${active ? activeClass : inactiveClass}`}
        >
            <Icon size={18} className="mb-2" />
            <p className="text-sm font-semibold text-cyber-text">{title}</p>
            <p className="text-[11px] text-cyber-muted mt-0.5 leading-snug">{desc}</p>
        </button>
    )
}

function InfoBanner({ children, color = 'blue' }) {
    const cls =
        color === 'accent'
            ? 'bg-cyber-accentDim border-cyber-accent/30 text-cyber-accent'
            : 'bg-cyber-blue/10 border-cyber-blue/30 text-cyber-blue'
    return (
        <div className={`flex items-start gap-2 text-[11px] px-3 py-2 rounded-lg border ${cls}`}>
            {children}
        </div>
    )
}

function PipelineSteps() {
    const steps = [
        { label: 'Text', desc: 'Input message', color: 'text-cyber-muted' },
        { label: 'Encrypt', desc: 'AES (optional)', color: 'text-cyber-blue' },
        { label: 'Binary', desc: '→ 0s and 1s', color: 'text-cyber-muted' },
        { label: 'DNA', desc: 'G·C·A·T bases', color: 'text-cyber-accent' },
        { label: 'FASTA', desc: 'Stego file', color: 'text-cyber-accent' },
    ]

    return (
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {steps.map((step, i) => (
                <div key={i} className="flex items-center gap-1 flex-shrink-0">
                    <div className="text-center">
                        <div className="text-xs font-mono font-semibold text-cyber-text">{step.label}</div>
                        <div className={`text-[10px] ${step.color}`}>{step.desc}</div>
                    </div>
                    {i < steps.length - 1 && (
                        <ChevronDown
                            size={12}
                            className="text-cyber-border flex-shrink-0 -rotate-90 mx-1"
                        />
                    )}
                </div>
            ))}
        </div>
    )
}

function SectionTitle({ icon: Icon, title, color }) {
    const colorClass = color === 'accent' ? 'text-cyber-accent' : 'text-cyber-blue'
    return (
        <div className="flex items-center gap-2">
            <Icon size={16} className={colorClass} />
            <span className="text-sm font-semibold text-cyber-text">{title}</span>
        </div>
    )
}
