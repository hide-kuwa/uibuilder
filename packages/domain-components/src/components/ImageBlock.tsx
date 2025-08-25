import type { FC } from "react";

type Props = {
  src: string;
  alt: string;
  width: number;
  height: number;
  fit: "cover" | "contain" | "fill" | "none" | "scale-down";
  className?: string;
};
export const ImageBlock: FC<Props> = ({ src, alt, width, height, fit, className }) => {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      style={{ objectFit: fit }}
      className={className}
    />
  );
};
