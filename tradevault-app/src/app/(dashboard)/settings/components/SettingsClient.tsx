// =============================================
// CANDLE TRACE - SETTINGS CLIENT COMPONENT
// =============================================

'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/ui/Toast';
import { TagManager } from '@/components/tags';
import styles from './SettingsClient.module.css';

interface SettingsClientProps {
    profile: {
        id?: string;
        initial_balance?: number;
    };
    userId: string;
    userEmail: string;
}

export function SettingsClient({ profile, userId, userEmail }: SettingsClientProps) {
    const [initialBalance, setInitialBalance] = useState(profile.initial_balance || 10000);
    const [isSaving, setIsSaving] = useState(false);
    const { addToast } = useToast();
    const supabase = createClient();

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Update the existing profile row using user_id
            const { error } = await supabase
                .from('profiles')
                .update({
                    initial_balance: initialBalance,
                    updated_at: new Date().toISOString(),
                })
                .eq('user_id', userId);

            if (error) throw error;
            addToast('Settings saved successfully!', 'success');
        } catch (error) {
            console.error('Error saving settings:', error);
            addToast('Failed to save settings', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Settings</h1>
                <p className={styles.subtitle}>Manage your account preferences</p>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Account</h2>
                <div className={styles.card}>
                    <div className={styles.field}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            value={userEmail}
                            disabled
                            className={styles.input}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Trading Account</h2>
                <div className={styles.card}>
                    <div className={styles.field}>
                        <label className={styles.label}>Initial Balance ($)</label>
                        <p className={styles.hint}>
                            This is the starting balance for your equity curve calculations.
                        </p>
                        <input
                            type="number"
                            value={initialBalance}
                            onChange={(e) => setInitialBalance(parseFloat(e.target.value) || 0)}
                            className={styles.input}
                            step="0.01"
                            min="0"
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className={styles.saveBtn}
                    >
                        {isSaving ? 'Saving...' : '💾 Save Settings'}
                    </button>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Trade Tags</h2>
                <TagManager />
            </div>
        </div>
    );
}

