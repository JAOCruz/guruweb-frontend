import * as React from "react";
import { cn } from "../../../lib/utils";

export interface NeoButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "neutral" | "reverse" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}

const NeoButton = React.forwardRef<HTMLButtonElement, NeoButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-base text-base font-base ring-offset-white transition-all gap-2",
          "disabled:pointer-events-none disabled:opacity-50",
          {
            "text-main-foreground bg-main border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none active:translate-x-boxShadowX active:translate-y-boxShadowY active:shadow-none":
              variant === "default",
          },
          {
            "bg-secondary-background text-foreground border-2 border-border shadow-shadow hover:translate-x-boxShadowX hover:translate-y-boxShadowY hover:shadow-none active:translate-x-boxShadowX active:translate-y-boxShadowY active:shadow-none":
              variant === "neutral",
          },
          {
            "text-main-foreground bg-main border-2 border-border hover:translate-x-reverseBoxShadowX hover:translate-y-reverseBoxShadowY hover:shadow-shadow active:shadow-shadow":
              variant === "reverse",
          },
          {
            "bg-transparent text-foreground border-2 border-border hover:bg-secondary-background hover:shadow-[2px_2px_0px_#000]":
              variant === "outline",
          },
          {
            "bg-transparent text-foreground hover:bg-secondary-background":
              variant === "ghost",
          },
          {
            "h-12 px-5 py-2.5": size === "default",
            "h-10 px-3 text-sm": size === "sm",
            "h-14 px-7 text-lg": size === "lg",
            "h-12 w-12": size === "icon",
          },
          className
        )}
        {...props}
      />
    );
  }
);
NeoButton.displayName = "NeoButton";

export { NeoButton };
