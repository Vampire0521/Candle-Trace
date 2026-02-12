// =============================================
// CANDLE TRACE - DASHBOARD LOADING STATE
// =============================================

import styles from './loading.module.css';

export default function DashboardLoading() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.skeleton} style={{ width: '200px', height: '32px' }} />
            </div>

            {/* Stats Grid Skeleton */}
            <div className={styles.statsGrid}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={styles.statCard}>
                        <div className={styles.skeleton} style={{ width: '60%', height: '14px', marginBottom: '12px' }} />
                        <div className={styles.skeleton} style={{ width: '80%', height: '28px' }} />
                    </div>
                ))}
            </div>

            {/* Charts Skeleton */}
            <div className={styles.chartsGrid}>
                <div className={styles.chartCard}>
                    <div className={styles.skeleton} style={{ width: '150px', height: '20px', marginBottom: '16px' }} />
                    <div className={styles.skeleton} style={{ width: '100%', height: '200px' }} />
                </div>
                <div className={styles.chartCard}>
                    <div className={styles.skeleton} style={{ width: '150px', height: '20px', marginBottom: '16px' }} />
                    <div className={styles.skeleton} style={{ width: '100%', height: '200px' }} />
                </div>
            </div>

            {/* Table Skeleton */}
            <div className={styles.tableCard}>
                <div className={styles.skeleton} style={{ width: '150px', height: '20px', marginBottom: '16px' }} />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className={styles.tableRow}>
                        <div className={styles.skeleton} style={{ width: '15%', height: '16px' }} />
                        <div className={styles.skeleton} style={{ width: '10%', height: '16px' }} />
                        <div className={styles.skeleton} style={{ width: '10%', height: '16px' }} />
                        <div className={styles.skeleton} style={{ width: '12%', height: '16px' }} />
                        <div className={styles.skeleton} style={{ width: '12%', height: '16px' }} />
                        <div className={styles.skeleton} style={{ width: '15%', height: '16px' }} />
                    </div>
                ))}
            </div>
        </div>
    );
}
