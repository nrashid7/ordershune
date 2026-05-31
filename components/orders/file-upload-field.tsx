"use client";

import { useRef } from "react";
import { ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function FileUploadField({
  id,
  label,
  description,
  accept,
  loading,
  icon: Icon,
  onFile,
}: {
  id: string;
  label: string;
  description: string;
  accept: string;
  loading?: boolean;
  icon: typeof ImageIcon;
  onFile: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <p className="text-sm text-muted-foreground">{description}</p>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={loading}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="outline"
        disabled={loading}
        className={cn("flex min-h-11 w-full flex-col gap-2 py-6")}
        onClick={() => inputRef.current?.click()}
      >
        <Icon className="size-6 text-muted-foreground" aria-hidden="true" />
        <span>{loading ? "Processing..." : "Choose file"}</span>
      </Button>
    </div>
  );
}
