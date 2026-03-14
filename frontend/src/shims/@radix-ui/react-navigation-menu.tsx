import { createPrimitiveComponents } from '../radixHelper';

const {
  Root,
  List,
  Item,
  Link,
  Trigger,
  Content,
  Indicator,
  Viewport
} = createPrimitiveComponents({
  Root: "div",
  List: "div",
  Item: "button",
  Link: "button",
  Trigger: "button",
  Content: "div",
  Indicator: "span",
  Viewport: "div",
});

export {
  Root,
  List,
  Item,
  Link,
  Trigger,
  Content,
  Indicator,
  Viewport,
};