// =============================================
// CANDLE TRACE - AI INSIGHTS COMPONENT
// Display AI-generated trade insights
// =============================================

'use client';

import { useState } from 'react';
import styles from './AIInsights.module.css';
import type { TradeAnalysisResponse } from '@/types';

interface AIInsightsProps {
    tradeId: string;
    initialAnalysis?: TradeAnalysisResponse | null;
}

export function AIInsights({ tradeId, initialAnalysis }: AIInsightsProps) {
    const [analysis, setAnalysis] = useState<TradeAnalysisResponse | null>(initialAnalysis || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateInsight = async () => {
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/ai/insights', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ trade_id: tradeId }),
            });

            if (!res.ok) {
                const { error } = await res.json();
                throw new Error(error || 'Failed to generate insight');
            }

            const { data } = await res.json();
            setAnalysis(data.analysis);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (!analysis) {
        return (
            <div className={styles.generateContainer}>
                <button
                    onClick={generateInsight}
                    disabled={loading}
                    className={styles.generateBtn}
                >
                    {loading ? (
                        <>🔄 Analyzing...</>
                    ) : (
                        <>🤖 Get AI Analysis</>
                    )}
                </button>
                {error && <p className={styles.error}>{error}</p>}
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.icon}>🤖</span>
                <h4>AI Analysis</h4>
                <div className={styles.score}>
                    <span className={styles.scoreValue}>{analysis.score}</span>
                    <span className={styles.scoreLabel}>/10</span>
                </div>
            </div>

            <p className={styles.summary}>{analysis.summary}</p>

            <div className={styles.sections}>
                <div className={styles.section}>
                    <h5>✅ Strengths</h5>
                    <ul>
                        {analysis.strengths.map((s, i) => (
                            <li key={i}>{s}</li>
                        ))}
                    </ul>
                </div>

                <div className={styles.section}>
                    <h5>📈 Improvements</h5>
                    <ul>
                        {analysis.improvements.map((imp, i) => (
                            <li key={i}>{imp}</li>
                        ))}
                    </ul>
                </div>

                <div className={styles.lessons}>
                    <h5>💡 Key Lesson</h5>
                    <p>{analysis.lessons}</p>
                </div>
            </div>

            <button
                onClick={generateInsight}
                disabled={loading}
                className={styles.refreshBtn}
            >
                {loading ? '🔄' : '↻'} Refresh
            </button>
        </div>
    );
}
