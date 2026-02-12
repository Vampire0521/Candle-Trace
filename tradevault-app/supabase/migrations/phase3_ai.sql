-- =============================================
-- TRADEVAULT - PHASE 3: AI ANALYTICS ENGINE
-- Database schema for AI insights, chat, and patterns
-- =============================================

-- Table: AI Insights (per-trade analysis)
CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    trade_id UUID REFERENCES trades(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('trade_analysis', 'pattern', 'tip', 'alert')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
    metadata JSONB DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: AI Conversations (chat history)
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'New Chat',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: AI Messages (chat messages)
CREATE TABLE IF NOT EXISTS ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Table: AI Patterns (detected trading patterns)
CREATE TABLE IF NOT EXISTS ai_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pattern_type TEXT NOT NULL CHECK (pattern_type IN ('winning', 'losing', 'neutral')),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    criteria JSONB NOT NULL, -- Conditions that define this pattern
    trade_ids UUID[] DEFAULT '{}', -- Trades matching this pattern
    win_rate DECIMAL(5,2),
    avg_pnl DECIMAL(12,2),
    occurrence_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Table: AI Tips (personalized suggestions)
CREATE TABLE IF NOT EXISTS ai_tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('psychology', 'risk', 'strategy', 'timing', 'general')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    is_dismissed BOOLEAN DEFAULT false,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_insights_user ON ai_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_trade ON ai_insights(trade_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_patterns_user ON ai_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_tips_user ON ai_tips(user_id);

-- Row Level Security
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tips ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own data
CREATE POLICY "Users can view own insights"
    ON ai_insights FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
    ON ai_insights FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
    ON ai_insights FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights"
    ON ai_insights FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own conversations"
    ON ai_conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
    ON ai_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
    ON ai_conversations FOR DELETE
    USING (auth.uid() = user_id);

-- Messages accessible via conversation ownership
CREATE POLICY "Users can view messages in own conversations"
    ON ai_messages FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM ai_conversations 
        WHERE id = ai_messages.conversation_id 
        AND user_id = auth.uid()
    ));

CREATE POLICY "Users can insert messages in own conversations"
    ON ai_messages FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM ai_conversations 
        WHERE id = ai_messages.conversation_id 
        AND user_id = auth.uid()
    ));

CREATE POLICY "Users can view own patterns"
    ON ai_patterns FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own patterns"
    ON ai_patterns FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view own tips"
    ON ai_tips FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own tips"
    ON ai_tips FOR ALL
    USING (auth.uid() = user_id);
