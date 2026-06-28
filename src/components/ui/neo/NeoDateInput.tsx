import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { cn } from "../../../lib/utils";
import { NeoInput, type NeoInputProps } from "./NeoInput";

export interface NeoDateInputProps extends NeoInputProps {
  iconClassName?: string;
}

const NeoDateInput = React.forwardRef<HTMLInputElement, NeoDateInputProps>(
  ({ className, iconClassName, ...props }, ref) => {
    return (
      <div className="relative w-full min-w-0">
        <NeoInput
          ref={ref}
          type="date"
          className={cn(
            "w-full min-w-0 pr-10 [color-scheme:light] dark:[color-scheme:dark]",
            "[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0",
            "[&::-webkit-calendar-picker-indicator]:z-10 [&::-webkit-calendar-picker-indicator]:cursor-pointer",
            "[&::-webkit-calendar-picker-indicator]:bg-transparent [&::-webkit-calendar-picker-indicator]:text-transparent",
            className
          )}
          {...props}
        />
        <CalendarIcon
          className={cn(
            "pointer-events-none absolute top-1/2 right-3 z-0 h-4 w-4 -translate-y-1/2 text-foreground/60",
            iconClassName
          )}
        />
      </div>
    );
  }
);
NeoDateInput.displayName = "NeoDateInput";

export { NeoDateInput };
