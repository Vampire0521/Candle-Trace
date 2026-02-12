// =============================================
// CANDLE TRACE - HEADER COMPONENT
// =============================================

'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import styles from './Header.module.css';

interface HeaderProps {
    user: { email?: string; id: string };
}

const pageTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/trades': 'Trades',
    '/analytics': 'Analytics',
    '/strategies': 'Strategies',
    '/calculator': 'Risk Calculator',
    '/goals': 'Goals',
};

export function Header({ user }: HeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [showMenu, setShowMenu] = useState(false);
    const [theme, setTheme] = useState<'dark' | 'light'>('dark');

    const pageTitle = pageTitles[pathname] || 'Candle Trace';

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const toggleTheme = () => {
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
        document.body.classList.toggle('light-mode', newTheme === 'light');
    };

    return (
        <header className={styles.header}>
            <div className={styles.headerLeft}>
                <h1 className={styles.pageTitle}>{pageTitle}</h1>
            </div>

            <div className={styles.headerRight}>
                {/* Quick add button */}
                <button
                    className={styles.actionBtn}
                    title="Add Trade (N)"
                    onClick={() => router.push('/trades?action=add')}
                >
                    ➕
                </button>

                {/* Theme toggle */}
                <button
                    className={styles.actionBtn}
                    onClick={toggleTheme}
                    title="Toggle Theme"
                >
                    {theme === 'dark' ? '☀️' : '🌙'}
                </button>

                {/* User menu */}
                <div className={styles.userMenu}>
                    <button
                        className={styles.userBtn}
                        onClick={() => setShowMenu(!showMenu)}
                    >
                        <span className={styles.avatar}>
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                        <span className={styles.userEmail}>{user.email}</span>
                        <span className={styles.chevron}>▼</span>
                    </button>

                    {showMenu && (
                        <div className={styles.dropdown}>
                            <div className={styles.dropdownHeader}>
                                <span className={styles.dropdownEmail}>{user.email}</span>
                            </div>
                            <button className={styles.dropdownItem}>
                                ⚙️ Settings
                            </button>
                            <button
                                className={styles.dropdownItem}
                                onClick={handleSignOut}
                            >
                                🚪 Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
