import { NavLink, useNavigate, useMatch } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import {
    Dna, LayoutDashboard, ImagePlay, Lock, LogOut,
    User, ChevronRight
} from 'lucide-react'
import clsx from 'clsx'
import CyberBadge from '../ui/CyberBadge.jsx'

/* ─────────────────────────────────────────────────────────────
   NAV CONFIG — add new tools here and they appear automatically
───────────────────────────────────────────────────────────── */
const NAV_ITEMS = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, end: true },
    { label: 'DNA-Stego', to: '/dashboard/dna-stego', icon: Dna, badge: 'Active' },
    { label: 'Image Stego', to: '/dashboard/image-stego', icon: ImagePlay, badge: 'Soon', badgeColor: 'muted', disabled: true },
    { label: 'File Encrypt', to: '/dashboard/file-encrypt', icon: Lock, badge: 'Soon', badgeColor: 'muted', disabled: true },
]

export default function Sidebar({ collapsed, onToggle }) {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    async function handleLogout() {
        await logout()
        navigate('/')
    }

    return (
        <aside
            className={clsx(
                'flex flex-col h-full bg-cyber-surface border-r border-cyber-border transition-all duration-300',
                collapsed ? 'w-16' : 'w-60',
            )}
        >
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-cyber-border">
                <div className="flex-shrink-0 w-8 h-8 bg-cyber-accent rounded-lg flex items-center justify-center shadow-glow-accent">
                    <Dna size={18} className="text-cyber-bg" />
                </div>
                {!collapsed && (
                    <div className="animate-fade-in">
                        <p className="text-sm font-bold text-cyber-text tracking-tight">DNA-Stego</p>
                        <p className="text-[10px] text-cyber-muted font-mono">v1.0.0</p>
                    </div>
                )}
            </div>

            {/* Nav links */}
            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
                {!collapsed && (
                    <p className="text-[10px] font-mono text-cyber-muted/50 uppercase tracking-widest px-2 mb-3">
                        Tools
                    </p>
                )}
                {NAV_ITEMS.map((item) => (
                    <SidebarItem key={item.to} item={item} collapsed={collapsed} />
                ))}
            </nav>

            {/* User section */}
            <div className="border-t border-cyber-border p-3 space-y-1">
                <div className={clsx('flex items-center gap-3 px-2 py-2 rounded-lg', !collapsed && 'bg-cyber-border/20')}>
                    <div className="flex-shrink-0 w-7 h-7 rounded-full bg-cyber-accentDim border border-cyber-accent/30 flex items-center justify-center">
                        <User size={13} className="text-cyber-accent" />
                    </div>
                    {!collapsed && (
                        <div className="flex-1 min-w-0 animate-fade-in">
                            <p className="text-xs font-medium text-cyber-text truncate">
                                {user?.username ?? 'Guest Session'}
                            </p>
                            <p className="text-[10px] text-cyber-muted truncate">
                                {user?.email ?? 'Temporary — data not saved'}
                            </p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleLogout}
                    className={clsx(
                        'w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-cyber-muted hover:text-cyber-red hover:bg-cyber-red/10 transition-all text-sm',
                        collapsed && 'justify-center',
                    )}
                >
                    <LogOut size={15} />
                    {!collapsed && <span>Sign Out</span>}
                </button>

                <button
                    onClick={onToggle}
                    className="w-full flex items-center justify-center py-1.5 text-cyber-muted hover:text-cyber-text transition-colors"
                >
                    <ChevronRight
                        size={14}
                        className={clsx('transition-transform duration-300', !collapsed && 'rotate-180')}
                    />
                </button>
            </div>
        </aside>
    )
}

function SidebarItem({ item, collapsed }) {
    const { label, to, icon: Icon, badge, badgeColor = 'accent', end, disabled } = item

    // useMatch is React-Compiler-safe (no render-prop / function-as-children)
    const matchExact = useMatch(to)
    const matchPrefix = useMatch(`${to}/*`)
    const isActive = end ? !!matchExact : !!(matchExact || matchPrefix)

    if (disabled) {
        return (
            <div className={clsx('flex items-center gap-3 px-3 py-2.5 rounded-lg opacity-40 cursor-not-allowed', collapsed && 'justify-center')}>
                <Icon size={17} className="flex-shrink-0 text-cyber-muted" />
                {!collapsed && (
                    <div className="flex items-center justify-between w-full">
                        <span className="text-sm text-cyber-muted">{label}</span>
                        {badge && <CyberBadge color={badgeColor}>{badge}</CyberBadge>}
                    </div>
                )}
            </div>
        )
    }

    return (
        <NavLink
            to={to}
            end={end}
            className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group',
                isActive
                    ? 'nav-active text-cyber-accent'
                    : 'text-cyber-muted hover:text-cyber-text hover:bg-cyber-border/30',
                collapsed && 'justify-center',
            )}
        >
            <Icon
                size={17}
                className={clsx('flex-shrink-0 transition-colors', isActive ? 'text-cyber-accent' : 'group-hover:text-cyber-text')}
            />
            {!collapsed && (
                <div className="flex items-center justify-between w-full">
                    <span className="text-sm font-medium">{label}</span>
                    {badge && !isActive && <CyberBadge color={badgeColor}>{badge}</CyberBadge>}
                </div>
            )}
        </NavLink>
    )
}
