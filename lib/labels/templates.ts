import { COURIER_LABELS, type CourierName } from "@/lib/types/order";

export type LabelTemplate = {
  courierName: string;
  header: string;
  accentColor: string;
  showVariant: boolean;
  codEmphasis: boolean;
};

const TEMPLATES: Record<CourierName, LabelTemplate> = {
  pathao: {
    courierName: "pathao",
    header: COURIER_LABELS.pathao,
    accentColor: "#E63946",
    showVariant: true,
    codEmphasis: true,
  },
  redx: {
    courierName: "redx",
    header: COURIER_LABELS.redx,
    accentColor: "#D62828",
    showVariant: true,
    codEmphasis: true,
  },
  steadfast: {
    courierName: "steadfast",
    header: COURIER_LABELS.steadfast,
    accentColor: "#1D3557",
    showVariant: false,
    codEmphasis: true,
  },
  delivery_tiger: {
    courierName: "delivery_tiger",
    header: COURIER_LABELS.delivery_tiger,
    accentColor: "#F77F00",
    showVariant: true,
    codEmphasis: true,
  },
};

const GENERIC: LabelTemplate = {
  courierName: "generic",
  header: "Shipping Label",
  accentColor: "#1B4332",
  showVariant: true,
  codEmphasis: true,
};

export function getLabelTemplate(courierName: string | null | undefined): LabelTemplate {
  const key = (courierName ?? "").toLowerCase().trim() as CourierName;
  if (key in TEMPLATES) {
    return TEMPLATES[key];
  }
  return {
    ...GENERIC,
    courierName: courierName?.trim() || "generic",
    header: courierName?.trim()
      ? courierName.trim().replace(/_/g, " ")
      : GENERIC.header,
  };
}
