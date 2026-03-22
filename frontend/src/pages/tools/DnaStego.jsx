import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Unlock, Download, Key, Dna, ChevronDown } from 'lucide-react'
import Button from '../../components/ui/Button.jsx'
import FileUpload from '../../components/ui/FileUpload.jsx'
import TextArea from '../../components/ui/TextArea.jsx'
import Input from '../../components/ui/Input.jsx'
import ResultDisplay from '../../components/ui/ResultDisplay.jsx'
import { encryptMessage, downloadStegoFile, decryptMessage, triggerDownload } from '../../services/api.js'

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
                    Encrypt a secret message, convert it into a DNA sequence (A·C·G·T), and embed it inside
                    a FASTA file. The recipient uses the key to extract and decrypt the original message.
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

/* ────────── Encrypt Panel ────────── */
function EncryptPanel() {
    const [message, setMessage] = useState('')
    const [fastaFile, setFastaFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)

    const canSubmit = message.trim().length > 0 && fastaFile !== null

    async function handleEncrypt() {
        setLoading(true)
        setResult(null)
        setError(null)
        try {
            const data = await encryptMessage(message, fastaFile)
            setResult(data)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    async function handleDownload() {
        try {
            const blob = await downloadStegoFile(result.stego_file)
            triggerDownload(blob, 'encoded.fasta')
        } catch (err) {
            setError('Download failed: ' + err.message)
        }
    }

    return (
        <div className="glass-panel p-6 space-y-5">
            <SectionTitle icon={Lock} title="Encrypt Message" color="accent" />

            <TextArea
                label="Secret Message"
                placeholder="Enter the message you want to hide..."
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                hint="Your message will be encrypted and converted into a DNA sequence"
            />

            <FileUpload
                label="Cover FASTA File"
                accept=".fasta,.fa,.fna"
                hint="The original genome or sequence file to inject data into"
                onFile={setFastaFile}
            />

            <Button
                fullWidth
                loading={loading}
                disabled={!canSubmit}
                onClick={handleEncrypt}
            >
                <Dna size={15} />
                Generate Stego FASTA
            </Button>

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
                        {
                            label: 'Encryption Key',
                            value: result.key,
                            copyable: true,
                            mono: true,
                        },
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

/* ────────── Decrypt Panel ────────── */
function DecryptPanel() {
    const [stegoFile, setStegoFile] = useState(null)
    const [key, setKey] = useState('')
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)

    const canSubmit = stegoFile !== null && key.trim().length > 0

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
                hint="Upload the encoded FASTA file received from the sender"
                onFile={setStegoFile}
            />

            <Input
                label="Decryption Key"
                placeholder="Paste encryption key here..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                type="password"
                hint="The key was generated during the encryption step"
            />

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

/* ────────── Pipeline Visualization ────────── */
function PipelineSteps() {
    const steps = [
        { label: 'Text', desc: 'Input message', color: 'text-cyber-muted' },
        { label: 'Encrypt', desc: 'Fernet AES', color: 'text-cyber-blue' },
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

/* ────────── Section Title ────────── */
function SectionTitle({ icon: Icon, title, color }) {
    const colorClass = color === 'accent' ? 'text-cyber-accent' : 'text-cyber-blue'
    return (
        <div className="flex items-center gap-2">
            <Icon size={16} className={colorClass} />
            <span className="text-sm font-semibold text-cyber-text">{title}</span>
        </div>
    )
}
