// =============================================
// CANDLE TRACE - SIDEBAR COMPONENT
// =============================================

'use client';

import Link from 'next/link';
// next/image not needed - using plain img for SVG logo
import { usePathname } from 'next/navigation';
import { useSidebar } from './SidebarContext';
import styles from './Sidebar.module.css';
import { motion } from 'framer-motion';

interface NavItem {
    id: string;
    label: string;
    icon: string;
    href: string;
    shortcut: string;
}

const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', href: '/dashboard', shortcut: 'D' },
    { id: 'trades', label: 'Trades', icon: '📈', href: '/trades', shortcut: 'T' },
    { id: 'analytics', label: 'Analytics', icon: '📉', href: '/analytics', shortcut: 'A' },
    { id: 'ai', label: 'AI Insights', icon: '🤖', href: '/ai', shortcut: 'I' },
    { id: 'strategies', label: 'Strategies', icon: '🎯', href: '/strategies', shortcut: 'S' },
    { id: 'calculator', label: 'Calculator', icon: '🧮', href: '/calculator', shortcut: 'R' },
    { id: 'goals', label: 'Goals', icon: '🏆', href: '/goals', shortcut: 'G' },
    { id: 'settings', label: 'Settings', icon: '⚙️', href: '/settings', shortcut: '' },
];

export function Sidebar() {
    const pathname = usePathname();
    const { isCollapsed, toggle } = useSidebar();

    return (
        <aside className={`${styles.sidebar} ${isCollapsed ? styles.collapsed : ''}`}>
            <div className={styles.sidebarHeader}>
                <div className={styles.logo}>
                    <img src="/CandleTrace_logo.svg" alt="Candle Trace" width={28} height={28} className={styles.logoImage} />
                    <span className={`${styles.logoText} ${isCollapsed ? styles.hidden : ''}`}>
                        Candle Trace
                    </span>
                </div>
            </div>

            <nav className={styles.nav}>
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <motion.div key={item.id} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                            <Link
                                href={item.href}
                                className={`${styles.navItem} ${isActive ? styles.active : ''}`}
                                title={item.label}
                            >
                                <span className={styles.navIcon}>{item.icon}</span>
                                <span className={`${styles.navLabel} ${isCollapsed ? styles.hidden : ''}`}>
                                    {item.label}
                                </span>
                                {!isCollapsed && (
                                    <span className={styles.shortcutHint}>{item.shortcut}</span>
                                )}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeNav"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-sm"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    />
                                )}
                            </Link>
                        </motion.div>
                    );
                })}
            </nav>

            <div className={styles.sidebarFooter}>
                <button
                    className={styles.collapseBtn}
                    onClick={toggle}
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <span className={styles.collapseIcon}>{isCollapsed ? '»' : '«'}</span>
                </button>
            </div>
        </aside>
    );
}
