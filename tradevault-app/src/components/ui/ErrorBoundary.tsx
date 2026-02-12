// =============================================
// CANDLE TRACE - ERROR BOUNDARY COMPONENT
// Catches React errors and displays fallback UI
// =============================================

'use client';

import { Component, ReactNode } from 'react';
import styles from './ErrorBoundary.module.css';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught error:', error, errorInfo);
        // Future: Send to error tracking service (Sentry, etc.)
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className={styles.container}>
                    <div className={styles.card}>
                        <span className={styles.icon}>⚠️</span>
                        <h2 className={styles.title}>Something went wrong</h2>
                        <p className={styles.message}>
                            We encountered an unexpected error. Please try refreshing the page.
                        </p>
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <pre className={styles.error}>
                                {this.state.error.message}
                            </pre>
                        )}
                        <button
                            className={styles.button}
                            onClick={() => window.location.reload()}
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
