import * as React from "react";

type SlotState = {
  char?: string;
  hasFakeCaret?: boolean;
  isActive?: boolean;
};

export const OTPInputContext = React.createContext<{ slots: SlotState[] }>({ slots: [] });

export type OTPInputProps = React.ComponentPropsWithoutRef<"input"> & {
  containerClassName?: string;
  length?: number;
};

export function OTPInput({ containerClassName, value = "", length = 4, ...props }: OTPInputProps) {
  const slots = React.useMemo(() => {
    const total = Math.max(length, value.length);
    return Array.from({ length: total }, (_, index) => ({
      char: value[index] ?? "",
      hasFakeCaret: index === value.length,
      isActive: index === value.length,
    }));
  }, [length, value]);

  return (
    <OTPInputContext.Provider value={{ slots }}>
      <div className={containerClassName}>
        <input value={value} {...props} />
      </div>
    </OTPInputContext.Provider>
  );
}
