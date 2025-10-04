-- Add WhatsApp verification column to users table
-- This small addition enables WhatsApp verification tracking

-- Add whatsapp_verified column if it doesn't exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN DEFAULT FALSE;

-- Create function to verify and update WhatsApp number
CREATE OR REPLACE FUNCTION verify_whatsapp_number(
    p_user_id UUID,
    p_whatsapp_number TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    existing_user_id UUID;
    result JSON;
BEGIN
    -- Validate WhatsApp number format (basic validation)
    IF p_whatsapp_number IS NULL OR LENGTH(TRIM(p_whatsapp_number)) < 10 THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Invalid WhatsApp number format'
        );
    END IF;
    
    -- Check if WhatsApp number is already used by another user
    SELECT id INTO existing_user_id 
    FROM users 
    WHERE whatsapp_number = p_whatsapp_number 
    AND whatsapp_verified = true 
    AND id != p_user_id;
    
    IF existing_user_id IS NOT NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'WhatsApp number already verified by another user'
        );
    END IF;
    
    -- Update user's WhatsApp number and mark as verified
    UPDATE users 
    SET 
        whatsapp_number = p_whatsapp_number,
        whatsapp_verified = true,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Return success response
    RETURN json_build_object(
        'success', true,
        'message', 'WhatsApp number verified successfully',
        'whatsapp_number', p_whatsapp_number
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$;

-- Create function to check WhatsApp verification status
CREATE OR REPLACE FUNCTION get_whatsapp_status(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_whatsapp TEXT;
    is_verified BOOLEAN;
BEGIN
    SELECT whatsapp_number, whatsapp_verified 
    INTO user_whatsapp, is_verified
    FROM users 
    WHERE id = p_user_id;
    
    RETURN json_build_object(
        'whatsapp_number', user_whatsapp,
        'verified', COALESCE(is_verified, false),
        'has_number', user_whatsapp IS NOT NULL
    );
END;
$$;
