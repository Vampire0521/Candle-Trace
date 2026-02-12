// =============================================
// CANDLE TRACE - FORGOT PASSWORD PAGE
// =============================================

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import styles from '../login/page.module.css';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const supabase = createClient();
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
            });

            if (error) {
                setError(error.message);
            } else {
                setSuccess(true);
            }
        } catch {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (success) {
        return (
            <div className={styles.container}>
                <h1 className={styles.title}>Check your email</h1>
                <p className={styles.subtitle}>
                    We&apos;ve sent you a password reset link. Please check your email.
                </p>
                <Link href="/login" className={styles.link}>
                    Back to Sign In
                </Link>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Reset password</h1>
            <p className={styles.subtitle}>
                Enter your email and we&apos;ll send you a reset link
            </p>

            <form onSubmit={handleSubmit} className={styles.form}>
                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.formGroup}>
                    <label htmlFor="email" className={styles.label}>
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        className={styles.input}
                        required
                    />
                </div>

                <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={isLoading}
                >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
            </form>

            <p className={styles.footer}>
                <Link href="/login" className={styles.link}>
                    Back to Sign In
                </Link>
            </p>
        </div>
    );
}
