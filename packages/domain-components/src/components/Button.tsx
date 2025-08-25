import type { FC } from "react";
import { ActionBus } from "@core/action-bus";

type Props = {
  label: string;
  variant: "solid" | "outline" | "ghost";
  className?: string;
};
export const Button: FC<Props & { nodeId?: string }> = ({ label, variant, className, nodeId }) => {
  const base =
    variant === "solid"
      ? "px-3 py-2 rounded bg-black text-white"
      : variant === "outline"
      ? "px-3 py-2 rounded border"
      : "px-3 py-2 rounded";

  return (
    <button
      className={`${base} ${className ?? ""}`.trim()}
      onClick={() =>
        ActionBus.emit({ type: "COMPONENT_EVENT", nodeId, event: "onClick", payload: {} })
      }
    >
      {label}
    </button>
  );
};
