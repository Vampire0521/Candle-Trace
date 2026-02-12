// =============================================
// CANDLE TRACE - RISK CALCULATOR PAGE
// All 3 calculators visible in a grid
// =============================================

'use client';

import { useState } from 'react';
import {
    calculatePositionSize,
    calculateRiskReward,
    calculateKelly,
    formatCurrency,
} from '@/lib/utils';
import type {
    PositionSizeInputs,
    RiskRewardInputs,
    KellyInputs,
    PositionSizeResult,
    RiskRewardResult,
    KellyResult,
} from '@/types';
import styles from './page.module.css';

export default function CalculatorPage() {
    // Position Size Calculator
    const [positionInputs, setPositionInputs] = useState<PositionSizeInputs>({
        accountBalance: 10000,
        riskPercent: 2,
        entryPrice: 100,
        stopLoss: 95,
    });
    const [positionResult, setPositionResult] = useState<PositionSizeResult | null>(null);

    // Risk/Reward Calculator
    const [rrInputs, setRRInputs] = useState<RiskRewardInputs>({
        entryPrice: 100,
        stopLoss: 95,
        takeProfit: 115,
    });
    const [rrResult, setRRResult] = useState<RiskRewardResult | null>(null);

    // Kelly Calculator
    const [kellyInputs, setKellyInputs] = useState<KellyInputs>({
        winRate: 55,
        avgWin: 150,
        avgLoss: 100,
    });
    const [kellyResult, setKellyResult] = useState<KellyResult | null>(null);

    const handlePositionCalculate = () => {
        const result = calculatePositionSize(positionInputs);
        setPositionResult(result);
    };

    const handleRRCalculate = () => {
        const result = calculateRiskReward(rrInputs);
        setRRResult(result);
    };

    const handleKellyCalculate = () => {
        const result = calculateKelly(kellyInputs);
        setKellyResult(result);
    };

    return (
        <div className={styles.container}>
            <div className={styles.pageHeader}>
                <h1 className={styles.pageTitle}>Risk Calculators</h1>
                <p className={styles.pageDesc}>Professional risk management tools for informed trading decisions.</p>
            </div>

            <div className={styles.calculatorsGrid}>
                {/* Position Size Calculator */}
                <div className={styles.calculatorCard}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardIcon}>📐</span>
                        <div>
                            <h2 className={styles.cardTitle}>Position Sizer</h2>
                            <p className={styles.cardDesc}>Calculate optimal position size based on risk tolerance.</p>
                        </div>
                    </div>

                    <div className={styles.form}>
                        <div className={styles.field}>
                            <label>Account Balance ($)</label>
                            <input
                                type="number"
                                value={positionInputs.accountBalance}
                                onChange={(e) => setPositionInputs(prev => ({ ...prev, accountBalance: parseFloat(e.target.value) || 0 }))}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Risk Per Trade (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={positionInputs.riskPercent}
                                onChange={(e) => setPositionInputs(prev => ({ ...prev, riskPercent: parseFloat(e.target.value) || 0 }))}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.fieldRow}>
                            <div className={styles.field}>
                                <label>Entry Price ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={positionInputs.entryPrice}
                                    onChange={(e) => setPositionInputs(prev => ({ ...prev, entryPrice: parseFloat(e.target.value) || 0 }))}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Stop Loss ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={positionInputs.stopLoss}
                                    onChange={(e) => setPositionInputs(prev => ({ ...prev, stopLoss: parseFloat(e.target.value) || 0 }))}
                                    className={styles.input}
                                />
                            </div>
                        </div>
                        <button className={styles.calculateBtn} onClick={handlePositionCalculate}>
                            Calculate Position
                        </button>
                    </div>

                    {positionResult && (
                        <div className={styles.results}>
                            <div className={styles.resultItem}>
                                <span className={styles.resultLabel}>Risk Amount</span>
                                <span className={styles.resultValue}>{formatCurrency(positionResult.riskAmount)}</span>
                            </div>
                            <div className={styles.resultItem}>
                                <span className={styles.resultLabel}>Position Size</span>
                                <span className={`${styles.resultValue} ${styles.highlight}`}>{positionResult.positionSize.toFixed(2)} shares</span>
                            </div>
                            <div className={styles.resultItem}>
                                <span className={styles.resultLabel}>Position Value</span>
                                <span className={styles.resultValue}>{formatCurrency(positionResult.positionValue)}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Risk/Reward Calculator */}
                <div className={styles.calculatorCard}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardIcon}>⚖️</span>
                        <div>
                            <h2 className={styles.cardTitle}>Risk/Reward</h2>
                            <p className={styles.cardDesc}>Analyze your trade&apos;s risk-to-reward ratio.</p>
                        </div>
                    </div>

                    <div className={styles.form}>
                        <div className={styles.field}>
                            <label>Entry Price ($)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={rrInputs.entryPrice}
                                onChange={(e) => setRRInputs(prev => ({ ...prev, entryPrice: parseFloat(e.target.value) || 0 }))}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.fieldRow}>
                            <div className={styles.field}>
                                <label>Stop Loss ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={rrInputs.stopLoss}
                                    onChange={(e) => setRRInputs(prev => ({ ...prev, stopLoss: parseFloat(e.target.value) || 0 }))}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Take Profit ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={rrInputs.takeProfit}
                                    onChange={(e) => setRRInputs(prev => ({ ...prev, takeProfit: parseFloat(e.target.value) || 0 }))}
                                    className={styles.input}
                                />
                            </div>
                        </div>
                        <button className={styles.calculateBtn} onClick={handleRRCalculate}>
                            Calculate R:R
                        </button>
                    </div>

                    {rrResult && (
                        <div className={styles.results}>
                            <div className={styles.resultItem}>
                                <span className={styles.resultLabel}>Risk</span>
                                <span className={`${styles.resultValue} ${styles.negative}`}>
                                    {formatCurrency(rrResult.risk)} ({rrResult.riskPercent.toFixed(2)}%)
                                </span>
                            </div>
                            <div className={styles.resultItem}>
                                <span className={styles.resultLabel}>Reward</span>
                                <span className={`${styles.resultValue} ${styles.positive}`}>
                                    {formatCurrency(rrResult.reward)} ({rrResult.rewardPercent.toFixed(2)}%)
                                </span>
                            </div>
                            <div className={styles.resultItem}>
                                <span className={styles.resultLabel}>R:R Ratio</span>
                                <span className={`${styles.resultValue} ${styles.highlight}`}>
                                    1:{rrResult.ratio.toFixed(2)}
                                </span>
                            </div>
                            <div className={styles.rrVisual}>
                                <div className={styles.rrBar}>
                                    <div className={styles.rrRisk} style={{ flex: 1 }}>RISK</div>
                                    <div className={styles.rrReward} style={{ flex: rrResult.ratio }}>REWARD</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Kelly Criterion Calculator */}
                <div className={styles.calculatorCard}>
                    <div className={styles.cardHeader}>
                        <span className={styles.cardIcon}>📊</span>
                        <div>
                            <h2 className={styles.cardTitle}>Kelly Criterion</h2>
                            <p className={styles.cardDesc}>Optimal bet sizing based on historical performance.</p>
                        </div>
                    </div>

                    <div className={styles.form}>
                        <div className={styles.field}>
                            <label>Win Rate (%)</label>
                            <input
                                type="number"
                                step="0.1"
                                value={kellyInputs.winRate}
                                onChange={(e) => setKellyInputs(prev => ({ ...prev, winRate: parseFloat(e.target.value) || 0 }))}
                                className={styles.input}
                            />
                        </div>
                        <div className={styles.fieldRow}>
                            <div className={styles.field}>
                                <label>Avg Win ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={kellyInputs.avgWin}
                                    onChange={(e) => setKellyInputs(prev => ({ ...prev, avgWin: parseFloat(e.target.value) || 0 }))}
                                    className={styles.input}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Avg Loss ($)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={kellyInputs.avgLoss}
                                    onChange={(e) => setKellyInputs(prev => ({ ...prev, avgLoss: parseFloat(e.target.value) || 0 }))}
                                    className={styles.input}
                                />
                            </div>
                        </div>
                        <button className={styles.calculateBtn} onClick={handleKellyCalculate}>
                            Calculate Kelly
                        </button>
                    </div>

                    {kellyResult && (
                        <div className={styles.results}>
                            <div className={styles.resultItem}>
                                <span className={styles.resultLabel}>Full Kelly %</span>
                                <span className={styles.resultValue}>{kellyResult.kellyPercent.toFixed(2)}%</span>
                            </div>
                            <div className={styles.resultItem}>
                                <span className={styles.resultLabel}>Half Kelly (Recommended)</span>
                                <span className={`${styles.resultValue} ${styles.highlight}`}>{kellyResult.halfKellyPercent.toFixed(2)}%</span>
                            </div>
                            <div className={styles.kellyNote}>
                                <strong>💡 Pro Tip:</strong> Most traders use Half Kelly to reduce volatility.
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
