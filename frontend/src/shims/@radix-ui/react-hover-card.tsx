import { createPrimitiveComponents } from '../radixHelper';

const {
  Root,
  Trigger,
  Content,
  Portal
} = createPrimitiveComponents({
  Root: "div",
  Trigger: "button",
  Content: "div",
  Portal: "div",
});

export {
  Root,
  Trigger,
  Content,
  Portal,
};