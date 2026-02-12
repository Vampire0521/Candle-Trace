// =============================================
// CANDLE TRACE - TRADES CLIENT COMPONENT
// Handles all trade operations on client side
// =============================================

'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Trade, Strategy, TradeFilters, TradeFormData, TradeEmotionFormData } from '@/types';
import { calculatePnL, formatCurrency, formatDate } from '@/lib/utils';
import { TradeModal } from './TradeModal';
import { TradeFiltersBar } from './TradeFiltersBar';
import { ExportButton } from '@/components/export';
import styles from './TradesClient.module.css';

interface TradesClientProps {
    initialTrades: Trade[];
    strategies: Strategy[];
}

export function TradesClient({ initialTrades, strategies }: TradesClientProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [trades, setTrades] = useState<Trade[]>(initialTrades);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [filters, setFilters] = useState<TradeFilters>({
        search: '',
        type: '',
        strategy: '',
        result: '',
        fromDate: '',
        toDate: '',
    });

    // Check for action=add in URL to auto-open modal
    useEffect(() => {
        const action = searchParams.get('action');
        if (action === 'add') {
            setEditingTrade(null);
            setIsModalOpen(true);
            // Clean up the URL without the action parameter
            router.replace('/trades', { scroll: false });
        }
    }, [searchParams, router]);

    // Filter trades
    const filteredTrades = useMemo(() => {
        return trades.filter(trade => {
            // Search filter
            if (filters.search && !trade.ticker.toLowerCase().includes(filters.search.toLowerCase())) {
                return false;
            }
            // Type filter
            if (filters.type && trade.type !== filters.type) {
                return false;
            }
            // Strategy filter
            if (filters.strategy && trade.strategy_id !== filters.strategy) {
                return false;
            }
            // Result filter
            if (filters.result) {
                const pnl = calculatePnL(trade);
                if (filters.result === 'win' && pnl <= 0) return false;
                if (filters.result === 'loss' && pnl > 0) return false;
            }
            // Date range filter
            if (filters.fromDate && trade.trade_date < filters.fromDate) {
                return false;
            }
            if (filters.toDate && trade.trade_date > filters.toDate) {
                return false;
            }
            return true;
        });
    }, [trades, filters]);

    // Calculate summary stats
    const summary = useMemo(() => {
        const pnls = filteredTrades.map(t => calculatePnL(t));
        const totalPnL = pnls.reduce((a, b) => a + b, 0);
        const wins = pnls.filter(p => p > 0).length;
        return {
            totalTrades: filteredTrades.length,
            totalPnL,
            wins,
            losses: filteredTrades.length - wins,
            winRate: filteredTrades.length > 0 ? (wins / filteredTrades.length) * 100 : 0,
        };
    }, [filteredTrades]);

    // Add/Edit trade
    const handleSaveTrade = async (data: TradeFormData, emotionData?: TradeEmotionFormData) => {
        setIsLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setIsLoading(false);
            return;
        }

        try {
            let tradeId: string | null = null;

            if (editingTrade) {
                // Update existing trade
                const { error } = await supabase
                    .from('trades')
                    .update({
                        ...data,
                        updated_at: new Date().toISOString(),
                    })
                    .eq('id', editingTrade.id);

                if (!error) {
                    setTrades(prev => prev.map(t =>
                        t.id === editingTrade.id ? { ...t, ...data } : t
                    ));
                    tradeId = editingTrade.id;
                }
            } else {
                // Create new trade
                const { data: newTrade, error } = await supabase
                    .from('trades')
                    .insert({
                        ...data,
                        user_id: user.id,
                    })
                    .select()
                    .single();

                if (!error && newTrade) {
                    setTrades(prev => [newTrade, ...prev]);
                    tradeId = newTrade.id;
                }
            }

            // Save emotion data if provided
            if (emotionData && tradeId) {
                await fetch('/api/emotions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ...emotionData,
                        trade_id: tradeId,
                    }),
                });
            }

            setIsModalOpen(false);
            setEditingTrade(null);
            router.refresh();
        } catch (err) {
            console.error('Error saving trade:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Delete trade
    const handleDeleteTrade = async (id: string) => {
        if (!confirm('Are you sure you want to delete this trade?')) return;

        const supabase = createClient();
        const { error } = await supabase
            .from('trades')
            .delete()
            .eq('id', id);

        if (!error) {
            setTrades(prev => prev.filter(t => t.id !== id));
            router.refresh();
        }
    };

    // Export to CSV
    const handleExport = () => {
        const headers = ['Ticker', 'Type', 'Side', 'Entry', 'Exit', 'Qty', 'Date', 'P&L', 'Notes'];
        const rows = filteredTrades.map(t => [
            t.ticker,
            t.type,
            t.side,
            t.entry_price,
            t.exit_price,
            t.quantity,
            t.trade_date,
            calculatePnL(t).toFixed(2),
            t.notes || ''
        ]);

        const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `CANDLE TRACE-export-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Import from CSV
    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const text = await file.text();
        const lines = text.split('\n').slice(1); // Skip header
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return;

        const newTrades: Partial<Trade>[] = [];

        for (const line of lines) {
            if (!line.trim()) continue;
            const [ticker, type, side, entry, exit, qty, date] = line.split(',');

            if (ticker && entry && exit && qty && date) {
                newTrades.push({
                    user_id: user.id,
                    ticker: ticker.trim(),
                    type: (type?.trim() as Trade['type']) || 'stock',
                    side: (side?.trim() as Trade['side']) || 'long',
                    entry_price: parseFloat(entry),
                    exit_price: parseFloat(exit),
                    quantity: parseFloat(qty),
                    trade_date: date.trim(),
                });
            }
        }

        if (newTrades.length > 0) {
            const { data, error } = await supabase
                .from('trades')
                .insert(newTrades)
                .select();

            if (!error && data) {
                setTrades(prev => [...data, ...prev]);
                router.refresh();
                alert(`Imported ${data.length} trades successfully!`);
            }
        }

        event.target.value = '';
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.headerLeft}>
                    <h2 className={styles.title}>All Trades</h2>
                    <span className={styles.count}>{summary.totalTrades} trades</span>
                </div>
                <div className={styles.headerActions}>
                    <label className={styles.importBtn}>
                        📥 Import CSV
                        <input type="file" accept=".csv" onChange={handleImport} hidden />
                    </label>
                    <button className={styles.exportBtn} onClick={handleExport}>
                        📤 Export CSV
                    </button>
                    <button
                        className={styles.addBtn}
                        onClick={() => {
                            setEditingTrade(null);
                            setIsModalOpen(true);
                        }}
                    >
                        ➕ Add Trade
                    </button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className={styles.summary}>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Total P&L</span>
                    <span className={`${styles.summaryValue} ${summary.totalPnL >= 0 ? styles.positive : styles.negative}`}>
                        {formatCurrency(summary.totalPnL, true)}
                    </span>
                </div>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Win Rate</span>
                    <span className={styles.summaryValue}>{summary.winRate.toFixed(1)}%</span>
                </div>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Wins</span>
                    <span className={`${styles.summaryValue} ${styles.positive}`}>{summary.wins}</span>
                </div>
                <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Losses</span>
                    <span className={`${styles.summaryValue} ${styles.negative}`}>{summary.losses}</span>
                </div>
            </div>

            {/* Filters */}
            <TradeFiltersBar
                filters={filters}
                setFilters={setFilters}
                strategies={strategies}
            />

            {/* Trades Table */}
            <div className={styles.tableCard}>
                {filteredTrades.length === 0 ? (
                    <div className={styles.empty}>
                        <span className={styles.emptyIcon}>📈</span>
                        <p>No trades found. {trades.length === 0 ? 'Add your first trade!' : 'Try adjusting your filters.'}</p>
                    </div>
                ) : (
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
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTrades.map((trade) => {
                                    const pnl = calculatePnL(trade);
                                    const isPositive = pnl >= 0;

                                    return (
                                        <tr key={trade.id} className={styles.row}>
                                            <td className={styles.ticker}>{trade.ticker}</td>
                                            <td>
                                                <span className={`${styles.badge} ${styles[trade.type]}`}>
                                                    {trade.type}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`${styles.badge} ${styles[trade.side]}`}>
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
                                            <td className={styles.actions}>
                                                <button
                                                    className={styles.viewBtn}
                                                    onClick={() => router.push(`/trades/${trade.id}`)}
                                                    title="View Details"
                                                >
                                                    👁️
                                                </button>
                                                <button
                                                    className={styles.editBtn}
                                                    onClick={() => {
                                                        setEditingTrade(trade);
                                                        setIsModalOpen(true);
                                                    }}
                                                    title="Edit"
                                                >
                                                    ✏️
                                                </button>
                                                <button
                                                    className={styles.deleteBtn}
                                                    onClick={() => handleDeleteTrade(trade.id)}
                                                    title="Delete"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Trade Modal */}
            <TradeModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTrade(null);
                }}
                onSave={handleSaveTrade}
                trade={editingTrade}
                strategies={strategies}
                isLoading={isLoading}
            />
        </div>
    );
}
