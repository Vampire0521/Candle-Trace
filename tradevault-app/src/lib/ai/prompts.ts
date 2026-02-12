// =============================================
// CANDLE TRACE - AI PROMPT TEMPLATES
// Prompts for trade analysis, patterns, and tips
// =============================================

import type { Trade } from '@/types';
import { calculatePnL, formatCurrency } from '@/lib/utils';

// System prompt for Candle Trace AI
export const CANDLETRACE_SYSTEM_PROMPT = `You are Candle Trace AI, an expert trading analyst and coach. You help traders analyze their trades, identify patterns, and improve their performance.

Key traits:
- Be concise and actionable
- Focus on data-driven insights
- Provide specific, measurable suggestions
- Be encouraging but honest about mistakes
- Use trading terminology appropriately

You have access to the trader's complete trading history and psychology data.`;

// Format a trade for AI context
export function formatTradeForAI(trade: Trade): string {
    const pnl = calculatePnL(trade);
    const isWin = pnl > 0;

    return `Trade: ${trade.ticker} (${trade.type})
- Side: ${trade.side}
- Date: ${trade.trade_date}${trade.entry_time ? ` at ${trade.entry_time}` : ''}
- Entry: ${formatCurrency(trade.entry_price)} → Exit: ${formatCurrency(trade.exit_price)}
- Quantity: ${trade.quantity}
- P&L: ${formatCurrency(pnl)} (${isWin ? 'WIN' : 'LOSS'})
- Category: ${trade.category || 'N/A'}
- Market: ${trade.market_condition || 'N/A'}
- Notes: ${trade.notes || 'None'}`;
}

// Format multiple trades for context
export function formatTradesForAI(trades: Trade[]): string {
    return trades.map((t, i) => `[Trade ${i + 1}]\n${formatTradeForAI(t)}`).join('\n\n');
}

// Trade analysis prompt
export function getTradeAnalysisPrompt(trade: Trade): string {
    return `Analyze this trading journal entry and provide insights:

${formatTradeForAI(trade)}

Provide a JSON response with this exact structure:
{
    "summary": "One sentence summary of the trade quality",
    "strengths": ["List 2-3 things done well"],
    "improvements": ["List 2-3 areas for improvement"],
    "lessons": "Key lesson from this trade",
    "score": 1-10 rating of trade execution
}`;
}

// Pattern detection prompt
export function getPatternDetectionPrompt(trades: Trade[]): string {
    const wins = trades.filter(t => calculatePnL(t) > 0);
    const losses = trades.filter(t => calculatePnL(t) <= 0);

    return `Analyze this trader's recent trades and identify patterns:

WINNING TRADES (${wins.length}):
${formatTradesForAI(wins.slice(0, 10))}

LOSING TRADES (${losses.length}):
${formatTradesForAI(losses.slice(0, 10))}

Identify patterns in their trading behavior. Provide a JSON response:
{
    "winning_patterns": [
        {
            "name": "Pattern name",
            "description": "What they do that leads to wins",
            "frequency": "How often this appears"
        }
    ],
    "losing_patterns": [
        {
            "name": "Pattern name", 
            "description": "What they do that leads to losses",
            "frequency": "How often this appears"
        }
    ],
    "key_insight": "Most important finding"
}`;
}

// Personalized tips prompt
export function getPersonalizedTipsPrompt(
    trades: Trade[],
    avgDiscipline: number,
    planAdherence: number,
    commonMistakes: string[]
): string {
    const totalPnL = trades.reduce((sum, t) => sum + calculatePnL(t), 0);
    const winRate = (trades.filter(t => calculatePnL(t) > 0).length / trades.length) * 100;

    return `Based on this trader's performance, provide personalized improvement tips:

PERFORMANCE SUMMARY:
- Total Trades: ${trades.length}
- Win Rate: ${winRate.toFixed(1)}%
- Total P&L: ${formatCurrency(totalPnL)}
- Avg Discipline Score: ${avgDiscipline.toFixed(1)}/10
- Plan Adherence: ${planAdherence.toFixed(1)}%
- Common Mistakes: ${commonMistakes.join(', ') || 'None tracked'}

Recent Trades:
${formatTradesForAI(trades.slice(0, 5))}

Provide a JSON response with personalized tips:
{
    "tips": [
        {
            "category": "psychology|risk|strategy|timing|general",
            "title": "Short actionable title",
            "content": "Detailed tip with specific action items",
            "priority": "high|medium|low"
        }
    ]
}

Provide 3-5 specific, actionable tips based on their actual data.`;
}

// Chat context prompt
export function getChatContextPrompt(trades: Trade[], question: string): string {
    const totalPnL = trades.reduce((sum, t) => sum + calculatePnL(t), 0);
    const wins = trades.filter(t => calculatePnL(t) > 0).length;
    const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;

    return `You are Candle Trace AI, helping a trader with their trading journal.

TRADER'S STATS:
- Total Trades: ${trades.length}
- Win Rate: ${winRate.toFixed(1)}%
- Total P&L: ${formatCurrency(totalPnL)}

RECENT TRADES:
${formatTradesForAI(trades.slice(0, 10))}

TRADER'S QUESTION:
${question}

Provide a helpful, specific answer based on their actual trading data. Be concise but thorough.`;
}

// Risk alert prompt
export function getRiskAlertPrompt(trades: Trade[]): string {
    const recentTrades = trades.slice(0, 20);
    const recentLosses = recentTrades.filter(t => calculatePnL(t) < 0);
    const lossStreak = getConsecutiveLosses(recentTrades);

    return `Analyze this trader's recent behavior for risk alerts:

RECENT ACTIVITY:
- Last 20 trades: ${recentTrades.length} trades
- Recent losses: ${recentLosses.length}
- Current loss streak: ${lossStreak}

Recent Trades (newest first):
${formatTradesForAI(recentTrades)}

Check for concerning patterns and provide a JSON response:
{
    "alerts": [
        {
            "type": "overtrading|revenge_trading|tilt|position_sizing|loss_streak",
            "severity": "high|medium|low",
            "message": "Specific warning message",
            "recommendation": "What to do about it"
        }
    ],
    "overall_risk_level": "low|medium|high",
    "summary": "Brief risk assessment"
}

Only include alerts if there are genuine concerns. Return empty alerts array if everything looks healthy.`;
}

// Helper: Count consecutive losses
function getConsecutiveLosses(trades: Trade[]): number {
    let streak = 0;
    for (const trade of trades) {
        if (calculatePnL(trade) < 0) {
            streak++;
        } else {
            break;
        }
    }
    return streak;
}
