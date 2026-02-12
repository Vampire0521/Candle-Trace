// =============================================
// CANDLE TRACE - TRADE DETAILS CLIENT
// Professional trade details view
// =============================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Trade, TradeEmotion, TradeTag } from '@/types';
import { calculatePnL, formatCurrency, formatDate, formatPercent } from '@/lib/utils';
import { FadeIn, ScaleIn } from '@/components/ui/Motion';
import styles from './TradeDetails.module.css';

interface TradeDetailsClientProps {
    trade: Trade & { strategies?: { id: string; name: string; icon: string; description?: string } };
    emotions: TradeEmotion | null;
    tags: TradeTag[];
}

export function TradeDetailsClient({ trade, emotions, tags }: TradeDetailsClientProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const pnl = calculatePnL(trade);
    const isWin = pnl > 0;
    const riskReward = trade.stop_loss && trade.take_profit
        ? Math.abs(trade.take_profit - trade.entry_price) / Math.abs(trade.entry_price - trade.stop_loss)
        : null;

    // Calculate return percentage
    const investment = trade.entry_price * trade.quantity;
    const returnPercent = (pnl / investment) * 100;

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this trade? This action cannot be undone.')) {
            return;
        }
        setIsDeleting(true);
        const supabase = createClient();
        const { error } = await supabase.from('trades').delete().eq('id', trade.id);
        if (!error) {
            router.push('/trades');
        } else {
            setIsDeleting(false);
            alert('Failed to delete trade');
        }
    };

    const handleEdit = () => {
        router.push(`/trades?edit=${trade.id}`);
    };

    return (
        <div className={styles.container}>
            {/* Header */}
            <FadeIn>
                <div className={styles.header}>
                    <button className={styles.backBtn} onClick={() => router.back()}>
                        ← Back
                    </button>
                    <div className={styles.headerContent}>
                        <div className={styles.tickerWrap}>
                            <span className={`${styles.sideTag} ${trade.side === 'long' ? styles.long : styles.short}`}>
                                {trade.side === 'long' ? '🟢 LONG' : '🔴 SHORT'}
                            </span>
                            <h1 className={styles.ticker}>{trade.ticker}</h1>
                            <span className={styles.typeTag}>{trade.type.toUpperCase()}</span>
                        </div>
                        <div className={`${styles.pnlBadge} ${isWin ? styles.win : styles.loss}`}>
                            {isWin ? '📈' : '📉'} {formatCurrency(pnl)}
                            <span className={styles.pnlPercent}>
                                ({returnPercent >= 0 ? '+' : ''}{returnPercent.toFixed(2)}%)
                            </span>
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <button className={styles.editBtn} onClick={handleEdit}>
                            ✏️ Edit
                        </button>
                        <button
                            className={styles.deleteBtn}
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? '...' : '🗑️ Delete'}
                        </button>
                    </div>
                </div>
            </FadeIn>

            <div className={styles.content}>
                {/* Main Info Cards */}
                <div className={styles.grid}>
                    {/* Trade Summary Card */}
                    <ScaleIn delay={0.1}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>📊 Trade Summary</h3>
                            <div className={styles.stats}>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>Entry Price</span>
                                    <span className={styles.statValue}>{formatCurrency(trade.entry_price)}</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>Exit Price</span>
                                    <span className={styles.statValue}>{formatCurrency(trade.exit_price)}</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>Quantity</span>
                                    <span className={styles.statValue}>{trade.quantity.toLocaleString()}</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>Position Size</span>
                                    <span className={styles.statValue}>{formatCurrency(investment)}</span>
                                </div>
                                {trade.stop_loss && (
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>Stop Loss</span>
                                        <span className={`${styles.statValue} ${styles.stopLoss}`}>
                                            {formatCurrency(trade.stop_loss)}
                                        </span>
                                    </div>
                                )}
                                {trade.take_profit && (
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>Take Profit</span>
                                        <span className={`${styles.statValue} ${styles.takeProfit}`}>
                                            {formatCurrency(trade.take_profit)}
                                        </span>
                                    </div>
                                )}
                                {riskReward && (
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>Risk/Reward</span>
                                        <span className={styles.statValue}>1:{riskReward.toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScaleIn>

                    {/* Timing Card */}
                    <ScaleIn delay={0.15}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>⏱️ Timing</h3>
                            <div className={styles.stats}>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>Trade Date</span>
                                    <span className={styles.statValue}>{formatDate(trade.trade_date)}</span>
                                </div>
                                {trade.entry_time && (
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>Entry Time</span>
                                        <span className={styles.statValue}>{trade.entry_time}</span>
                                    </div>
                                )}
                                {trade.exit_time && (
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>Exit Time</span>
                                        <span className={styles.statValue}>{trade.exit_time}</span>
                                    </div>
                                )}
                                {trade.category && (
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>Category</span>
                                        <span className={styles.statValue}>
                                            {trade.category === 'scalp' && '⚡ Scalp'}
                                            {trade.category === 'day' && '☀️ Day Trade'}
                                            {trade.category === 'swing' && '🌊 Swing'}
                                            {trade.category === 'position' && '🗓️ Position'}
                                        </span>
                                    </div>
                                )}
                                {trade.market_condition && (
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>Market</span>
                                        <span className={styles.statValue}>
                                            {trade.market_condition === 'bullish' && '📈 Bullish'}
                                            {trade.market_condition === 'bearish' && '📉 Bearish'}
                                            {trade.market_condition === 'choppy' && '🌪️ Choppy'}
                                            {trade.market_condition === 'ranging' && '↔️ Ranging'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScaleIn>

                    {/* Advanced Metrics Card */}
                    <ScaleIn delay={0.2}>
                        <div className={styles.card}>
                            <h3 className={styles.cardTitle}>📈 Advanced Metrics</h3>
                            <div className={styles.stats}>
                                {trade.mfe !== null && trade.mfe !== undefined && (
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>MFE</span>
                                        <span className={`${styles.statValue} ${styles.takeProfit}`}>
                                            {formatCurrency(trade.mfe)}
                                        </span>
                                    </div>
                                )}
                                {trade.mae !== null && trade.mae !== undefined && (
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>MAE</span>
                                        <span className={`${styles.statValue} ${styles.stopLoss}`}>
                                            {formatCurrency(trade.mae)}
                                        </span>
                                    </div>
                                )}
                                {(trade.commission || trade.fees) && (
                                    <>
                                        <div className={styles.stat}>
                                            <span className={styles.statLabel}>Commission</span>
                                            <span className={styles.statValue}>
                                                {formatCurrency(trade.commission || 0)}
                                            </span>
                                        </div>
                                        <div className={styles.stat}>
                                            <span className={styles.statLabel}>Fees</span>
                                            <span className={styles.statValue}>
                                                {formatCurrency(trade.fees || 0)}
                                            </span>
                                        </div>
                                    </>
                                )}
                                {trade.strategies && (
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>Strategy</span>
                                        <span className={styles.statValue}>
                                            {trade.strategies.icon} {trade.strategies.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </ScaleIn>

                    {/* Psychology Card */}
                    {emotions && (
                        <ScaleIn delay={0.25}>
                            <div className={styles.card}>
                                <h3 className={styles.cardTitle}>🧠 Psychology</h3>
                                <div className={styles.emotionGrid}>
                                    <div className={styles.emotionSection}>
                                        <h4>Pre-Trade</h4>
                                        <div className={styles.emotionBars}>
                                            <div className={styles.emotionBar}>
                                                <span>Confidence</span>
                                                <div className={styles.barTrack}>
                                                    <div
                                                        className={styles.barFill}
                                                        style={{ width: `${((emotions.pre_confidence ?? 0) / 5) * 100}%` }}
                                                    />
                                                </div>
                                                <span>{emotions.pre_confidence ?? 0}/5</span>
                                            </div>
                                            <div className={styles.emotionBar}>
                                                <span>Fear</span>
                                                <div className={styles.barTrack}>
                                                    <div
                                                        className={`${styles.barFill} ${styles.fearBar}`}
                                                        style={{ width: `${((emotions.pre_fear ?? 0) / 5) * 100}%` }}
                                                    />
                                                </div>
                                                <span>{emotions.pre_fear ?? 0}/5</span>
                                            </div>
                                            <div className={styles.emotionBar}>
                                                <span>Greed</span>
                                                <div className={styles.barTrack}>
                                                    <div
                                                        className={`${styles.barFill} ${styles.greedBar}`}
                                                        style={{ width: `${((emotions.pre_greed ?? 0) / 5) * 100}%` }}
                                                    />
                                                </div>
                                                <span>{emotions.pre_greed ?? 0}/5</span>
                                            </div>
                                            <div className={styles.emotionBar}>
                                                <span>FOMO</span>
                                                <div className={styles.barTrack}>
                                                    <div
                                                        className={`${styles.barFill} ${styles.fomoBar}`}
                                                        style={{ width: `${((emotions.pre_fomo ?? 0) / 5) * 100}%` }}
                                                    />
                                                </div>
                                                <span>{emotions.pre_fomo ?? 0}/5</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={styles.disciplineSection}>
                                        <div className={styles.disciplineScore}>
                                            <span className={styles.disciplineValue}>{emotions.discipline_score ?? 0}</span>
                                            <span className={styles.disciplineLabel}>Discipline</span>
                                        </div>
                                        <div className={`${styles.planBadge} ${emotions.followed_plan ? styles.followed : styles.notFollowed}`}>
                                            {emotions.followed_plan ? '✅ Followed Plan' : '❌ Deviated'}
                                        </div>
                                    </div>
                                </div>
                                {emotions.mistakes && emotions.mistakes.length > 0 && (
                                    <div className={styles.mistakes}>
                                        <h4>⚠️ Mistakes</h4>
                                        <div className={styles.mistakeTags}>
                                            {emotions.mistakes.map((m, i) => (
                                                <span key={i} className={styles.mistakeTag}>
                                                    {m.replace(/_/g, ' ')}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScaleIn>
                    )}
                </div>

                {/* Tags Section */}
                {tags.length > 0 && (
                    <FadeIn delay={0.3}>
                        <div className={styles.tagsSection}>
                            <h3>🏷️ Tags</h3>
                            <div className={styles.tagsList}>
                                {tags.map((tag: TradeTag) => (
                                    <span
                                        key={tag.id}
                                        className={styles.tag}
                                        style={{ backgroundColor: tag.color + '20', borderColor: tag.color }}
                                    >
                                        <span className={styles.tagDot} style={{ backgroundColor: tag.color }} />
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </FadeIn>
                )}

                {/* Screenshot Section */}
                {trade.screenshot_url && (
                    <FadeIn delay={0.35}>
                        <div className={styles.screenshotSection}>
                            <h3>📷 Trade Chart</h3>
                            <div className={styles.screenshotWrap}>
                                <img
                                    src={trade.screenshot_url}
                                    alt="Trade chart screenshot"
                                    className={styles.screenshot}
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                        const parent = target.parentElement;
                                        if (parent && !parent.querySelector('.screenshot-error')) {
                                            const errorDiv = document.createElement('div');
                                            errorDiv.className = 'screenshot-error';
                                            errorDiv.style.cssText = 'padding: 2rem; text-align: center; color: #888; background: rgba(255,255,255,0.05); border-radius: 8px;';
                                            errorDiv.innerHTML = '⚠️ Screenshot unavailable<br><small style="color:#666">The image could not be loaded. It may have been deleted or the storage bucket may need to be made public.</small>';
                                            parent.appendChild(errorDiv);
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </FadeIn>
                )}

                {/* Notes Section */}
                {trade.notes && (
                    <FadeIn delay={0.4}>
                        <div className={styles.notesSection}>
                            <h3>📝 Notes</h3>
                            <p className={styles.notes}>{trade.notes}</p>
                        </div>
                    </FadeIn>
                )}

                {/* Emotions Notes */}
                {emotions?.notes && (
                    <FadeIn delay={0.45}>
                        <div className={styles.notesSection}>
                            <h3>🧠 Psychology Notes</h3>
                            <p className={styles.notes}>{emotions.notes}</p>
                        </div>
                    </FadeIn>
                )}
            </div>
        </div>
    );
}
