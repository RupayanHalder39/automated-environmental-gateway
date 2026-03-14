import { createPrimitiveComponents } from '../radixHelper';

const {
  Root,
  Item,
  Indicator
} = createPrimitiveComponents({
  Root: "div",
  Item: "button",
  Indicator: "span",
});

export {
  Root,
  Item,
  Indicator,
};