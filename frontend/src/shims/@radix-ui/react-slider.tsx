import { createPrimitiveComponents } from '../radixHelper';

const {
  Root,
  Track,
  Range,
  Thumb
} = createPrimitiveComponents({
  Root: "div",
  Track: "div",
  Range: "div",
  Thumb: "div",
});

export {
  Root,
  Track,
  Range,
  Thumb,
};