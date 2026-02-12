// =============================================
// CANDLE TRACE - TIP CARD COMPONENT
// Display personalized AI tips
// =============================================

'use client';

import styles from './TipCard.module.css';

interface Tip {
    id: string;
    category: string;
    title: string;
    content: string;
    priority: 'low' | 'medium' | 'high';
}

interface TipCardProps {
    tip: Tip;
    onDismiss?: (id: string) => void;
}

const categoryIcons: Record<string, string> = {
    psychology: '🧠',
    risk: '⚠️',
    strategy: '📊',
    timing: '⏰',
    general: '💡',
};

const priorityColors: Record<string, string> = {
    low: 'var(--text-secondary)',
    medium: 'var(--yellow)',
    high: 'var(--red)',
};

export function TipCard({ tip, onDismiss }: TipCardProps) {
    return (
        <div className={styles.card} style={{ '--priority-color': priorityColors[tip.priority] } as React.CSSProperties}>
            <div className={styles.header}>
                <span className={styles.icon}>
                    {categoryIcons[tip.category] || '💡'}
                </span>
                <div className={styles.meta}>
                    <span className={styles.category}>{tip.category}</span>
                    <span className={styles.priority} data-priority={tip.priority}>
                        {tip.priority}
                    </span>
                </div>
                {onDismiss && (
                    <button
                        className={styles.dismissBtn}
                        onClick={() => onDismiss(tip.id)}
                        title="Dismiss tip"
                    >
                        ✕
                    </button>
                )}
            </div>

            <h4 className={styles.title}>{tip.title}</h4>
            <p className={styles.content}>{tip.content}</p>
        </div>
    );
}

// Compact version for dashboard
export function TipCardCompact({ tip, onDismiss }: TipCardProps) {
    return (
        <div className={styles.compact}>
            <span className={styles.compactIcon}>
                {categoryIcons[tip.category] || '💡'}
            </span>
            <div className={styles.compactContent}>
                <span className={styles.compactTitle}>{tip.title}</span>
                <span className={styles.compactCategory}>{tip.category}</span>
            </div>
            {onDismiss && (
                <button
                    className={styles.compactDismiss}
                    onClick={() => onDismiss(tip.id)}
                >
                    ✕
                </button>
            )}
        </div>
    );
}
