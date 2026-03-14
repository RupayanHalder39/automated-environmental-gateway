import * as React from "react";

type EmblaApi = {
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: () => boolean;
  canScrollNext: () => boolean;
};

export type UseEmblaCarouselType = [
  React.RefObject<HTMLDivElement>,
  EmblaApi,
];

export default function useEmblaCarousel(): UseEmblaCarouselType {
  const ref = React.useRef<HTMLDivElement>(null);
  const api = React.useMemo<EmblaApi>(
    () => ({
      scrollPrev: () => {},
      scrollNext: () => {},
      canScrollPrev: () => false,
      canScrollNext: () => false,
    }),
    [],
  );
  return [ref, api];
}
