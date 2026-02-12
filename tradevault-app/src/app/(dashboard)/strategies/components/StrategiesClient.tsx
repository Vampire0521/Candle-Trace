// =============================================
// CANDLE TRACE - STRATEGIES CLIENT COMPONENT
// =============================================

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Strategy, Trade, StrategyFormData } from '@/types';
import { calculatePnL, formatCurrency } from '@/lib/utils';
import { Modal } from '@/components/ui';
import styles from './StrategiesClient.module.css';

interface StrategiesClientProps {
    initialStrategies: Strategy[];
    trades: Trade[];
}

const icons = ['📈', '📊', '🎯', '💹', '📉', '🚀', '💎', '⚡', '🔥', '⭐'];

export function StrategiesClient({ initialStrategies, trades }: StrategiesClientProps) {
    const router = useRouter();
    const [strategies, setStrategies] = useState<Strategy[]>(initialStrategies);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('📈');

    // Calculate stats per strategy
    const strategyStats = useMemo(() => {
        const stats = new Map<string, { trades: number; wins: number; pnl: number }>();

        trades.forEach(trade => {
            if (trade.strategy_id) {
                const current = stats.get(trade.strategy_id) || { trades: 0, wins: 0, pnl: 0 };
                const pnl = calculatePnL(trade);
                stats.set(trade.strategy_id, {
                    trades: current.trades + 1,
                    wins: current.wins + (pnl > 0 ? 1 : 0),
                    pnl: current.pnl + pnl,
                });
            }
        });

        return stats;
    }, [trades]);

    const openModal = (strategy?: Strategy) => {
        if (strategy) {
            setEditingStrategy(strategy);
            setName(strategy.name);
            setDescription(strategy.description || '');
            setIcon(strategy.icon);
        } else {
            setEditingStrategy(null);
            setName('');
            setDescription('');
            setIcon('📈');
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!name.trim()) return;

        setIsLoading(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setIsLoading(false);
            return;
        }

        try {
            if (editingStrategy) {
                const { error } = await supabase
                    .from('strategies')
                    .update({ name, description, icon })
                    .eq('id', editingStrategy.id);

                if (!error) {
                    setStrategies(prev =>
                        prev.map(s => s.id === editingStrategy.id ? { ...s, name, description, icon } : s)
                    );
                }
            } else {
                const { data, error } = await supabase
                    .from('strategies')
                    .insert({ user_id: user.id, name, description, icon })
                    .select()
                    .single();

                if (!error && data) {
                    setStrategies(prev => [...prev, data]);
                }
            }

            setIsModalOpen(false);
            router.refresh();
        } catch (err) {
            console.error('Error saving strategy:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this strategy? Associated trades will not be deleted.')) return;

        const supabase = createClient();
        const { error } = await supabase
            .from('strategies')
            .delete()
            .eq('id', id);

        if (!error) {
            setStrategies(prev => prev.filter(s => s.id !== id));
            router.refresh();
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h2 className={styles.title}>Trading Strategies</h2>
                <button className={styles.addBtn} onClick={() => openModal()}>
                    ➕ Add Strategy
                </button>
            </div>

            {/* Strategies Grid */}
            {strategies.length === 0 ? (
                <div className={styles.empty}>
                    <span className={styles.emptyIcon}>🎯</span>
                    <p>No strategies yet. Create your first trading strategy!</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {strategies.map(strategy => {
                        const stats = strategyStats.get(strategy.id) || { trades: 0, wins: 0, pnl: 0 };
                        const winRate = stats.trades > 0 ? (stats.wins / stats.trades) * 100 : 0;

                        return (
                            <div key={strategy.id} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <span className={styles.cardIcon}>{strategy.icon}</span>
                                    <div className={styles.cardActions}>
                                        <button onClick={() => openModal(strategy)} title="Edit">✏️</button>
                                        <button onClick={() => handleDelete(strategy.id)} title="Delete">🗑️</button>
                                    </div>
                                </div>
                                <h3 className={styles.cardTitle}>{strategy.name}</h3>
                                {strategy.description && (
                                    <p className={styles.cardDesc}>{strategy.description}</p>
                                )}
                                <div className={styles.cardStats}>
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>Trades</span>
                                        <span className={styles.statValue}>{stats.trades}</span>
                                    </div>
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>Win Rate</span>
                                        <span className={styles.statValue}>{winRate.toFixed(0)}%</span>
                                    </div>
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>P&L</span>
                                        <span className={`${styles.statValue} ${stats.pnl >= 0 ? styles.positive : styles.negative}`}>
                                            {formatCurrency(stats.pnl, true)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingStrategy ? '✏️ Edit Strategy' : '➕ Add Strategy'}
            >
                <div className={styles.form}>
                    <div className={styles.field}>
                        <label className={styles.label}>Strategy Name *</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={styles.input}
                            placeholder="e.g., Breakout Trading"
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={styles.textarea}
                            placeholder="Describe your strategy..."
                            rows={3}
                        />
                    </div>
                    <div className={styles.field}>
                        <label className={styles.label}>Icon</label>
                        <div className={styles.iconGrid}>
                            {icons.map(i => (
                                <button
                                    key={i}
                                    type="button"
                                    className={`${styles.iconBtn} ${icon === i ? styles.iconSelected : ''}`}
                                    onClick={() => setIcon(i)}
                                >
                                    {i}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className={styles.actions}>
                        <button type="button" onClick={() => setIsModalOpen(false)} className={styles.cancelBtn}>
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className={styles.saveBtn}
                            disabled={isLoading || !name.trim()}
                        >
                            {isLoading ? 'Saving...' : (editingStrategy ? 'Update' : 'Create')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
