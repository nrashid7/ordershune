"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImageIcon, MicIcon } from "lucide-react";
import { toast } from "sonner";
import { CopyButton } from "@/components/copy-button";
import { FileUploadField } from "@/components/orders/file-upload-field";
import {
  extractedToFormValues,
  OrderCard,
  type OrderCardValues,
} from "@/components/orders/order-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { createCourierBooking, saveOrder } from "@/lib/actions/orders";
import {
  generateCourierFormat,
  generateCustomerConfirmation,
  generateOrderSummary,
} from "@/lib/formatting";
import type { ExtractedOrder, InputType } from "@/lib/types/order";

export function CreateOrderClient({
  preferredCourier,
  pickupAddress,
}: {
  preferredCourier: string;
  pickupAddress: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [extracted, setExtracted] = useState<ExtractedOrder | null>(null);
  const [values, setValues] = useState<OrderCardValues | null>(null);
  const [inputType, setInputType] = useState<InputType>("text");
  const [rawInput, setRawInput] = useState("");

  const runExtraction = async (text: string, type: InputType) => {
    setLoading(true);
    try {
      const response = await fetch("/api/extract-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inputType: type, text }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Extraction failed");
      setExtracted(data);
      setValues(extractedToFormValues(data));
      setInputType(type);
      setRawInput(text);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Extraction failed");
    } finally {
      setLoading(false);
    }
  };

  const processFile = async (file: File, kind: "image" | "audio") => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kind", kind);
      const mediaRes = await fetch("/api/media-process", {
        method: "POST",
        body: formData,
      });
      const mediaData = await mediaRes.json();
      if (!mediaRes.ok) throw new Error(mediaData.error ?? "Media processing failed");
      await runExtraction(
        mediaData.text,
        kind === "image" ? "image_ocr_text" : "audio_transcript"
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
      setLoading(false);
    }
  };

  const buildPayload = () => {
    if (!values) return null;
    return {
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
      raw_input: rawInput,
      input_type: inputType,
      extracted_json: extracted,
      missing_fields: extracted?.missing_fields ?? [],
      confidence_score: extracted?.confidence_score ?? null,
      status:
        extracted?.missing_fields && extracted.missing_fields.length > 0
          ? "missing_info"
          : "pending",
    };
  };

  const handleSave = async (status?: string) => {
    const payload = buildPayload();
    if (!payload) return;
    const result = await saveOrder({ ...payload, status: status ?? payload.status });
    if (result.error) toast.error(result.error);
    else {
      toast.success("Order saved");
      router.push(`/orders/${result.id}`);
    }
  };

  const summaryOrder = values
    ? {
        ...values,
        quantity: values.quantity ? Number(values.quantity) : null,
        price: values.price ? Number(values.price) : null,
        cod_amount: values.cod_amount ? Number(values.cod_amount) : null,
      }
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Order</h1>
        <p className="text-sm text-muted-foreground">
          Paste text, upload screenshot, or upload voice note
        </p>
      </div>

      <Tabs defaultValue="text">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="text">Paste Text</TabsTrigger>
          <TabsTrigger value="screenshot">Upload Screenshot</TabsTrigger>
          <TabsTrigger value="voice">Upload Voice Note</TabsTrigger>
        </TabsList>

        <TabsContent value="text">
          <Card>
            <CardHeader>
              <CardTitle>Customer message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                rows={8}
                placeholder="Paste customer message here..."
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
              />
              <Button
                disabled={loading || !textInput.trim()}
                onClick={() => runExtraction(textInput, "text")}
              >
                {loading ? "Extracting..." : "Extract order"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="screenshot">
          <Card>
            <CardHeader>
              <CardTitle>Order screenshot</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploadField
                id="order-screenshot-upload"
                label="Screenshot file"
                description="Upload a screenshot of the customer order message."
                accept="image/*"
                loading={loading}
                icon={ImageIcon}
                onFile={(file) => processFile(file, "image")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="voice">
          <Card>
            <CardHeader>
              <CardTitle>Voice note</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUploadField
                id="order-voice-upload"
                label="Voice note file"
                description="Upload a voice note to transcribe and extract order details."
                accept="audio/*"
                loading={loading}
                icon={MicIcon}
                onFile={(file) => processFile(file, "audio")}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {values && summaryOrder ? (
        <>
          <OrderCard
            values={values}
            onChange={setValues}
            missingFields={extracted?.missing_fields ?? []}
            confidenceScore={extracted?.confidence_score}
          />

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => handleSave()}>Save Order</Button>
            <CopyButton text={generateOrderSummary(summaryOrder)} label="Copy Summary" />
            <CopyButton
              text={generateCourierFormat(summaryOrder, {
                default_pickup_address: pickupAddress,
              })}
              label="Copy Courier Format"
            />
            <CopyButton
              text={generateCustomerConfirmation(summaryOrder)}
              label="Copy Confirmation"
            />
            <Button variant="secondary" onClick={() => handleSave("ready_for_courier")}>
              Mark Ready for Courier
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                const payload = buildPayload();
                if (!payload) return;
                const saved = await saveOrder({ ...payload, status: "ready_for_courier" });
                if (saved.error || !saved.id) {
                  toast.error(saved.error ?? "Save failed");
                  return;
                }
                const booking = await createCourierBooking(saved.id, preferredCourier);
                if (booking.error) toast.error(booking.error);
                else
                  toast.success(
                    booking.mock
                      ? `Mock booking created: ${booking.trackingId}`
                      : `Booking created: ${booking.trackingId}`
                  );
              }}
            >
              Create Courier Booking
            </Button>
          </div>
        </>
      ) : null}
    </div>
  );
}
