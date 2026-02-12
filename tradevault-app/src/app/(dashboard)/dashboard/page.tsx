// =============================================
// CANDLE TRACE - DASHBOARD PAGE
// =============================================

import { createClient } from '@/lib/supabase/server';
import { StatsGrid } from './components/StatsGrid';
import { PnLCalendar } from './components/PnLCalendar';
import { EquityCurve } from './components/EquityCurve';
import { RecentTrades } from './components/RecentTrades';
import { PsychologyWidgets } from './components/PsychologyWidgets';
import styles from './page.module.css';
import { Stagger, FadeIn, ScaleIn } from '@/components/ui/Motion';

export default async function DashboardPage() {
    const supabase = await createClient();

    // Fetch trades
    const { data: trades = [] } = await supabase
        .from('trades')
        .select('*')
        .order('trade_date', { ascending: false });

    // Fetch profile for initial balance
    const { data: profile } = await supabase
        .from('profiles')
        .select('initial_balance')
        .single();

    const initialBalance = profile?.initial_balance || 10000;

    return (
        <Stagger className={styles.dashboard}>
            <FadeIn>
                <StatsGrid trades={trades || []} initialBalance={initialBalance} />
            </FadeIn>

            <div className={styles.chartsRow}>
                <ScaleIn className={styles.calendarCard} delay={0.15}>
                    <h3 className={styles.cardTitle}>📅 P&L Calendar</h3>
                    <PnLCalendar trades={trades || []} />
                </ScaleIn>

                <ScaleIn className={styles.equityCard} delay={0.2}>
                    <h3 className={styles.cardTitle}>📈 Equity Curve</h3>
                    <EquityCurve trades={trades || []} initialBalance={initialBalance} />
                </ScaleIn>
            </div>

            <FadeIn delay={0.25}>
                <PsychologyWidgets />
            </FadeIn>

            <FadeIn className={styles.recentCard} delay={0.4}>
                <h3 className={styles.cardTitle}>🕐 Recent Trades</h3>
                <RecentTrades trades={(trades || []).slice(0, 10)} />
            </FadeIn>
        </Stagger>
    );
}

