import { Bell, Shield, HelpCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'
import CyberBadge from '../ui/CyberBadge.jsx'

export default function Navbar({ title, subtitle }) {
    const { user, isGuest } = useAuth()

    return (
        <header className="flex items-center justify-between h-14 px-6 border-b border-cyber-border bg-cyber-surface/80 backdrop-blur-sm flex-shrink-0">
            {/* Title */}
            <div>
                <h1 className="text-base font-semibold text-cyber-text tracking-tight">{title}</h1>
                {subtitle && <p className="text-xs text-cyber-muted">{subtitle}</p>}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
                {isGuest && (
                    <CyberBadge color="muted">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-slow" />
                        Guest Mode
                    </CyberBadge>
                )}

                <div className="flex items-center gap-1">
                    <NavbarIconBtn icon={Shield} tooltip="Security Status" />
                </div>

                <div className="h-5 w-px bg-cyber-border" />

                {/* Session indicator */}
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-cyber-accentDim border border-cyber-accent/30 flex items-center justify-center text-[10px] font-bold text-cyber-accent">
                        {user ? user.username[0].toUpperCase() : 'G'}
                    </div>
                    <span className="text-xs text-cyber-muted hidden sm:block">
                        {user?.username ?? 'Guest'}
                    </span>
                </div>
            </div>
        </header>
    )
}

function NavbarIconBtn({ icon: Icon, tooltip }) {
    return (
        <button
            title={tooltip}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-cyber-muted hover:text-cyber-text hover:bg-cyber-border/40 transition-all"
        >
            <Icon size={15} />
        </button>
    )
}
