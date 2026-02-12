// =============================================
// CANDLE TRACE - EQUITY CURVE COMPONENT
// Professional Trading Platform Quality
// =============================================

'use client';

import { useMemo, useRef, useEffect, useState, useCallback } from 'react';
import type { Trade } from '@/types';
import { calculateStats, formatCurrency, formatPercent } from '@/lib/utils';
import styles from './EquityCurve.module.css';

interface EquityCurveProps {
    trades: Trade[];
    initialBalance: number;
}

type TimeRange = '1W' | '1M' | '3M' | 'YTD' | 'ALL';

export function EquityCurve({ trades, initialBalance }: EquityCurveProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [timeRange, setTimeRange] = useState<TimeRange>('ALL');
    const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; value: number; date: string } | null>(null);

    const stats = useMemo(
        () => calculateStats(trades, initialBalance),
        [trades, initialBalance]
    );

    // Filter trades based on time range
    const filteredTrades = useMemo(() => {
        if (timeRange === 'ALL') return trades;

        const now = new Date();
        let startDate: Date;

        switch (timeRange) {
            case '1W':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '1M':
                startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                break;
            case '3M':
                startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                break;
            case 'YTD':
                startDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                return trades;
        }

        return trades.filter(t => new Date(t.trade_date) >= startDate);
    }, [trades, timeRange]);

    const filteredStats = useMemo(
        () => calculateStats(filteredTrades, initialBalance),
        [filteredTrades, initialBalance]
    );

    // Calculate equity points with dates
    const equityPoints = useMemo(() => {
        const points: { date: string; value: number }[] = [];
        let runningEquity = initialBalance;

        // Sort trades by date
        const sortedTrades = [...filteredTrades].sort((a, b) =>
            new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
        );

        // Add initial point
        if (sortedTrades.length > 0) {
            points.push({ date: 'Start', value: initialBalance });
        }

        // Add point for each trade
        sortedTrades.forEach(trade => {
            const pnl = (trade.exit_price - trade.entry_price) * trade.quantity * (trade.side === 'long' ? 1 : -1);
            runningEquity += pnl;
            points.push({ date: trade.trade_date, value: runningEquity });
        });

        return points;
    }, [filteredTrades, initialBalance]);

    // Chart dimensions
    const paddingLeft = 85; // More space for negative values like -$17,560.00
    const paddingRight = 20;
    const paddingTop = 20;
    const paddingBottom = 30;

    // Store canvas dimensions to avoid recalculating on every draw
    const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

    // Handle canvas resize separately from drawing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const updateSize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            setCanvasSize({ width: rect.width, height: rect.height });
        };

        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [filteredStats]); // Only re-run when data changes

    const drawChart = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas || canvasSize.width === 0) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const dpr = window.devicePixelRatio || 1;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        const width = canvasSize.width;
        const height = canvasSize.height;
        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        const equity = filteredStats.equity;
        if (equity.length < 2) {
            ctx.fillStyle = 'rgba(161, 161, 170, 0.5)';
            ctx.font = '14px Inter, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No trading data yet', width / 2, height / 2);
            return;
        }

        // Calculate range with buffer
        const rawMin = Math.min(...equity);
        const rawMax = Math.max(...equity);
        const diff = rawMax - rawMin;
        const min = rawMin - (diff * 0.08);
        const max = rawMax + (diff * 0.08);
        const range = max - min || 1;

        // Draw grid lines (dashed)
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(63, 63, 70, 0.3)';
        ctx.lineWidth = 1;
        const gridLines = 5;

        for (let i = 0; i < gridLines; i++) {
            const y = paddingTop + (chartHeight / (gridLines - 1)) * i;

            ctx.beginPath();
            ctx.moveTo(paddingLeft, y);
            ctx.lineTo(width - paddingRight, y);
            ctx.stroke();

            // Y-axis labels
            const value = max - (range / (gridLines - 1)) * i;
            ctx.fillStyle = '#71717a';
            ctx.font = '500 11px Inter, sans-serif';
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            ctx.fillText(formatCurrency(value, false), paddingLeft - 8, y);
        }

        ctx.setLineDash([]);

        // Draw zero/baseline reference if applicable
        if (min < initialBalance && max > initialBalance) {
            const zeroY = paddingTop + chartHeight - ((initialBalance - min) / range) * chartHeight;
            ctx.strokeStyle = 'rgba(161, 161, 170, 0.3)';
            ctx.setLineDash([2, 2]);
            ctx.beginPath();
            ctx.moveTo(paddingLeft, zeroY);
            ctx.lineTo(width - paddingRight, zeroY);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // Draw gradient fill first (under the line)
        const isPositive = filteredStats.totalPnL >= 0;
        const gradient = ctx.createLinearGradient(0, paddingTop, 0, height - paddingBottom);

        if (isPositive) {
            gradient.addColorStop(0, 'rgba(34, 197, 94, 0.25)');
            gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.1)');
            gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
        } else {
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.25)');
            gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.1)');
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
        }

        ctx.beginPath();
        equity.forEach((val, i) => {
            const x = paddingLeft + (i / (equity.length - 1)) * chartWidth;
            const y = paddingTop + chartHeight - ((val - min) / range) * chartHeight;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.lineTo(width - paddingRight, paddingTop + chartHeight);
        ctx.lineTo(paddingLeft, paddingTop + chartHeight);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw main equity line with glow effect
        ctx.shadowColor = isPositive ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.strokeStyle = isPositive ? '#22c55e' : '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        equity.forEach((val, i) => {
            const x = paddingLeft + (i / (equity.length - 1)) * chartWidth;
            const y = paddingTop + chartHeight - ((val - min) / range) * chartHeight;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Draw hovered point if exists
        if (hoveredPoint) {
            ctx.beginPath();
            ctx.arc(hoveredPoint.x, hoveredPoint.y, 6, 0, Math.PI * 2);
            ctx.fillStyle = isPositive ? '#22c55e' : '#ef4444';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw crosshair
            ctx.setLineDash([2, 2]);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(hoveredPoint.x, paddingTop);
            ctx.lineTo(hoveredPoint.x, height - paddingBottom);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(paddingLeft, hoveredPoint.y);
            ctx.lineTo(width - paddingRight, hoveredPoint.y);
            ctx.stroke();

            ctx.setLineDash([]);
        }

    }, [filteredStats, initialBalance, hoveredPoint, canvasSize, paddingLeft, paddingRight, paddingTop, paddingBottom]);

    useEffect(() => {
        drawChart();
    }, [drawChart]);

    // Handle mouse move for crosshair
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const equity = filteredStats.equity;
        if (equity.length < 2) return;

        const width = rect.width;
        const height = rect.height;
        const chartWidth = width - paddingLeft - paddingRight;
        const chartHeight = height - paddingTop - paddingBottom;

        // Check if mouse is in chart area
        if (x < paddingLeft || x > width - paddingRight || y < paddingTop || y > height - paddingBottom) {
            setHoveredPoint(null);
            return;
        }

        // Find closest data point
        const relativeX = x - paddingLeft;
        const dataIndex = Math.round((relativeX / chartWidth) * (equity.length - 1));
        const clampedIndex = Math.max(0, Math.min(equity.length - 1, dataIndex));

        const rawMin = Math.min(...equity);
        const rawMax = Math.max(...equity);
        const diff = rawMax - rawMin;
        const min = rawMin - (diff * 0.08);
        const max = rawMax + (diff * 0.08);
        const range = max - min || 1;

        const pointX = paddingLeft + (clampedIndex / (equity.length - 1)) * chartWidth;
        const pointY = paddingTop + chartHeight - ((equity[clampedIndex] - min) / range) * chartHeight;

        const date = equityPoints[clampedIndex]?.date || '';

        setHoveredPoint({
            x: pointX,
            y: pointY,
            value: equity[clampedIndex],
            date
        });
    }, [filteredStats.equity, equityPoints, paddingLeft, paddingRight, paddingTop, paddingBottom]);

    const handleMouseLeave = useCallback(() => {
        setHoveredPoint(null);
    }, []);

    const currentEquity = filteredStats.equity[filteredStats.equity.length - 1] || initialBalance;
    const returnPct = ((currentEquity - initialBalance) / initialBalance) * 100;
    const peakEquity = Math.max(...filteredStats.equity, initialBalance);

    return (
        <div className={styles.container} ref={containerRef}>
            {/* Header Stats */}
            <div className={styles.headerRow}>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Equity</span>
                    <span className={`${styles.statValue} ${currentEquity >= initialBalance ? styles.positive : styles.negative}`}>
                        {formatCurrency(currentEquity)}
                    </span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Return</span>
                    <span className={`${styles.statValue} ${returnPct >= 0 ? styles.positive : styles.negative}`}>
                        {returnPct >= 0 ? '+' : ''}{returnPct.toFixed(2)}%
                    </span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Peak</span>
                    <span className={styles.statValue}>{formatCurrency(peakEquity)}</span>
                </div>
                <div className={styles.statCard}>
                    <span className={styles.statLabel}>Drawdown</span>
                    <span className={`${styles.statValue} ${styles.negative}`}>
                        {formatPercent(filteredStats.maxDrawdown)}
                    </span>
                </div>
            </div>

            {/* Time Range Selector */}
            <div className={styles.rangeSelector}>
                {(['1W', '1M', '3M', 'YTD', 'ALL'] as TimeRange[]).map((range) => (
                    <button
                        key={range}
                        className={`${styles.rangeBtn} ${timeRange === range ? styles.rangeActive : ''}`}
                        onClick={() => setTimeRange(range)}
                    >
                        {range}
                    </button>
                ))}
            </div>

            {/* Chart Area */}
            <div className={styles.chartArea}>
                <canvas
                    ref={canvasRef}
                    className={styles.canvas}
                    onMouseMove={handleMouseMove}
                    onMouseLeave={handleMouseLeave}
                />

                {/* Hover Tooltip */}
                {hoveredPoint && (
                    <div
                        className={styles.tooltip}
                        style={{
                            left: hoveredPoint.x,
                            top: hoveredPoint.y - 50
                        }}
                    >
                        <div className={styles.tooltipDate}>{hoveredPoint.date}</div>
                        <div className={styles.tooltipValue}>{formatCurrency(hoveredPoint.value)}</div>
                    </div>
                )}
            </div>

            {/* Bottom Stats */}
            <div className={styles.bottomStats}>
                <div className={styles.bottomStat}>
                    <span className={styles.bottomLabel}>Profit Factor</span>
                    <span className={styles.bottomValue}>{filteredStats.profitFactor.toFixed(2)}</span>
                </div>
                <div className={styles.bottomStat}>
                    <span className={styles.bottomLabel}>Sharpe Ratio</span>
                    <span className={styles.bottomValue}>{filteredStats.sharpe.toFixed(2)}</span>
                </div>
                <div className={styles.bottomStat}>
                    <span className={styles.bottomLabel}>Win Rate</span>
                    <span className={styles.bottomValue}>{formatPercent(filteredStats.winRate)}</span>
                </div>
            </div>
        </div>
    );
}
