-- =====================================================
-- 01_SETUP_FUNCTIONS.SQL
-- Package Forwarding Address Management System Setup
-- 
-- PURPOSE: Creates the core functions needed for address management
-- WHEN TO RUN: First time setup only
-- SAFE TO RE-RUN: Yes, will update existing functions
-- =====================================================

-- Function 1: Update master warehouse address for all customers
-- This updates the warehouse address that ALL customers will use
CREATE OR REPLACE FUNCTION update_master_warehouse_address(
    p_street_address TEXT,
    p_city TEXT, 
    p_state TEXT,
    p_postal_code TEXT,
    p_country TEXT DEFAULT 'USA',
    p_updated_by UUID DEFAULT NULL
) RETURNS INTEGER AS $$
DECLARE
    v_updated_count INTEGER;
BEGIN
    -- Update all active addresses with new warehouse info
    UPDATE public.us_shipping_addresses 
    SET 
        street_address = p_street_address,
        city = p_city,
        state = p_state, 
        postal_code = p_postal_code,
        country = p_country,
        updated_by = p_updated_by,
        updated_at = NOW()
    WHERE is_active = true;
    
    GET DIAGNOSTICS v_updated_count = ROW_COUNT;
    
    RETURN v_updated_count;
END;
$$ LANGUAGE plpgsql;

-- Function 2: Assign next available suite number to new customer
-- This gives each customer a unique suite number (VC-10001, VC-10002, etc.)
CREATE OR REPLACE FUNCTION assign_next_suite_number(
    p_user_id UUID,
    p_warehouse_id UUID DEFAULT NULL,
    p_assigned_by UUID DEFAULT NULL
) RETURNS TEXT AS $$
DECLARE
    v_next_suite TEXT;
    v_current_max INTEGER;
    v_address_id UUID;
    v_master_address RECORD;
BEGIN
    -- Get current master warehouse address (use first active record as template)
    SELECT street_address, city, state, postal_code, country
    INTO v_master_address
    FROM public.us_shipping_addresses
    WHERE is_active = true
    LIMIT 1;
    
    -- If no addresses exist, use defaults
    IF v_master_address IS NULL THEN
        v_master_address.street_address := '123 Warehouse Street';
        v_master_address.city := 'Atlanta';
        v_master_address.state := 'GA';
        v_master_address.postal_code := '30309';
        v_master_address.country := 'USA';
    END IF;
    
    -- Find next available suite number (VC-##### format)
    SELECT COALESCE(MAX(CAST(SUBSTRING(suite_number FROM 'VC-([0-9]+)') AS INTEGER)), 10000) + 1
    INTO v_current_max
    FROM public.us_shipping_addresses
    WHERE suite_number ~ '^VC-[0-9]+$';
    
    -- Format as VC-##### (5 digits)
    v_next_suite := 'VC-' || LPAD(v_current_max::TEXT, 5, '0');
    
    -- Create address record
    INSERT INTO public.us_shipping_addresses (
        user_id,
        suite_number,
        street_address,
        city, 
        state,
        postal_code,
        country,
        warehouse_id,
        assigned_by,
        is_active
    ) VALUES (
        p_user_id,
        v_next_suite,
        v_master_address.street_address,
        v_master_address.city,
        v_master_address.state, 
        v_master_address.postal_code,
        v_master_address.country,
        p_warehouse_id,
        p_assigned_by,
        true
    ) RETURNING id INTO v_address_id;
    
    -- Link to user profile
    UPDATE public.user_profiles 
    SET us_shipping_address_id = v_address_id,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN v_next_suite;
END;
$$ LANGUAGE plpgsql;

-- Function 3: Get next available suite number (utility function)
-- Use this to preview what the next suite number will be
CREATE OR REPLACE FUNCTION get_next_suite_number() RETURNS TEXT AS $$
DECLARE
    v_current_max INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(suite_number FROM 'VC-([0-9]+)') AS INTEGER)), 10000) + 1
    INTO v_current_max
    FROM public.us_shipping_addresses
    WHERE suite_number ~ '^VC-[0-9]+$';
    
    RETURN 'VC-' || LPAD(v_current_max::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'SUCCESS: All functions created successfully!' as status;
SELECT 'NEXT STEP: Run 02_master_address_management.sql to set your warehouse address' as next_step;
