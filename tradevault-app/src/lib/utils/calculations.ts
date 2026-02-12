// =============================================
// CANDLE TRACE - P&L CALCULATIONS
// Matches the calculation logic from the HTML implementation
// =============================================

import type {
    Trade,
    TradeStats,
    DailyPnL,
    MonthlyPnL,
    PositionSizeInputs,
    PositionSizeResult,
    RiskRewardInputs,
    RiskRewardResult,
    KellyInputs,
    KellyResult
} from '@/types';

/**
 * Calculate P&L for a single trade
 * Long: (exit - entry) * qty
 * Short: (entry - exit) * qty
 */
export function calculatePnL(trade: Trade): number {
    if (trade.side === 'long') {
        return (trade.exit_price - trade.entry_price) * trade.quantity;
    } else {
        return (trade.entry_price - trade.exit_price) * trade.quantity;
    }
}

/**
 * Determine if a trade is a winner
 */
export function isWinningTrade(trade: Trade): boolean {
    return calculatePnL(trade) > 0;
}

/**
 * Calculate Risk/Reward ratio achieved for a trade
 */
export function calculateRRRatio(trade: Trade): number | null {
    if (!trade.stop_loss) return null;

    const risk = Math.abs(trade.entry_price - trade.stop_loss) * trade.quantity;
    if (risk === 0) return null;

    const pnl = Math.abs(calculatePnL(trade));
    return pnl / risk;
}

/**
 * Calculate comprehensive trading statistics from a list of trades
 */
export function calculateStats(trades: Trade[], initialBalance: number = 10000): TradeStats {
    const emptyStats: TradeStats = {
        totalPnL: 0,
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        profitFactor: 0,
        totalTrades: 0,
        wins: 0,
        losses: 0,
        maxDrawdown: 0,
        sharpe: 0,
        roi: 0,
        equity: [initialBalance]
    };

    if (trades.length === 0) return emptyStats;

    let wins = 0;
    let losses = 0;
    let totalWin = 0;
    let totalLoss = 0;
    const equity: number[] = [initialBalance];
    let peak = initialBalance;
    let maxDrawdown = 0;
    const pnls: number[] = [];

    // Sort trades by date ascending for proper equity curve
    const sortedTrades = [...trades].sort(
        (a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
    );

    sortedTrades.forEach(trade => {
        const pnl = calculatePnL(trade);
        pnls.push(pnl);

        if (pnl > 0) {
            wins++;
            totalWin += pnl;
        } else {
            losses++;
            totalLoss += Math.abs(pnl);
        }

        const newEquity = equity[equity.length - 1] + pnl;
        equity.push(newEquity);

        if (newEquity > peak) peak = newEquity;
        const drawdown = ((peak - newEquity) / peak) * 100;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });

    // Calculate Sharpe Ratio (annualized)
    const avgPnL = pnls.reduce((a, b) => a + b, 0) / pnls.length;
    const variance = pnls.reduce((a, b) => a + Math.pow(b - avgPnL, 2), 0) / pnls.length;
    const stdDev = Math.sqrt(variance);
    const sharpe = stdDev > 0 ? (avgPnL / stdDev) * Math.sqrt(252) : 0;

    const totalPnL = pnls.reduce((a, b) => a + b, 0);
    const finalEquity = equity[equity.length - 1];

    return {
        totalPnL,
        winRate: trades.length > 0 ? (wins / trades.length) * 100 : 0,
        avgWin: wins > 0 ? totalWin / wins : 0,
        avgLoss: losses > 0 ? totalLoss / losses : 0,
        profitFactor: totalLoss > 0 ? totalWin / totalLoss : (totalWin > 0 ? Infinity : 0),
        totalTrades: trades.length,
        wins,
        losses,
        maxDrawdown,
        sharpe,
        roi: ((finalEquity - initialBalance) / initialBalance) * 100,
        equity
    };
}

/**
 * Aggregate P&L by day
 */
export function aggregateDailyPnL(trades: Trade[]): DailyPnL[] {
    const dailyMap: Record<string, number> = {};

    trades.forEach(trade => {
        const date = trade.trade_date;
        if (!dailyMap[date]) dailyMap[date] = 0;
        dailyMap[date] += calculatePnL(trade);
    });

    return Object.entries(dailyMap)
        .map(([date, pnl]) => ({ date, pnl }))
        .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Aggregate P&L by month
 */
export function aggregateMonthlyPnL(trades: Trade[]): MonthlyPnL[] {
    const monthlyMap: Record<string, number> = {};

    trades.forEach(trade => {
        const month = trade.trade_date.substring(0, 7); // YYYY-MM
        if (!monthlyMap[month]) monthlyMap[month] = 0;
        monthlyMap[month] += calculatePnL(trade);
    });

    return Object.entries(monthlyMap)
        .map(([month, pnl]) => ({ month, pnl }))
        .sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Get heat level for calendar display (-4 to 4)
 */
export function getHeatLevel(pnl: number): number {
    if (pnl > 500) return 4;
    if (pnl > 200) return 3;
    if (pnl > 50) return 2;
    if (pnl > 0) return 1;
    if (pnl === 0) return 0;
    if (pnl > -50) return -1;
    if (pnl > -200) return -2;
    if (pnl > -500) return -3;
    return -4;
}

// =============================================
// POSITION SIZE CALCULATOR
// =============================================

export function calculatePositionSize(inputs: PositionSizeInputs): PositionSizeResult {
    const { accountBalance, riskPercent, entryPrice, stopLoss } = inputs;

    const riskAmount = accountBalance * (riskPercent / 100);
    const riskPerShare = Math.abs(entryPrice - stopLoss);
    const positionSize = riskPerShare > 0 ? Math.floor(riskAmount / riskPerShare) : 0;
    const positionValue = positionSize * entryPrice;

    return {
        riskAmount,
        positionSize,
        positionValue
    };
}

// =============================================
// RISK/REWARD CALCULATOR
// =============================================

export function calculateRiskReward(inputs: RiskRewardInputs): RiskRewardResult {
    const { entryPrice, stopLoss, takeProfit } = inputs;

    const risk = Math.abs(entryPrice - stopLoss);
    const reward = Math.abs(takeProfit - entryPrice);
    const riskPercent = (risk / entryPrice) * 100;
    const rewardPercent = (reward / entryPrice) * 100;
    const ratio = risk > 0 ? reward / risk : 0;

    return {
        risk,
        riskPercent,
        reward,
        rewardPercent,
        ratio
    };
}

// =============================================
// KELLY CRITERION CALCULATOR
// =============================================

export function calculateKelly(inputs: KellyInputs): KellyResult {
    const { winRate, avgWin, avgLoss } = inputs;

    const winRateDecimal = winRate / 100;
    const winLossRatio = avgLoss > 0 ? avgWin / avgLoss : 0;
    const kelly = winRateDecimal - ((1 - winRateDecimal) / winLossRatio);
    const kellyPercent = Math.max(0, kelly * 100);

    return {
        kellyPercent,
        halfKellyPercent: kellyPercent / 2
    };
}
