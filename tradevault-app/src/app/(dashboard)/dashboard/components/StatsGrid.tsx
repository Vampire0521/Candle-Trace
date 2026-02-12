// =============================================
// CANDLE TRACE - STATS GRID COMPONENT
// =============================================

'use client';

import { useMemo } from 'react';
import type { Trade } from '@/types';
import { calculateStats, formatCurrency, formatPercent } from '@/lib/utils';
import styles from './StatsGrid.module.css';

interface StatsGridProps {
    trades: Trade[];
    initialBalance: number;
}

export function StatsGrid({ trades, initialBalance }: StatsGridProps) {
    const stats = useMemo(
        () => calculateStats(trades, initialBalance),
        [trades, initialBalance]
    );

    const statCards = [
        {
            id: 'pnl',
            icon: '💰',
            label: 'Total P&L',
            value: formatCurrency(stats.totalPnL, true),
            isPositive: stats.totalPnL >= 0,
            change: `${stats.totalTrades} trades`,
        },
        {
            id: 'winrate',
            icon: '🎯',
            label: 'Win Rate',
            value: formatPercent(stats.winRate),
            isPositive: stats.winRate >= 50,
            change: `${stats.wins}W / ${stats.losses}L`,
        },
        {
            id: 'profitfactor',
            icon: '⚖️',
            label: 'Profit Factor',
            value: stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2),
            isPositive: stats.profitFactor >= 1,
            change: `Avg Win: ${formatCurrency(stats.avgWin)}`,
        },
        {
            id: 'drawdown',
            icon: '📉',
            label: 'Max Drawdown',
            value: formatPercent(stats.maxDrawdown),
            isPositive: stats.maxDrawdown < 10,
            change: `Avg Loss: ${formatCurrency(stats.avgLoss)}`,
        },
    ];

    return (
        <div className={styles.statsGrid}>
            {statCards.map((card) => (
                <div
                    key={card.id}
                    className={`${styles.statCard} ${card.isPositive ? styles.positive : styles.negative
                        }`}
                >
                    <div className={styles.statIcon}>{card.icon}</div>
                    <div className={styles.statLabel}>{card.label}</div>
                    <div
                        className={`${styles.statValue} ${card.isPositive ? styles.valuePositive : styles.valueNegative
                            }`}
                    >
                        {card.value}
                    </div>
                    <div className={styles.statChange}>{card.change}</div>
                </div>
            ))}
        </div>
    );
}
