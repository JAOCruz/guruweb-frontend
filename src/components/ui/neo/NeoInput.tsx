import * as React from "react";
import { cn } from "../../../lib/utils";

export interface NeoInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
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
  ({ className, type, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "input";
    return (
      <Comp
        ref={ref as any}
        type={asChild ? undefined : type}
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
);
NeoInput.displayName = "NeoInput";

export { NeoInput, Slot };
