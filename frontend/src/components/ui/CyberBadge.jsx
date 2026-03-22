import clsx from 'clsx'

const colors = {
    accent: 'bg-cyber-accentDim text-cyber-accent border border-cyber-accent/30',
    blue: 'bg-cyber-blueDim text-cyber-blue border border-cyber-blue/30',
    red: 'bg-cyber-red/10 text-cyber-red border border-cyber-red/30',
    muted: 'bg-cyber-border/40 text-cyber-muted border border-cyber-border',
}

export default function CyberBadge({ children, color = 'accent', className = '' }) {
    return (
        <span
            className={clsx(
                'inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-mono rounded-full',
                colors[color],
                className,
            )}
        >
            {children}
        </span>
    )
}
