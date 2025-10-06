-- =====================================================
-- CREATE SUPPORT MESSAGES TABLE
-- =====================================================
-- This script creates the support_messages table to store
-- customer support inquiries and contact form submissions
-- =====================================================

-- Create support_messages table
CREATE TABLE IF NOT EXISTS support_messages (
    -- Primary key and identification
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Message details
    name TEXT NOT NULL,                                    -- Customer name
    email TEXT NOT NULL,                                   -- Customer email
    subject TEXT NOT NULL,                                 -- Message subject
    message TEXT NOT NULL,                                 -- Message content
    category TEXT NOT NULL DEFAULT 'general' CHECK (category IN (
        'general',      -- General inquiry
        'support',      -- Technical support
        'feedback',     -- Customer feedback
        'complaint'     -- Customer complaint
    )),
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN (
        'new',          -- New message, not yet reviewed
        'in_progress',  -- Being handled by support team
        'resolved',     -- Issue resolved
        'closed'        -- Message closed/archived
    )),
    
    -- Optional user association (if logged in user)
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Response tracking
    responded_at TIMESTAMP WITH TIME ZONE,                 -- When response was sent
    responded_by UUID REFERENCES users(id) ON DELETE SET NULL, -- Who responded
    response_message TEXT,                                 -- Response content
    
    -- Email delivery tracking
    email_sent BOOLEAN DEFAULT FALSE,                      -- Whether confirmation email was sent
    email_sent_at TIMESTAMP WITH TIME ZONE,               -- When email was sent
    email_error TEXT,                                      -- Email sending error (if any)
    
    -- Metadata
    ip_address INET,                                       -- Client IP address
    user_agent TEXT,                                       -- Client user agent
    source TEXT DEFAULT 'web' CHECK (source IN (
        'web',          -- Web form submission
        'mobile',       -- Mobile app submission
        'api'           -- Direct API submission
    )),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),    -- Creation timestamp
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()     -- Last update timestamp
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_support_messages_email ON support_messages(email);
CREATE INDEX IF NOT EXISTS idx_support_messages_status ON support_messages(status);
CREATE INDEX IF NOT EXISTS idx_support_messages_category ON support_messages(category);
CREATE INDEX IF NOT EXISTS idx_support_messages_created_at ON support_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_messages_user_id ON support_messages(user_id) WHERE user_id IS NOT NULL;

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_support_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_support_messages_updated_at
    BEFORE UPDATE ON support_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_support_messages_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Allow anyone to insert support messages (for contact form)
CREATE POLICY "Allow public insert support messages" ON support_messages
    FOR INSERT TO anon, authenticated
    WITH CHECK (true);

-- Allow users to view their own messages
CREATE POLICY "Users can view own support messages" ON support_messages
    FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Allow admins and superadmins to view all messages
CREATE POLICY "Admins can view all support messages" ON support_messages
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Allow admins and superadmins to update messages (for responses)
CREATE POLICY "Admins can update support messages" ON support_messages
    FOR UPDATE TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() 
            AND role IN ('admin', 'superadmin')
        )
    );

-- Grant necessary permissions
GRANT SELECT, INSERT ON support_messages TO anon;
GRANT ALL ON support_messages TO authenticated;
GRANT ALL ON support_messages TO service_role;

-- Add helpful comments
COMMENT ON TABLE support_messages IS 'Stores customer support inquiries and contact form submissions';
COMMENT ON COLUMN support_messages.category IS 'Type of inquiry: general, support, feedback, complaint';
COMMENT ON COLUMN support_messages.status IS 'Processing status: new, in_progress, resolved, closed';
COMMENT ON COLUMN support_messages.email_sent IS 'Whether confirmation email was sent to customer';
COMMENT ON COLUMN support_messages.source IS 'Source of submission: web, mobile, api';

-- Success message
DO $$
BEGIN
    RAISE NOTICE 'Support messages table created successfully with RLS policies and indexes';
END $$;
