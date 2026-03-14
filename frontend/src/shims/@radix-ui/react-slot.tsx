import * as React from "react";

export const Slot = React.forwardRef<HTMLElement, React.ComponentPropsWithoutRef<"div">>(
  ({ children, ...props }, ref) => {
    if (React.isValidElement(children)) {
      return React.cloneElement(children, { ...props, ref });
    }

    return (
      <div ref={ref as React.Ref<HTMLDivElement>} {...props}>
        {children}
      </div>
    );
  },
);

Slot.displayName = "RadixSlot";
