"use client";

import { Button } from "@/components/ui/button";

export function PrintLabelButton({
  label = "Print label",
}: {
  label?: string;
}) {
  return (
    <Button
      type="button"
      className="no-print"
      onClick={() => {
        window.print();
      }}
    >
      {label}
    </Button>
  );
}
