import clsx from 'clsx'

export default function TextArea({
    label,
    hint,
    error,
    rows = 4,
    monoFont = false,
    className = '',
    ...props
}) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-xs font-mono text-cyber-muted mb-2 uppercase tracking-widest">
                    {label}
                </label>
            )}
            <textarea
                rows={rows}
                className={clsx(
                    'terminal-input resize-none leading-relaxed',
                    monoFont && 'font-mono',
                    error && 'border-cyber-red/60 focus:border-cyber-red/80 focus:ring-cyber-red/20',
                    className,
                )}
                {...props}
            />
            {hint && !error && <p className="text-xs text-cyber-muted/70 mt-1.5">{hint}</p>}
            {error && <p className="text-xs text-cyber-red mt-1.5">{error}</p>}
        </div>
    )
}
