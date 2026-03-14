import { createPrimitiveComponents } from '../radixHelper';

const {
  Root,
  Viewport,
  Corner,
  ScrollAreaScrollbar,
  ScrollAreaThumb
} = createPrimitiveComponents({
  Root: "div",
  Viewport: "div",
  Corner: "div",
  ScrollAreaScrollbar: "div",
  ScrollAreaThumb: "div",
});

export {
  Root,
  Viewport,
  Corner,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
};