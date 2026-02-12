-- =============================================
-- TRADEVAULT - RESET & RECREATE SCHEMA
-- Run this to clean up and recreate everything
-- =============================================

-- Drop existing tables (in correct order due to foreign keys)
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS trades CASCADE;
DROP TABLE IF EXISTS strategies CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Drop existing views
DROP VIEW IF EXISTS trade_pnl;

-- Drop existing functions
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS trade_type CASCADE;
DROP TYPE IF EXISTS trade_side CASCADE;
DROP TYPE IF EXISTS trade_category CASCADE;
DROP TYPE IF EXISTS market_condition CASCADE;
DROP TYPE IF EXISTS goal_type CASCADE;
DROP TYPE IF EXISTS theme_type CASCADE;

-- =============================================
-- Now recreate everything
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CUSTOM TYPES (ENUMS)
-- =============================================

CREATE TYPE trade_type AS ENUM ('stock', 'crypto', 'forex', 'options', 'futures');
CREATE TYPE trade_side AS ENUM ('long', 'short');
CREATE TYPE trade_category AS ENUM ('scalp', 'day', 'swing', 'position');
CREATE TYPE market_condition AS ENUM ('bullish', 'bearish', 'choppy', 'ranging');
CREATE TYPE goal_type AS ENUM ('profit', 'trade_count', 'win_rate');
CREATE TYPE theme_type AS ENUM ('dark', 'light');

-- =============================================
-- PROFILES TABLE
-- =============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  initial_balance DECIMAL(15, 2) DEFAULT 10000.00,
  settings JSONB DEFAULT '{"theme": "dark", "default_trade_type": "stock", "default_risk_percent": 2}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create profile automatically when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- STRATEGIES TABLE
-- =============================================

CREATE TABLE strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT DEFAULT '📊',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_strategies_user_id ON strategies(user_id);

-- =============================================
-- TRADES TABLE
-- =============================================

CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ticker TEXT NOT NULL,
  type trade_type NOT NULL DEFAULT 'stock',
  side trade_side NOT NULL DEFAULT 'long',
  entry_price DECIMAL(15, 6) NOT NULL,
  exit_price DECIMAL(15, 6) NOT NULL,
  quantity DECIMAL(15, 6) NOT NULL,
  trade_date DATE NOT NULL,
  strategy_id UUID REFERENCES strategies(id) ON DELETE SET NULL,
  stop_loss DECIMAL(15, 6),
  take_profit DECIMAL(15, 6),
  category trade_category,
  market_condition market_condition,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_trades_user_id ON trades(user_id);
CREATE INDEX idx_trades_trade_date ON trades(trade_date);
CREATE INDEX idx_trades_ticker ON trades(ticker);
CREATE INDEX idx_trades_strategy_id ON trades(strategy_id);

-- =============================================
-- GOALS TABLE
-- =============================================

CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  target_amount DECIMAL(15, 2) NOT NULL,
  deadline DATE,
  goal_type goal_type DEFAULT 'profit',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_goals_user_id ON goals(user_id);

-- =============================================
-- UPDATED_AT TRIGGER
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- STRATEGIES POLICIES
CREATE POLICY "Users can view own strategies"
  ON strategies FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own strategies"
  ON strategies FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own strategies"
  ON strategies FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own strategies"
  ON strategies FOR DELETE
  USING (auth.uid() = user_id);

-- TRADES POLICIES
CREATE POLICY "Users can view own trades"
  ON trades FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trades"
  ON trades FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
  ON trades FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
  ON trades FOR DELETE
  USING (auth.uid() = user_id);

-- GOALS POLICIES
CREATE POLICY "Users can view own goals"
  ON goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  USING (auth.uid() = user_id);

-- =============================================
-- HELPER VIEW
-- =============================================

CREATE OR REPLACE VIEW trade_pnl AS
SELECT 
  t.*,
  CASE 
    WHEN t.side = 'long' THEN (t.exit_price - t.entry_price) * t.quantity
    ELSE (t.entry_price - t.exit_price) * t.quantity
  END as pnl
FROM trades t;

ALTER VIEW trade_pnl OWNER TO postgres;
