import { createPrimitiveComponents } from '../radixHelper';

const {
  Root,
  Trigger,
  Content,
  Portal,
  Anchor
} = createPrimitiveComponents({
  Root: "div",
  Trigger: "button",
  Content: "div",
  Portal: "div",
  Anchor: "div",
});

export {
  Root,
  Trigger,
  Content,
  Portal,
  Anchor,
};