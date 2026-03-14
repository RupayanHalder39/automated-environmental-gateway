import { createPrimitiveComponents } from '../radixHelper';

const {
  Root,
  Image,
  Fallback
} = createPrimitiveComponents({
  Root: "div",
  Image: "div",
  Fallback: "div",
});

export {
  Root,
  Image,
  Fallback,
};