// =============================================
// CANDLE TRACE - PATTERN CARD COMPONENT
// Display detected trading patterns
// =============================================

'use client';

import styles from './PatternCard.module.css';

interface Pattern {
    name: string;
    description: string;
    frequency: string;
}

interface PatternCardProps {
    type: 'winning' | 'losing';
    patterns: Pattern[];
}

export function PatternCard({ type, patterns }: PatternCardProps) {
    const isWinning = type === 'winning';

    return (
        <div className={`${styles.card} ${isWinning ? styles.winning : styles.losing}`}>
            <div className={styles.header}>
                <span className={styles.icon}>
                    {isWinning ? '🏆' : '⚠️'}
                </span>
                <h4>{isWinning ? 'Winning Patterns' : 'Losing Patterns'}</h4>
                <span className={styles.count}>{patterns.length}</span>
            </div>

            <div className={styles.patterns}>
                {patterns.length === 0 ? (
                    <p className={styles.empty}>
                        No {type} patterns detected yet
                    </p>
                ) : (
                    patterns.map((pattern, i) => (
                        <div key={i} className={styles.pattern}>
                            <div className={styles.patternHeader}>
                                <span className={styles.patternName}>{pattern.name}</span>
                                <span className={styles.frequency}>{pattern.frequency}</span>
                            </div>
                            <p className={styles.description}>{pattern.description}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
