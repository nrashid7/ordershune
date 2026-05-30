"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CopyButton } from "@/components/copy-button";
import {
  extractedToFormValues,
  OrderCard,
  type OrderCardValues,
} from "@/components/orders/order-card";
import { StatusBadge } from "@/components/orders/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createCourierBooking, saveOrder, syncOrderStatus } from "@/lib/actions/orders";
import {
  generateCourierFormat,
  generateCustomerConfirmation,
  generateOrderSummary,
} from "@/lib/formatting";
import type { OrderRecord, Profile } from "@/lib/types/order";

export function OrderDetailClient({
  order,
  profile,
}: {
  order: OrderRecord;
  profile: Pick<Profile, "preferred_courier" | "default_pickup_address"> | null;
}) {
  const [values, setValues] = useState<OrderCardValues>(
    extractedToFormValues({
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_address: order.customer_address,
      delivery_area: order.delivery_area,
      product_name: order.product_name,
      quantity: order.quantity,
      variant: order.variant,
      price: order.price,
      cod_amount: order.cod_amount,
      payment_status: (order.payment_status as OrderCardValues["payment_status"]) ?? "unknown",
      delivery_note: order.delivery_note,
      missing_fields: order.missing_fields ?? [],
      confidence_score: order.confidence_score ?? 0,
      notes: [],
    })
  );

  const summaryOrder = {
    ...values,
    quantity: values.quantity ? Number(values.quantity) : null,
    price: values.price ? Number(values.price) : null,
    cod_amount: values.cod_amount ? Number(values.cod_amount) : null,
  };

  const handleSave = async () => {
    const result = await saveOrder({
      id: order.id,
      customer_name: values.customer_name || null,
      customer_phone: values.customer_phone || null,
      customer_address: values.customer_address || null,
      delivery_area: values.delivery_area || null,
      product_name: values.product_name || null,
      quantity: values.quantity ? Number(values.quantity) : null,
      variant: values.variant || null,
      price: values.price ? Number(values.price) : null,
      cod_amount: values.cod_amount ? Number(values.cod_amount) : null,
      payment_status: values.payment_status,
      delivery_note: values.delivery_note || null,
    });
    if (result.error) toast.error(result.error);
    else toast.success("Order updated");
  };

  const timeline = [
    { label: "Order created", done: true },
    { label: "Information complete", done: order.status !== "missing_info" },
    { label: "Ready for courier", done: ["ready_for_courier", "courier_booked", "completed"].includes(order.status) },
    { label: "Courier booked", done: ["courier_booked", "completed"].includes(order.status) },
    { label: "Delivered", done: order.status === "completed" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Order Detail</h1>
          <p className="text-sm text-muted-foreground">{order.id}</p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <OrderCard
        values={values}
        onChange={setValues}
        missingFields={order.missing_fields ?? []}
        confidenceScore={order.confidence_score ?? undefined}
      />

      <div className="flex flex-wrap gap-2">
        <Button onClick={handleSave}>Save changes</Button>
        <CopyButton text={generateOrderSummary(summaryOrder)} label="Copy Summary" />
        <CopyButton
          text={generateCourierFormat(summaryOrder, profile)}
          label="Copy Courier Format"
        />
        <CopyButton
          text={generateCustomerConfirmation(summaryOrder)}
          label="Copy Confirmation"
        />
        {order.courier_tracking_id ? (
          <Button
            variant="outline"
            onClick={async () => {
              const result = await syncOrderStatus(order.id);
              if (result.error) toast.error(result.error);
              else if ("status" in result && result.status)
                toast.success(`Status: ${result.status}`);
              else toast.success("Status synced");
            }}
          >
            Refresh delivery status
          </Button>
        ) : null}
        <Button
          variant="outline"
          onClick={async () => {
            const result = await createCourierBooking(
              order.id,
              profile?.preferred_courier ?? "pathao"
            );
            if (result.error) toast.error(result.error);
            else toast.success(`Booking: ${result.trackingId}`);
          }}
        >
          Create Courier Booking
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Original raw message</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm">{order.raw_input ?? "—"}</pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Extracted JSON</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto whitespace-pre-wrap text-xs">
              {JSON.stringify(order.extracted_json, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Courier-ready payload</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="overflow-x-auto whitespace-pre-wrap text-xs">
              {JSON.stringify(
                order.courier_payload ?? generateCourierFormat(summaryOrder, profile),
                null,
                2
              )}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Courier status timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {timeline.map((step) => (
              <div key={step.label} className="flex items-center gap-3">
                <div
                  className={`h-3 w-3 rounded-full ${step.done ? "bg-emerald-500" : "bg-muted"}`}
                />
                <span>{step.label}</span>
              </div>
            ))}
            <p className="text-sm text-muted-foreground">
              Tracking: {order.courier_tracking_id ?? "Not booked yet"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
