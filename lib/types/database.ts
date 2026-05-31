export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/** Cast app objects for Postgres jsonb columns. */
export function toJson(value: unknown): Json {
  return value as Json;
}

type TableDef<
  Row extends Record<string, unknown>,
  Insert extends Record<string, unknown>,
> = {
  Row: Row;
  Insert: Insert;
  Update: Partial<Insert>;
  Relationships: [];
};

export interface Database {
  public: {
    Tables: {
      profiles: TableDef<
        {
          id: string;
          full_name: string | null;
          shop_name: string | null;
          phone: string | null;
          default_pickup_address: string | null;
          preferred_courier: string | null;
          default_payment_method: string | null;
          product_category: string | null;
          organization_id: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id: string;
          full_name?: string | null;
          shop_name?: string | null;
          phone?: string | null;
          default_pickup_address?: string | null;
          preferred_courier?: string | null;
          default_payment_method?: string | null;
          product_category?: string | null;
          organization_id?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      orders: TableDef<
        {
          id: string;
          user_id: string;
          customer_id: string | null;
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
          delivered_at: string | null;
          cod_entry_id: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          customer_id?: string | null;
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
          delivered_at?: string | null;
          cod_entry_id?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      courier_integrations: TableDef<
        {
          id: string;
          user_id: string;
          courier_name: string;
          api_key: string | null;
          api_secret: string | null;
          api_key_encrypted: string | null;
          api_secret_encrypted: string | null;
          merchant_id: string | null;
          pickup_address: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          courier_name: string;
          api_key?: string | null;
          api_secret?: string | null;
          api_key_encrypted?: string | null;
          api_secret_encrypted?: string | null;
          merchant_id?: string | null;
          pickup_address?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
      whatsapp_sessions: TableDef<
        {
          id: string;
          user_id: string;
          whatsapp_phone: string;
          last_message: string | null;
          last_order_id: string | null;
          state: string;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          whatsapp_phone: string;
          last_message?: string | null;
          last_order_id?: string | null;
          state?: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
      organizations: TableDef<
        {
          id: string;
          owner_id: string;
          name: string;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          owner_id: string;
          name: string;
          created_at?: string;
          updated_at?: string;
        }
      >;
      organization_members: TableDef<
        {
          id: string;
          organization_id: string;
          user_id: string;
          role: string;
          invited_email: string | null;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          user_id: string;
          role?: string;
          invited_email?: string | null;
          created_at?: string;
        }
      >;
      organization_invites: TableDef<
        {
          id: string;
          organization_id: string;
          email: string;
          role: string;
          created_at: string;
        },
        {
          id?: string;
          organization_id: string;
          email: string;
          role?: string;
          created_at?: string;
        }
      >;
      subscriptions: TableDef<
        {
          id: string;
          user_id: string;
          plan: string;
          status: string;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          current_period_end: string | null;
          orders_limit: number;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          plan?: string;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          current_period_end?: string | null;
          orders_limit?: number;
          created_at?: string;
          updated_at?: string;
        }
      >;
      customers: TableDef<
        {
          id: string;
          user_id: string;
          phone: string;
          name: string | null;
          address: string | null;
          delivery_area: string | null;
          order_count: number;
          total_cod: number;
          last_order_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          phone: string;
          name?: string | null;
          address?: string | null;
          delivery_area?: string | null;
          order_count?: number;
          total_cod?: number;
          last_order_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      cod_entries: TableDef<
        {
          id: string;
          user_id: string;
          order_id: string;
          cod_amount: number;
          collected_amount: number | null;
          status: string;
          collected_at: string | null;
          reconciled_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          order_id: string;
          cod_amount: number;
          collected_amount?: number | null;
          status?: string;
          collected_at?: string | null;
          reconciled_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      notifications: TableDef<
        {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string | null;
          order_id: string | null;
          read_at: string | null;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          type?: string;
          title: string;
          body?: string | null;
          order_id?: string | null;
          read_at?: string | null;
          created_at?: string;
        }
      >;
      channel_integrations: TableDef<
        {
          id: string;
          user_id: string;
          channel: string;
          page_id: string | null;
          access_token_encrypted: string | null;
          verify_token: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        },
        {
          id?: string;
          user_id: string;
          channel: string;
          page_id?: string | null;
          access_token_encrypted?: string | null;
          verify_token?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
