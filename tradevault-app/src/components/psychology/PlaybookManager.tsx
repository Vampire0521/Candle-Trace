// =============================================
// CANDLE TRACE - PLAYBOOK MANAGER COMPONENT
// Create and manage trading setup templates
// =============================================

'use client';

import { useState, useEffect } from 'react';
import type { PlaybookSetup, PlaybookFormData, PlaybookRule } from '@/types';
import styles from './PlaybookManager.module.css';

const TIMEFRAME_OPTIONS = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w'];
const CONDITION_OPTIONS = ['bullish', 'bearish', 'ranging', 'breakout', 'reversal', 'trend'];
const SETUP_ICONS = ['📊', '📈', '📉', '🎯', '💎', '⚡', '🔥', '🚀', '💰', '🏆'];

export function PlaybookManager() {
    const [setups, setSetups] = useState<PlaybookSetup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSetup, setEditingSetup] = useState<PlaybookSetup | null>(null);
    const [formData, setFormData] = useState<PlaybookFormData>(getEmptyForm());

    function getEmptyForm(): PlaybookFormData {
        return {
            name: '',
            description: '',
            icon: '📊',
            market_conditions: [],
            timeframes: [],
            entry_rules: [],
            exit_rules: [],
            risk_percent: 1.0,
            min_rr_ratio: 2.0,
        };
    }

    useEffect(() => {
        fetchSetups();
    }, []);

    async function fetchSetups() {
        try {
            const res = await fetch('/api/playbook');
            if (res.ok) {
                const { data } = await res.json();
                setSetups(data || []);
            }
        } catch (error) {
            console.error('Failed to fetch playbook:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleSave() {
        try {
            const method = editingSetup ? 'PUT' : 'POST';
            const url = editingSetup ? `/api/playbook/${editingSetup.id}` : '/api/playbook';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                fetchSetups();
                setIsModalOpen(false);
                setEditingSetup(null);
                setFormData(getEmptyForm());
            }
        } catch (error) {
            console.error('Failed to save setup:', error);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this setup?')) return;
        try {
            await fetch(`/api/playbook/${id}`, { method: 'DELETE' });
            setSetups(prev => prev.filter(s => s.id !== id));
        } catch (error) {
            console.error('Failed to delete:', error);
        }
    }

    function openEditModal(setup: PlaybookSetup) {
        setEditingSetup(setup);
        setFormData({
            name: setup.name,
            description: setup.description || '',
            icon: setup.icon,
            market_conditions: setup.market_conditions,
            timeframes: setup.timeframes,
            entry_rules: setup.entry_rules,
            exit_rules: setup.exit_rules,
            risk_percent: setup.risk_percent,
            min_rr_ratio: setup.min_rr_ratio,
        });
        setIsModalOpen(true);
    }

    function addRule(type: 'entry' | 'exit') {
        const newRule: PlaybookRule = {
            id: crypto.randomUUID(),
            text: '',
            required: true,
        };
        setFormData(prev => ({
            ...prev,
            [type === 'entry' ? 'entry_rules' : 'exit_rules']: [
                ...prev[type === 'entry' ? 'entry_rules' : 'exit_rules'],
                newRule,
            ],
        }));
    }

    function updateRule(type: 'entry' | 'exit', id: string, text: string) {
        const key = type === 'entry' ? 'entry_rules' : 'exit_rules';
        setFormData(prev => ({
            ...prev,
            [key]: prev[key].map((r: PlaybookRule) => r.id === id ? { ...r, text } : r),
        }));
    }

    function removeRule(type: 'entry' | 'exit', id: string) {
        const key = type === 'entry' ? 'entry_rules' : 'exit_rules';
        setFormData(prev => ({
            ...prev,
            [key]: prev[key].filter((r: PlaybookRule) => r.id !== id),
        }));
    }

    function toggleCondition(condition: string) {
        setFormData(prev => ({
            ...prev,
            market_conditions: prev.market_conditions.includes(condition)
                ? prev.market_conditions.filter(c => c !== condition)
                : [...prev.market_conditions, condition],
        }));
    }

    function toggleTimeframe(tf: string) {
        setFormData(prev => ({
            ...prev,
            timeframes: prev.timeframes.includes(tf)
                ? prev.timeframes.filter(t => t !== tf)
                : [...prev.timeframes, tf],
        }));
    }

    if (isLoading) {
        return <div className={styles.loading}>Loading playbook...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h2 className={styles.title}>📖 Trading Playbook</h2>
                <button
                    className={styles.addBtn}
                    onClick={() => {
                        setEditingSetup(null);
                        setFormData(getEmptyForm());
                        setIsModalOpen(true);
                    }}
                >
                    ➕ New Setup
                </button>
            </div>

            {setups.length === 0 ? (
                <div className={styles.emptyState}>
                    <span className={styles.emptyIcon}>📖</span>
                    <p>No setups yet. Create your first trading setup!</p>
                </div>
            ) : (
                <div className={styles.setupGrid}>
                    {setups.map(setup => (
                        <div key={setup.id} className={styles.setupCard}>
                            <div className={styles.cardHeader}>
                                <span className={styles.setupIcon}>{setup.icon}</span>
                                <h3 className={styles.setupName}>{setup.name}</h3>
                            </div>
                            {setup.description && (
                                <p className={styles.setupDesc}>{setup.description}</p>
                            )}
                            <div className={styles.setupMeta}>
                                <span>🎯 {setup.times_used} trades</span>
                                <span>
                                    {setup.win_count + setup.loss_count > 0
                                        ? `${((setup.win_count / (setup.win_count + setup.loss_count)) * 100).toFixed(0)}% win`
                                        : 'No data'}
                                </span>
                            </div>
                            <div className={styles.cardTags}>
                                {setup.timeframes.slice(0, 3).map(tf => (
                                    <span key={tf} className={styles.tag}>{tf}</span>
                                ))}
                                {setup.market_conditions.slice(0, 2).map(c => (
                                    <span key={c} className={`${styles.tag} ${styles.conditionTag}`}>{c}</span>
                                ))}
                            </div>
                            <div className={styles.cardActions}>
                                <button onClick={() => openEditModal(setup)}>✏️ Edit</button>
                                <button onClick={() => handleDelete(setup.id)}>🗑️</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsModalOpen(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>
                            {editingSetup ? 'Edit Setup' : 'New Setup'}
                        </h3>

                        <div className={styles.formGroup}>
                            <label>Icon & Name</label>
                            <div className={styles.iconNameRow}>
                                <select
                                    value={formData.icon}
                                    onChange={e => setFormData(p => ({ ...p, icon: e.target.value }))}
                                    className={styles.iconSelect}
                                >
                                    {SETUP_ICONS.map(icon => (
                                        <option key={icon} value={icon}>{icon}</option>
                                    ))}
                                </select>
                                <input
                                    type="text"
                                    placeholder="Setup name..."
                                    value={formData.name}
                                    onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Description</label>
                            <textarea
                                placeholder="Describe this setup..."
                                value={formData.description}
                                onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                className={styles.textarea}
                                rows={2}
                            />
                        </div>

                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label>Risk %</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={formData.risk_percent}
                                    onChange={e => setFormData(p => ({ ...p, risk_percent: parseFloat(e.target.value) || 1 }))}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label>Min R:R</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={formData.min_rr_ratio}
                                    onChange={e => setFormData(p => ({ ...p, min_rr_ratio: parseFloat(e.target.value) || 2 }))}
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Timeframes</label>
                            <div className={styles.chipGrid}>
                                {TIMEFRAME_OPTIONS.map(tf => (
                                    <button
                                        key={tf}
                                        type="button"
                                        onClick={() => toggleTimeframe(tf)}
                                        className={`${styles.chip} ${formData.timeframes.includes(tf) ? styles.active : ''}`}
                                    >
                                        {tf}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Market Conditions</label>
                            <div className={styles.chipGrid}>
                                {CONDITION_OPTIONS.map(c => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => toggleCondition(c)}
                                        className={`${styles.chip} ${formData.market_conditions.includes(c) ? styles.active : ''}`}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Entry Rules</label>
                            {formData.entry_rules.map(rule => (
                                <div key={rule.id} className={styles.ruleRow}>
                                    <input
                                        type="text"
                                        placeholder="Entry rule..."
                                        value={rule.text}
                                        onChange={e => updateRule('entry', rule.id, e.target.value)}
                                        className={styles.ruleInput}
                                    />
                                    <button type="button" onClick={() => removeRule('entry', rule.id)}>✕</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addRule('entry')} className={styles.addRuleBtn}>
                                + Add Entry Rule
                            </button>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Exit Rules</label>
                            {formData.exit_rules.map(rule => (
                                <div key={rule.id} className={styles.ruleRow}>
                                    <input
                                        type="text"
                                        placeholder="Exit rule..."
                                        value={rule.text}
                                        onChange={e => updateRule('exit', rule.id, e.target.value)}
                                        className={styles.ruleInput}
                                    />
                                    <button type="button" onClick={() => removeRule('exit', rule.id)}>✕</button>
                                </div>
                            ))}
                            <button type="button" onClick={() => addRule('exit')} className={styles.addRuleBtn}>
                                + Add Exit Rule
                            </button>
                        </div>

                        <div className={styles.modalActions}>
                            <button onClick={() => setIsModalOpen(false)} className={styles.cancelBtn}>
                                Cancel
                            </button>
                            <button onClick={handleSave} className={styles.saveBtn} disabled={!formData.name}>
                                💾 Save Setup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
