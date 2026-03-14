import * as React from "react";

export type FieldValues = Record<string, any>;
export type FieldPath<TFieldValues extends FieldValues> = Extract<keyof TFieldValues, string>;

export interface ControllerRenderProps {
  field: {
    value: any;
    onChange: (...args: any) => void;
  };
  fieldState: Record<string, unknown>;
  formState: Record<string, unknown>;
}

export interface ControllerProps<TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>> {
  name: TName;
  render?: (props: ControllerRenderProps) => React.ReactNode;
  defaultValue?: any;
}

const FormContext = React.createContext({
  getFieldState: () => ({ invalid: false, error: null }),
});

export function FormProvider({ children }: React.PropsWithChildren) {
  const value = React.useMemo(() => ({ getFieldState: () => ({ invalid: false, error: null }) }), []);
  return <FormContext.Provider value={value}>{children}</FormContext.Provider>;
}

export function useFormContext() {
  return React.useContext(FormContext);
}

export function useFormState({ name }: { name?: string }) {
  return {};
}

export function Controller(props: ControllerProps) {
  const renderProps: ControllerRenderProps = {
    field: { value: props.defaultValue ?? "", onChange: () => {} },
    fieldState: {},
    formState: {},
  };

  if (props.render) {
    return <>{props.render(renderProps)}</>;
  }

  return null;
}

export function useForm() {
  return {
    register: () => () => {},
    control: {},
  };
}
