export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          shop_name: string | null;
          phone: string | null;
          default_pickup_address: string | null;
          preferred_courier: string | null;
          default_payment_method: string | null;
          product_category: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          shop_name?: string | null;
          phone?: string | null;
          default_pickup_address?: string | null;
          preferred_courier?: string | null;
          default_payment_method?: string | null;
          product_category?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      orders: {
        Row: {
          id: string;
          user_id: string;
          customer_name: string | null;
          customer_phone: string | null;
          customer_address: string | null;
          delivery_area: string | null;
          product_name: string | null;
          quantity: number | null;
          variant: string | null;
          price: number | null;
          cod_amount: number | null;
          payment_status: string | null;
          delivery_note: string | null;
          raw_input: string | null;
          input_type: string | null;
          extracted_json: Json | null;
          missing_fields: string[] | null;
          confidence_score: number | null;
          status: string;
          courier_name: string | null;
          courier_status: string | null;
          courier_tracking_id: string | null;
          courier_payload: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          customer_name?: string | null;
          customer_phone?: string | null;
          customer_address?: string | null;
          delivery_area?: string | null;
          product_name?: string | null;
          quantity?: number | null;
          variant?: string | null;
          price?: number | null;
          cod_amount?: number | null;
          payment_status?: string | null;
          delivery_note?: string | null;
          raw_input?: string | null;
          input_type?: string | null;
          extracted_json?: Json | null;
          missing_fields?: string[] | null;
          confidence_score?: number | null;
          status?: string;
          courier_name?: string | null;
          courier_status?: string | null;
          courier_tracking_id?: string | null;
          courier_payload?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
      };
      courier_integrations: {
        Row: {
          id: string;
          user_id: string;
          courier_name: string;
          api_key: string | null;
          api_secret: string | null;
          merchant_id: string | null;
          pickup_address: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          courier_name: string;
          api_key?: string | null;
          api_secret?: string | null;
          merchant_id?: string | null;
          pickup_address?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["courier_integrations"]["Insert"]
        >;
      };
      whatsapp_sessions: {
        Row: {
          id: string;
          user_id: string;
          whatsapp_phone: string;
          last_message: string | null;
          last_order_id: string | null;
          state: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          whatsapp_phone: string;
          last_message?: string | null;
          last_order_id?: string | null;
          state?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database["public"]["Tables"]["whatsapp_sessions"]["Insert"]
        >;
      };
    };
  };
}
