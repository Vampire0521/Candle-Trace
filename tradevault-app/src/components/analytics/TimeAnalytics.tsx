// =============================================
// CANDLE TRACE - TIME-BASED ANALYTICS
// Performance by hour of day and day of week
// =============================================

'use client';

import { useMemo } from 'react';
import { Trade, HourlyPerformance, DayOfWeekPerformance } from '@/types';
import styles from './TimeAnalytics.module.css';

interface Props {
    trades: Trade[];
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function calculatePnL(trade: Trade): number {
    const diff = trade.side === 'long'
        ? trade.exit_price - trade.entry_price
        : trade.entry_price - trade.exit_price;
    return diff * trade.quantity;
}

export function TimeAnalytics({ trades }: Props) {
    // Calculate hourly performance
    const hourlyData = useMemo<HourlyPerformance[]>(() => {
        const hourMap = new Map<number, { pnl: number; wins: number; total: number }>();

        trades.forEach(trade => {
            if (!trade.entry_time) return;
            const hour = parseInt(trade.entry_time.split(':')[0], 10);
            const pnl = calculatePnL(trade);
            const isWin = pnl > 0;

            const existing = hourMap.get(hour) || { pnl: 0, wins: 0, total: 0 };
            hourMap.set(hour, {
                pnl: existing.pnl + pnl,
                wins: existing.wins + (isWin ? 1 : 0),
                total: existing.total + 1,
            });
        });

        return Array.from({ length: 24 }, (_, hour) => {
            const data = hourMap.get(hour);
            return {
                hour,
                tradeCount: data?.total || 0,
                pnl: data?.pnl || 0,
                winRate: data?.total ? (data.wins / data.total) * 100 : 0,
            };
        });
    }, [trades]);

    // Calculate day of week performance
    const dayData = useMemo<DayOfWeekPerformance[]>(() => {
        const dayMap = new Map<number, { pnl: number; wins: number; total: number }>();

        trades.forEach(trade => {
            const date = new Date(trade.trade_date);
            const day = date.getDay();
            const pnl = calculatePnL(trade);
            const isWin = pnl > 0;

            const existing = dayMap.get(day) || { pnl: 0, wins: 0, total: 0 };
            dayMap.set(day, {
                pnl: existing.pnl + pnl,
                wins: existing.wins + (isWin ? 1 : 0),
                total: existing.total + 1,
            });
        });

        return Array.from({ length: 7 }, (_, day) => {
            const data = dayMap.get(day);
            return {
                day,
                dayName: DAY_NAMES[day],
                tradeCount: data?.total || 0,
                pnl: data?.pnl || 0,
                winRate: data?.total ? (data.wins / data.total) * 100 : 0,
            };
        });
    }, [trades]);

    // Find best/worst hours
    const tradedHours = hourlyData.filter(h => h.tradeCount > 0);
    const bestHour = tradedHours.reduce((best, h) => h.pnl > best.pnl ? h : best, tradedHours[0] || { hour: 0, pnl: 0 });
    const worstHour = tradedHours.reduce((worst, h) => h.pnl < worst.pnl ? h : worst, tradedHours[0] || { hour: 0, pnl: 0 });

    // Find best/worst days
    const tradedDays = dayData.filter(d => d.tradeCount > 0);
    const bestDay = tradedDays.reduce((best, d) => d.pnl > best.pnl ? d : best, tradedDays[0] || { day: 0, dayName: '', pnl: 0 });
    const worstDay = tradedDays.reduce((worst, d) => d.pnl < worst.pnl ? d : worst, tradedDays[0] || { day: 0, dayName: '', pnl: 0 });

    const maxHourPnL = Math.max(...hourlyData.map(h => Math.abs(h.pnl)), 1);
    const maxDayPnL = Math.max(...dayData.map(d => Math.abs(d.pnl)), 1);

    if (trades.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>No trades yet. Add trades to see time-based analytics.</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            {/* Summary Cards */}
            <div className={styles.summaryGrid}>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Best Trading Hour</span>
                    <span className={styles.summaryValue}>
                        {bestHour ? `${bestHour.hour}:00 - ${bestHour.hour + 1}:00` : 'N/A'}
                    </span>
                    <span className={`${styles.summaryPnl} ${bestHour?.pnl >= 0 ? styles.positive : styles.negative}`}>
                        ${bestHour?.pnl.toFixed(2)}
                    </span>
                </div>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Worst Trading Hour</span>
                    <span className={styles.summaryValue}>
                        {worstHour ? `${worstHour.hour}:00 - ${worstHour.hour + 1}:00` : 'N/A'}
                    </span>
                    <span className={`${styles.summaryPnl} ${worstHour?.pnl >= 0 ? styles.positive : styles.negative}`}>
                        ${worstHour?.pnl.toFixed(2)}
                    </span>
                </div>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Best Trading Day</span>
                    <span className={styles.summaryValue}>{bestDay?.dayName || 'N/A'}</span>
                    <span className={`${styles.summaryPnl} ${bestDay?.pnl >= 0 ? styles.positive : styles.negative}`}>
                        ${bestDay?.pnl.toFixed(2)}
                    </span>
                </div>
                <div className={styles.summaryCard}>
                    <span className={styles.summaryLabel}>Worst Trading Day</span>
                    <span className={styles.summaryValue}>{worstDay?.dayName || 'N/A'}</span>
                    <span className={`${styles.summaryPnl} ${worstDay?.pnl >= 0 ? styles.positive : styles.negative}`}>
                        ${worstDay?.pnl.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Hourly Performance */}
            <div className={styles.chartSection}>
                <h4 className={styles.chartTitle}>📊 Performance by Hour of Day</h4>
                <div className={styles.hourlyChart}>
                    {hourlyData.map(({ hour, pnl, tradeCount, winRate }) => (
                        <div key={hour} className={styles.hourBar}>
                            <div className={styles.barContainer}>
                                <div
                                    className={`${styles.bar} ${pnl >= 0 ? styles.positive : styles.negative}`}
                                    style={{ height: `${(Math.abs(pnl) / maxHourPnL) * 100}%` }}
                                />
                            </div>
                            <span className={styles.hourLabel}>{hour}</span>
                            {tradeCount > 0 && (
                                <div className={styles.tooltip}>
                                    <div>P&L: ${pnl.toFixed(2)}</div>
                                    <div>Trades: {tradeCount}</div>
                                    <div>Win Rate: {winRate.toFixed(0)}%</div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <p className={styles.chartNote}>
                    Note: Only trades with entry_time will appear here. Add entry times to your trades for full analysis.
                </p>
            </div>

            {/* Day of Week Performance */}
            <div className={styles.chartSection}>
                <h4 className={styles.chartTitle}>📅 Performance by Day of Week</h4>
                <div className={styles.dayChart}>
                    {dayData.map(({ day, dayName, pnl, tradeCount, winRate }) => (
                        <div key={day} className={styles.dayItem}>
                            <span className={styles.dayName}>{dayName.slice(0, 3)}</span>
                            <div className={styles.dayBarContainer}>
                                <div
                                    className={`${styles.dayBar} ${pnl >= 0 ? styles.positive : styles.negative}`}
                                    style={{ width: `${(Math.abs(pnl) / maxDayPnL) * 100}%` }}
                                />
                            </div>
                            <span className={`${styles.dayPnl} ${pnl >= 0 ? styles.positive : styles.negative}`}>
                                ${pnl.toFixed(2)}
                            </span>
                            <span className={styles.dayStats}>
                                {tradeCount} trades • {winRate.toFixed(0)}% win
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
