// =============================================
// CANDLE TRACE - TRADES PAGE
// Full CRUD, filtering, search, import/export
// =============================================

import { createClient } from '@/lib/supabase/server';
import { TradesClient } from './components/TradesClient';

export default async function TradesPage() {
  const supabase = await createClient();
  
  // Fetch trades
  const { data: trades = [] } = await supabase
    .from('trades')
    .select('*')
    .order('trade_date', { ascending: false });

  // Fetch strategies for the dropdown
  const { data: strategies = [] } = await supabase
    .from('strategies')
    .select('*')
    .order('name');

  return (
    <TradesClient 
      initialTrades={trades || []} 
      strategies={strategies || []} 
    />
  );
}
