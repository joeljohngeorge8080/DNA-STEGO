import clsx from 'clsx'
import { Loader2 } from 'lucide-react'

const variants = {
    primary: 'bg-cyber-accent text-cyber-bg font-semibold hover:bg-cyber-accent/90 shadow-glow-accent',
    secondary: 'bg-transparent border border-cyber-accent/40 text-cyber-accent hover:bg-cyber-accentDim hover:border-cyber-accent/70',
    ghost: 'bg-transparent text-cyber-muted hover:text-cyber-text hover:bg-cyber-border/30',
    danger: 'bg-cyber-red/10 border border-cyber-red/40 text-cyber-red hover:bg-cyber-red/20',
}

const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-md',
    md: 'px-5 py-2.5 text-sm rounded-lg',
    lg: 'px-7 py-3 text-base rounded-xl',
}

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    className = '',
    ...props
}) {
    return (
        <button
            disabled={disabled || loading}
            className={clsx(
                'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-cyber-accent/30 focus:ring-offset-1 focus:ring-offset-cyber-bg',
                'disabled:opacity-40 disabled:cursor-not-allowed',
                'active:scale-95',
                variants[variant],
                sizes[size],
                fullWidth && 'w-full',
                className,
            )}
            {...props}
        >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {children}
        </button>
    )
}
