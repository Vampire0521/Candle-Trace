// =============================================
// CANDLE TRACE - EMOTION LOGGER COMPONENT
// Log emotions before/after trades
// =============================================

'use client';

import { useState } from 'react';
import type { TradeEmotionFormData, MistakeType } from '@/types';
import { MISTAKE_OPTIONS, EMOTION_SCALE, DISCIPLINE_SCALE } from '@/types';
import styles from './EmotionLogger.module.css';

interface Props {
    tradeId?: string;
    onSave: (data: TradeEmotionFormData) => Promise<void>;
    onCancel?: () => void;
    isPostTrade?: boolean;
}

export function EmotionLogger({ tradeId, onSave, onCancel, isPostTrade = false }: Props) {
    const [formData, setFormData] = useState<TradeEmotionFormData>({
        pre_confidence: 3,
        pre_fear: 2,
        pre_greed: 2,
        pre_fomo: 2,
        post_satisfaction: isPostTrade ? 3 : undefined,
        post_regret: isPostTrade ? 2 : undefined,
        discipline_score: 7,
        followed_plan: true,
        mistakes: [],
        notes: '',
    });
    const [isSaving, setIsSaving] = useState(false);

    const toggleMistake = (mistake: MistakeType) => {
        setFormData(prev => ({
            ...prev,
            mistakes: prev.mistakes.includes(mistake)
                ? prev.mistakes.filter(m => m !== mistake)
                : [...prev.mistakes, mistake],
        }));
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            await onSave(formData);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>
                {isPostTrade ? '📊 Post-Trade Reflection' : '🧠 Pre-Trade Mindset'}
            </h3>
            <p className={styles.subtitle}>
                {isPostTrade
                    ? 'How did this trade go emotionally?'
                    : 'How are you feeling before this trade?'}
            </p>

            {/* Pre-Trade Emotions */}
            {!isPostTrade && (
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Emotional State</h4>

                    <div className={styles.sliderGroup}>
                        <label className={styles.sliderLabel}>
                            <span>Confidence</span>
                            <span className={styles.sliderValue}>
                                {EMOTION_SCALE.find(e => e.value === formData.pre_confidence)?.label}
                            </span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            value={formData.pre_confidence}
                            onChange={(e) => setFormData(prev => ({ ...prev, pre_confidence: parseInt(e.target.value) }))}
                            className={`${styles.slider} ${styles.confidenceSlider}`}
                        />
                    </div>

                    <div className={styles.sliderGroup}>
                        <label className={styles.sliderLabel}>
                            <span>Fear</span>
                            <span className={styles.sliderValue}>
                                {EMOTION_SCALE.find(e => e.value === formData.pre_fear)?.label}
                            </span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            value={formData.pre_fear}
                            onChange={(e) => setFormData(prev => ({ ...prev, pre_fear: parseInt(e.target.value) }))}
                            className={`${styles.slider} ${styles.fearSlider}`}
                        />
                    </div>

                    <div className={styles.sliderGroup}>
                        <label className={styles.sliderLabel}>
                            <span>Greed</span>
                            <span className={styles.sliderValue}>
                                {EMOTION_SCALE.find(e => e.value === formData.pre_greed)?.label}
                            </span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            value={formData.pre_greed}
                            onChange={(e) => setFormData(prev => ({ ...prev, pre_greed: parseInt(e.target.value) }))}
                            className={`${styles.slider} ${styles.greedSlider}`}
                        />
                    </div>

                    <div className={styles.sliderGroup}>
                        <label className={styles.sliderLabel}>
                            <span>FOMO</span>
                            <span className={styles.sliderValue}>
                                {EMOTION_SCALE.find(e => e.value === formData.pre_fomo)?.label}
                            </span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            value={formData.pre_fomo}
                            onChange={(e) => setFormData(prev => ({ ...prev, pre_fomo: parseInt(e.target.value) }))}
                            className={`${styles.slider} ${styles.fomoSlider}`}
                        />
                    </div>
                </div>
            )}

            {/* Post-Trade Emotions */}
            {isPostTrade && (
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>How Do You Feel?</h4>

                    <div className={styles.sliderGroup}>
                        <label className={styles.sliderLabel}>
                            <span>Satisfaction</span>
                            <span className={styles.sliderValue}>
                                {EMOTION_SCALE.find(e => e.value === formData.post_satisfaction)?.label}
                            </span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            value={formData.post_satisfaction || 3}
                            onChange={(e) => setFormData(prev => ({ ...prev, post_satisfaction: parseInt(e.target.value) }))}
                            className={`${styles.slider} ${styles.satisfactionSlider}`}
                        />
                    </div>

                    <div className={styles.sliderGroup}>
                        <label className={styles.sliderLabel}>
                            <span>Regret</span>
                            <span className={styles.sliderValue}>
                                {EMOTION_SCALE.find(e => e.value === formData.post_regret)?.label}
                            </span>
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            value={formData.post_regret || 2}
                            onChange={(e) => setFormData(prev => ({ ...prev, post_regret: parseInt(e.target.value) }))}
                            className={`${styles.slider} ${styles.regretSlider}`}
                        />
                    </div>
                </div>
            )}

            {/* Discipline Score */}
            <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Discipline Score</h4>
                <div className={styles.sliderGroup}>
                    <label className={styles.sliderLabel}>
                        <span>How disciplined was this trade? (1-10)</span>
                        <span className={`${styles.sliderValue} ${styles.disciplineValue}`}>
                            {formData.discipline_score} - {DISCIPLINE_SCALE.find(d => d.value === formData.discipline_score)?.label}
                        </span>
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={formData.discipline_score}
                        onChange={(e) => setFormData(prev => ({ ...prev, discipline_score: parseInt(e.target.value) }))}
                        className={`${styles.slider} ${styles.disciplineSlider}`}
                    />
                </div>

                <div className={styles.checkboxGroup}>
                    <label className={styles.checkbox}>
                        <input
                            type="checkbox"
                            checked={formData.followed_plan}
                            onChange={(e) => setFormData(prev => ({ ...prev, followed_plan: e.target.checked }))}
                        />
                        <span>I followed my trading plan</span>
                    </label>
                </div>
            </div>

            {/* Mistakes */}
            <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Any Mistakes?</h4>
                <div className={styles.mistakeGrid}>
                    {MISTAKE_OPTIONS.map((mistake) => (
                        <button
                            key={mistake.value}
                            type="button"
                            onClick={() => toggleMistake(mistake.value)}
                            className={`${styles.mistakeChip} ${formData.mistakes.includes(mistake.value) ? styles.active : ''}`}
                        >
                            <span className={styles.mistakeIcon}>{mistake.icon}</span>
                            <span>{mistake.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Notes */}
            <div className={styles.section}>
                <h4 className={styles.sectionTitle}>Notes (optional)</h4>
                <textarea
                    className={styles.textarea}
                    placeholder="Any thoughts about your emotional state or this trade..."
                    value={formData.notes || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                />
            </div>

            {/* Actions */}
            <div className={styles.actions}>
                {onCancel && (
                    <button
                        type="button"
                        className={styles.cancelBtn}
                        onClick={onCancel}
                        disabled={isSaving}
                    >
                        Skip
                    </button>
                )}
                <button
                    type="button"
                    className={styles.saveBtn}
                    onClick={handleSubmit}
                    disabled={isSaving}
                >
                    {isSaving ? 'Saving...' : '💾 Save'}
                </button>
            </div>
        </div>
    );
}
