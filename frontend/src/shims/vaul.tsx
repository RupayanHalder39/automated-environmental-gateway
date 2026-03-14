import * as React from "react";

type PrimitiveComponent = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<React.PropsWithChildren<any>> & React.RefAttributes<HTMLElement>
>;

function createPrimitive(tag: React.ElementType): PrimitiveComponent {
  const Component = React.forwardRef<HTMLElement, React.PropsWithChildren<any>>((props, ref) =>
    React.createElement(tag, { ...props, ref }, props.children),
  );
  Component.displayName = `VaulStub(${tag})`;
  return Component;
}

export const Drawer = {
  Root: createPrimitive("div"),
  Trigger: createPrimitive("button"),
  Portal: createPrimitive("div"),
  Close: createPrimitive("button"),
  Overlay: createPrimitive("div"),
  Content: createPrimitive("div"),
};
