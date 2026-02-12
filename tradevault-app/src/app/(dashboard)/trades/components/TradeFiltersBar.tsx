// =============================================
// CANDLE TRACE - TRADE FILTERS BAR
// =============================================

'use client';

import type { TradeFilters, Strategy, TradeType } from '@/types';
import styles from './TradeFiltersBar.module.css';

interface TradeFiltersBarProps {
    filters: TradeFilters;
    setFilters: React.Dispatch<React.SetStateAction<TradeFilters>>;
    strategies: Strategy[];
}

const tradeTypes: { value: TradeType | ''; label: string }[] = [
    { value: '', label: 'All Types' },
    { value: 'stock', label: 'Stock' },
    { value: 'crypto', label: 'Crypto' },
    { value: 'forex', label: 'Forex' },
    { value: 'options', label: 'Options' },
    { value: 'futures', label: 'Futures' },
];

export function TradeFiltersBar({ filters, setFilters, strategies }: TradeFiltersBarProps) {
    const handleChange = (key: keyof TradeFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            type: '',
            strategy: '',
            result: '',
            fromDate: '',
            toDate: '',
        });
    };

    const hasFilters = Object.values(filters).some(v => v !== '');

    return (
        <div className={styles.filtersBar}>
            {/* Search */}
            <div className={styles.searchWrapper}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                    type="text"
                    placeholder="Search ticker..."
                    value={filters.search}
                    onChange={(e) => handleChange('search', e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            {/* Type Filter */}
            <select
                value={filters.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className={styles.select}
            >
                {tradeTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                ))}
            </select>

            {/* Strategy Filter */}
            <select
                value={filters.strategy}
                onChange={(e) => handleChange('strategy', e.target.value)}
                className={styles.select}
            >
                <option value="">All Strategies</option>
                {strategies.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                ))}
            </select>

            {/* Result Filter */}
            <select
                value={filters.result}
                onChange={(e) => handleChange('result', e.target.value)}
                className={styles.select}
            >
                <option value="">All Results</option>
                <option value="win">Winners</option>
                <option value="loss">Losers</option>
            </select>

            {/* Date Range */}
            <input
                type="date"
                value={filters.fromDate}
                onChange={(e) => handleChange('fromDate', e.target.value)}
                className={styles.dateInput}
                placeholder="From"
            />
            <input
                type="date"
                value={filters.toDate}
                onChange={(e) => handleChange('toDate', e.target.value)}
                className={styles.dateInput}
                placeholder="To"
            />

            {/* Clear Filters */}
            {hasFilters && (
                <button className={styles.clearBtn} onClick={clearFilters}>
                    ✕ Clear
                </button>
            )}
        </div>
    );
}
