import type { CSSProperties } from "react";
import type { Img } from "../data/products";

type Props = {
  image: Img;
  className?: string;
  eager?: boolean;
  sizes?: string;
  style?: CSSProperties;
  /** Decorative images are hidden from screen readers. */
  decorative?: boolean;
};

export default function Picture({ image, className, eager, style, decorative }: Props) {
  return (
    <img
      className={className}
      src={image.src}
      width={image.w}
      height={image.h}
      alt={decorative ? "" : image.alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
      style={style}
    />
  );
}
