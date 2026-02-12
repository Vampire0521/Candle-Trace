// =============================================
// CANDLE TRACE - PSYCHOLOGY WIDGETS FOR DASHBOARD
// Client components wrapper
// =============================================

'use client';

import { DisciplineScore, Tiltmeter } from '@/components/psychology';
import type { DisciplineStats } from '@/types';
import { useState, useEffect } from 'react';
import styles from './PsychologyWidgets.module.css';

export function PsychologyWidgets() {
    const [stats, setStats] = useState<DisciplineStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/discipline?days=30');
                if (res.ok) {
                    const { data } = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch discipline stats:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (isLoading) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.widget}>
                <Tiltmeter stats={stats} />
            </div>
            <div className={styles.widget}>
                <DisciplineScore days={30} />
            </div>
        </div>
    );
}
