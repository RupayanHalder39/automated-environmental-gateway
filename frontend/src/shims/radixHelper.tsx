import * as React from "react";

type PrimitiveSpec = Record<string, React.ElementType>;

type PrimitiveComponent = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.PropsWithChildren<any>> & React.RefAttributes<HTMLElement>
>;

const OpenStateContext = React.createContext<boolean | undefined>(undefined);

const HIDE_WHEN_CLOSED = new Set(["Overlay", "Content", "Portal"]);

export function createPrimitiveComponents<T extends PrimitiveSpec>(spec: T) {
  const components = {} as { [K in keyof T]: PrimitiveComponent };

  Object.entries(spec).forEach(([name, Element]) => {
    const Component = React.forwardRef<HTMLElement, React.PropsWithChildren<any>>(
      ({ asChild, children, open, defaultOpen, ...props }, ref) => {
        const contextOpen = React.useContext(OpenStateContext);
        const isRoot = name === "Root";
        const resolvedOpen =
          isRoot && typeof open !== "undefined"
            ? Boolean(open)
            : isRoot && typeof defaultOpen !== "undefined"
              ? Boolean(defaultOpen)
              : contextOpen;

        if (!isRoot && HIDE_WHEN_CLOSED.has(name) && resolvedOpen === false) {
          return null;
        }

        const elementProps = { ...props, ref };

        const elementNode =
          asChild && React.isValidElement(children)
            ? React.cloneElement(children, elementProps)
            : React.createElement(Element, elementProps, children);

        if (isRoot) {
          return (
            <OpenStateContext.Provider value={resolvedOpen ?? false}>
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
