// =============================================
// CANDLE TRACE - ANALYTICS CLIENT COMPONENT
// =============================================

'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import type { Trade, Strategy } from '@/types';
import { TimeAnalytics } from '@/components/analytics';
import {
    calculateStats,
    calculatePnL,
    formatCurrency,
    formatPercent,
    aggregateDailyPnL,
} from '@/lib/utils';
import styles from './AnalyticsClient.module.css';

interface AnalyticsClientProps {
    trades: Trade[];
    strategies: Strategy[];
    initialBalance: number;
}

export function AnalyticsClient({ trades, strategies, initialBalance }: AnalyticsClientProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'distribution' | 'time' | 'drawdown'>('overview');
    const equityChartRef = useRef<HTMLCanvasElement>(null);
    const distributionChartRef = useRef<HTMLCanvasElement>(null);

    const stats = useMemo(() => calculateStats(trades, initialBalance), [trades, initialBalance]);

    // Strategy performance
    const strategyPerformance = useMemo(() => {
        const perf = strategies.map(strategy => {
            const stratTrades = trades.filter(t => t.strategy_id === strategy.id);
            const pnls = stratTrades.map(t => calculatePnL(t));
            const totalPnL = pnls.reduce((a, b) => a + b, 0);
            const wins = pnls.filter(p => p > 0).length;
            const winRate = stratTrades.length > 0 ? (wins / stratTrades.length) * 100 : 0;

            return { strategy, trades: stratTrades.length, totalPnL, winRate };
        });
        return perf.sort((a, b) => b.totalPnL - a.totalPnL);
    }, [trades, strategies]);

    // Type distribution
    const typeDistribution = useMemo(() => {
        const dist: Record<string, { count: number; pnl: number }> = {};
        trades.forEach(t => {
            if (!dist[t.type]) dist[t.type] = { count: 0, pnl: 0 };
            dist[t.type].count++;
            dist[t.type].pnl += calculatePnL(t);
        });
        return dist;
    }, [trades]);

    // Monthly performance
    const monthlyPerformance = useMemo(() => {
        const monthly: Record<string, number> = {};
        trades.forEach(t => {
            const month = t.trade_date.substring(0, 7);
            if (!monthly[month]) monthly[month] = 0;
            monthly[month] += calculatePnL(t);
        });
        return Object.entries(monthly).sort((a, b) => a[0].localeCompare(b[0]));
    }, [trades]);

    // Draw equity curve
    useEffect(() => {
        if (activeTab !== 'overview' || !equityChartRef.current) return;
        const canvas = equityChartRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const width = rect.width;
        const height = rect.height;
        const padding = 40;

        ctx.clearRect(0, 0, width, height);

        if (stats.equity.length < 2) {
            ctx.fillStyle = 'rgba(161, 161, 170, 0.5)';
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Not enough data', width / 2, height / 2);
            return;
        }

        const min = Math.min(...stats.equity) * 0.98;
        const max = Math.max(...stats.equity) * 1.02;
        const range = max - min;
        const chartWidth = width - padding * 2;
        const chartHeight = height - padding * 2;

        // Grid
        ctx.strokeStyle = 'rgba(63, 63, 70, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding + (chartHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Line
        ctx.beginPath();
        ctx.strokeStyle = stats.totalPnL >= 0 ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 2;
        stats.equity.forEach((val, i) => {
            const x = padding + (i / (stats.equity.length - 1)) * chartWidth;
            const y = padding + chartHeight - ((val - min) / range) * chartHeight;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        // Fill
        const gradient = ctx.createLinearGradient(0, padding, 0, height - padding);
        if (stats.totalPnL >= 0) {
            gradient.addColorStop(0, 'rgba(34, 197, 94, 0.2)');
            gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
        } else {
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.2)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
        }
        ctx.lineTo(width - padding, height - padding);
        ctx.lineTo(padding, height - padding);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
    }, [activeTab, stats]);

    return (
        <div className={styles.container}>
            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
                    onClick={() => setActiveTab('overview')}
                >
                    📊 Overview
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'distribution' ? styles.active : ''}`}
                    onClick={() => setActiveTab('distribution')}
                >
                    📈 Distribution
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'time' ? styles.active : ''}`}
                    onClick={() => setActiveTab('time')}
                >
                    🕐 Time Analysis
                </button>
                <button
                    className={`${styles.tab} ${activeTab === 'drawdown' ? styles.active : ''}`}
                    onClick={() => setActiveTab('drawdown')}
                >
                    📉 Drawdown
                </button>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <>
                    {/* Key Metrics */}
                    <div className={styles.metricsGrid}>
                        <div className={styles.metricCard}>
                            <span className={styles.metricLabel}>Total P&L</span>
                            <span className={`${styles.metricValue} ${stats.totalPnL >= 0 ? styles.positive : styles.negative}`}>
                                {formatCurrency(stats.totalPnL, true)}
                            </span>
                        </div>
                        <div className={styles.metricCard}>
                            <span className={styles.metricLabel}>Win Rate</span>
                            <span className={styles.metricValue}>{formatPercent(stats.winRate)}</span>
                        </div>
                        <div className={styles.metricCard}>
                            <span className={styles.metricLabel}>Profit Factor</span>
                            <span className={styles.metricValue}>
                                {stats.profitFactor === Infinity ? '∞' : stats.profitFactor.toFixed(2)}
                            </span>
                        </div>
                        <div className={styles.metricCard}>
                            <span className={styles.metricLabel}>ROI</span>
                            <span className={`${styles.metricValue} ${stats.roi >= 0 ? styles.positive : styles.negative}`}>
                                {formatPercent(stats.roi)}
                            </span>
                        </div>
                        <div className={styles.metricCard}>
                            <span className={styles.metricLabel}>Avg Win</span>
                            <span className={`${styles.metricValue} ${styles.positive}`}>{formatCurrency(stats.avgWin)}</span>
                        </div>
                        <div className={styles.metricCard}>
                            <span className={styles.metricLabel}>Avg Loss</span>
                            <span className={`${styles.metricValue} ${styles.negative}`}>{formatCurrency(stats.avgLoss)}</span>
                        </div>
                        <div className={styles.metricCard}>
                            <span className={styles.metricLabel}>Max Drawdown</span>
                            <span className={`${styles.metricValue} ${styles.negative}`}>{formatPercent(stats.maxDrawdown)}</span>
                        </div>
                        <div className={styles.metricCard}>
                            <span className={styles.metricLabel}>Total Trades</span>
                            <span className={styles.metricValue}>{stats.totalTrades}</span>
                        </div>
                    </div>

                    {/* Equity Chart */}
                    <div className={styles.chartCard}>
                        <h3 className={styles.chartTitle}>📈 Equity Curve</h3>
                        <canvas ref={equityChartRef} className={styles.chart} />
                    </div>

                    {/* Strategy Performance */}
                    <div className={styles.tableCard}>
                        <h3 className={styles.chartTitle}>🎯 Strategy Performance</h3>
                        {strategyPerformance.length === 0 ? (
                            <p className={styles.noData}>No strategies with trades yet.</p>
                        ) : (
                            <table className={styles.table}>
                                <thead>
                                    <tr>
                                        <th>Strategy</th>
                                        <th>Trades</th>
                                        <th>Win Rate</th>
                                        <th>P&L</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {strategyPerformance.filter(s => s.trades > 0).map(s => (
                                        <tr key={s.strategy.id}>
                                            <td>{s.strategy.icon} {s.strategy.name}</td>
                                            <td>{s.trades}</td>
                                            <td>{s.winRate.toFixed(1)}%</td>
                                            <td className={s.totalPnL >= 0 ? styles.positive : styles.negative}>
                                                {formatCurrency(s.totalPnL, true)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </>
            )}

            {/* Distribution Tab */}
            {activeTab === 'distribution' && (
                <>
                    {/* Type Distribution */}
                    <div className={styles.distributionGrid}>
                        {Object.entries(typeDistribution).map(([type, data]) => (
                            <div key={type} className={styles.distributionCard}>
                                <span className={styles.distributionType}>{type.toUpperCase()}</span>
                                <span className={styles.distributionCount}>{data.count} trades</span>
                                <span className={`${styles.distributionPnL} ${data.pnl >= 0 ? styles.positive : styles.negative}`}>
                                    {formatCurrency(data.pnl, true)}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Monthly Performance */}
                    <div className={styles.tableCard}>
                        <h3 className={styles.chartTitle}>📅 Monthly Performance</h3>
                        {monthlyPerformance.length === 0 ? (
                            <p className={styles.noData}>No trades yet.</p>
                        ) : (
                            <div className={styles.monthlyGrid}>
                                {monthlyPerformance.map(([month, pnl]) => (
                                    <div key={month} className={styles.monthCard}>
                                        <span className={styles.monthLabel}>{month}</span>
                                        <span className={`${styles.monthValue} ${pnl >= 0 ? styles.positive : styles.negative}`}>
                                            {formatCurrency(pnl, true)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Time Analysis Tab */}
            {activeTab === 'time' && (
                <TimeAnalytics trades={trades} />
            )}

            {/* Drawdown Tab */}
            {activeTab === 'drawdown' && (
                <div className={styles.drawdownSection}>
                    <div className={styles.drawdownStats}>
                        <div className={styles.drawdownCard}>
                            <span className={styles.drawdownLabel}>Maximum Drawdown</span>
                            <span className={`${styles.drawdownValue} ${styles.negative}`}>
                                {formatPercent(stats.maxDrawdown)}
                            </span>
                            <span className={styles.drawdownHint}>Peak to trough decline</span>
                        </div>
                        <div className={styles.drawdownCard}>
                            <span className={styles.drawdownLabel}>Current Drawdown</span>
                            <span className={styles.drawdownValue}>
                                {stats.equity.length > 0
                                    ? formatPercent(((Math.max(...stats.equity) - stats.equity[stats.equity.length - 1]) / Math.max(...stats.equity)) * 100)
                                    : '0%'}
                            </span>
                            <span className={styles.drawdownHint}>From highest equity</span>
                        </div>
                        <div className={styles.drawdownCard}>
                            <span className={styles.drawdownLabel}>Risk of Ruin</span>
                            <span className={styles.drawdownValue}>
                                {stats.maxDrawdown > 20 ? 'High' : stats.maxDrawdown > 10 ? 'Medium' : 'Low'}
                            </span>
                            <span className={styles.drawdownHint}>Based on drawdown level</span>
                        </div>
                    </div>

                    <div className={styles.drawdownTip}>
                        <strong>💡 Drawdown Management Tips:</strong>
                        <ul>
                            <li>Keep max drawdown under 20% to avoid psychological stress</li>
                            <li>Use position sizing to limit single-trade risk to 1-2%</li>
                            <li>Consider reducing position size after consecutive losses</li>
                            <li>Have a trading plan for recovery phases</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
}
