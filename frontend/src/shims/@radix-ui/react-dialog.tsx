import * as React from "react";
import { createPortal } from "react-dom";
import { createPrimitiveComponents } from "../radixHelper";

const PortalImpl = React.forwardRef<HTMLElement, React.PropsWithChildren<any>>(({ children }, _ref) => {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
});
PortalImpl.displayName = "RadixDialogPortal";

const {
  Root,
  Trigger,
  Portal,
  Close,
  Overlay,
  Content,
  Title,
  Description
} = createPrimitiveComponents({
  Root: "div",
  Trigger: "button",
  Portal: PortalImpl,
  Close: "button",
  Overlay: "div",
  Content: "div",
  Title: "span",
  Description: "span",
});

export {
  Root,
  Trigger,
  Portal,
  Close,
  Overlay,
  Content,
  Title,
  Description,
};
