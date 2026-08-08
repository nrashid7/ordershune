import { code128Svg } from "@/lib/labels/barcode";
import { getLabelTemplate } from "@/lib/labels/templates";
import type { OrderRecord } from "@/lib/types/order";

export type ShippingLabelProfile = {
  shop_name: string | null;
  default_pickup_address: string | null;
};

export function ShippingLabel({
  order,
  profile,
  courierName,
}: {
  order: OrderRecord;
  profile: ShippingLabelProfile;
  courierName: string;
}) {
  const template = getLabelTemplate(courierName || order.courier_name);
  const barcodeValue =
    order.courier_tracking_id?.trim() || order.id.replace(/-/g, "").slice(0, 16);
  const barcodeSvg = code128Svg(barcodeValue, 40);
  const codAmount = order.cod_amount ?? order.price;
  const showCod =
    template.codEmphasis &&
    (order.payment_status === "cod" ||
      order.payment_status === "partial" ||
      (codAmount != null && Number(codAmount) > 0));

  return (
    <article
      className="shipping-label flex flex-col overflow-hidden bg-white text-black"
      style={{
        width: "105mm",
        height: "148mm",
        border: `2px solid ${template.accentColor}`,
      }}
    >
      <header
        className="px-3 py-2 text-white"
        style={{ backgroundColor: template.accentColor }}
      >
        <p className="text-xs font-medium uppercase tracking-wide opacity-90">
          OrderShune
        </p>
        <h1 className="text-lg font-bold leading-tight">{template.header}</h1>
      </header>

      <div className="flex flex-1 flex-col gap-2 px-3 py-2 text-sm">
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            Shop / Pickup
          </p>
          <p className="font-semibold">{profile.shop_name || "Shop"}</p>
          <p className="text-xs leading-snug text-neutral-700">
            {profile.default_pickup_address || "Pickup address not set"}
          </p>
        </section>

        <section className="border-t border-neutral-200 pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            Deliver to
          </p>
          <p className="font-semibold">{order.customer_name || "—"}</p>
          <p className="font-mono text-sm">{order.customer_phone || "—"}</p>
          <p className="text-xs leading-snug">{order.customer_address || "—"}</p>
          {order.delivery_area ? (
            <p className="text-xs text-neutral-600">Area: {order.delivery_area}</p>
          ) : null}
        </section>

        <section className="border-t border-neutral-200 pt-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
            Product
          </p>
          <p className="font-medium">{order.product_name || "—"}</p>
          <p className="text-xs">
            Qty: <span className="font-semibold">{order.quantity ?? 1}</span>
            {template.showVariant && order.variant ? (
              <>
                {" · "}
                Variant: <span className="font-semibold">{order.variant}</span>
              </>
            ) : null}
          </p>
          {order.delivery_note ? (
            <p className="mt-1 text-xs text-neutral-600">Note: {order.delivery_note}</p>
          ) : null}
        </section>

        {showCod ? (
          <section
            className="mt-auto rounded border-2 px-2 py-1.5 text-center"
            style={{ borderColor: template.accentColor }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide">
              Cash on Delivery
            </p>
            <p
              className="text-2xl font-bold tabular-nums"
              style={{ color: template.accentColor }}
            >
              ৳{Number(codAmount ?? 0).toLocaleString("en-BD")}
            </p>
          </section>
        ) : (
          <div className="mt-auto" />
        )}

        <section className="flex flex-col items-center border-t border-neutral-200 pt-2">
          <div
            className="w-full max-w-full overflow-hidden [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full"
            dangerouslySetInnerHTML={{ __html: barcodeSvg }}
          />
          <p className="mt-0.5 font-mono text-[10px] text-neutral-500">
            {order.id.slice(0, 8)}
          </p>
        </section>
      </div>
    </article>
  );
}
