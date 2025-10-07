-- Core Functions for Waybill, Barcode, QR Code, Receipt, and Verification
-- Implements backend logic for document generation and package verification
-- 
-- @author Senior Software Engineer
-- @version 1.0.0
-- @date 2025-10-07

-- ============================================================================
-- SECTION 1: UTILITY FUNCTIONS
-- ============================================================================

-- Function to generate unique receipt number
CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TEXT AS $$
DECLARE
    new_receipt_number TEXT;
    counter INTEGER := 1;
    date_part TEXT;
BEGIN
    date_part := TO_CHAR(NOW(), 'YYYYMMDD');
    
    LOOP
        new_receipt_number := 'RCP-' || date_part || '-' || LPAD(counter::TEXT, 4, '0');
        
        IF NOT EXISTS (
            SELECT 1 FROM receipts WHERE receipt_number = new_receipt_number
        ) THEN
            RETURN new_receipt_number;
        END IF;
        
        counter := counter + 1;
        
        IF counter > 9999 THEN
            RAISE EXCEPTION 'Unable to generate unique receipt number for today';
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate 6-digit authentication code
CREATE OR REPLACE FUNCTION generate_auth_code()
RETURNS TEXT AS $$
DECLARE
    auth_code TEXT;
BEGIN
    auth_code := LPAD((FLOOR(RANDOM() * 900000) + 100000)::TEXT, 6, '0');
    RETURN auth_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 2: WAYBILL GENERATION FUNCTION
-- ============================================================================

-- Function to generate digital waybill for shipment
CREATE OR REPLACE FUNCTION generate_waybill(
    p_shipment_id UUID,
    p_generated_by UUID
)
RETURNS JSON AS $$
DECLARE
    shipment_record RECORD;
    packages_data JSONB;
    sender_info JSONB;
    receiver_info JSONB;
    waybill_json JSONB;
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = p_generated_by 
        AND role IN ('warehouse_admin', 'admin', 'superadmin', 'super_admin')
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Insufficient permissions for waybill generation'
        );
    END IF;
    
    SELECT 
        s.*,
        u.first_name AS sender_first_name,
        u.last_name AS sender_last_name,
        u.email AS sender_email,
        u.phone_number AS sender_phone,
        u.suite_number AS sender_suite
    INTO shipment_record
    FROM shipments s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = p_shipment_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Shipment not found'
        );
    END IF;
    
    SELECT jsonb_agg(
        jsonb_build_object(
            'package_id', p.package_id,
            'tracking_number', p.tracking_number,
            'description', p.description,
            'weight', p.weight,
            'declared_value', p.declared_value,
            'barcode_data', p.barcode_data,
            'qr_code_data', p.qr_code_data
        )
    )
    INTO packages_data
    FROM packages p
    JOIN package_shipments ps ON p.id = ps.package_id
    WHERE ps.shipment_id = p_shipment_id;
    
    sender_info := jsonb_build_object(
        'name', shipment_record.sender_first_name || ' ' || shipment_record.sender_last_name,
        'email', shipment_record.sender_email,
        'phone', shipment_record.sender_phone,
        'suite_number', shipment_record.sender_suite
    );
    
    receiver_info := jsonb_build_object(
        'name', shipment_record.recipient_name,
        'phone', shipment_record.recipient_phone,
        'address', shipment_record.delivery_address,
        'city', shipment_record.delivery_city,
        'country', shipment_record.delivery_country
    );
    
    waybill_json := jsonb_build_object(
        'waybill_number', shipment_record.tracking_number,
        'generated_at', NOW(),
        'generated_by', p_generated_by,
        'shipment_details', jsonb_build_object(
            'shipment_id', shipment_record.id,
            'tracking_number', shipment_record.tracking_number,
            'status', shipment_record.status,
            'service_type', shipment_record.service_type,
            'total_weight', shipment_record.total_weight,
            'total_value', shipment_record.total_value,
            'shipping_cost', shipment_record.shipping_cost,
            'estimated_delivery', shipment_record.estimated_delivery,
            'created_at', shipment_record.created_at
        ),
        'sender', sender_info,
        'receiver', receiver_info,
        'packages', COALESCE(packages_data, '[]'::jsonb),
        'barcode_data', shipment_record.barcode_data,
        'qr_code_data', shipment_record.qr_code_data,
        'warehouse_info', jsonb_build_object(
            'name', 'VanguardCargo Warehouse',
            'contact', 'info@vanguardcargo.com'
        )
    );
    
    UPDATE shipments
    SET 
        waybill_data = waybill_json,
        waybill_generated_at = NOW(),
        updated_at = NOW()
    WHERE id = p_shipment_id;
    
    RETURN json_build_object(
        'success', true,
        'waybill', waybill_json,
        'message', 'Waybill generated successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SECTION 3: BARCODE AND QR CODE STORAGE FUNCTIONS
-- ============================================================================

-- Function to store barcode and QR code data for package
CREATE OR REPLACE FUNCTION store_package_codes(
    p_package_id UUID,
    p_barcode_data TEXT,
    p_qr_code_data TEXT,
    p_staff_id UUID
)
RETURNS JSON AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = p_staff_id 
        AND role IN ('warehouse_admin', 'admin', 'superadmin', 'super_admin')
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Insufficient permissions'
        );
    END IF;
    
    UPDATE packages
    SET 
        barcode_data = p_barcode_data,
        qr_code_data = p_qr_code_data,
        updated_at = NOW()
    WHERE id = p_package_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Package not found'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Barcode and QR code stored successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to store barcode and QR code data for shipment
CREATE OR REPLACE FUNCTION store_shipment_codes(
    p_shipment_id UUID,
    p_barcode_data TEXT,
    p_qr_code_data TEXT,
    p_staff_id UUID
)
RETURNS JSON AS $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = p_staff_id 
        AND role IN ('warehouse_admin', 'admin', 'superadmin', 'super_admin')
    ) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Insufficient permissions'
        );
    END IF;
    
    UPDATE shipments
    SET 
        barcode_data = p_barcode_data,
        qr_code_data = p_qr_code_data,
        updated_at = NOW()
    WHERE id = p_shipment_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Shipment not found'
        );
    END IF;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Shipment barcode and QR code stored successfully'
    );
    
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
