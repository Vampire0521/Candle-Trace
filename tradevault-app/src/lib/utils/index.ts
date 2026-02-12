// =============================================
// CANDLE TRACE - UTILITY FUNCTIONS INDEX
// =============================================

export * from './calculations';

// Formatting utilities
export function formatCurrency(value: number, showSign = false): string {
    const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(Math.abs(value));

    if (showSign && value !== 0) {
        return value > 0 ? `+${formatted}` : `-${formatted}`;
    }
    return value < 0 ? `-${formatted}` : formatted;
}

export function formatPercent(value: number, showSign = false): string {
    const formatted = `${Math.abs(value).toFixed(1)}%`;
    if (showSign && value !== 0) {
        return value > 0 ? `+${formatted}` : `-${formatted}`;
    }
    return value < 0 ? `-${formatted}` : formatted;
}

export function formatNumber(value: number): string {
    return new Intl.NumberFormat('en-US').format(value);
}

export function formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function formatDateShort(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return getLocalDateString(d);
}

/**
 * Get date string in YYYY-MM-DD format using LOCAL timezone
 * Avoids the UTC conversion issue with toISOString()
 */
export function getLocalDateString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Class name utility
// Class name utility
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}
