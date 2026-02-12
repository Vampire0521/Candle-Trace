-- =============================================
-- TRADEVAULT - PHASE 1 MIGRATION (SAFE VERSION)
-- Tags, MFE/MAE, Screenshots, Advanced Fields
-- This version is safe to run on existing database
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
-- 4. RLS POLICIES FOR NEW TABLES
-- =============================================

ALTER TABLE trade_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE trade_tag_links ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid errors)
DROP POLICY IF EXISTS "Users can view own tags" ON trade_tags;
DROP POLICY IF EXISTS "Users can insert own tags" ON trade_tags;
DROP POLICY IF EXISTS "Users can update own tags" ON trade_tags;
DROP POLICY IF EXISTS "Users can delete own tags" ON trade_tags;

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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own tag links" ON trade_tag_links;
DROP POLICY IF EXISTS "Users can insert own tag links" ON trade_tag_links;
DROP POLICY IF EXISTS "Users can delete own tag links" ON trade_tag_links;

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
-- DONE! You should see "Success" message
-- =============================================
