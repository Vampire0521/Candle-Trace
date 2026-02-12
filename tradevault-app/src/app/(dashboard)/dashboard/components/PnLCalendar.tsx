// =============================================
// CANDLE TRACE - P&L CALENDAR COMPONENT
// Professional Trading Platform Quality
// =============================================

'use client';

import { useState, useMemo } from 'react';
import type { Trade } from '@/types';
import { aggregateDailyPnL, getHeatLevel, formatCurrency, calculatePnL, getLocalDateString } from '@/lib/utils';
import styles from './PnLCalendar.module.css';

interface PnLCalendarProps {
    trades: Trade[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function PnLCalendar({ trades }: PnLCalendarProps) {
    const today = new Date();
    const [selectedYear, setSelectedYear] = useState(today.getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(today.getMonth());

    // Get available years from trades
    const availableYears = useMemo(() => {
        const years = new Set<number>();
        years.add(today.getFullYear());
        trades.forEach(t => {
            if (t.trade_date) {
                years.add(new Date(t.trade_date).getFullYear());
            }
        });
        return Array.from(years).sort((a, b) => b - a);
    }, [trades]);

    // Calculate monthly stats
    const monthStats = useMemo(() => {
        const monthStart = new Date(selectedYear, selectedMonth, 1);
        const monthEnd = new Date(selectedYear, selectedMonth + 1, 0);

        const monthTrades = trades.filter(t => {
            const d = new Date(t.trade_date);
            return d >= monthStart && d <= monthEnd;
        });

        const dailyPnL = aggregateDailyPnL(monthTrades);
        const winDays = dailyPnL.filter(d => d.pnl > 0).length;
        const lossDays = dailyPnL.filter(d => d.pnl < 0).length;

        // Calculate streak
        let currentStreak = 0;
        let streakType: 'win' | 'loss' | 'none' = 'none';
        const sortedDays = [...dailyPnL].sort((a, b) => b.date.localeCompare(a.date));

        for (const day of sortedDays) {
            if (currentStreak === 0) {
                if (day.pnl > 0) {
                    streakType = 'win';
                    currentStreak = 1;
                } else if (day.pnl < 0) {
                    streakType = 'loss';
                    currentStreak = 1;
                }
            } else {
                if (streakType === 'win' && day.pnl > 0) {
                    currentStreak++;
                } else if (streakType === 'loss' && day.pnl < 0) {
                    currentStreak++;
                } else {
                    break;
                }
            }
        }

        const bestDay = dailyPnL.reduce((best, d) => d.pnl > best.pnl ? d : best, { date: '', pnl: 0 });
        const worstDay = dailyPnL.reduce((worst, d) => d.pnl < worst.pnl ? d : worst, { date: '', pnl: 0 });

        return { winDays, lossDays, currentStreak, streakType, bestDay, worstDay };
    }, [trades, selectedYear, selectedMonth]);

    const { days, monthTotal, maxAbsPnL } = useMemo(() => {
        const dailyPnL = aggregateDailyPnL(trades);
        const pnlMap = new Map(dailyPnL.map(d => [d.date, d.pnl]));

        // Get first day of selected month
        const firstDay = new Date(selectedYear, selectedMonth, 1);
        const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
        const startDayOfWeek = firstDay.getDay(); // 0 = Sunday

        const days: { date: string; day: number; pnl: number; isCurrentMonth: boolean }[] = [];
        let monthTotal = 0;
        let maxAbsPnL = 0;

        // Add empty days for alignment (previous month)
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push({ date: '', day: 0, pnl: 0, isCurrentMonth: false });
        }

        // Add days of the month
        for (let d = 1; d <= lastDay.getDate(); d++) {
            const date = new Date(selectedYear, selectedMonth, d);
            const dateStr = getLocalDateString(date);
            const pnl = pnlMap.get(dateStr) || 0;
            monthTotal += pnl;
            maxAbsPnL = Math.max(maxAbsPnL, Math.abs(pnl));
            days.push({ date: dateStr, day: d, pnl, isCurrentMonth: true });
        }

        return { days, monthTotal, maxAbsPnL };
    }, [trades, selectedYear, selectedMonth]);

    const goToPrevMonth = () => {
        if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(y => y - 1);
        } else {
            setSelectedMonth(m => m - 1);
        }
    };

    const goToNextMonth = () => {
        if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(y => y + 1);
        } else {
            setSelectedMonth(m => m + 1);
        }
    };

    const isCurrentMonth = selectedYear === today.getFullYear() && selectedMonth === today.getMonth();

    // Format compact currency for in-cell display
    const formatCompact = (value: number): string => {
        if (value === 0) return '';
        const abs = Math.abs(value);
        if (abs >= 1000) {
            return `${value >= 0 ? '+' : ''}${(value / 1000).toFixed(1)}k`;
        }
        return `${value >= 0 ? '+' : ''}${value.toFixed(0)}`;
    };

    return (
        <div className={styles.calendar}>
            {/* Header with Navigation */}
            <div className={styles.header}>
                <div className={styles.navigation}>
                    <button className={styles.navBtn} onClick={goToPrevMonth} aria-label="Previous month">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>

                    <div className={styles.monthSelector}>
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className={styles.select}
                        >
                            {MONTHS.map((m, i) => (
                                <option key={i} value={i}>{m}</option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className={styles.select}
                        >
                            {availableYears.map(y => (
                                <option key={y} value={y}>{y}</option>
                            ))}
                        </select>
                    </div>

                    <button
                        className={styles.navBtn}
                        onClick={goToNextMonth}
                        disabled={isCurrentMonth}
                        aria-label="Next month"
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Performance Summary */}
            <div className={styles.summaryRow}>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>W/L</span>
                    <span className={styles.summaryValue}>
                        <span className={styles.winText}>{monthStats.winDays}</span>
                        <span className={styles.separator}>/</span>
                        <span className={styles.lossText}>{monthStats.lossDays}</span>
                    </span>
                </div>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Streak</span>
                    <span className={`${styles.summaryValue} ${monthStats.streakType === 'win' ? styles.winText : monthStats.streakType === 'loss' ? styles.lossText : ''}`}>
                        {monthStats.currentStreak > 0 ? `${monthStats.streakType === 'win' ? '🔥' : '❄️'} ${monthStats.currentStreak}` : '—'}
                    </span>
                </div>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Best</span>
                    <span className={`${styles.summaryValue} ${styles.winText}`}>
                        {monthStats.bestDay.pnl > 0 ? formatCurrency(monthStats.bestDay.pnl, true) : '—'}
                    </span>
                </div>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Total</span>
                    <span className={`${styles.summaryValue} ${monthTotal >= 0 ? styles.winText : styles.lossText}`}>
                        {formatCurrency(monthTotal, true)}
                    </span>
                </div>
            </div>

            {/* Day Headers */}
            <div className={styles.dayHeaders}>
                {DAYS.map((d, i) => (
                    <span key={i}>{d}</span>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className={styles.grid}>
                {days.map((day, idx) => {
                    if (!day.isCurrentMonth) {
                        return <div key={idx} className={styles.emptyDay} />;
                    }

                    const heatLevel = getHeatLevel(day.pnl);
                    const heatClass = heatLevel > 0
                        ? styles[`heatPositive${Math.abs(heatLevel)}`]
                        : heatLevel < 0
                            ? styles[`heatNegative${Math.abs(heatLevel)}`]
                            : styles.heatNeutral;

                    const isToday = day.date === getLocalDateString(today);

                    return (
                        <div
                            key={idx}
                            className={`${styles.day} ${heatClass} ${isToday ? styles.today : ''}`}
                            data-tooltip={`${day.date}: ${formatCurrency(day.pnl)}`}
                        >
                            <span className={styles.dayNumber}>{day.day}</span>
                            {day.pnl !== 0 && (
                                <span className={styles.dayPnL}>{formatCompact(day.pnl)}</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className={styles.legend}>
                <span className={styles.legendLabel}>Loss</span>
                <div className={styles.legendGradient} />
                <span className={styles.legendLabel}>Profit</span>
            </div>
        </div>
    );
}
