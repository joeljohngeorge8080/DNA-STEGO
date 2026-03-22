import clsx from 'clsx'

export default function Input({
    label,
    hint,
    error,
    prefix,
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
            <div className="relative">
                {prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted text-sm select-none font-mono">
                        {prefix}
                    </span>
                )}
                <input
                    className={clsx(
                        'terminal-input h-11',
                        prefix && 'pl-8',
                        error && 'border-cyber-red/60 focus:border-cyber-red/80 focus:ring-cyber-red/20',
                        className,
                    )}
                    {...props}
                />
            </div>
            {hint && !error && <p className="text-xs text-cyber-muted/70 mt-1.5">{hint}</p>}
            {error && <p className="text-xs text-cyber-red mt-1.5">{error}</p>}
        </div>
    )
}
