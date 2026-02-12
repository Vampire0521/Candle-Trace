-- =============================================
-- TRADEVAULT - PHASE 1 MIGRATION
-- Tags, MFE/MAE, Screenshots, Advanced Fields
-- Run in Supabase SQL Editor
-- =============================================

-- =============================================
-- 1. ADD NEW COLUMNS TO TRADES TABLE
-- =============================================

-- Add MFE/MAE columns (Maximum Favorable/Adverse Excursion)
ALTER TABLE trades ADD COLUMN IF NOT EXISTS mfe DECIMAL(15, 6);
ALTER TABLE trades ADD COLUMN IF NOT EXISTS mae DECIMAL(15, 6);

-- Add screenshot URL for trade charts
ALTER TABLE trades ADD COLUMN IF NOT EXISTS screenshot_url TEXT;

-- Add entry/exit time for time-based analysis
ALTER TABLE trades ADD COLUMN IF NOT EXISTS entry_time TIME;
ALTER TABLE trades ADD COLUMN IF NOT EXISTS exit_time TIME;

-- Add commission/fees tracking
ALTER TABLE trades ADD COLUMN IF NOT EXISTS commission DECIMAL(10, 2) DEFAULT 0;
ALTER TABLE trades ADD COLUMN IF NOT EXISTS fees DECIMAL(10, 2) DEFAULT 0;

-- =============================================
-- 2. CREATE TRADE TAGS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS trade_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#8b5cf6',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

CREATE INDEX IF NOT EXISTS idx_trade_tags_user_id ON trade_tags(user_id);

-- =============================================
-- 3. CREATE TAG-TRADE JUNCTION TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS trade_tag_links (
    trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES trade_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (trade_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_trade_tag_links_trade_id ON trade_tag_links(trade_id);
CREATE INDEX IF NOT EXISTS idx_trade_tag_links_tag_id ON trade_tag_links(tag_id);

-- =============================================
-- 4. CREATE EMOTION TYPES FOR PHASE 2
-- =============================================

CREATE TYPE IF NOT EXISTS emotion_type AS ENUM (
    'confident', 'fearful', 'greedy', 'neutral', 'anxious', 'excited', 'frustrated'
);

CREATE TYPE IF NOT EXISTS mistake_type AS ENUM (
    'fomo', 'revenge', 'oversize', 'early_exit', 'late_entry', 
    'no_stop_loss', 'moved_stop', 'ignored_plan', 'overtrading'
);

-- =============================================
-- 5. RLS POLICIES FOR NEW TABLES
-- =============================================

ALTER TABLE trade_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_tag_links ENABLE ROW LEVEL SECURITY;

-- Trade Tags Policies
CREATE POLICY "Users can view own tags"
    ON trade_tags FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags"
    ON trade_tags FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags"
    ON trade_tags FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags"
    ON trade_tags FOR DELETE
    USING (auth.uid() = user_id);

-- Trade Tag Links Policies (via trade ownership)
CREATE POLICY "Users can view own tag links"
    ON trade_tag_links FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM trades 
            WHERE trades.id = trade_tag_links.trade_id 
            AND trades.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own tag links"
    ON trade_tag_links FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM trades 
            WHERE trades.id = trade_tag_links.trade_id 
            AND trades.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own tag links"
    ON trade_tag_links FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM trades 
            WHERE trades.id = trade_tag_links.trade_id 
            AND trades.user_id = auth.uid()
        )
    );

-- =============================================
-- 6. HELPER VIEW FOR TRADES WITH TAGS
-- =============================================

CREATE OR REPLACE VIEW trades_with_tags AS
SELECT 
    t.*,
    CASE 
        WHEN t.side = 'long' THEN (t.exit_price - t.entry_price) * t.quantity
        ELSE (t.entry_price - t.exit_price) * t.quantity
    END as pnl,
    COALESCE(
        (SELECT json_agg(json_build_object('id', tt.id, 'name', tt.name, 'color', tt.color))
         FROM trade_tag_links ttl
         JOIN trade_tags tt ON tt.id = ttl.tag_id
         WHERE ttl.trade_id = t.id),
        '[]'::json
    ) as tags
FROM trades t;

-- =============================================
-- 7. FUNCTION TO GET TIME-BASED STATS
-- =============================================

CREATE OR REPLACE FUNCTION get_time_based_stats(p_user_id UUID)
RETURNS TABLE (
    hour_of_day INT,
    day_of_week INT,
    trade_count BIGINT,
    total_pnl DECIMAL,
    win_count BIGINT,
    loss_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        EXTRACT(HOUR FROM t.entry_time)::INT as hour_of_day,
        EXTRACT(DOW FROM t.trade_date)::INT as day_of_week,
        COUNT(*)::BIGINT as trade_count,
        SUM(
            CASE 
                WHEN t.side = 'long' THEN (t.exit_price - t.entry_price) * t.quantity
                ELSE (t.entry_price - t.exit_price) * t.quantity
            END
        )::DECIMAL as total_pnl,
        COUNT(*) FILTER (
            WHERE (t.side = 'long' AND t.exit_price > t.entry_price) 
               OR (t.side = 'short' AND t.exit_price < t.entry_price)
        )::BIGINT as win_count,
        COUNT(*) FILTER (
            WHERE (t.side = 'long' AND t.exit_price <= t.entry_price) 
               OR (t.side = 'short' AND t.exit_price >= t.entry_price)
        )::BIGINT as loss_count
    FROM trades t
    WHERE t.user_id = p_user_id
    AND t.entry_time IS NOT NULL
    GROUP BY hour_of_day, day_of_week
    ORDER BY hour_of_day, day_of_week;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- 8. FUNCTION TO GET MFE/MAE STATS
-- =============================================

CREATE OR REPLACE FUNCTION get_mfe_mae_stats(p_user_id UUID)
RETURNS TABLE (
    avg_mfe DECIMAL,
    avg_mae DECIMAL,
    max_mfe DECIMAL,
    max_mae DECIMAL,
    mfe_capture_ratio DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        AVG(t.mfe)::DECIMAL as avg_mfe,
        AVG(t.mae)::DECIMAL as avg_mae,
        MAX(t.mfe)::DECIMAL as max_mfe,
        MAX(t.mae)::DECIMAL as max_mae,
        CASE 
            WHEN AVG(t.mfe) > 0 THEN 
                AVG(
                    CASE 
                        WHEN t.side = 'long' THEN (t.exit_price - t.entry_price)
                        ELSE (t.entry_price - t.exit_price)
                    END
                ) / AVG(t.mfe)
            ELSE 0
        END::DECIMAL as mfe_capture_ratio
    FROM trades t
    WHERE t.user_id = p_user_id
    AND t.mfe IS NOT NULL
    AND t.mae IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- DONE! Run this in Supabase SQL Editor
-- =============================================
