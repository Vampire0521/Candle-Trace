// =============================================
// CANDLE TRACE - CARD COMPONENT
// =============================================

import React from 'react';
import styles from './Card.module.css';
import { motion } from 'framer-motion';

export interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'stat' | 'strategy';
    status?: 'positive' | 'negative' | 'neutral';
    onClick?: () => void;
}



export function Card({
    children,
    className = '',
    variant = 'default',
    status = 'neutral',
    onClick,
}: CardProps) {
    return (
        <motion.div
            whileHover={onClick ? { y: -4, scale: 1.01 } : undefined}
            whileTap={onClick ? { scale: 0.98 } : undefined}
            className={`${styles.card} ${styles[variant]} ${styles[status]} ${className}`}
            onClick={onClick}
            role={onClick ? 'button' : undefined}
            tabIndex={onClick ? 0 : undefined}
        >
            {children}
        </motion.div>
    );
}

// Sub-components for card structure
export function CardIcon({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`${styles.cardIcon} ${className}`}>{children}</div>;
}

export function CardTitle({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`${styles.cardTitle} ${className}`}>{children}</div>;
}

export function CardValue({
    children,
    className = '',
    positive,
    negative
}: {
    children: React.ReactNode;
    className?: string;
    positive?: boolean;
    negative?: boolean;
}) {
    const statusClass = positive ? styles.valuePositive : negative ? styles.valueNegative : '';
    return <div className={`${styles.cardValue} ${statusClass} ${className}`}>{children}</div>;
}

export function CardChange({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <div className={`${styles.cardChange} ${className}`}>{children}</div>;
}

export function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
    return <h3 className={`${styles.cardHeader} ${className}`}>{children}</h3>;
}
