import * as React from "react";

type ClassNames = Record<string, string>;

type Components = Record<string, React.ComponentType<any>>;

export interface DayPickerProps extends React.ComponentPropsWithoutRef<"div"> {
  classNames?: ClassNames;
  components?: Components;
  showOutsideDays?: boolean;
  mode?: string;
}

export function DayPicker({ children, ...props }: DayPickerProps) {
  return (
    <div {...props}>
      {children}
    </div>
  );
}
