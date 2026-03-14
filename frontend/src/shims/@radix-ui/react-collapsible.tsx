import { createPrimitiveComponents } from '../radixHelper';

const {
  Root,
  CollapsibleTrigger,
  CollapsibleContent
} = createPrimitiveComponents({
  Root: "div",
  CollapsibleTrigger: "button",
  CollapsibleContent: "div",
});

export {
  Root,
  CollapsibleTrigger,
  CollapsibleContent,
};