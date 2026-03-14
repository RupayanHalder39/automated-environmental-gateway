import * as React from "react";

const forwardDiv = (displayName: string) =>
  React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>((props, ref) => (
    <div ref={ref} {...props} />
  ));

export const PanelGroup = forwardDiv("PanelGroup");
export const Panel = forwardDiv("Panel");
export const PanelResizeHandle = forwardDiv("PanelResizeHandle");
