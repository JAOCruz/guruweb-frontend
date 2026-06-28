import * as React from "react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NeoButtonProps extends Omit<ButtonProps, "variant"> {
  variant?: "default" | "neutral" | "reverse" | "outline" | "ghost" | "noShadow";
}

const NeoButton = React.forwardRef<HTMLButtonElement, NeoButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant={variant === "default" || variant === "outline" || variant === "ghost" ? "default" : variant}
        className={cn(
          {
            "bg-transparent text-foreground border-2 border-border hover:bg-secondary-background hover:shadow-[2px_2px_0px_#000] hover:translate-x-0 hover:translate-y-0":
              variant === "outline",
          },
          {
            "bg-transparent text-foreground hover:bg-secondary-background hover:shadow-none hover:translate-x-0 hover:translate-y-0":
              variant === "ghost",
          },
          {
            "h-12 px-5 py-2.5 text-base": props.size === undefined || props.size === "default",
            "h-14 px-7 text-lg": props.size === "lg",
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
export type { ButtonProps as NeoButtonBaseProps };
