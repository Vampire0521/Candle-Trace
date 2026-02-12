// =============================================
// CANDLE TRACE - AI PAGE CLIENT COMPONENT
// Interactive AI analytics interface
// =============================================

'use client';

import { useState } from 'react';
import { AIChat, PatternCard, TipCard } from '@/components/ai';
import styles from './AIPage.module.css';
import type { AIPattern, AITip, AIConversation } from '@/types';

interface AIPageClientProps {
    initialPatterns: AIPattern[];
    initialTips: AITip[];
    conversations: AIConversation[];
}

export function AIPageClient({
    initialPatterns,
    initialTips,
    conversations: initialConversations,
}: AIPageClientProps) {
    const [patterns, setPatterns] = useState(initialPatterns);
    const [tips, setTips] = useState(initialTips);
    const [conversations, setConversations] = useState(initialConversations);
    const [activeConvId, setActiveConvId] = useState<string | undefined>();
    const [loadingPatterns, setLoadingPatterns] = useState(false);
    const [loadingTips, setLoadingTips] = useState(false);

    const winningPatterns = patterns.filter(p => p.pattern_type === 'winning');
    const losingPatterns = patterns.filter(p => p.pattern_type === 'losing');

    const detectPatterns = async () => {
        setLoadingPatterns(true);
        try {
            const res = await fetch('/api/ai/patterns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ days: 30 }),
            });

            if (res.ok) {
                const { data } = await res.json();
                // Refresh patterns from server
                const patternsRes = await fetch('/api/ai/patterns');
                const { data: newPatterns } = await patternsRes.json();
                setPatterns(newPatterns || []);
            }
        } catch (err) {
            console.error('Failed to detect patterns:', err);
        } finally {
            setLoadingPatterns(false);
        }
    };

    const generateTips = async () => {
        setLoadingTips(true);
        try {
            const res = await fetch('/api/ai/tips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ days: 30 }),
            });

            if (res.ok) {
                const { data } = await res.json();
                setTips(data.tips || []);
            }
        } catch (err) {
            console.error('Failed to generate tips:', err);
        } finally {
            setLoadingTips(false);
        }
    };

    const dismissTip = async (tipId: string) => {
        try {
            await fetch('/api/ai/tips', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tip_id: tipId, is_dismissed: true }),
            });
            setTips(tips.filter(t => t.id !== tipId));
        } catch (err) {
            console.error('Failed to dismiss tip:', err);
        }
    };

    const handleNewConversation = (id: string) => {
        setActiveConvId(id);
        setConversations(prev => [
            { id, user_id: '', title: 'New Chat', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
            ...prev.filter(c => c.id !== id)
        ]);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <h1>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="10" rx="2" />
                            <circle cx="12" cy="5" r="2" />
                            <path d="M12 7v4" />
                            <line x1="8" y1="16" x2="8" y2="16" />
                            <line x1="16" y1="16" x2="16" y2="16" />
                        </svg>
                        AI Analytics
                    </h1>
                    <p>AI-powered insights to improve your trading</p>
                </div>
            </header>

            <div className={styles.grid}>
                {/* Chat Section */}
                <section className={styles.chatSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Ask Candle Trace</h2>
                        {conversations.length > 0 && (
                            <select
                                className={styles.convSelect}
                                value={activeConvId || ''}
                                onChange={(e) => setActiveConvId(e.target.value || undefined)}
                            >
                                <option value="">New Chat</option>
                                {conversations.map(conv => (
                                    <option key={conv.id} value={conv.id}>
                                        {conv.title}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                    <AIChat
                        conversationId={activeConvId}
                        onNewConversation={handleNewConversation}
                    />
                </section>

                {/* Patterns Section */}
                <section className={styles.patternsSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Trading Patterns</h2>
                        <button
                            onClick={detectPatterns}
                            disabled={loadingPatterns}
                            className={styles.actionBtn}
                        >
                            {loadingPatterns ? '🔄 Detecting...' : '🔍 Detect Patterns'}
                        </button>
                    </div>
                    <div className={styles.patternCards}>
                        <PatternCard
                            type="winning"
                            patterns={winningPatterns.map(p => ({
                                name: p.name,
                                description: p.description,
                                frequency: (p.criteria as { frequency?: string })?.frequency || 'N/A',
                            }))}
                        />
                        <PatternCard
                            type="losing"
                            patterns={losingPatterns.map(p => ({
                                name: p.name,
                                description: p.description,
                                frequency: (p.criteria as { frequency?: string })?.frequency || 'N/A',
                            }))}
                        />
                    </div>
                </section>

                {/* Tips Section */}
                <section className={styles.tipsSection}>
                    <div className={styles.sectionHeader}>
                        <h2>Personalized Tips</h2>
                        <button
                            onClick={generateTips}
                            disabled={loadingTips}
                            className={styles.actionBtn}
                        >
                            {loadingTips ? '🔄 Generating...' : '💡 Get Tips'}
                        </button>
                    </div>
                    <div className={styles.tipCards}>
                        {tips.length === 0 ? (
                            <div className={styles.emptyTips}>
                                <p>No active tips. Click &quot;Get Tips&quot; to generate personalized suggestions.</p>
                            </div>
                        ) : (
                            tips.map(tip => (
                                <TipCard
                                    key={tip.id}
                                    tip={tip}
                                    onDismiss={dismissTip}
                                />
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
