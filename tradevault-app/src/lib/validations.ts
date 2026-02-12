// =============================================
// CANDLE TRACE - ZOD VALIDATION SCHEMAS
// Type-safe input validation
// =============================================

import { z } from 'zod';

// =============================================
// TRADE SCHEMAS
// =============================================

export const tradeFormSchema = z.object({
    ticker: z
        .string()
        .min(1, 'Ticker is required')
        .max(20, 'Ticker must be 20 characters or less')
        .regex(/^[A-Za-z0-9/.-]+$/, 'Invalid ticker format'),
    type: z.enum(['stock', 'crypto', 'forex', 'options', 'futures']),
    side: z.enum(['long', 'short']),
    entry_price: z
        .number()
        .positive('Entry price must be positive'),
    exit_price: z
        .number()
        .positive('Exit price must be positive'),
    quantity: z
        .number()
        .positive('Quantity must be positive'),
    trade_date: z.string().min(1, 'Trade date is required'),
    strategy_id: z.string().nullable().optional(),
    stop_loss: z.number().positive().nullable().optional(),
    take_profit: z.number().positive().nullable().optional(),
    category: z.enum(['scalp', 'day', 'swing', 'position']).nullable().optional(),
    market_condition: z.enum(['bullish', 'bearish', 'choppy', 'ranging']).nullable().optional(),
    notes: z.string().max(5000, 'Notes must be 5000 characters or less').nullable().optional(),
});

export type TradeFormInput = z.infer<typeof tradeFormSchema>;

// =============================================
// STRATEGY SCHEMAS
// =============================================

export const strategyFormSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name must be 100 characters or less'),
    description: z.string().max(1000, 'Description must be 1000 characters or less').nullable().optional(),
    icon: z.string().max(10, 'Icon must be 10 characters or less'),
});

export type StrategyFormInput = z.infer<typeof strategyFormSchema>;

// =============================================
// GOAL SCHEMAS
// =============================================

export const goalFormSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .max(100, 'Name must be 100 characters or less'),
    target_amount: z
        .number()
        .positive('Target amount must be positive'),
    deadline: z.string().nullable().optional(),
    goal_type: z.enum(['profit', 'trade_count', 'win_rate']),
});

export type GoalFormInput = z.infer<typeof goalFormSchema>;

// =============================================
// AUTH SCHEMAS
// =============================================

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
    password: z
        .string()
        .min(1, 'Password is required'),
});

export const signupSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

// =============================================
// CALCULATOR SCHEMAS
// =============================================

export const positionSizeSchema = z.object({
    accountBalance: z.number().positive('Account balance must be positive'),
    riskPercent: z.number().min(0.1).max(100, 'Risk must be between 0.1% and 100%'),
    entryPrice: z.number().positive('Entry price must be positive'),
    stopLoss: z.number().positive('Stop loss must be positive'),
});

export const riskRewardSchema = z.object({
    entryPrice: z.number().positive('Entry price must be positive'),
    stopLoss: z.number().positive('Stop loss must be positive'),
    takeProfit: z.number().positive('Take profit must be positive'),
});

export const kellySchema = z.object({
    winRate: z.number().min(0).max(100, 'Win rate must be between 0% and 100%'),
    avgWin: z.number().positive('Average win must be positive'),
    avgLoss: z.number().positive('Average loss must be positive'),
});
