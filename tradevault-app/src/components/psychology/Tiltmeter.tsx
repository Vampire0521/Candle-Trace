// =============================================
// CANDLE TRACE - TILTMETER COMPONENT
// Visual emotional trading detector
// =============================================

'use client';

import { useMemo } from 'react';
import type { TiltLevel, DisciplineStats } from '@/types';
import styles from './Tiltmeter.module.css';

interface Props {
    stats: DisciplineStats | null;
    recentTradeCount?: number;
}

const TILT_LEVELS: { level: TiltLevel; label: string; color: string; min: number; max: number }[] = [
    { level: 'calm', label: 'Calm', color: '#22c55e', min: -5, max: -2 },
    { level: 'focused', label: 'Focused', color: '#3b82f6', min: -2, max: 0 },
    { level: 'elevated', label: 'Elevated', color: '#f59e0b', min: 0, max: 2 },
    { level: 'tilted', label: 'Tilted', color: '#ef4444', min: 2, max: 4 },
    { level: 'danger', label: 'Danger Zone', color: '#dc2626', min: 4, max: 5 },
];

const RECOMMENDATIONS: Record<TiltLevel, string> = {
    calm: "You're in a great mental state. Stick to your plan!",
    focused: "Good mindset for trading. Stay disciplined.",
    elevated: "Emotions rising. Consider taking a short break.",
    tilted: "⚠️ High emotional state detected. Reduce position size or stop trading.",
    danger: "🛑 STOP TRADING. Take a break and reset your mindset.",
};

export function Tiltmeter({ stats, recentTradeCount = 0 }: Props) {
    const tiltData = useMemo(() => {
        if (!stats || stats.total_trades_with_emotions === 0) {
            return {
                level: 'focused' as TiltLevel,
                score: 0,
                recommendation: "Start logging emotions to track your tilt level.",
                hasData: false,
            };
        }

        // Calculate tilt score based on emotions and discipline
        // High fear + high greed + low discipline = high tilt
        const emotionScore = (stats.avg_pre_fear + stats.avg_pre_greed) / 2;
        const disciplineScore = stats.avg_discipline_score / 10; // Normalize to 0-1
        const planAdherence = stats.plan_adherence_percent / 100;

        // Tilt score: -5 (very calm) to +5 (very tilted)
        const rawScore = (emotionScore * 2) - (disciplineScore * 5) - (planAdherence * 2);
        const score = Math.max(-5, Math.min(5, rawScore));

        // Determine level
        const levelInfo = TILT_LEVELS.find(l => score >= l.min && score < l.max) || TILT_LEVELS[2];

        return {
            level: levelInfo.level,
            score,
            recommendation: RECOMMENDATIONS[levelInfo.level],
            hasData: true,
        };
    }, [stats]);

    const levelInfo = TILT_LEVELS.find(l => l.level === tiltData.level) || TILT_LEVELS[2];
    const percentage = ((tiltData.score + 5) / 10) * 100; // Convert -5..5 to 0..100

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>🎯 Tiltmeter</h3>
                <span className={styles.badge} style={{ background: levelInfo.color }}>
                    {levelInfo.label}
                </span>
            </div>

            {/* Visual Meter */}
            <div className={styles.meterContainer}>
                <div className={styles.meterTrack}>
                    {TILT_LEVELS.map((level) => (
                        <div
                            key={level.level}
                            className={styles.meterSegment}
                            style={{ background: level.color }}
                        />
                    ))}
                </div>
                <div
                    className={styles.meterNeedle}
                    style={{ left: `${percentage}%` }}
                >
                    <div className={styles.needleHead} style={{ borderBottomColor: levelInfo.color }} />
                </div>
                <div className={styles.meterLabels}>
                    <span>Calm</span>
                    <span>Danger</span>
                </div>
            </div>

            {/* Stats */}
            {tiltData.hasData && (
                <div className={styles.statsGrid}>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Discipline Score</span>
                        <span className={styles.statValue}>{stats?.avg_discipline_score.toFixed(1)}/10</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Plan Adherence</span>
                        <span className={styles.statValue}>{stats?.plan_adherence_percent.toFixed(0)}%</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Avg Fear</span>
                        <span className={styles.statValue}>{stats?.avg_pre_fear.toFixed(1)}/5</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statLabel}>Avg Greed</span>
                        <span className={styles.statValue}>{stats?.avg_pre_greed.toFixed(1)}/5</span>
                    </div>
                </div>
            )}

            {/* Recommendation */}
            <div className={`${styles.recommendation} ${styles[tiltData.level]}`}>
                <span className={styles.recIcon}>
                    {tiltData.level === 'calm' && '😌'}
                    {tiltData.level === 'focused' && '🎯'}
                    {tiltData.level === 'elevated' && '⚡'}
                    {tiltData.level === 'tilted' && '⚠️'}
                    {tiltData.level === 'danger' && '🛑'}
                </span>
                <span>{tiltData.recommendation}</span>
            </div>

            {/* Top Mistakes */}
            {stats && stats.top_mistakes && stats.top_mistakes.length > 0 && (
                <div className={styles.mistakesSection}>
                    <span className={styles.mistakesLabel}>Top Mistakes (last 30 days):</span>
                    <div className={styles.mistakesList}>
                        {stats.top_mistakes.map((mistake, i) => (
                            <span key={i} className={styles.mistakeTag}>{mistake}</span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
