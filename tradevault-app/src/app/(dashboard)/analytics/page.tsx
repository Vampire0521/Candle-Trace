// =============================================
// CANDLE TRACE - ANALYTICS PAGE
// =============================================

import { createClient } from '@/lib/supabase/server';
import { AnalyticsClient } from './components/AnalyticsClient';

export default async function AnalyticsPage() {
    const supabase = await createClient();

    // Fetch trades
    const { data: trades = [] } = await supabase
        .from('trades')
        .select('*')
        .order('trade_date', { ascending: true });

    // Fetch strategies
    const { data: strategies = [] } = await supabase
        .from('strategies')
        .select('*');

    // Fetch profile for initial balance
    const { data: profile } = await supabase
        .from('profiles')
        .select('initial_balance')
        .single();

    const initialBalance = profile?.initial_balance || 10000;

    return (
        <AnalyticsClient
            trades={trades || []}
            strategies={strategies || []}
            initialBalance={initialBalance}
        />
    );
}
