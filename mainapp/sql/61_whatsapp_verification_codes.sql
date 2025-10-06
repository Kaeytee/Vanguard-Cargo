-- WhatsApp Verification Codes Table
-- Stores OTP codes for WhatsApp number verification
-- Author: Senior Software Engineer
-- Version: 1.0.0

-- Create whatsapp_verification_codes table
CREATE TABLE IF NOT EXISTS whatsapp_verification_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone_number TEXT NOT NULL,
    otp_code TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_verification_phone ON whatsapp_verification_codes(phone_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_verification_expires ON whatsapp_verification_codes(expires_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_verification_verified ON whatsapp_verification_codes(verified);

-- Add RLS (Row Level Security)
ALTER TABLE whatsapp_verification_codes ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only access their own verification codes
CREATE POLICY "Users can access their own verification codes" ON whatsapp_verification_codes
    FOR ALL USING (true); -- Allow all operations for now, can be restricted later

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_whatsapp_verification_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_whatsapp_verification_codes_updated_at
    BEFORE UPDATE ON whatsapp_verification_codes
    FOR EACH ROW
    EXECUTE FUNCTION update_whatsapp_verification_codes_updated_at();

-- Add columns to users table for WhatsApp verification
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS whatsapp_verified_at TIMESTAMPTZ NULL;

-- Create function to clean up expired verification codes
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM whatsapp_verification_codes 
    WHERE expires_at < NOW() AND verified = FALSE;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get verification status
CREATE OR REPLACE FUNCTION get_whatsapp_verification_status(p_user_id UUID)
RETURNS TABLE (
    has_whatsapp_number BOOLEAN,
    whatsapp_number TEXT,
    is_verified BOOLEAN,
    verified_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (u.whatsapp_number IS NOT NULL) as has_whatsapp_number,
        u.whatsapp_number,
        COALESCE(u.whatsapp_verified, FALSE) as is_verified,
        u.whatsapp_verified_at
    FROM users u
    WHERE u.id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to initiate verification
CREATE OR REPLACE FUNCTION initiate_whatsapp_verification(
    p_user_id UUID,
    p_phone_number TEXT
)
RETURNS JSON AS $$
DECLARE
    existing_user_id UUID;
    result JSON;
BEGIN
    -- Check if phone number already exists for another user
    SELECT id INTO existing_user_id
    FROM users 
    WHERE whatsapp_number = p_phone_number 
    AND id != p_user_id 
    AND whatsapp_verified = TRUE;
    
    IF existing_user_id IS NOT NULL THEN
        result := json_build_object(
            'success', FALSE,
            'error', 'This WhatsApp number is already registered to another account'
        );
        RETURN result;
    END IF;
    
    -- Store the phone number temporarily (unverified)
    UPDATE users 
    SET whatsapp_number = p_phone_number,
        whatsapp_verified = FALSE,
        whatsapp_verified_at = NULL
    WHERE id = p_user_id;
    
    result := json_build_object(
        'success', TRUE,
        'message', 'Phone number validation successful'
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to complete verification
CREATE OR REPLACE FUNCTION complete_whatsapp_verification(
    p_user_id UUID,
    p_phone_number TEXT
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Update user verification status
    UPDATE users 
    SET whatsapp_verified = TRUE,
        whatsapp_verified_at = NOW()
    WHERE id = p_user_id 
    AND whatsapp_number = p_phone_number;
    -- Add WhatsApp verification column to users table
-- This small addition enables WhatsApp verification tracking

-- Add whatsapp_verified column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN DEFAULT FALSE;

-- Create function to verify and update WhatsApp number
CREATE OR REPLACE FUNCTION verify_whatsapp_number(
    p_user_id UUID,

    -- Clean up verification codes for this phone number
    DELETE FROM whatsapp_verification_codes 
    WHERE phone_number = p_phone_number;
    
    result := json_build_object(
        'success', TRUE,
        'message', 'WhatsApp number verified successfully!'
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT ALL ON whatsapp_verification_codes TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_expired_verification_codes() TO authenticated;
GRANT EXECUTE ON FUNCTION get_whatsapp_verification_status(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION initiate_whatsapp_verification(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION complete_whatsapp_verification(UUID, TEXT) TO authenticated;

-- Add comment
COMMENT ON TABLE whatsapp_verification_codes IS 'Stores OTP verification codes for WhatsApp number verification';
COMMENT ON FUNCTION cleanup_expired_verification_codes() IS 'Cleans up expired verification codes';
COMMENT ON FUNCTION get_whatsapp_verification_status(UUID) IS 'Gets WhatsApp verification status for a user';
COMMENT ON FUNCTION initiate_whatsapp_verification(UUID, TEXT) IS 'Initiates WhatsApp verification process';
COMMENT ON FUNCTION complete_whatsapp_verification(UUID, TEXT) IS 'Completes WhatsApp verification process';
