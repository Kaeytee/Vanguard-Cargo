-- Create email notifications log table for audit trail
-- This table tracks all email notifications sent to users

CREATE TABLE IF NOT EXISTS email_notifications_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  package_id UUID REFERENCES packages(id) ON DELETE SET NULL,
  email_type VARCHAR(50) NOT NULL, -- 'status_change', 'welcome', 'reminder', etc.
  status VARCHAR(50), -- Package status when email was sent
  message_id VARCHAR(255), -- Email service message ID for tracking
  recipient_email VARCHAR(255) NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  success BOOLEAN DEFAULT true,
  error_message TEXT, -- Store error details if email failed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_email_notifications_log_user_id ON email_notifications_log(user_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_log_package_id ON email_notifications_log(package_id);
CREATE INDEX IF NOT EXISTS idx_email_notifications_log_email_type ON email_notifications_log(email_type);
CREATE INDEX IF NOT EXISTS idx_email_notifications_log_sent_at ON email_notifications_log(sent_at);

-- Enable Row Level Security
ALTER TABLE email_notifications_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only view their own email notification logs
CREATE POLICY "Users can view own email logs" ON email_notifications_log
  FOR SELECT USING (auth.uid() = user_id);

-- Only authenticated users can insert email logs (for service usage)
CREATE POLICY "Service can insert email logs" ON email_notifications_log
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Admins can view all email logs
CREATE POLICY "Admins can view all email logs" ON email_notifications_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- Add helpful comments
COMMENT ON TABLE email_notifications_log IS 'Audit trail for all email notifications sent to users';
COMMENT ON COLUMN email_notifications_log.email_type IS 'Type of email notification (status_change, welcome, reminder, etc.)';
COMMENT ON COLUMN email_notifications_log.message_id IS 'Email service provider message ID for tracking delivery';
COMMENT ON COLUMN email_notifications_log.success IS 'Whether the email was sent successfully';
COMMENT ON COLUMN email_notifications_log.error_message IS 'Error details if email sending failed';
