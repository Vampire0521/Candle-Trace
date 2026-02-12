-- =============================================
-- TRADEVAULT - PHASE 2 MIGRATION
-- Psychology & Discipline Features
-- Run in Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. TRADE EMOTIONS TABLE
-- Tracks emotions before/after each trade
-- =============================================

CREATE TABLE IF NOT EXISTS trade_emotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Pre-trade emotions (1-5 scale)
    pre_confidence INT CHECK (pre_confidence BETWEEN 1 AND 5),
    pre_fear INT CHECK (pre_fear BETWEEN 1 AND 5),
    pre_greed INT CHECK (pre_greed BETWEEN 1 AND 5),
    pre_fomo INT CHECK (pre_fomo BETWEEN 1 AND 5),
    
    -- Post-trade emotions
    post_satisfaction INT CHECK (post_satisfaction BETWEEN 1 AND 5),
    post_regret INT CHECK (post_regret BETWEEN 1 AND 5),
    
    -- Overall discipline score for this trade (1-10)
    discipline_score INT CHECK (discipline_score BETWEEN 1 AND 10),
    
    -- Did trader follow their plan?
    followed_plan BOOLEAN DEFAULT true,
    
    -- Mistakes made (array of mistake types)
    mistakes TEXT[] DEFAULT '{}',
    
    -- Notes about emotions/psychology
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trade_emotions_trade_id ON trade_emotions(trade_id);
CREATE INDEX IF NOT EXISTS idx_trade_emotions_user_id ON trade_emotions(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_emotions_created_at ON trade_emotions(created_at);

-- =============================================
-- 2. PLAYBOOK SETUPS TABLE
-- Trading setup templates/playbook entries
-- =============================================

CREATE TABLE IF NOT EXISTS playbook_setups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT '📊',
    
    -- Setup criteria
    market_conditions TEXT[], -- bullish, bearish, ranging, etc.
    timeframes TEXT[], -- 1m, 5m, 15m, 1h, 4h, 1d
    
    -- Entry rules (structured JSON)
    entry_rules JSONB DEFAULT '[]',
    
    -- Exit rules
    exit_rules JSONB DEFAULT '[]',
    
    -- Risk parameters
    risk_percent DECIMAL(5,2) DEFAULT 1.0,
    min_rr_ratio DECIMAL(5,2) DEFAULT 2.0,
    max_position_size DECIMAL(15,2),
    
    -- Performance tracking
    times_used INT DEFAULT 0,
    win_count INT DEFAULT 0,
    loss_count INT DEFAULT 0,
    total_pnl DECIMAL(15,2) DEFAULT 0,
    
    -- Visual reference
    screenshot_url TEXT,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_playbook_setups_user_id ON playbook_setups(user_id);

-- =============================================
-- 3. PRE-TRADE CHECKLISTS TABLE
-- User-defined checklists before entering trades
-- =============================================

CREATE TABLE IF NOT EXISTS pre_trade_checklists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    name TEXT NOT NULL DEFAULT 'Default Checklist',
    items JSONB NOT NULL DEFAULT '[]',
    -- items structure: [{"id": "uuid", "text": "Check item text", "required": true}]
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pre_trade_checklists_user_id ON pre_trade_checklists(user_id);

-- =============================================
-- 4. CHECKLIST COMPLETIONS TABLE
-- Track which items were checked for each trade
-- =============================================

CREATE TABLE IF NOT EXISTS checklist_completions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
    checklist_id UUID REFERENCES pre_trade_checklists(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Which items were completed
    completed_items TEXT[] DEFAULT '{}',
    -- All item IDs from checklist at time of trade
    all_items TEXT[] DEFAULT '{}',
    
    -- Completion percentage
    completion_percent DECIMAL(5,2) DEFAULT 100,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checklist_completions_trade_id ON checklist_completions(trade_id);

-- =============================================
-- 5. RLS POLICIES
-- =============================================

ALTER TABLE trade_emotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_setups ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_trade_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_completions ENABLE ROW LEVEL SECURITY;

-- Trade Emotions Policies
DROP POLICY IF EXISTS "Users can view own emotions" ON trade_emotions;
DROP POLICY IF EXISTS "Users can insert own emotions" ON trade_emotions;
DROP POLICY IF EXISTS "Users can update own emotions" ON trade_emotions;
DROP POLICY IF EXISTS "Users can delete own emotions" ON trade_emotions;

CREATE POLICY "Users can view own emotions"
    ON trade_emotions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own emotions"
    ON trade_emotions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own emotions"
    ON trade_emotions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own emotions"
    ON trade_emotions FOR DELETE USING (auth.uid() = user_id);

-- Playbook Policies
DROP POLICY IF EXISTS "Users can view own playbook" ON playbook_setups;
DROP POLICY IF EXISTS "Users can insert own playbook" ON playbook_setups;
DROP POLICY IF EXISTS "Users can update own playbook" ON playbook_setups;
DROP POLICY IF EXISTS "Users can delete own playbook" ON playbook_setups;

CREATE POLICY "Users can view own playbook"
    ON playbook_setups FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own playbook"
    ON playbook_setups FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own playbook"
    ON playbook_setups FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own playbook"
    ON playbook_setups FOR DELETE USING (auth.uid() = user_id);

-- Checklist Policies
DROP POLICY IF EXISTS "Users can view own checklists" ON pre_trade_checklists;
DROP POLICY IF EXISTS "Users can insert own checklists" ON pre_trade_checklists;
DROP POLICY IF EXISTS "Users can update own checklists" ON pre_trade_checklists;
DROP POLICY IF EXISTS "Users can delete own checklists" ON pre_trade_checklists;

CREATE POLICY "Users can view own checklists"
    ON pre_trade_checklists FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own checklists"
    ON pre_trade_checklists FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own checklists"
    ON pre_trade_checklists FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own checklists"
    ON pre_trade_checklists FOR DELETE USING (auth.uid() = user_id);

-- Checklist Completions Policies
DROP POLICY IF EXISTS "Users can view own completions" ON checklist_completions;
DROP POLICY IF EXISTS "Users can insert own completions" ON checklist_completions;

CREATE POLICY "Users can view own completions"
    ON checklist_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions"
    ON checklist_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- 6. HELPER FUNCTION: Get Discipline Stats
-- =============================================

CREATE OR REPLACE FUNCTION get_discipline_stats(p_user_id UUID, p_days INT DEFAULT 30)
RETURNS TABLE (
    avg_discipline_score DECIMAL,
    total_trades_with_emotions BIGINT,
    followed_plan_count BIGINT,
    plan_adherence_percent DECIMAL,
    top_mistakes TEXT[],
    avg_pre_confidence DECIMAL,
    avg_pre_fear DECIMAL,
    avg_pre_greed DECIMAL,
    tilt_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    WITH emotion_data AS (
        SELECT * FROM trade_emotions
        WHERE user_id = p_user_id
        AND created_at >= NOW() - (p_days || ' days')::INTERVAL
    ),
    mistake_counts AS (
        SELECT unnest(mistakes) as mistake, COUNT(*) as cnt
        FROM emotion_data
        GROUP BY unnest(mistakes)
        ORDER BY cnt DESC
        LIMIT 3
    )
    SELECT 
        COALESCE(AVG(e.discipline_score), 0)::DECIMAL as avg_discipline_score,
        COUNT(*)::BIGINT as total_trades_with_emotions,
        COUNT(*) FILTER (WHERE e.followed_plan = true)::BIGINT as followed_plan_count,
        CASE 
            WHEN COUNT(*) > 0 THEN 
                (COUNT(*) FILTER (WHERE e.followed_plan = true)::DECIMAL / COUNT(*)::DECIMAL * 100)
            ELSE 0
        END as plan_adherence_percent,
        COALESCE(ARRAY(SELECT mistake FROM mistake_counts), ARRAY[]::TEXT[]) as top_mistakes,
        COALESCE(AVG(e.pre_confidence), 0)::DECIMAL as avg_pre_confidence,
        COALESCE(AVG(e.pre_fear), 0)::DECIMAL as avg_pre_fear,
        COALESCE(AVG(e.pre_greed), 0)::DECIMAL as avg_pre_greed,
        -- Tilt score: high fear + high greed + low discipline = high tilt
        CASE 
            WHEN COUNT(*) > 0 THEN 
                ((COALESCE(AVG(e.pre_fear), 0) + COALESCE(AVG(e.pre_greed), 0) + COALESCE(AVG(e.pre_fomo), 0)) / 3 
                - COALESCE(AVG(e.discipline_score), 5) / 2)::DECIMAL
            ELSE 0
        END as tilt_score
    FROM emotion_data e;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- DONE! Run this in Supabase SQL Editor
-- =============================================
