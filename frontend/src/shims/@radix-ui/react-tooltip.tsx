import { createPrimitiveComponents } from '../radixHelper';

const {
  Provider,
  Root,
  Trigger,
  Content,
  Arrow,
  Portal
} = createPrimitiveComponents({
  Provider: "div",
  Root: "div",
  Trigger: "button",
  Content: "div",
  Arrow: "span",
  Portal: "div",
});

export {
  Provider,
  Root,
  Trigger,
  Content,
  Arrow,
  Portal,
};