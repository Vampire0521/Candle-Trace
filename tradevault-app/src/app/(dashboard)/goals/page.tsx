// =============================================
// CANDLE TRACE - GOALS PAGE
// =============================================

import { createClient } from '@/lib/supabase/server';
import { GoalsClient } from './components/GoalsClient';

export default async function GoalsPage() {
    const supabase = await createClient();

    // Fetch goals
    const { data: goals = [] } = await supabase
        .from('goals')
        .select('*')
        .order('deadline', { ascending: true });

    // Fetch trades for progress calculation
    const { data: trades = [] } = await supabase
        .from('trades')
        .select('*');

    return (
        <GoalsClient
            initialGoals={goals || []}
            trades={trades || []}
        />
    );
}
