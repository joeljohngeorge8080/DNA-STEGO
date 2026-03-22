import { useState } from 'react'
import { Copy, Check, AlertCircle, CheckCircle2, Terminal } from 'lucide-react'
import clsx from 'clsx'

/**
 * ResultDisplay — Shows encode/decode results in a terminal-style panel.
 *
 * Props:
 *   title   — panel title
 *   type    — 'success' | 'error'
 *   items   — [{ label, value, copyable, mono, dna }]
 *   actions — JSX nodes rendered below (e.g. Download button)
 */
export default function ResultDisplay({ title, type = 'success', items = [], actions }) {
    return (
        <div
            className={clsx(
                'rounded-xl border overflow-hidden animate-fade-in',
                type === 'success'
                    ? 'border-cyber-accent/25 bg-gradient-to-b from-cyber-accent/5 to-transparent'
                    : 'border-cyber-red/25 bg-gradient-to-b from-cyber-red/5 to-transparent',
            )}
        >
            {/* Header */}
            <div
                className={clsx(
                    'flex items-center gap-2.5 px-4 py-3 border-b',
                    type === 'success' ? 'border-cyber-accent/20' : 'border-cyber-red/20',
                )}
            >
                {type === 'success' ? (
                    <CheckCircle2 size={15} className="text-cyber-accent" />
                ) : (
                    <AlertCircle size={15} className="text-cyber-red" />
                )}
                <span className="text-xs font-mono uppercase tracking-widest text-cyber-muted">{title}</span>
            </div>

            {/* Items */}
            <div className="p-4 space-y-4">
                {items.map((item, i) => (
                    <ResultItem key={i} {...item} />
                ))}
                {actions && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-cyber-border/50">
                        {actions}
                    </div>
                )}
            </div>
        </div>
    )
}

function ResultItem({ label, value, copyable = false, mono = true, dna = false }) {
    const [copied, setCopied] = useState(false)

    async function copy() {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono text-cyber-muted uppercase tracking-widest">{label}</span>
                {copyable && (
                    <button
                        onClick={copy}
                        className="flex items-center gap-1 text-xs text-cyber-muted hover:text-cyber-accent transition-colors"
                    >
                        {copied ? <Check size={12} className="text-cyber-accent" /> : <Copy size={12} />}
                        {copied ? 'Copied' : 'Copy'}
                    </button>
                )}
            </div>
            <div
                className={clsx(
                    'rounded-lg bg-cyber-bg border border-cyber-border px-3 py-2.5 text-sm break-all leading-relaxed',
                    mono ? 'font-mono' : 'font-sans',
                    dna && 'tracking-wide',
                )}
            >
                {dna ? <DnaHighlight value={value} /> : (
                    <span className="text-cyber-text">{value}</span>
                )}
            </div>
        </div>
    )
}

// Colorize A/T/G/C in a DNA string
function DnaHighlight({ value }) {
    const colors = { A: 'dna-a', T: 'dna-t', G: 'dna-g', C: 'dna-c' }
    return (
        <span>
            {value.split('').map((ch, i) => (
                <span key={i} className={colors[ch] ?? 'text-cyber-muted'}>
                    {ch}
                </span>
            ))}
        </span>
    )
}
