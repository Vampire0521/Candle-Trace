// =============================================
// CANDLE TRACE - RECENT TRADES COMPONENT
// =============================================

'use client';

import Link from 'next/link';
import type { Trade } from '@/types';
import { calculatePnL, formatCurrency, formatDate } from '@/lib/utils';
import styles from './RecentTrades.module.css';

interface RecentTradesProps {
    trades: Trade[];
}

export function RecentTrades({ trades }: RecentTradesProps) {
    if (trades.length === 0) {
        return (
            <div className={styles.empty}>
                <span className={styles.emptyIcon}>📈</span>
                <p>No trades yet. Start logging your trades!</p>
                <Link href="/trades" className={styles.addBtn}>
                    Add Your First Trade
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.tableWrapper}>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Ticker</th>
                            <th>Type</th>
                            <th>Side</th>
                            <th>Entry</th>
                            <th>Exit</th>
                            <th>Qty</th>
                            <th>P&L</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {trades.map((trade) => {
                            const pnl = calculatePnL(trade);
                            const isPositive = pnl >= 0;

                            return (
                                <tr key={trade.id} className={styles.row}>
                                    <td className={styles.ticker}>
                                        <span className={styles.tickerBadge}>{trade.ticker}</span>
                                    </td>
                                    <td>
                                        <span className={`${styles.typeBadge} ${styles[trade.type]}`}>
                                            {trade.type}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`${styles.sideBadge} ${styles[trade.side]}`}>
                                            {trade.side}
                                        </span>
                                    </td>
                                    <td className={styles.price}>{formatCurrency(trade.entry_price)}</td>
                                    <td className={styles.price}>{formatCurrency(trade.exit_price)}</td>
                                    <td className={styles.qty}>{trade.quantity}</td>
                                    <td className={`${styles.pnl} ${isPositive ? styles.positive : styles.negative}`}>
                                        {formatCurrency(pnl, true)}
                                    </td>
                                    <td className={styles.date}>{formatDate(trade.trade_date)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <Link href="/trades" className={styles.viewAll}>
                View All Trades →
            </Link>
        </div>
    );
}
