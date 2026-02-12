// =============================================
// CANDLE TRACE - DASHBOARD LAYOUT WRAPPER
// Client component with sidebar context
// =============================================

'use client';

import { SidebarProvider, useSidebar } from '@/components/layout/SidebarContext';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { KeyboardShortcuts } from '@/components/providers';
import styles from './layout.module.css';

interface DashboardLayoutClientProps {
    children: React.ReactNode;
    user: { email?: string; id: string };
}

function LayoutContent({ children, user }: DashboardLayoutClientProps) {
    const { isCollapsed } = useSidebar();

    return (
        <div className={styles.appContainer}>
            <KeyboardShortcuts />
            <Sidebar />
            <main className={`${styles.mainContent} ${isCollapsed ? styles.collapsed : ''}`}>
                <Header user={user} />
                <div className={styles.pageContent}>
                    {children}
                </div>
            </main>
        </div>
    );
}

export function DashboardLayoutClient({ children, user }: DashboardLayoutClientProps) {
    return (
        <SidebarProvider>
            <LayoutContent user={user}>
                {children}
            </LayoutContent>
        </SidebarProvider>
    );
}
