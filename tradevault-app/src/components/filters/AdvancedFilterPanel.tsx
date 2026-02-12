// =============================================
// CANDLE TRACE - ADVANCED FILTER PANEL
// Comprehensive filtering for trades
// =============================================

'use client';

import { useState, useEffect } from 'react';
import { TradeTag, TradeType, TradeCategory, MarketCondition, AdvancedTradeFilters, Strategy } from '@/types';
import styles from './AdvancedFilterPanel.module.css';

interface Props {
    filters: AdvancedTradeFilters;
    onFiltersChange: (filters: AdvancedTradeFilters) => void;
    strategies: Strategy[];
    onReset: () => void;
}

const TRADE_TYPES: TradeType[] = ['stock', 'crypto', 'forex', 'options', 'futures'];
const CATEGORIES: TradeCategory[] = ['scalp', 'day', 'swing', 'position'];
const MARKET_CONDITIONS: MarketCondition[] = ['bullish', 'bearish', 'choppy', 'ranging'];

export function AdvancedFilterPanel({ filters, onFiltersChange, strategies, onReset }: Props) {
    const [tags, setTags] = useState<TradeTag[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isLoadingTags, setIsLoadingTags] = useState(true);

    useEffect(() => {
        fetchTags();
    }, []);

    const fetchTags = async () => {
        try {
            const res = await fetch('/api/tags');
            const { data } = await res.json();
            setTags(data || []);
        } catch (error) {
            console.error('Failed to fetch tags:', error);
        } finally {
            setIsLoadingTags(false);
        }
    };

    const updateFilter = <K extends keyof AdvancedTradeFilters>(
        key: K,
        value: AdvancedTradeFilters[K]
    ) => {
        onFiltersChange({ ...filters, [key]: value });
    };

    const toggleTag = (tagId: string) => {
        const newTags = filters.tags.includes(tagId)
            ? filters.tags.filter(id => id !== tagId)
            : [...filters.tags, tagId];
        updateFilter('tags', newTags);
    };

    const hasActiveFilters =
        filters.search ||
        filters.type ||
        filters.strategy ||
        filters.result ||
        filters.fromDate ||
        filters.toDate ||
        filters.tags.length > 0 ||
        filters.minPnl !== null ||
        filters.maxPnl !== null ||
        filters.category ||
        filters.marketCondition ||
        filters.hasScreenshot !== null;

    return (
        <div className={styles.container}>
            {/* Quick Filters Row */}
            <div className={styles.quickFilters}>
                <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="🔍 Search ticker..."
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                />

                <select
                    className={styles.select}
                    value={filters.type}
                    onChange={(e) => updateFilter('type', e.target.value as TradeType | '')}
                >
                    <option value="">All Types</option>
                    {TRADE_TYPES.map(type => (
                        <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                </select>

                <select
                    className={styles.select}
                    value={filters.result}
                    onChange={(e) => updateFilter('result', e.target.value as 'win' | 'loss' | '')}
                >
                    <option value="">All Results</option>
                    <option value="win">✅ Winners</option>
                    <option value="loss">❌ Losers</option>
                </select>

                <button
                    className={`${styles.expandButton} ${isExpanded ? styles.active : ''}`}
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    {isExpanded ? '▼ Less Filters' : '▶ More Filters'}
                </button>

                {hasActiveFilters && (
                    <button className={styles.resetButton} onClick={onReset}>
                        ✕ Reset
                    </button>
                )}
            </div>

            {/* Expanded Filters */}
            {isExpanded && (
                <div className={styles.expandedFilters}>
                    {/* Date Range */}
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Date Range</label>
                        <div className={styles.dateRange}>
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={filters.fromDate}
                                onChange={(e) => updateFilter('fromDate', e.target.value)}
                            />
                            <span className={styles.dateSeparator}>to</span>
                            <input
                                type="date"
                                className={styles.dateInput}
                                value={filters.toDate}
                                onChange={(e) => updateFilter('toDate', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Strategy */}
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Strategy</label>
                        <select
                            className={styles.select}
                            value={filters.strategy}
                            onChange={(e) => updateFilter('strategy', e.target.value)}
                        >
                            <option value="">All Strategies</option>
                            {strategies.map(s => (
                                <option key={s.id} value={s.id}>{s.icon} {s.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Category */}
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Category</label>
                        <select
                            className={styles.select}
                            value={filters.category}
                            onChange={(e) => updateFilter('category', e.target.value as TradeCategory | '')}
                        >
                            <option value="">All Categories</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Market Condition */}
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Market Condition</label>
                        <select
                            className={styles.select}
                            value={filters.marketCondition}
                            onChange={(e) => updateFilter('marketCondition', e.target.value as MarketCondition | '')}
                        >
                            <option value="">All Conditions</option>
                            {MARKET_CONDITIONS.map(cond => (
                                <option key={cond} value={cond}>{cond.charAt(0).toUpperCase() + cond.slice(1)}</option>
                            ))}
                        </select>
                    </div>

                    {/* P&L Range */}
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>P&L Range ($)</label>
                        <div className={styles.pnlRange}>
                            <input
                                type="number"
                                className={styles.pnlInput}
                                placeholder="Min"
                                value={filters.minPnl ?? ''}
                                onChange={(e) => updateFilter('minPnl', e.target.value ? Number(e.target.value) : null)}
                            />
                            <span className={styles.dateSeparator}>-</span>
                            <input
                                type="number"
                                className={styles.pnlInput}
                                placeholder="Max"
                                value={filters.maxPnl ?? ''}
                                onChange={(e) => updateFilter('maxPnl', e.target.value ? Number(e.target.value) : null)}
                            />
                        </div>
                    </div>

                    {/* Tags */}
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Tags</label>
                        <div className={styles.tagsContainer}>
                            {isLoadingTags ? (
                                <span className={styles.loadingText}>Loading tags...</span>
                            ) : tags.length === 0 ? (
                                <span className={styles.noTags}>No tags created yet</span>
                            ) : (
                                tags.map(tag => (
                                    <button
                                        key={tag.id}
                                        className={`${styles.tagChip} ${filters.tags.includes(tag.id) ? styles.tagActive : ''}`}
                                        style={{
                                            borderColor: tag.color,
                                            backgroundColor: filters.tags.includes(tag.id) ? tag.color : 'transparent'
                                        }}
                                        onClick={() => toggleTag(tag.id)}
                                    >
                                        {tag.name}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Sort Options */}
                    <div className={styles.filterGroup}>
                        <label className={styles.filterLabel}>Sort By</label>
                        <div className={styles.sortContainer}>
                            <select
                                className={styles.select}
                                value={filters.sortBy}
                                onChange={(e) => updateFilter('sortBy', e.target.value as AdvancedTradeFilters['sortBy'])}
                            >
                                <option value="trade_date">Trade Date</option>
                                <option value="pnl">P&L</option>
                                <option value="ticker">Ticker</option>
                                <option value="created_at">Created At</option>
                            </select>
                            <button
                                className={styles.sortOrder}
                                onClick={() => updateFilter('sortOrder', filters.sortOrder === 'asc' ? 'desc' : 'asc')}
                            >
                                {filters.sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
