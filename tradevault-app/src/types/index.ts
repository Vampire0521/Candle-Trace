// =============================================
// CANDLE TRACE - TYPE DEFINITIONS
// Based on the HTML implementation data structures
// =============================================

// =============================================
// DATABASE TYPES (Supabase Schema)
// =============================================

export type TradeType = 'stock' | 'crypto' | 'forex' | 'options' | 'futures';
export type TradeSide = 'long' | 'short';
export type TradeCategory = 'scalp' | 'day' | 'swing' | 'position';
export type MarketCondition = 'bullish' | 'bearish' | 'choppy' | 'ranging';
export type GoalType = 'profit' | 'trade_count' | 'win_rate';

// Phase 1: New Types
export type EmotionType = 'confident' | 'fearful' | 'greedy' | 'neutral' | 'anxious' | 'excited' | 'frustrated';
export type MistakeType = 'fomo' | 'revenge' | 'oversize' | 'early_exit' | 'late_entry' | 'no_stop_loss' | 'moved_stop' | 'ignored_plan' | 'overtrading';

// Database row types
export interface Trade {
    id: string;
    user_id: string;
    ticker: string;
    type: TradeType;
    side: TradeSide;
    entry_price: number;
    exit_price: number;
    quantity: number;
    trade_date: string; // ISO date string
    strategy_id: string | null;
    stop_loss: number | null;
    take_profit: number | null;
    category: TradeCategory | null;
    market_condition: MarketCondition | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    // Phase 1 additions
    mfe: number | null; // Maximum Favorable Excursion
    mae: number | null; // Maximum Adverse Excursion
    screenshot_url: string | null;
    entry_time: string | null; // HH:MM:SS format
    exit_time: string | null;
    commission: number | null;
    fees: number | null;
    tags?: TradeTag[]; // Populated via join
}

export interface TradeTag {
    id: string;
    user_id: string;
    name: string;
    color: string;
    created_at: string;
}

export interface TradeTagLink {
    trade_id: string;
    tag_id: string;
}

export interface Strategy {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    icon: string;
    created_at: string;
}

export interface Goal {
    id: string;
    user_id: string;
    name: string;
    target_amount: number;
    deadline: string | null;
    goal_type: GoalType;
    created_at: string;
}

export interface Profile {
    id: string;
    user_id: string;
    display_name: string | null;
    initial_balance: number;
    settings: ProfileSettings;
    created_at: string;
    updated_at: string;
}

export interface ProfileSettings {
    theme: 'dark' | 'light';
    default_trade_type: TradeType;
    default_risk_percent: number;
}

// =============================================
// FORM TYPES (for React Hook Form)
// =============================================

export interface TradeFormData {
    ticker: string;
    type: TradeType;
    side: TradeSide;
    entry_price: number;
    exit_price: number;
    quantity: number;
    trade_date: string;
    strategy_id?: string;
    stop_loss?: number;
    take_profit?: number;
    category?: TradeCategory;
    market_condition?: MarketCondition;
    notes?: string;
    // Phase 1 additions
    entry_time?: string; // HH:MM format
    exit_time?: string; // HH:MM format
    mfe?: number; // Maximum Favorable Excursion
    mae?: number; // Maximum Adverse Excursion
    commission?: number;
    fees?: number;
    screenshot_url?: string; // Trade chart screenshot
}

export interface StrategyFormData {
    name: string;
    description?: string;
    icon: string;
}

export interface GoalFormData {
    name: string;
    target_amount: number;
    deadline?: string;
    goal_type: GoalType;
}

// =============================================
// COMPUTED / ANALYTICS TYPES
// =============================================

export interface TradeStats {
    totalPnL: number;
    winRate: number;
    avgWin: number;
    avgLoss: number;
    profitFactor: number;
    totalTrades: number;
    wins: number;
    losses: number;
    maxDrawdown: number;
    sharpe: number;
    roi: number;
    equity: number[];
}

export interface StrategyStats {
    strategy: Strategy;
    totalTrades: number;
    winRate: number;
    totalPnL: number;
}

export interface DailyPnL {
    date: string;
    pnl: number;
}

export interface MonthlyPnL {
    month: string; // YYYY-MM format
    pnl: number;
}

// =============================================
// UI STATE TYPES
// =============================================

export interface TradeFilters {
    search: string;
    type: TradeType | '';
    strategy: string;
    result: 'win' | 'loss' | '';
    fromDate: string;
    toDate: string;
}

export type PageName = 'dashboard' | 'trades' | 'analytics' | 'strategies' | 'calculator' | 'goals';

export type AnalyticsTab = 'overview' | 'distribution' | 'drawdown';

// =============================================
// CALCULATOR TYPES
// =============================================

export interface PositionSizeInputs {
    accountBalance: number;
    riskPercent: number;
    entryPrice: number;
    stopLoss: number;
}

export interface PositionSizeResult {
    riskAmount: number;
    positionSize: number;
    positionValue: number;
}

export interface RiskRewardInputs {
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
}

export interface RiskRewardResult {
    risk: number;
    riskPercent: number;
    reward: number;
    rewardPercent: number;
    ratio: number;
}

export interface KellyInputs {
    winRate: number; // as percentage (0-100)
    avgWin: number;
    avgLoss: number;
}

export interface KellyResult {
    kellyPercent: number;
    halfKellyPercent: number;
}

// =============================================
// API RESPONSE TYPES
// =============================================

export interface ApiError {
    message: string;
    code?: string;
}

export interface ApiResponse<T> {
    data: T | null;
    error: ApiError | null;
}

// =============================================
// PHASE 1: ADVANCED ANALYTICS TYPES
// =============================================

export interface TimeBasedStats {
    hour_of_day: number;
    day_of_week: number;
    trade_count: number;
    total_pnl: number;
    win_count: number;
    loss_count: number;
}

export interface MfeMaeStats {
    avg_mfe: number;
    avg_mae: number;
    max_mfe: number;
    max_mae: number;
    mfe_capture_ratio: number;
}

export interface AdvancedTradeFilters extends TradeFilters {
    tags: string[]; // Array of tag IDs
    minPnl: number | null;
    maxPnl: number | null;
    category: TradeCategory | '';
    marketCondition: MarketCondition | '';
    hasScreenshot: boolean | null;
    sortBy: 'trade_date' | 'pnl' | 'ticker' | 'created_at';
    sortOrder: 'asc' | 'desc';
}

export interface TradeFormDataExtended extends TradeFormData {
    mfe?: number;
    mae?: number;
    entry_time?: string;
    exit_time?: string;
    commission?: number;
    fees?: number;
    tag_ids?: string[];
}

export interface TagFormData {
    name: string;
    color: string;
}

// Performance by hour/day
export interface HourlyPerformance {
    hour: number; // 0-23
    tradeCount: number;
    pnl: number;
    winRate: number;
}

export interface DayOfWeekPerformance {
    day: number; // 0=Sunday, 6=Saturday
    dayName: string;
    tradeCount: number;
    pnl: number;
    winRate: number;
}

export interface ExportOptions {
    format: 'csv' | 'pdf';
    dateRange: {
        from: string;
        to: string;
    };
    includeNotes: boolean;
    includeScreenshots: boolean;
    includeTags: boolean;
}

// =============================================
// PHASE 2: PSYCHOLOGY & DISCIPLINE TYPES
// =============================================

export interface TradeEmotion {
    id: string;
    trade_id: string | null;
    user_id: string;
    pre_confidence: number | null; // 1-5
    pre_fear: number | null; // 1-5
    pre_greed: number | null; // 1-5
    pre_fomo: number | null; // 1-5
    post_satisfaction: number | null; // 1-5
    post_regret: number | null; // 1-5
    discipline_score: number | null; // 1-10
    followed_plan: boolean;
    mistakes: MistakeType[];
    notes: string | null;
    created_at: string;
}

export interface TradeEmotionFormData {
    pre_confidence: number;
    pre_fear: number;
    pre_greed: number;
    pre_fomo: number;
    post_satisfaction?: number;
    post_regret?: number;
    discipline_score: number;
    followed_plan: boolean;
    mistakes: MistakeType[];
    notes?: string;
}

export interface PlaybookSetup {
    id: string;
    user_id: string;
    name: string;
    description: string | null;
    icon: string;
    market_conditions: string[];
    timeframes: string[];
    entry_rules: PlaybookRule[];
    exit_rules: PlaybookRule[];
    risk_percent: number;
    min_rr_ratio: number;
    max_position_size: number | null;
    times_used: number;
    win_count: number;
    loss_count: number;
    total_pnl: number;
    screenshot_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface PlaybookRule {
    id: string;
    text: string;
    required: boolean;
}

export interface PlaybookFormData {
    name: string;
    description?: string;
    icon: string;
    market_conditions: string[];
    timeframes: string[];
    entry_rules: PlaybookRule[];
    exit_rules: PlaybookRule[];
    risk_percent: number;
    min_rr_ratio: number;
    max_position_size?: number;
    screenshot_url?: string;
}

export interface PreTradeChecklist {
    id: string;
    user_id: string;
    name: string;
    items: ChecklistItem[];
    is_active: boolean;
    created_at: string;
}

export interface ChecklistItem {
    id: string;
    text: string;
    required: boolean;
}

export interface ChecklistFormData {
    name: string;
    items: ChecklistItem[];
}

export interface ChecklistCompletion {
    id: string;
    trade_id: string | null;
    checklist_id: string | null;
    user_id: string;
    completed_items: string[];
    all_items: string[];
    completion_percent: number;
    created_at: string;
}

export interface DisciplineStats {
    avg_discipline_score: number;
    total_trades_with_emotions: number;
    followed_plan_count: number;
    plan_adherence_percent: number;
    top_mistakes: MistakeType[];
    avg_pre_confidence: number;
    avg_pre_fear: number;
    avg_pre_greed: number;
    tilt_score: number;
}

// Tiltmeter levels
export type TiltLevel = 'calm' | 'focused' | 'elevated' | 'tilted' | 'danger';

export interface TiltmeterData {
    level: TiltLevel;
    score: number; // -5 to 5 (negative = calm, positive = tilted)
    recentEmotions: TradeEmotion[];
    recommendation: string;
}

// Available mistake types for UI
export const MISTAKE_OPTIONS: { value: MistakeType; label: string; icon: string }[] = [
    { value: 'fomo', label: 'FOMO Entry', icon: '😱' },
    { value: 'revenge', label: 'Revenge Trade', icon: '😤' },
    { value: 'oversize', label: 'Over-sized Position', icon: '📈' },
    { value: 'early_exit', label: 'Early Exit', icon: '🏃' },
    { value: 'late_entry', label: 'Late Entry', icon: '⏰' },
    { value: 'no_stop_loss', label: 'No Stop Loss', icon: '🚫' },
    { value: 'moved_stop', label: 'Moved Stop Loss', icon: '↔️' },
    { value: 'ignored_plan', label: 'Ignored Trading Plan', icon: '📋' },
    { value: 'overtrading', label: 'Overtrading', icon: '🔄' },
];

// Emotion scale labels
export const EMOTION_SCALE = [
    { value: 1, label: 'Very Low' },
    { value: 2, label: 'Low' },
    { value: 3, label: 'Moderate' },
    { value: 4, label: 'High' },
    { value: 5, label: 'Very High' },
];

// Discipline scale labels
export const DISCIPLINE_SCALE = [
    { value: 1, label: 'Poor' },
    { value: 2, label: 'Below Average' },
    { value: 3, label: 'Below Average' },
    { value: 4, label: 'Fair' },
    { value: 5, label: 'Average' },
    { value: 6, label: 'Above Average' },
    { value: 7, label: 'Good' },
    { value: 8, label: 'Very Good' },
    { value: 9, label: 'Excellent' },
    { value: 10, label: 'Perfect' },
];

// =============================================
// PHASE 3: AI TYPES
// =============================================

export type AIInsightType = 'trade_analysis' | 'pattern' | 'tip' | 'alert';
export type AIPatternType = 'winning' | 'losing' | 'neutral';
export type AIPriority = 'low' | 'medium' | 'high';
export type AITipCategory = 'psychology' | 'risk' | 'strategy' | 'timing' | 'general';
export type AIAlertType = 'overtrading' | 'revenge_trading' | 'tilt' | 'position_sizing' | 'loss_streak';

export interface AIInsight {
    id: string;
    user_id: string;
    trade_id: string | null;
    insight_type: AIInsightType;
    title: string;
    content: string;
    confidence: number | null;
    metadata: Record<string, unknown>;
    is_read: boolean;
    created_at: string;
}

export interface AIConversation {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string;
}

export interface AIMessage {
    id: string;
    conversation_id: string;
    role: 'user' | 'assistant';
    content: string;
    metadata: Record<string, unknown>;
    created_at: string;
}

export interface AIPattern {
    id: string;
    user_id: string;
    pattern_type: AIPatternType;
    name: string;
    description: string;
    criteria: Record<string, unknown>;
    trade_ids: string[];
    win_rate: number | null;
    avg_pnl: number | null;
    occurrence_count: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface AITip {
    id: string;
    user_id: string;
    category: AITipCategory;
    title: string;
    content: string;
    priority: AIPriority;
    is_dismissed: boolean;
    valid_until: string | null;
    created_at: string;
}

// AI Response types (from Gemini/Groq)
export interface TradeAnalysisResponse {
    summary: string;
    strengths: string[];
    improvements: string[];
    lessons: string;
    score: number;
}

export interface PatternDetectionResponse {
    winning_patterns: Array<{
        name: string;
        description: string;
        frequency: string;
    }>;
    losing_patterns: Array<{
        name: string;
        description: string;
        frequency: string;
    }>;
    key_insight: string;
}

export interface PersonalizedTipsResponse {
    tips: Array<{
        category: AITipCategory;
        title: string;
        content: string;
        priority: AIPriority;
    }>;
}

export interface RiskAlertResponse {
    alerts: Array<{
        type: AIAlertType;
        severity: AIPriority;
        message: string;
        recommendation: string;
    }>;
    overall_risk_level: AIPriority;
    summary: string;
}

