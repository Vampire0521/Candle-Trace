// =============================================
// CANDLE TRACE - GOALS CLIENT COMPONENT
// =============================================

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Goal, Trade, GoalType } from '@/types';
import { calculatePnL, formatCurrency, calculateStats } from '@/lib/utils';
import { Modal } from '@/components/ui';
import styles from './GoalsClient.module.css';

interface GoalsClientProps {
    initialGoals: Goal[];
    trades: Trade[];
}

export function GoalsClient({ initialGoals, trades }: GoalsClientProps) {
    const router = useRouter();
    const [goals, setGoals] = useState<Goal[]>(initialGoals);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form state
    const [name, setName] = useState('');
    const [targetAmount, setTargetAmount] = useState<number>(1000);
    const [deadline, setDeadline] = useState('');
    const [goalType, setGoalType] = useState<GoalType>('profit');

    // Calculate trade stats
    const stats = useMemo(() => calculateStats(trades, 10000), [trades]);

    // Calculate progress for each goal
    const getProgress = (goal: Goal) => {
        let current = 0;
        switch (goal.goal_type) {
            case 'profit':
                current = stats.totalPnL;
                break;
            case 'trade_count':
                current = stats.totalTrades;
                break;
            case 'win_rate':
                current = stats.winRate;
                break;
        }
        const progress = (current / goal.target_amount) * 100;
        return { current, progress: Math.min(progress, 100), isComplete: progress >= 100 };
    };

    const openModal = (goal?: Goal) => {
        if (goal) {
            setEditingGoal(goal);
            setName(goal.name);
            setTargetAmount(goal.target_amount);
            setDeadline(goal.deadline || '');
            setGoalType(goal.goal_type);
        } else {
            setEditingGoal(null);
            setName('');
            setTargetAmount(1000);
            setDeadline('');
            setGoalType('profit');
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
            const goalData = {
                name,
                target_amount: targetAmount,
                deadline: deadline || null,
                goal_type: goalType,
            };

            if (editingGoal) {
                const { error } = await supabase
                    .from('goals')
                    .update(goalData)
                    .eq('id', editingGoal.id);

                if (!error) {
                    setGoals(prev =>
                        prev.map(g => g.id === editingGoal.id ? { ...g, ...goalData } : g)
                    );
                }
            } else {
                const { data, error } = await supabase
                    .from('goals')
                    .insert({ ...goalData, user_id: user.id })
                    .select()
                    .single();

                if (!error && data) {
                    setGoals(prev => [...prev, data]);
                }
            }

            setIsModalOpen(false);
            router.refresh();
        } catch (err) {
            console.error('Error saving goal:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this goal?')) return;

        const supabase = createClient();
        const { error } = await supabase
            .from('goals')
            .delete()
            .eq('id', id);

        if (!error) {
            setGoals(prev => prev.filter(g => g.id !== id));
            router.refresh();
        }
    };

    const formatGoalValue = (goal: Goal, value: number) => {
        switch (goal.goal_type) {
            case 'profit':
                return formatCurrency(value, true);
            case 'trade_count':
                return `${Math.round(value)} trades`;
            case 'win_rate':
                return `${value.toFixed(1)}%`;
            default:
                return value.toString();
        }
    };

    const getGoalIcon = (type: GoalType) => {
        switch (type) {
            case 'profit': return '💰';
            case 'trade_count': return '📊';
            case 'win_rate': return '🎯';
            default: return '🏆';
        }
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <div className={styles.header}>
                <h2 className={styles.title}>Trading Goals</h2>
                <button className={styles.addBtn} onClick={() => openModal()}>
                    ➕ Add Goal
                </button>
            </div>

            {/* Goals Grid */}
            {goals.length === 0 ? (
                <div className={styles.empty}>
                    <span className={styles.emptyIcon}>🏆</span>
                    <p>No goals set. Create your first trading goal!</p>
                </div>
            ) : (
                <div className={styles.grid}>
                    {goals.map(goal => {
                        const { current, progress, isComplete } = getProgress(goal);
                        const daysLeft = goal.deadline
                            ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                            : null;

                        return (
                            <div key={goal.id} className={`${styles.card} ${isComplete ? styles.complete : ''}`}>
                                <div className={styles.cardHeader}>
                                    <span className={styles.cardIcon}>{getGoalIcon(goal.goal_type)}</span>
                                    <div className={styles.cardActions}>
                                        <button onClick={() => openModal(goal)} title="Edit">✏️</button>
                                        <button onClick={() => handleDelete(goal.id)} title="Delete">🗑️</button>
                                    </div>
                                </div>

                                <h3 className={styles.cardTitle}>{goal.name}</h3>

                                <div className={styles.progressSection}>
                                    <div className={styles.progressLabels}>
                                        <span>{formatGoalValue(goal, current)}</span>
                                        <span>{formatGoalValue(goal, goal.target_amount)}</span>
                                    </div>
                                    <div className={styles.progressBar}>
                                        <div
                                            className={`${styles.progressFill} ${isComplete ? styles.fillComplete : ''}`}
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    <div className={styles.progressInfo}>
                                        <span className={styles.progressPercent}>{progress.toFixed(0)}%</span>
                                        {daysLeft !== null && (
                                            <span className={`${styles.deadline} ${daysLeft < 0 ? styles.overdue : ''}`}>
                                                {daysLeft >= 0 ? `${daysLeft} days left` : `${Math.abs(daysLeft)} days overdue`}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {isComplete && (
                                    <div className={styles.completeBadge}>✅ Goal Achieved!</div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingGoal ? '✏️ Edit Goal' : '➕ Add Goal'}
            >
                <div className={styles.form}>
                    <div className={styles.field}>
                        <label className={styles.label}>Goal Name *</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={styles.input}
                            placeholder="e.g., Monthly Profit Target"
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label className={styles.label}>Goal Type</label>
                            <select
                                value={goalType}
                                onChange={(e) => setGoalType(e.target.value as GoalType)}
                                className={styles.select}
                            >
                                <option value="profit">💰 Profit Target</option>
                                <option value="trade_count">📊 Trade Count</option>
                                <option value="win_rate">🎯 Win Rate %</option>
                            </select>
                        </div>
                        <div className={styles.field}>
                            <label className={styles.label}>Target</label>
                            <input
                                type="number"
                                value={targetAmount}
                                onChange={(e) => setTargetAmount(parseFloat(e.target.value) || 0)}
                                className={styles.input}
                                placeholder={goalType === 'profit' ? '5000' : goalType === 'win_rate' ? '60' : '100'}
                            />
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label className={styles.label}>Deadline (optional)</label>
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className={styles.input}
                        />
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
                            {isLoading ? 'Saving...' : (editingGoal ? 'Update' : 'Create')}
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
