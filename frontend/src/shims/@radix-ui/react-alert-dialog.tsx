import { createPrimitiveComponents } from '../radixHelper';

const {
  Root,
  Trigger,
  Portal,
  Overlay,
  Content,
  Title,
  Description,
  Action,
  Cancel
} = createPrimitiveComponents({
  Root: "div",
  Trigger: "button",
  Portal: "div",
  Overlay: "div",
  Content: "div",
  Title: "span",
  Description: "span",
  Action: "button",
  Cancel: "div",
});

export {
  Root,
  Trigger,
  Portal,
  Overlay,
  Content,
  Title,
  Description,
  Action,
  Cancel,
};