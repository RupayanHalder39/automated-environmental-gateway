import { createPrimitiveComponents } from '../radixHelper';

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
  Portal: "div",
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