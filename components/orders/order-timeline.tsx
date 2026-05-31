import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export type TimelineStep = {
  label: string;
  done: boolean;
};

export function OrderTimeline({ steps }: { steps: TimelineStep[] }) {
  const activeIndex = steps.findIndex((step) => !step.done);
  const currentIndex = activeIndex === -1 ? steps.length - 1 : activeIndex;

  return (
    <ol className="space-y-3" aria-label="Order progress">
      {steps.map((step, index) => {
        const isCurrent = index === currentIndex && !step.done;
        const statusText = step.done ? "Completed" : isCurrent ? "In progress" : "Pending";

        return (
          <li
            key={step.label}
            className="flex items-center gap-3"
            aria-current={isCurrent ? "step" : undefined}
          >
            {step.done ? (
              <Check className="size-4 shrink-0 text-brand" aria-hidden="true" />
            ) : (
              <Circle
                className={cn(
                  "size-4 shrink-0",
                  isCurrent ? "text-brand" : "text-muted-foreground"
                )}
                aria-hidden="true"
              />
            )}
            <div className="flex flex-wrap items-baseline gap-2">
              <span>{step.label}</span>
              <span className="text-xs text-muted-foreground">({statusText})</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
