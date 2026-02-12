// =============================================
// CANDLE TRACE - EXPORT API ROUTE
// Export trades to CSV
// =============================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
    try {
        const supabase = await createClient();

        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get query params for filtering
        const searchParams = request.nextUrl.searchParams;
        const fromDate = searchParams.get('from');
        const toDate = searchParams.get('to');
        const format = searchParams.get('format') || 'csv';

        // Build query
        let query = supabase
            .from('trades')
            .select(`
                *,
                strategies(name, icon)
            `)
            .eq('user_id', user.id)
            .order('trade_date', { ascending: false });

        if (fromDate) {
            query = query.gte('trade_date', fromDate);
        }
        if (toDate) {
            query = query.lte('trade_date', toDate);
        }

        const { data: trades, error } = await query;

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        if (!trades || trades.length === 0) {
            return NextResponse.json({ error: 'No trades found' }, { status: 404 });
        }

        if (format === 'csv') {
            // Generate CSV
            const headers = [
                'Date',
                'Ticker',
                'Type',
                'Side',
                'Entry Price',
                'Exit Price',
                'Quantity',
                'Strategy',
                'Category',
                'Market Condition',
                'Stop Loss',
                'Take Profit',
                'Entry Time',
                'Exit Time',
                'MFE',
                'MAE',
                'Commission',
                'Fees',
                'P&L',
                'Notes',
            ];

            const rows = trades.map(trade => {
                const pnl = trade.side === 'long'
                    ? (trade.exit_price - trade.entry_price) * trade.quantity
                    : (trade.entry_price - trade.exit_price) * trade.quantity;

                return [
                    trade.trade_date,
                    trade.ticker,
                    trade.type,
                    trade.side,
                    trade.entry_price,
                    trade.exit_price,
                    trade.quantity,
                    trade.strategies?.name || '',
                    trade.category || '',
                    trade.market_condition || '',
                    trade.stop_loss || '',
                    trade.take_profit || '',
                    trade.entry_time || '',
                    trade.exit_time || '',
                    trade.mfe || '',
                    trade.mae || '',
                    trade.commission || 0,
                    trade.fees || 0,
                    pnl.toFixed(2),
                    (trade.notes || '').replace(/"/g, '""'), // Escape quotes
                ];
            });

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell =>
                    typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))
                        ? `"${cell}"`
                        : cell
                ).join(',')),
            ].join('\n');

            return new NextResponse(csvContent, {
                headers: {
                    'Content-Type': 'text/csv',
                    'Content-Disposition': `attachment; filename="candletrace_export_${new Date().toISOString().split('T')[0]}.csv"`,
                },
            });
        }

        // Return JSON for other formats
        return NextResponse.json({ data: trades });
    } catch (error) {
        console.error('Export error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
