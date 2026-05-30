export type PaymentStatus = "paid" | "cod" | "partial" | "unknown";

export type OrderStatus =
  | "pending"
  | "missing_info"
  | "ready_for_courier"
  | "courier_booked"
  | "completed"
  | "cancelled";

export type InputType = "text" | "image_ocr_text" | "audio_transcript";

export interface ExtractOrderInput {
  inputType: InputType;
  text: string;
}

export interface ExtractedOrder {
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  delivery_area: string | null;
  product_name: string | null;
  quantity: number | null;
  variant: string | null;
  price: number | null;
  cod_amount: number | null;
  payment_status: PaymentStatus;
  delivery_note: string | null;
  missing_fields: string[];
  confidence_score: number;
  notes: string[];
}

export interface OrderRecord {
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
  extracted_json: ExtractedOrder | null;
  missing_fields: string[] | null;
  confidence_score: number | null;
  status: OrderStatus;
  courier_name: string | null;
  courier_status: string | null;
  courier_tracking_id: string | null;
  courier_payload: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
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
}

export interface CourierIntegration {
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
}

export interface WhatsAppSession {
  id: string;
  user_id: string;
  whatsapp_phone: string;
  last_message: string | null;
  last_order_id: string | null;
  state: "idle" | "draft" | "awaiting_edit";
  created_at: string;
  updated_at: string;
}

export type OrderFormData = {
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  delivery_area: string;
  product_name: string;
  quantity: string;
  variant: string;
  price: string;
  cod_amount: string;
  payment_status: PaymentStatus;
  delivery_note: string;
};

export const ORDER_FIELD_LABELS: Record<string, string> = {
  customer_name: "Customer Name",
  customer_phone: "Phone",
  customer_address: "Address",
  delivery_area: "Delivery Area",
  product_name: "Product",
  quantity: "Quantity",
  variant: "Variant",
  price: "Price",
  cod_amount: "COD Amount",
  payment_status: "Payment Status",
  delivery_note: "Delivery Note",
};

export const COURIER_NAMES = [
  "pathao",
  "redx",
  "steadfast",
  "delivery_tiger",
] as const;

export type CourierName = (typeof COURIER_NAMES)[number];

export const COURIER_LABELS: Record<CourierName, string> = {
  pathao: "Pathao",
  redx: "REDX",
  steadfast: "Steadfast",
  delivery_tiger: "Delivery Tiger",
};
