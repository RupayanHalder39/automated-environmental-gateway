import * as React from "react";

type ThemeOption = "light" | "dark" | "system";

export type ToasterProps = React.ComponentPropsWithoutRef<"div"> & {
  theme?: ThemeOption;
};

export function Toaster({ children, ...props }: ToasterProps) {
  return (
    <div data-sonner="toaster" {...props}>
      {children}
    </div>
  );
}
