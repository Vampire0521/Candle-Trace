// =============================================
// CANDLE TRACE - APP PROVIDERS
// Wraps app with all context providers
// =============================================

'use client';

import { ReactNode } from 'react';
import { ToastProvider, SmoothScroll } from '@/components/ui';

interface ProvidersProps {
    children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <SmoothScroll>
            <ToastProvider>
                {children}
            </ToastProvider>
        </SmoothScroll>
    );
}
