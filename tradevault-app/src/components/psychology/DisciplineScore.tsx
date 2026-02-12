// =============================================
// CANDLE TRACE - DISCIPLINE SCORE CARD
// Dashboard widget showing discipline metrics
// =============================================

'use client';

import { useEffect, useState } from 'react';
import type { DisciplineStats } from '@/types';
import styles from './DisciplineScore.module.css';

interface Props {
    days?: number;
}

export function DisciplineScore({ days = 30 }: Props) {
    const [stats, setStats] = useState<DisciplineStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch(`/api/discipline?days=${days}`);
                if (res.ok) {
                    const { data } = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch discipline stats:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchStats();
    }, [days]);

    if (isLoading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>Loading discipline data...</div>
            </div>
        );
    }

    if (!stats || stats.total_trades_with_emotions === 0) {
        return (
            <div className={styles.container}>
                <h3 className={styles.title}>📊 Discipline Score</h3>
                <div className={styles.emptyState}>
                    <p>No emotion data yet. Log your first trade emotions to see your discipline score.</p>
                </div>
            </div>
        );
    }

    const scoreColor = stats.avg_discipline_score >= 7 ? '#22c55e'
        : stats.avg_discipline_score >= 5 ? '#f59e0b'
            : '#ef4444';

    const adherenceColor = stats.plan_adherence_percent >= 80 ? '#22c55e'
        : stats.plan_adherence_percent >= 60 ? '#f59e0b'
            : '#ef4444';

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>📊 Discipline Score</h3>
            <p className={styles.period}>Last {days} days</p>

            <div className={styles.mainScore}>
                <div
                    className={styles.scoreCircle}
                    style={{ borderColor: scoreColor }}
                >
                    <span className={styles.scoreValue} style={{ color: scoreColor }}>
                        {stats.avg_discipline_score.toFixed(1)}
                    </span>
                    <span className={styles.scoreMax}>/10</span>
                </div>
            </div>

            <div className={styles.metricsGrid}>
                <div className={styles.metric}>
                    <span className={styles.metricLabel}>Plan Adherence</span>
                    <div className={styles.metricBar}>
                        <div
                            className={styles.metricFill}
                            style={{
                                width: `${stats.plan_adherence_percent}%`,
                                background: adherenceColor,
                            }}
                        />
                    </div>
                    <span className={styles.metricValue} style={{ color: adherenceColor }}>
                        {stats.plan_adherence_percent.toFixed(0)}%
                    </span>
                </div>

                <div className={styles.metric}>
                    <span className={styles.metricLabel}>Trades Logged</span>
                    <span className={styles.metricValueLarge}>{stats.total_trades_with_emotions}</span>
                </div>

                <div className={styles.metric}>
                    <span className={styles.metricLabel}>Avg Confidence</span>
                    <span className={styles.metricValueLarge}>{stats.avg_pre_confidence.toFixed(1)}/5</span>
                </div>

                <div className={styles.metric}>
                    <span className={styles.metricLabel}>Followed Plan</span>
                    <span className={styles.metricValueLarge}>{stats.followed_plan_count}/{stats.total_trades_with_emotions}</span>
                </div>
            </div>
        </div>
    );
}
