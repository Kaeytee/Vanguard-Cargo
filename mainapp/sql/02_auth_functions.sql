-- Authentication Functions and Triggers
-- Simple user registration and suite number generation
-- 
-- @author Senior Software Engineer
-- @version 1.0.0

-- Function to generate unique suite number
CREATE OR REPLACE FUNCTION generate_suite_number()
RETURNS TEXT AS $$
DECLARE
    new_suite_number TEXT;
    counter INTEGER := 1;
BEGIN
    LOOP
        -- Generate suite number in format VC-001, VC-002, etc.
        new_suite_number := 'VC-' || LPAD(counter::TEXT, 3, '0');
        
        -- Check if this suite number already exists
        IF NOT EXISTS (SELECT 1 FROM users WHERE suite_number = new_suite_number) THEN
            RETURN new_suite_number;
        END IF;
        
        counter := counter + 1;
        
        -- Safety check to prevent infinite loop
        IF counter > 9999 THEN
            RAISE EXCEPTION 'Unable to generate unique suite number';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_suite_number TEXT;
BEGIN
    -- Generate unique suite number
    new_suite_number := generate_suite_number();
    
    -- Insert user record with suite number
    INSERT INTO users (
        id,
        email,
        first_name,
        last_name,
        suite_number,
        email_verified
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        new_suite_number,
        NEW.email_confirmed_at IS NOT NULL
    )
    ON CONFLICT (id) DO UPDATE SET
        email = NEW.email,
        first_name = COALESCE(NEW.raw_user_meta_data->>'first_name', users.first_name),
        last_name = COALESCE(NEW.raw_user_meta_data->>'last_name', users.last_name),
        email_verified = NEW.email_confirmed_at IS NOT NULL;
    
    -- Create default user preferences
    INSERT INTO user_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update user profile
CREATE OR REPLACE FUNCTION update_user_profile(
    user_id UUID,
    new_first_name TEXT DEFAULT NULL,
    new_last_name TEXT DEFAULT NULL,
    new_phone TEXT DEFAULT NULL,
    new_street_address TEXT DEFAULT NULL,
    new_city TEXT DEFAULT NULL,
    new_country TEXT DEFAULT NULL,
    new_postal_code TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Update user profile
    UPDATE users 
    SET 
        first_name = COALESCE(new_first_name, first_name),
        last_name = COALESCE(new_last_name, last_name),
        phone_number = COALESCE(new_phone, phone_number),
        street_address = COALESCE(new_street_address, street_address),
        city = COALESCE(new_city, city),
        country = COALESCE(new_country, country),
        postal_code = COALESCE(new_postal_code, postal_code),
        updated_at = NOW()
    WHERE id = user_id;
    
    -- Return success response
    RETURN json_build_object(
        'success', true,
        'message', 'Profile updated successfully'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user preferences
CREATE OR REPLACE FUNCTION update_user_preferences(
    user_id UUID,
    new_language TEXT DEFAULT NULL,
    new_units TEXT DEFAULT NULL,
    new_auto_refresh BOOLEAN DEFAULT NULL,
    new_email_notifications BOOLEAN DEFAULT NULL,
    new_sms_notifications BOOLEAN DEFAULT NULL,
    new_push_notifications BOOLEAN DEFAULT NULL
)
RETURNS JSON AS $$
BEGIN
    -- Update preferences
    UPDATE user_preferences 
    SET 
        language = COALESCE(new_language, language),
        units = COALESCE(new_units, units),
        auto_refresh = COALESCE(new_auto_refresh, auto_refresh),
        email_notifications = COALESCE(new_email_notifications, email_notifications),
        sms_notifications = COALESCE(new_sms_notifications, sms_notifications),
        push_notifications = COALESCE(new_push_notifications, push_notifications),
        updated_at = NOW()
    WHERE user_id = update_user_preferences.user_id;
    
    -- Return success response
    RETURN json_build_object(
        'success', true,
        'message', 'Preferences updated successfully'
    );
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
