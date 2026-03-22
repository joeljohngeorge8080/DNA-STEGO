import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Navbar from './Navbar.jsx'

// Page metadata — maps route pathnames to title/subtitle
const PAGE_META = {
    '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your tools and activity' },
    '/dashboard/dna-stego': { title: 'DNA-Stego', subtitle: 'Encode and decode messages in DNA sequences' },
    '/dashboard/image-stego': { title: 'Image Stego', subtitle: 'Coming soon' },
    '/dashboard/file-encrypt': { title: 'File Encrypt', subtitle: 'Coming soon' },
}

export default function DashboardLayout() {
    const [collapsed, setCollapsed] = useState(false)
    const location = useLocation()
    const meta = PAGE_META[location.pathname] ?? { title: 'Dashboard', subtitle: '' }

    return (
        <div className="flex h-screen bg-cyber-bg overflow-hidden">
            {/* Sidebar */}
            <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

            {/* Main */}
            <div className="flex flex-col flex-1 min-w-0">
                <Navbar title={meta.title} subtitle={meta.subtitle} />
                <main className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
