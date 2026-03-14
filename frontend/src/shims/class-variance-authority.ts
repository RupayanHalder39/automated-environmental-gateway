export type VariantProps<T extends (...args: any) => any> = T extends (options: infer O) => any ? O : never;

type VariantConfig = {
  variants?: Record<string, Record<string, string>>;
  defaultVariants?: Record<string, string>;
};

type CVAOptions = Record<string, string | undefined> & { className?: string };

export function cva(base: string, config?: VariantConfig) {
  return (options?: CVAOptions) => {
    const segments: string[] = [base];
    const variants = config?.variants || {};
    const defaults = config?.defaultVariants || {};
    Object.keys(variants).forEach((variant) => {
      const selected = options?.[variant] || defaults[variant];
      if (selected && variants[variant][selected]) {
        segments.push(variants[variant][selected]);
      }
    });
    if (options?.className) {
      segments.push(options.className);
    }
    return segments.filter(Boolean).join(" ");
  };
}
