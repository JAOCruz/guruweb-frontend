import * as React from "react";
import { cn } from "../../../lib/utils";

interface NeoBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "main" | "neutral" | "outline";
}

const NeoBadge = React.forwardRef<HTMLSpanElement, NeoBadgeProps>(
  ({ className, variant = "neutral", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-base border-2 px-2 py-0.5 text-xs font-black uppercase tracking-wider",
          {
            "bg-main text-main-foreground border-border": variant === "main",
          },
          {
            "bg-background text-foreground border-border": variant === "neutral",
          },
          {
            "bg-transparent text-foreground border-border": variant === "outline",
          },
          className
        )}
        {...props}
      />
    );
  }
);
NeoBadge.displayName = "NeoBadge";

export { NeoBadge };
