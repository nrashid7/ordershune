"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { ExtractedOrder, PaymentStatus } from "@/lib/types/order";

export type OrderCardValues = {
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

export function extractedToFormValues(data: ExtractedOrder): OrderCardValues {
  return {
    customer_name: data.customer_name ?? "",
    customer_phone: data.customer_phone ?? "",
    customer_address: data.customer_address ?? "",
    delivery_area: data.delivery_area ?? "",
    product_name: data.product_name ?? "",
    quantity: data.quantity?.toString() ?? "",
    variant: data.variant ?? "",
    price: data.price?.toString() ?? "",
    cod_amount: data.cod_amount?.toString() ?? "",
    payment_status: data.payment_status,
    delivery_note: data.delivery_note ?? "",
  };
}

export function OrderCard({
  values,
  onChange,
  missingFields = [],
  confidenceScore,
}: {
  values: OrderCardValues;
  onChange: (values: OrderCardValues) => void;
  missingFields?: string[];
  confidenceScore?: number;
}) {
  const update = (key: keyof OrderCardValues, value: string) => {
    onChange({ ...values, [key]: value });
  };

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">Order Card</h3>
        {confidenceScore != null ? (
          <Badge variant="outline">Confidence: {Math.round(confidenceScore * 100)}%</Badge>
        ) : null}
      </div>

      {missingFields.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {missingFields.map((field) => (
            <Badge key={field} className="bg-amber-100 text-amber-900">
              Missing: {field}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Customer Name / গ্রাহক">
          <Input value={values.customer_name} onChange={(e) => update("customer_name", e.target.value)} />
        </Field>
        <Field label="Phone / ফোন">
          <Input value={values.customer_phone} onChange={(e) => update("customer_phone", e.target.value)} />
        </Field>
        <Field label="Address / ঠিকানা" className="sm:col-span-2">
          <Textarea value={values.customer_address} onChange={(e) => update("customer_address", e.target.value)} />
        </Field>
        <Field label="Delivery Area">
          <Input value={values.delivery_area} onChange={(e) => update("delivery_area", e.target.value)} />
        </Field>
        <Field label="Product">
          <Input value={values.product_name} onChange={(e) => update("product_name", e.target.value)} />
        </Field>
        <Field label="Quantity">
          <Input value={values.quantity} onChange={(e) => update("quantity", e.target.value)} />
        </Field>
        <Field label="Variant / Size / Color">
          <Input value={values.variant} onChange={(e) => update("variant", e.target.value)} />
        </Field>
        <Field label="Price">
          <Input value={values.price} onChange={(e) => update("price", e.target.value)} />
        </Field>
        <Field label="COD Amount">
          <Input value={values.cod_amount} onChange={(e) => update("cod_amount", e.target.value)} />
        </Field>
        <Field label="Payment Status">
          <Select
            value={values.payment_status}
            onValueChange={(value) =>
              update("payment_status", value as OrderCardValues["payment_status"])
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cod">COD</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="unknown">Unknown</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Delivery Note" className="sm:col-span-2">
          <Textarea value={values.delivery_note} onChange={(e) => update("delivery_note", e.target.value)} />
        </Field>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-2 block text-sm">{label}</Label>
      {children}
    </div>
  );
}
