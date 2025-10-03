import { supabase } from '../lib/supabase';

/**
 * Debug utility to check what packages exist for a user
 * This helps debug why packages aren't showing in shipment history
 */

export async function debugUserPackages(userId: string) {
  console.log('🔍 DEBUG: Checking packages for user:', userId);
  
  try {
    // 1. Get ALL packages for the user (regardless of status)
    const { data: allPackages, error: allError } = await supabase
      .from('packages')
      .select(`
        id,
        package_id,
        tracking_number,
        status,
        processed_at,
        shipped_at,
        created_at,
        updated_at,
        store_name,
        vendor_name,
        description,
        user_id
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (allError) {
      console.error('❌ Error fetching all packages:', allError);
      return;
    }

    console.log('📦 ALL PACKAGES:', allPackages);
    console.log('📊 Total packages found:', allPackages?.length || 0);

    // 2. Group by status
    const statusCounts: Record<string, number> = {};
    allPackages?.forEach(pkg => {
      statusCounts[pkg.status] = (statusCounts[pkg.status] || 0) + 1;
    });
    
    console.log('📈 Packages by status:', statusCounts);

    // 3. Check specifically for shipped packages
    const shippedPackages = allPackages?.filter(pkg => pkg.status === 'shipped');
    console.log('🚢 SHIPPED packages:', shippedPackages);

    // 4. Check processing packages
    const processingPackages = allPackages?.filter(pkg => pkg.status === 'processing');
    console.log('⚙️ PROCESSING packages:', processingPackages);

    // 5. Check received packages (should be in intake)
    const receivedPackages = allPackages?.filter(pkg => pkg.status === 'received');
    console.log('📥 RECEIVED packages (should be in intake):', receivedPackages);

    // 6. Test the shipment history query
    console.log('🔍 Testing shipment history query...');
    
    const { data: shipmentHistoryPackages, error: shipmentError } = await supabase
      .from('packages')
      .select(`
        id,
        package_id,
        tracking_number,
        status,
        shipped_at,
        created_at,
        store_name,
        vendor_name,
        description,
        users!packages_user_id_fkey(
          id,
          first_name,
          last_name,
          street_address,
          city,
          country,
          phone_number
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'shipped')
      .not('shipped_at', 'is', null)
      .order('shipped_at', { ascending: false });

    if (shipmentError) {
      console.error('❌ Error in shipment history query:', shipmentError);
    } else {
      console.log('📋 Shipment history query result:', shipmentHistoryPackages);
    }

    // 7. Test without the shipped_at filter
    console.log('🔍 Testing without shipped_at filter...');
    
    const { data: allShippedPackages, error: allShippedError } = await supabase
      .from('packages')
      .select(`
        id,
        package_id,
        tracking_number,
        status,
        shipped_at,
        created_at,
        store_name,
        users!packages_user_id_fkey(
          id,
          first_name,
          last_name,
          city,
          country
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'shipped')
      .order('created_at', { ascending: false });

    if (allShippedError) {
      console.error('❌ Error in all shipped query:', allShippedError);
    } else {
      console.log('📋 All shipped packages (no shipped_at filter):', allShippedPackages);
    }

  } catch (error) {
    console.error('💥 Unexpected error in debug:', error);
  }
}

// Function to manually move a package to shipped status for testing
export async function debugMovePackageToShipped(packageId: string) {
  console.log('🔧 DEBUG: Moving package to shipped status:', packageId);
  
  try {
    const { data, error } = await supabase
      .from('packages')
      .update({
        status: 'shipped',
        shipped_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', packageId)
      .select();

    if (error) {
      console.error('❌ Error moving package:', error);
    } else {
      console.log('✅ Package moved to shipped:', data);
    }
  } catch (error) {
    console.error('💥 Unexpected error moving package:', error);
  }
}

// Function to check user data
export async function debugUserData(userId: string) {
  console.log('👤 DEBUG: Checking user data:', userId);
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId);

    if (error) {
      console.error('❌ Error fetching user:', error);
    } else {
      console.log('👤 User data:', data);
    }
  } catch (error) {
    console.error('💥 Unexpected error fetching user:', error);
  }
}
