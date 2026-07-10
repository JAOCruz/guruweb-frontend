import * as React from "react";
import { Input, type InputProps } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface NeoInputProps extends InputProps {
  asChild?: boolean;
}

const Slot = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }
>(({ children, ...props }, ref) => {
  if (!React.isValidElement(children)) return null;
  return React.cloneElement(children as React.ReactElement<any>, {
    ...props,
    ...(children as React.ReactElement<any>).props,
    className: cn(
      props.className,
      (children as React.ReactElement<any>).props.className
    ),
    ref,
  });
});
Slot.displayName = "Slot";

const NeoInput = React.forwardRef<HTMLInputElement, NeoInputProps>(
  ({ className, asChild = false, ...props }, ref) => {
    if (asChild) {
      return (
        <Slot
          ref={ref as React.Ref<HTMLElement>}
          className={cn(
            "flex h-12 w-full rounded-base border-2 border-border bg-secondary-background px-4 py-2 text-base font-base text-foreground",
            "selection:bg-main selection:text-main-foreground",
            "placeholder:text-foreground/50",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border focus-visible:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          {...props}
        />
      );
    }

    return (
      <Input
        ref={ref}
        className={cn(
          "h-12 px-4 py-2 text-base",
          "bg-secondary-background text-foreground",
          "placeholder:text-foreground/50",
          "focus-visible:ring-border",
          className
        )}
        {...props}
      />
    );
  }
);
NeoInput.displayName = "NeoInput";

export { NeoInput, Slot };
