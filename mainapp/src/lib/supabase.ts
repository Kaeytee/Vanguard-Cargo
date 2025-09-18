import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config/supabase';

// Create Supabase client with Cloudflare cookie error handling
export const supabase = createClient(
  SUPABASE_CONFIG.url,
  SUPABASE_CONFIG.anonKey,
  {
    auth: SUPABASE_CONFIG.auth,
    realtime: SUPABASE_CONFIG.realtime,
    global: {
      headers: {
        'User-Agent': 'vanguard-cargo/1.0.0',
      },
    },
  }
);

// Database types (will be updated as we build)
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          role: 'customer' | 'admin' | 'warehouse_staff';
          us_shipping_address_id: string | null;
          profile_picture_url: string | null;
          date_of_birth: string | null;
          gender: string | null;
          preferred_language: string;
          is_email_verified: boolean;
          is_phone_verified: boolean;
          account_status: 'active' | 'inactive' | 'suspended';
          last_activity_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          phone?: string | null;
          role?: 'customer' | 'admin' | 'warehouse_staff';
          us_shipping_address_id?: string | null;
          profile_picture_url?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          preferred_language?: string;
          is_email_verified?: boolean;
          is_phone_verified?: boolean;
          account_status?: 'active' | 'inactive' | 'suspended';
          last_activity_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          phone?: string | null;
          role?: 'customer' | 'admin' | 'warehouse_staff';
          us_shipping_address_id?: string | null;
          profile_picture_url?: string | null;
          date_of_birth?: string | null;
          gender?: string | null;
          preferred_language?: string;
          is_email_verified?: boolean;
          is_phone_verified?: boolean;
          account_status?: 'active' | 'inactive' | 'suspended';
          last_activity_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      packages: {
        Row: {
          id: string;
          user_id: string;
          tracking_number: string;
          sender_name: string;
          sender_email: string | null;
          sender_phone: string | null;
          declared_value: number;
          weight_lbs: number | null;
          length_in: number | null;
          width_in: number | null;
          height_in: number | null;
          billable_weight_lbs: number;
          status: string;
          warehouse_id: string | null;
          storage_fee_accumulated: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tracking_number?: string;
          sender_name: string;
          sender_email?: string | null;
          sender_phone?: string | null;
          declared_value: number;
          weight_lbs?: number | null;
          length_in?: number | null;
          width_in?: number | null;
          height_in?: number | null;
          billable_weight_lbs?: number;
          status?: string;
          warehouse_id?: string | null;
          storage_fee_accumulated?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tracking_number?: string;
          sender_name?: string;
          sender_email?: string | null;
          sender_phone?: string | null;
          declared_value?: number;
          weight_lbs?: number | null;
          length_in?: number | null;
          width_in?: number | null;
          height_in?: number | null;
          billable_weight_lbs?: number;
          status?: string;
          warehouse_id?: string | null;
          storage_fee_accumulated?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      shipments: {
        Row: {
          id: string;
          user_id: string;
          shipment_number: string;
          service_type: string;
          total_cost: number | null;
          estimated_cost: number | null;
          cost_status: string;
          status: string;
          recipient_name: string;
          recipient_phone: string | null;
          delivery_address: string;
          delivery_city: string;
          delivery_country: string;
          total_weight_lbs: number;
          total_packages: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          shipment_number?: string;
          service_type?: string;
          total_cost?: number | null;
          estimated_cost?: number | null;
          cost_status?: string;
          status?: string;
          recipient_name: string;
          recipient_phone?: string | null;
          delivery_address: string;
          delivery_city: string;
          delivery_country?: string;
          total_weight_lbs: number;
          total_packages: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          shipment_number?: string;
          service_type?: string;
          total_cost?: number | null;
          estimated_cost?: number | null;
          cost_status?: string;
          status?: string;
          recipient_name?: string;
          recipient_phone?: string | null;
          delivery_address?: string;
          delivery_city?: string;
          delivery_country?: string;
          total_weight_lbs?: number;
          total_packages?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      us_shipping_addresses: {
        Row: {
          id: string;
          user_id: string;
          suite_number: string;
          street_address: string;
          city: string;
          state: string;
          postal_code: string;
          country: string;
          warehouse_id: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          suite_number: string;
          street_address: string;
          city: string;
          state: string;
          postal_code: string;
          country?: string;
          warehouse_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          suite_number?: string;
          street_address?: string;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
          warehouse_id?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          category: string;
          is_read: boolean;
          is_sent: boolean;
          priority: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type?: string;
          category?: string;
          is_read?: boolean;
          is_sent?: boolean;
          priority?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: string;
          category?: string;
          is_read?: boolean;
          is_sent?: boolean;
          priority?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      assign_us_shipping_address: {
        Args: {
          target_user_id: string;
          warehouse_location?: string;
          assigned_by?: string;
        };
        Returns: string;
      };
      calculate_estimated_shipment_cost: {
        Args: {
          total_weight: number;
          service_type?: string;
          destination_country?: string;
          is_express?: boolean;
          insurance_value?: number;
        };
        Returns: {
          estimated_base_rate: number;
          estimated_weight_charge: number;
          estimated_insurance_fee: number;
          estimated_handling_fee: number;
          estimated_total: number;
          note: string;
        }[];
      };
      system_health_check: {
        Args: Record<string, never>;
        Returns: {
          component: string;
          system_status: string;
          details: Record<string, unknown>;
        }[];
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

export default supabase;
