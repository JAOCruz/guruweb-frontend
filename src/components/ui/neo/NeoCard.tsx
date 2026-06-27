import * as React from "react";
import { cn } from "../../../lib/utils";

export interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "main" | "neutral" | "outline";
}

const NeoCard = React.forwardRef<HTMLDivElement, NeoCardProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-base flex flex-col border-2 gap-5 p-6 font-base",
          {
            "bg-background text-foreground border-border shadow-shadow":
              variant === "default",
          },
          {
            "bg-main text-main-foreground border-border shadow-shadow":
              variant === "main",
          },
          {
            "bg-secondary-background text-foreground border-border shadow-shadow":
              variant === "neutral",
          },
          {
            "bg-transparent text-foreground border-border":
              variant === "outline",
          },
          className
        )}
        {...props}
      />
    );
  }
);
NeoCard.displayName = "NeoCard";

const NeoCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col gap-2", className)}
    {...props}
  />
));
NeoCardHeader.displayName = "NeoCardHeader";

const NeoCardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("font-heading leading-none text-xl md:text-2xl", className)}
    {...props}
  />
));
NeoCardTitle.displayName = "NeoCardTitle";

const NeoCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-base font-base text-foreground/70", className)}
    {...props}
  />
));
NeoCardDescription.displayName = "NeoCardDescription";

const NeoCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("", className)} {...props} />
));
NeoCardContent.displayName = "NeoCardContent";

const NeoCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center gap-3 pt-2", className)}
    {...props}
  />
));
NeoCardFooter.displayName = "NeoCardFooter";

export {
  NeoCard,
  NeoCardHeader,
  NeoCardTitle,
  NeoCardDescription,
  NeoCardContent,
  NeoCardFooter,
};
