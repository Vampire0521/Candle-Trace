// =============================================
// CANDLE TRACE - STRATEGIES PAGE
// =============================================

import { createClient } from '@/lib/supabase/server';
import { StrategiesClient } from './components/StrategiesClient';

export default async function StrategiesPage() {
    const supabase = await createClient();

    // Fetch strategies with trade counts
    const { data: strategies = [] } = await supabase
        .from('strategies')
        .select('*')
        .order('name');

    // Fetch all trades to calculate stats per strategy
    const { data: trades = [] } = await supabase
        .from('trades')
        .select('*');

    return (
        <StrategiesClient
            initialStrategies={strategies || []}
            trades={trades || []}
        />
    );
}
