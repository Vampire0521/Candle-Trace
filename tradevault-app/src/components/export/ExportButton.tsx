// =============================================
// CANDLE TRACE - EXPORT BUTTON COMPONENT
// Download trades as CSV
// =============================================

'use client';

import { useState } from 'react';
import styles from './ExportButton.module.css';

interface Props {
    fromDate?: string;
    toDate?: string;
}

export function ExportButton({ fromDate, toDate }: Props) {
    const [isExporting, setIsExporting] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [dateRange, setDateRange] = useState({
        from: fromDate || '',
        to: toDate || '',
    });

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const params = new URLSearchParams();
            if (dateRange.from) params.set('from', dateRange.from);
            if (dateRange.to) params.set('to', dateRange.to);
            params.set('format', 'csv');

            const response = await fetch(`/api/export?${params.toString()}`);

            if (!response.ok) {
                const { error } = await response.json();
                throw new Error(error || 'Export failed');
            }

            // Download the CSV
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `candletrace_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            setShowModal(false);
        } catch (error) {
            console.error('Export error:', error);
            alert(error instanceof Error ? error.message : 'Export failed');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <button
                className={styles.exportButton}
                onClick={() => setShowModal(true)}
            >
                📥 Export
            </button>

            {showModal && (
                <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
                    <div className={styles.modal} onClick={e => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>Export Trades</h3>
                        <p className={styles.modalSubtitle}>Download your trades as a CSV file</p>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Date Range (optional)</label>
                            <div className={styles.dateInputs}>
                                <input
                                    type="date"
                                    className={styles.dateInput}
                                    placeholder="From"
                                    value={dateRange.from}
                                    onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                                />
                                <span className={styles.dateSeparator}>to</span>
                                <input
                                    type="date"
                                    className={styles.dateInput}
                                    placeholder="To"
                                    value={dateRange.to}
                                    onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                                />
                            </div>
                            <p className={styles.hint}>Leave empty to export all trades</p>
                        </div>

                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelButton}
                                onClick={() => setShowModal(false)}
                                disabled={isExporting}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.downloadButton}
                                onClick={handleExport}
                                disabled={isExporting}
                            >
                                {isExporting ? 'Exporting...' : '📥 Download CSV'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
