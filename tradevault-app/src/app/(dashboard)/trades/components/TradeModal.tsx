// =============================================
// CANDLE TRACE - TRADE MODAL WITH EMOTION LOGGING
// Add/Edit trade form modal with psychology tab
// =============================================

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Trade, Strategy, TradeFormData, TradeEmotionFormData, MistakeType } from '@/types';
import { getLocalDateString } from '@/lib/utils';
import { MISTAKE_OPTIONS, EMOTION_SCALE, DISCIPLINE_SCALE } from '@/types';
import { Modal } from '@/components/ui';
import styles from './TradeModal.module.css';

interface TradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: TradeFormData, emotionData?: TradeEmotionFormData) => Promise<void>;
    trade: Trade | null;
    strategies: Strategy[];
    isLoading: boolean;
}

export function TradeModal({
    isOpen,
    onClose,
    onSave,
    trade,
    strategies,
    isLoading,
}: TradeModalProps) {
    const [activeTab, setActiveTab] = useState<'trade' | 'emotions'>('trade');
    const [logEmotions, setLogEmotions] = useState(true);
    const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [emotionData, setEmotionData] = useState<TradeEmotionFormData>({
        pre_confidence: 3,
        pre_fear: 2,
        pre_greed: 2,
        pre_fomo: 2,
        post_satisfaction: 3,
        post_regret: 2,
        discipline_score: 7,
        followed_plan: true,
        mistakes: [],
        notes: '',
    });

    const { register, handleSubmit, reset, formState: { errors } } = useForm<TradeFormData>({
        defaultValues: {
            ticker: '',
            type: 'stock',
            side: 'long',
            entry_price: 0,
            exit_price: 0,
            quantity: 0,
            trade_date: getLocalDateString(),
            strategy_id: '',
            stop_loss: undefined,
            take_profit: undefined,
            category: undefined,
            market_condition: undefined,
            notes: '',
            entry_time: '',
            exit_time: '',
            mfe: undefined,
            mae: undefined,
            commission: undefined,
            fees: undefined,
        },
    });

    // Reset form when trade changes
    useEffect(() => {
        if (trade) {
            reset({
                ticker: trade.ticker,
                type: trade.type,
                side: trade.side,
                entry_price: trade.entry_price,
                exit_price: trade.exit_price,
                quantity: trade.quantity,
                trade_date: trade.trade_date,
                strategy_id: trade.strategy_id || '',
                stop_loss: trade.stop_loss ?? undefined,
                take_profit: trade.take_profit ?? undefined,
                category: trade.category ?? undefined,
                market_condition: trade.market_condition ?? undefined,
                notes: trade.notes || '',
                entry_time: trade.entry_time || '',
                exit_time: trade.exit_time || '',
                mfe: trade.mfe ?? undefined,
                mae: trade.mae ?? undefined,
                commission: trade.commission ?? undefined,
                fees: trade.fees ?? undefined,
            });
        } else {
            reset({
                ticker: '',
                type: 'stock',
                side: 'long',
                entry_price: 0,
                exit_price: 0,
                quantity: 0,
                trade_date: getLocalDateString(),
                strategy_id: '',
                stop_loss: undefined,
                take_profit: undefined,
                category: undefined,
                market_condition: undefined,
                notes: '',
                entry_time: '',
                exit_time: '',
                mfe: undefined,
                mae: undefined,
                commission: undefined,
                fees: undefined,
            });
            // Reset emotions for new trade
            setEmotionData({
                pre_confidence: 3,
                pre_fear: 2,
                pre_greed: 2,
                pre_fomo: 2,
                post_satisfaction: 3,
                post_regret: 2,
                discipline_score: 7,
                followed_plan: true,
                mistakes: [],
                notes: '',
            });
            // Reset screenshot for new trade
            setScreenshotFile(null);
            setScreenshotUrl(null);
        }
        setActiveTab('trade');
    }, [trade, reset]);

    const toggleMistake = (mistake: MistakeType) => {
        setEmotionData(prev => ({
            ...prev,
            mistakes: prev.mistakes.includes(mistake)
                ? prev.mistakes.filter(m => m !== mistake)
                : [...prev.mistakes, mistake],
        }));
    };

    const handleScreenshotSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setScreenshotFile(file);
            const url = URL.createObjectURL(file);
            setScreenshotUrl(url);
        }
    };

    const removeScreenshot = () => {
        setScreenshotFile(null);
        if (screenshotUrl && !screenshotUrl.startsWith('http')) {
            URL.revokeObjectURL(screenshotUrl);
        }
        setScreenshotUrl(null);
    };

    const onSubmit = async (data: TradeFormData) => {
        // Upload screenshot if there's a new file
        let uploadedScreenshotUrl = trade?.screenshot_url || null;

        if (screenshotFile) {
            setIsUploading(true);
            console.log('Starting screenshot upload...', {
                fileName: screenshotFile.name,
                size: screenshotFile.size,
                type: screenshotFile.type
            });
            try {
                const formData = new FormData();
                formData.append('file', screenshotFile);
                formData.append('tradeId', trade?.id || 'new');

                const res = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                console.log('Upload response status:', res.status);

                if (res.ok) {
                    const json = await res.json();
                    console.log('Upload successful! URL:', json.url);
                    uploadedScreenshotUrl = json.url;
                } else {
                    const errorText = await res.text();
                    console.error('Upload failed:', res.status, errorText);
                    alert('Screenshot upload failed: ' + errorText);
                }
            } catch (error) {
                console.error('Failed to upload screenshot:', error);
                alert('Screenshot upload error: ' + (error as Error).message);
            }
            setIsUploading(false);
        }

        // Clean up optional fields
        const cleanData = {
            ...data,
            strategy_id: data.strategy_id || null,
            stop_loss: data.stop_loss || null,
            take_profit: data.take_profit || null,
            category: data.category || null,
            market_condition: data.market_condition || null,
            notes: data.notes || null,
            entry_time: data.entry_time || null,
            exit_time: data.exit_time || null,
            mfe: data.mfe || null,
            mae: data.mae || null,
            commission: data.commission || null,
            fees: data.fees || null,
            screenshot_url: uploadedScreenshotUrl,
        };
        await onSave(cleanData as TradeFormData, logEmotions ? emotionData : undefined);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={trade ? '✏️ Edit Trade' : '➕ Add Trade'}
            size="lg"
        >
            {/* Tabs */}
            <div className={styles.tabs}>
                <button
                    type="button"
                    className={`${styles.tab} ${activeTab === 'trade' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('trade')}
                >
                    📊 Trade Details
                </button>
                <button
                    type="button"
                    className={`${styles.tab} ${activeTab === 'emotions' ? styles.activeTab : ''}`}
                    onClick={() => setActiveTab('emotions')}
                >
                    🧠 Psychology
                </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                {/* Trade Details Tab */}
                {activeTab === 'trade' && (
                    <>
                        {/* Row 1: Ticker, Type, Side */}
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.label}>🎫 Ticker *</label>
                                <input
                                    {...register('ticker', { required: 'Ticker is required' })}
                                    className={styles.input}
                                    placeholder="AAPL"
                                />
                                {errors.ticker && <span className={styles.error}>{errors.ticker.message}</span>}
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>🏷️ Type</label>
                                <select {...register('type')} className={styles.select}>
                                    <option value="stock">🏢 Stock</option>
                                    <option value="crypto">🪙 Crypto</option>
                                    <option value="forex">💱 Forex</option>
                                    <option value="options">📜 Options</option>
                                    <option value="futures">⏳ Futures</option>
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>↕️ Side</label>
                                <select {...register('side')} className={styles.select}>
                                    <option value="long">🟢 Long</option>
                                    <option value="short">🔴 Short</option>
                                </select>
                            </div>
                        </div>

                        {/* Row 2: Entry, Exit, Quantity */}
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.label}>📥 Entry Price *</label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    {...register('entry_price', {
                                        required: 'Entry price is required',
                                        valueAsNumber: true,
                                        min: { value: 0.000001, message: 'Must be positive' }
                                    })}
                                    className={styles.input}
                                    placeholder="100.00"
                                />
                                {errors.entry_price && <span className={styles.error}>{errors.entry_price.message}</span>}
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>📤 Exit Price *</label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    {...register('exit_price', {
                                        required: 'Exit price is required',
                                        valueAsNumber: true,
                                        min: { value: 0.000001, message: 'Must be positive' }
                                    })}
                                    className={styles.input}
                                    placeholder="110.00"
                                />
                                {errors.exit_price && <span className={styles.error}>{errors.exit_price.message}</span>}
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>🔢 Quantity *</label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    {...register('quantity', {
                                        required: 'Quantity is required',
                                        valueAsNumber: true,
                                        min: { value: 0.000001, message: 'Must be positive' }
                                    })}
                                    className={styles.input}
                                    placeholder="10"
                                />
                                {errors.quantity && <span className={styles.error}>{errors.quantity.message}</span>}
                            </div>
                        </div>

                        {/* Row 3: Date, Strategy */}
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.label}>📅 Trade Date *</label>
                                <input
                                    type="date"
                                    {...register('trade_date', { required: 'Date is required' })}
                                    className={styles.input}
                                />
                                {errors.trade_date && <span className={styles.error}>{errors.trade_date.message}</span>}
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>🕐 Entry Time</label>
                                <input
                                    type="time"
                                    {...register('entry_time')}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>🕐 Exit Time</label>
                                <input
                                    type="time"
                                    {...register('exit_time')}
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        {/* Row 4: Strategy */}
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.label}>♟️ Strategy</label>
                                <select {...register('strategy_id')} className={styles.select}>
                                    <option value="">No Strategy</option>
                                    {strategies.map(s => (
                                        <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Row 5: Stop Loss, Take Profit */}
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.label}>🛑 Stop Loss</label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    {...register('stop_loss', { valueAsNumber: true })}
                                    className={styles.input}
                                    placeholder="Optional"
                                />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>🎯 Take Profit</label>
                                <input
                                    type="number"
                                    step="0.000001"
                                    {...register('take_profit', { valueAsNumber: true })}
                                    className={styles.input}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>

                        {/* Row 6: MFE, MAE */}
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.label}>📈 MFE (Max Favorable)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('mfe', { valueAsNumber: true })}
                                    className={styles.input}
                                    placeholder="Optional"
                                />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>📉 MAE (Max Adverse)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('mae', { valueAsNumber: true })}
                                    className={styles.input}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>

                        {/* Row 7: Commission, Fees */}
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.label}>💵 Commission</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('commission', { valueAsNumber: true })}
                                    className={styles.input}
                                    placeholder="Optional"
                                />
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>💰 Fees</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    {...register('fees', { valueAsNumber: true })}
                                    className={styles.input}
                                    placeholder="Optional"
                                />
                            </div>
                        </div>

                        {/* Row 5: Category, Market Condition */}
                        <div className={styles.row}>
                            <div className={styles.field}>
                                <label className={styles.label}>📂 Category</label>
                                <select {...register('category')} className={styles.select}>
                                    <option value="">Select Category</option>
                                    <option value="scalp">⚡ Scalp</option>
                                    <option value="day">☀️ Day Trade</option>
                                    <option value="swing">🌊 Swing</option>
                                    <option value="position">🗓️ Position</option>
                                </select>
                            </div>
                            <div className={styles.field}>
                                <label className={styles.label}>🌡️ Market Condition</label>
                                <select {...register('market_condition')} className={styles.select}>
                                    <option value="">Select Condition</option>
                                    <option value="bullish">📈 Bullish</option>
                                    <option value="bearish">📉 Bearish</option>
                                    <option value="choppy">🌪️ Choppy</option>
                                    <option value="ranging">↔️ Ranging</option>
                                </select>
                            </div>
                        </div>

                        {/* Notes */}
                        <div className={styles.field}>
                            <label className={styles.label}>📝 Notes</label>
                            <textarea
                                {...register('notes')}
                                className={styles.textarea}
                                placeholder="Trade notes, reasoning, lessons learned..."
                                rows={3}
                            />
                        </div>

                        {/* Screenshot Upload */}
                        <div className={styles.field}>
                            <label className={styles.label}>📷 Trade Screenshot</label>
                            {(screenshotUrl || trade?.screenshot_url) ? (
                                <div className={styles.screenshotPreview}>
                                    <img
                                        src={screenshotUrl || trade?.screenshot_url || ''}
                                        alt="Trade chart"
                                        className={styles.screenshotImg}
                                    />
                                    <button
                                        type="button"
                                        className={styles.removeScreenshot}
                                        onClick={removeScreenshot}
                                    >
                                        ✕ Remove
                                    </button>
                                </div>
                            ) : (
                                <label className={styles.uploadZone}>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp,image/gif"
                                        onChange={handleScreenshotSelect}
                                        hidden
                                    />
                                    <span className={styles.uploadIcon}>📤</span>
                                    <span className={styles.uploadText}>Click to upload chart screenshot</span>
                                    <span className={styles.uploadHint}>JPG, PNG, WebP, GIF • Max 2MB</span>
                                </label>
                            )}
                        </div>
                    </>
                )}

                {/* Psychology Tab */}
                {activeTab === 'emotions' && (
                    <div className={styles.emotionsTab}>
                        <div className={styles.emotionToggle}>
                            <label className={styles.toggleLabel}>
                                <input
                                    type="checkbox"
                                    checked={logEmotions}
                                    onChange={(e) => setLogEmotions(e.target.checked)}
                                />
                                <span>Log emotions for this trade</span>
                            </label>
                            <p className={styles.toggleHint}>Enable to track your psychology and build your discipline score</p>
                        </div>

                        {logEmotions && (
                            <>
                                {/* Pre-Trade Emotions */}
                                <div className={styles.emotionSection}>
                                    <h4 className={styles.emotionSectionTitle}>Pre-Trade Mindset</h4>

                                    <div className={styles.sliderRow}>
                                        <label>Confidence</label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="5"
                                            value={emotionData.pre_confidence}
                                            onChange={(e) => setEmotionData(p => ({ ...p, pre_confidence: parseInt(e.target.value) }))}
                                            className={styles.emotionSlider}
                                        />
                                        <span className={styles.sliderValue}>{EMOTION_SCALE.find(e => e.value === emotionData.pre_confidence)?.label}</span>
                                    </div>

                                    <div className={styles.sliderRow}>
                                        <label>Fear</label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="5"
                                            value={emotionData.pre_fear}
                                            onChange={(e) => setEmotionData(p => ({ ...p, pre_fear: parseInt(e.target.value) }))}
                                            className={`${styles.emotionSlider} ${styles.fearSlider}`}
                                        />
                                        <span className={styles.sliderValue}>{EMOTION_SCALE.find(e => e.value === emotionData.pre_fear)?.label}</span>
                                    </div>

                                    <div className={styles.sliderRow}>
                                        <label>Greed</label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="5"
                                            value={emotionData.pre_greed}
                                            onChange={(e) => setEmotionData(p => ({ ...p, pre_greed: parseInt(e.target.value) }))}
                                            className={`${styles.emotionSlider} ${styles.greedSlider}`}
                                        />
                                        <span className={styles.sliderValue}>{EMOTION_SCALE.find(e => e.value === emotionData.pre_greed)?.label}</span>
                                    </div>

                                    <div className={styles.sliderRow}>
                                        <label>FOMO</label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="5"
                                            value={emotionData.pre_fomo}
                                            onChange={(e) => setEmotionData(p => ({ ...p, pre_fomo: parseInt(e.target.value) }))}
                                            className={`${styles.emotionSlider} ${styles.fomoSlider}`}
                                        />
                                        <span className={styles.sliderValue}>{EMOTION_SCALE.find(e => e.value === emotionData.pre_fomo)?.label}</span>
                                    </div>
                                </div>

                                {/* Post-Trade Emotions */}
                                <div className={styles.emotionSection}>
                                    <h4 className={styles.emotionSectionTitle}>Post-Trade Reflection</h4>

                                    <div className={styles.sliderRow}>
                                        <label>Satisfaction</label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="5"
                                            value={emotionData.post_satisfaction || 3}
                                            onChange={(e) => setEmotionData(p => ({ ...p, post_satisfaction: parseInt(e.target.value) }))}
                                            className={`${styles.emotionSlider} ${styles.satisfactionSlider}`}
                                        />
                                        <span className={styles.sliderValue}>{EMOTION_SCALE.find(e => e.value === (emotionData.post_satisfaction || 3))?.label}</span>
                                    </div>

                                    <div className={styles.sliderRow}>
                                        <label>Regret</label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="5"
                                            value={emotionData.post_regret || 2}
                                            onChange={(e) => setEmotionData(p => ({ ...p, post_regret: parseInt(e.target.value) }))}
                                            className={`${styles.emotionSlider} ${styles.regretSlider}`}
                                        />
                                        <span className={styles.sliderValue}>{EMOTION_SCALE.find(e => e.value === (emotionData.post_regret || 2))?.label}</span>
                                    </div>
                                </div>

                                {/* Discipline */}
                                <div className={styles.emotionSection}>
                                    <h4 className={styles.emotionSectionTitle}>Discipline Score</h4>

                                    <div className={styles.sliderRow}>
                                        <label>Discipline (1-10)</label>
                                        <input
                                            type="range"
                                            min="1"
                                            max="10"
                                            value={emotionData.discipline_score}
                                            onChange={(e) => setEmotionData(p => ({ ...p, discipline_score: parseInt(e.target.value) }))}
                                            className={styles.emotionSlider}
                                        />
                                        <span className={styles.sliderValue}>
                                            {emotionData.discipline_score} - {DISCIPLINE_SCALE.find(d => d.value === emotionData.discipline_score)?.label}
                                        </span>
                                    </div>

                                    <label className={styles.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            checked={emotionData.followed_plan}
                                            onChange={(e) => setEmotionData(p => ({ ...p, followed_plan: e.target.checked }))}
                                        />
                                        <span>I followed my trading plan</span>
                                    </label>
                                </div>

                                {/* Mistakes */}
                                <div className={styles.emotionSection}>
                                    <h4 className={styles.emotionSectionTitle}>Any Mistakes?</h4>
                                    <div className={styles.mistakeGrid}>
                                        {MISTAKE_OPTIONS.map((mistake) => (
                                            <button
                                                key={mistake.value}
                                                type="button"
                                                onClick={() => toggleMistake(mistake.value)}
                                                className={`${styles.mistakeChip} ${emotionData.mistakes.includes(mistake.value) ? styles.activeMistake : ''}`}
                                            >
                                                <span>{mistake.icon}</span>
                                                <span>{mistake.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Emotion Notes */}
                                <div className={styles.field}>
                                    <label className={styles.label}>🧠 Psychology Notes</label>
                                    <textarea
                                        value={emotionData.notes || ''}
                                        onChange={(e) => setEmotionData(p => ({ ...p, notes: e.target.value }))}
                                        className={styles.textarea}
                                        placeholder="Any thoughts about your emotional state..."
                                        rows={2}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* Actions */}
                <div className={styles.actions}>
                    <button type="button" onClick={onClose} className={styles.cancelBtn}>
                        Cancel
                    </button>
                    <button type="submit" className={styles.saveBtn} disabled={isLoading}>
                        {isLoading ? 'Saving...' : (trade ? 'Update Trade' : 'Add Trade')}
                        {logEmotions && activeTab === 'trade' && ' + Emotions'}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
