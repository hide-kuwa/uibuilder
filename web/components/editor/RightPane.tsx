"use client";
import { useEditorStore } from "@/store/editorStore";
import type { PathNode } from "@/types/editor";

export default function RightPane() {
  const selected = useEditorStore((s) => s.vector?.selection?.pathId);
  const path = useEditorStore((s) =>
    s.tree.find((n): n is PathNode => n.id === selected && n.type === "Path"),
  );
  const setProps = useEditorStore((s) => s.setPathProps);
  if (!path) return <div className="bg-gray-800" />;
  const props = path.props || {};
  const parseDash = (v: string) => {
    const nums = v
      .trim()
      .split(/[\s,]+/)
      .map(Number)
      .filter((n) => !isNaN(n) && n > 0);
    return nums.length ? nums : undefined;
  };
  return (
    <div className="bg-gray-800 p-2 space-y-2 text-xs">
      <div className="font-bold">Vector › Style</div>
      <label className="block">
        Fill:
        <input
          type="text"
          className="w-full bg-gray-700 ml-1 p-1 text-white"
          value={props.fill || ""}
          onChange={(e) => setProps(path.id, { fill: e.target.value })}
        />
      </label>
      <label className="block">
        Stroke:
        <input
          type="text"
          className="w-full bg-gray-700 ml-1 p-1 text-white"
          value={props.stroke || ""}
          onChange={(e) => setProps(path.id, { stroke: e.target.value })}
        />
      </label>
      <label className="block">
        Width:
        <input
          type="number"
          className="w-full bg-gray-700 ml-1 p-1 text-white"
          value={props.strokeWidth ?? 1}
          onChange={(e) =>
            setProps(path.id, { strokeWidth: Number(e.target.value) })
          }
        />
      </label>
      <div>
        <div className="mb-1">Cap:</div>
        <div className="flex gap-1">
          {(["butt", "round", "square"] as const).map((cap) => (
            <button
              key={cap}
              className={`flex-1 p-1 ${
                props.strokeCap === cap ? "bg-blue-600" : "bg-gray-700"
              }`}
              onClick={() => setProps(path.id, { strokeCap: cap })}
            >
              {cap}
            </button>
          ))}
          <button
            className="p-1 bg-gray-700"
            onClick={() => setProps(path.id, { strokeCap: undefined })}
          >
            ↺
          </button>
        </div>
      </div>
      <div>
        <div className="mb-1">Join:</div>
        <div className="flex gap-1">
          {(["miter", "round", "bevel"] as const).map((join) => (
            <button
              key={join}
              className={`flex-1 p-1 ${
                props.strokeJoin === join ? "bg-blue-600" : "bg-gray-700"
              }`}
              onClick={() => setProps(path.id, { strokeJoin: join })}
            >
              {join}
            </button>
          ))}
          <button
            className="p-1 bg-gray-700"
            onClick={() => setProps(path.id, { strokeJoin: undefined })}
          >
            ↺
          </button>
        </div>
      </div>
      <div className="flex items-center">
        <label className="flex-1">
          Miter Limit:
          <input
            type="number"
            min={1}
            step={0.5}
            disabled={props.strokeJoin !== "miter"}
            className="w-full bg-gray-700 ml-1 p-1 text-white"
            value={props.miterLimit ?? 4}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v) && v >= 1) setProps(path.id, { miterLimit: v });
            }}
          />
        </label>
        <button
          className="ml-1 p-1 bg-gray-700"
          onClick={() => setProps(path.id, { miterLimit: undefined })}
        >
          ↺
        </button>
      </div>
      <div className="flex items-center">
        <label className="flex-1">
          Dash:
          <input
            type="text"
            className="w-full bg-gray-700 ml-1 p-1 text-white"
            value={props.dash?.join(" ") || ""}
            onChange={(e) =>
              setProps(path.id, { dash: parseDash(e.target.value) })
            }
          />
        </label>
        <button
          className="ml-1 p-1 bg-gray-700"
          onClick={() => setProps(path.id, { dash: undefined })}
        >
          ↺
        </button>
      </div>
      <div className="flex items-center">
        <label className="flex-1">
          Offset:
          <input
            type="number"
            className="w-full bg-gray-700 ml-1 p-1 text-white"
            value={props.dashOffset ?? 0}
            onChange={(e) => {
              const v = parseFloat(e.target.value);
              if (!isNaN(v)) setProps(path.id, { dashOffset: v });
            }}
          />
        </label>
        <button
          className="ml-1 p-1 bg-gray-700"
          onClick={() => setProps(path.id, { dashOffset: undefined })}
        >
          ↺
        </button>
      </div>
      <div>
        <div className="mb-1">Fill Rule:</div>
        <div className="flex items-center gap-2">
          {(["nonzero", "evenodd"] as const).map((rule) => (
            <label key={rule} className="flex items-center gap-1">
              <input
                type="radio"
                name="fillRule"
                checked={(props.fillRule || "nonzero") === rule}
                onChange={() => setProps(path.id, { fillRule: rule })}
              />
              {rule}
            </label>
          ))}
          <button
            className="p-1 bg-gray-700"
            onClick={() => setProps(path.id, { fillRule: undefined })}
          >
            ↺
          </button>
        </div>
      </div>
    </div>
  );
}
