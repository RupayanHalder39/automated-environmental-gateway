import * as React from "react";

type PrimitiveSpec = Record<string, React.ElementType>;

type PrimitiveComponent = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.PropsWithChildren<any>> & React.RefAttributes<HTMLElement>
>;

type OpenState = {
  open: boolean;
  setOpen?: (next: boolean) => void;
};

const OpenStateContext = React.createContext<OpenState | undefined>(undefined);

const HIDE_WHEN_CLOSED = new Set(["Overlay", "Content", "Portal"]);
const CLICK_CLOSE = new Set(["Close"]);

export function createPrimitiveComponents<T extends PrimitiveSpec>(spec: T) {
  const components = {} as { [K in keyof T]: PrimitiveComponent };

  Object.entries(spec).forEach(([name, Element]) => {
    const Component = React.forwardRef<HTMLElement, React.PropsWithChildren<any>>(
      ({ asChild, children, open, defaultOpen, onOpenChange, onClick, ...props }, ref) => {
        const context = React.useContext(OpenStateContext);
        const isRoot = name === "Root";
        const isControlled = isRoot && typeof open !== "undefined";
        const [uncontrolledOpen, setUncontrolledOpen] = React.useState(Boolean(defaultOpen));
        const resolvedOpen = isRoot ? (isControlled ? Boolean(open) : uncontrolledOpen) : context?.open;

        const setOpen = (next: boolean) => {
          if (!isControlled) {
            setUncontrolledOpen(next);
          }
          if (typeof onOpenChange === "function") {
            onOpenChange(next);
          }
        };

        if (!isRoot && HIDE_WHEN_CLOSED.has(name) && resolvedOpen === false) {
          return null;
        }

        const elementProps = { ...props, ref };

        if (name === "Trigger" && context?.setOpen) {
          elementProps.onClick = (event: React.MouseEvent<HTMLElement>) => {
            onClick?.(event);
            context.setOpen?.(!context.open);
          };
        } else if (name === "Item" && context?.setOpen) {
          elementProps.onClick = (event: React.MouseEvent<HTMLElement>) => {
            onClick?.(event);
            context.setOpen?.(false);
          };
        } else if (CLICK_CLOSE.has(name) && context?.setOpen) {
          elementProps.onClick = (event: React.MouseEvent<HTMLElement>) => {
            onClick?.(event);
            context.setOpen?.(false);
          };
        }

        const elementNode =
          asChild && React.isValidElement(children)
            ? React.cloneElement(children, elementProps)
            : React.createElement(Element, elementProps, children);

        if (isRoot) {
          return (
            <OpenStateContext.Provider value={{ open: Boolean(resolvedOpen), setOpen }}>
              {elementNode}
            </OpenStateContext.Provider>
          );
        }

        return elementNode;
      },
    );
    Component.displayName = `RadixStub(${name})`;
    components[name as keyof T] = Component;
  });

  return components;
}
