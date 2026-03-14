import { createPrimitiveComponents } from '../radixHelper';

const {
  Root,
  List,
  Trigger,
  Content
} = createPrimitiveComponents({
  Root: "div",
  List: "div",
  Trigger: "button",
  Content: "div",
});

export {
  Root,
  List,
  Trigger,
  Content,
};