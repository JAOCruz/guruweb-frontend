import * as React from "react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface NeoBadgeProps extends Omit<BadgeProps, "variant"> {
  variant?: "main" | "neutral" | "outline" | "default";
}

const NeoBadge: React.FC<NeoBadgeProps> = ({ className, variant = "neutral", ...props }) => {
  return (
    <Badge
      variant={variant === "main" || variant === "outline" ? "default" : variant}
      className={cn(
        "uppercase tracking-wider font-black",
        {
          "bg-main text-main-foreground border-border": variant === "main",
        },
        {
          "bg-transparent text-foreground border-border": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
};

export { NeoBadge };
