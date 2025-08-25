import type { FC } from "react";

type Props = {
  text: string;
  as: "p" | "h1" | "h2" | "h3" | "span";
  align: "left" | "center" | "right";
  className?: string;
};
export const TextBlock: FC<Props> = ({ text, as, align, className }) => {
  const Tag = as as any;
  return <Tag className={`text-${align} ${className ?? ""}`.trim()}>{text}</Tag>;
};
