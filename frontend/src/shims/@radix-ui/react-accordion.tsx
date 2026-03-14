import { createPrimitiveComponents } from '../radixHelper';

const {
  Root,
  Item,
  Header,
  Trigger,
  Content
} = createPrimitiveComponents({
  Root: "div",
  Item: "button",
  Header: "div",
  Trigger: "button",
  Content: "div",
});

export {
  Root,
  Item,
  Header,
  Trigger,
  Content,
};