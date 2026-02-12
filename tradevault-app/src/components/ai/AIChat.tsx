// =============================================
// CANDLE TRACE - AI CHAT COMPONENT
// "Ask Candle Trace" conversational interface
// =============================================

'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './AIChat.module.css';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

interface AIChatProps {
    conversationId?: string;
    onNewConversation?: (id: string) => void;
}

export function AIChat({ conversationId, onNewConversation }: AIChatProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentConvId, setCurrentConvId] = useState(conversationId);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Load conversation if ID provided
    useEffect(() => {
        if (conversationId) {
            loadConversation(conversationId);
        }
    }, [conversationId]);

    const loadConversation = async (id: string) => {
        try {
            const res = await fetch(`/api/ai/chat?conversation_id=${id}`);
            const { data } = await res.json();
            setMessages(data || []);
            setCurrentConvId(id);
        } catch (err) {
            console.error('Failed to load conversation:', err);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            id: `temp-${Date.now()}`,
            role: 'user',
            content: input.trim(),
            created_at: new Date().toISOString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.content,
                    conversation_id: currentConvId,
                }),
            });

            if (!res.ok) {
                const { error } = await res.json();
                throw new Error(error || 'Failed to send message');
            }

            const { data } = await res.json();

            // Update conversation ID if new
            if (!currentConvId && data.conversation_id) {
                setCurrentConvId(data.conversation_id);
                onNewConversation?.(data.conversation_id);
            }

            // Add assistant response
            setMessages(prev => [...prev, data.message]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <span className={styles.icon}>🤖</span>
                <h3>Ask Candle Trace</h3>
            </div>

            <div className={styles.messages}>
                {messages.length === 0 && (
                    <div className={styles.empty}>
                        <p>👋 Hi! I&apos;m your AI trading assistant.</p>
                        <p>Ask me anything about your trades:</p>
                        <ul>
                            <li>&quot;What&apos;s my best performing day of the week?&quot;</li>
                            <li>&quot;Why am I losing on crypto trades?&quot;</li>
                            <li>&quot;How can I improve my discipline?&quot;</li>
                        </ul>
                    </div>
                )}

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`${styles.message} ${styles[msg.role]}`}
                    >
                        <div className={styles.messageContent}>
                            {msg.content}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className={`${styles.message} ${styles.assistant}`}>
                        <div className={styles.typing}>
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className={styles.error}>
                        ⚠️ {error}
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            <div className={styles.inputArea}>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about your trading performance..."
                    className={styles.input}
                    rows={2}
                    disabled={loading}
                />
                <button
                    onClick={sendMessage}
                    disabled={!input.trim() || loading}
                    className={styles.sendBtn}
                >
                    {loading ? '...' : '➤'}
                </button>
            </div>
        </div>
    );
}
