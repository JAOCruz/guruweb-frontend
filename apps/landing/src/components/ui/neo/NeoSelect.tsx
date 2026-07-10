import * as React from "react";
import { cn } from "@/lib/utils";

export interface NeoSelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}

const NeoSelect = React.forwardRef<HTMLSelectElement, NeoSelectProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <select
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-base border-2 border-border bg-secondary-background px-4 py-2 text-base font-base text-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);
NeoSelect.displayName = "NeoSelect";

export { NeoSelect };
