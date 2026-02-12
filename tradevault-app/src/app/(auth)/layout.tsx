// =============================================
// CANDLE TRACE - AUTH LAYOUT
// =============================================

import styles from './layout.module.css';

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className={styles.authContainer}>
            <div className={styles.authCard}>
                <div className={styles.logo}>
                    <img src="/CandleTrace_logo.svg" alt="Candle Trace" width={32} height={32} className={styles.logoIcon} />
                    <span className={styles.logoText}>Candle Trace</span>
                </div>
                {children}
            </div>
        </div>
    );
}
