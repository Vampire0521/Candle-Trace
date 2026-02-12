// =============================================
// CANDLE TRACE - KEYBOARD SHORTCUTS PROVIDER
// Global keyboard shortcuts for navigation
// =============================================

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const SHORTCUTS: Record<string, string> = {
    'd': '/dashboard',
    't': '/trades',
    'a': '/analytics',
    's': '/strategies',
    'r': '/calculator',
    'g': '/goals',
};

export function KeyboardShortcuts() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Skip if user is typing in an input
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'INPUT' ||
                target.tagName === 'TEXTAREA' ||
                target.tagName === 'SELECT' ||
                target.isContentEditable
            ) {
                return;
            }

            // Skip if any modifier keys are pressed (except Escape)
            if ((e.ctrlKey || e.metaKey || e.altKey) && e.key !== 'Escape') {
                return;
            }

            const key = e.key.toLowerCase();

            // Navigation shortcuts
            if (SHORTCUTS[key]) {
                e.preventDefault();
                if (pathname !== SHORTCUTS[key]) {
                    router.push(SHORTCUTS[key]);
                }
                return;
            }

            // 'N' for new trade modal (to be implemented with modal context)
            if (key === 'n') {
                // Will be connected to modal context when trade modal is implemented
                console.log('New trade shortcut pressed');
                return;
            }

            // Escape to close modals
            if (e.key === 'Escape') {
                // Will be connected to modal context
                document.dispatchEvent(new CustomEvent('closeModals'));
                return;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router, pathname]);

    return null; // This is a headless component
}
