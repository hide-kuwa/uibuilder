"use client";
import { useEditorStore } from "@/store/editorStore";
import type { PathNode, ImageNode, ImageAdjustments, BlendMode } from "@/types/editor";
import { normalizeAdjustments, DEFAULT_ADJ } from "@/lib/image/filters";

export default function RightPane() {
  const selectedId = useEditorStore((s) => s.selectedIds[0]);
  const node = useEditorStore((s) => s.tree.find((n) => n.id === selectedId));
  const updateImage = useEditorStore((s) => s.updateImageNode);
  const selectedPath = useEditorStore((s) => s.vector?.selection?.pathId);
  const path = useEditorStore((s) =>
    s.tree.find((n): n is PathNode => n.id === selectedPath && n.type === "Path"),
  );
  const setProps = useEditorStore((s) => s.setPathProps);
  const toggleMask = useEditorStore((s) => s.toggleMask);
  if (node && (node as ImageNode).type === "Image") {
    const img = node as ImageNode;
    const adj = normalizeAdjustments(img.props.adjustments);
    const setAdj = (key: keyof ImageAdjustments, value: number) => {
      const next = normalizeAdjustments({ ...(img.props.adjustments || {}), [key]: value });
      updateImage(img.id, { adjustments: next });
    };
    const blendModes: BlendMode[] = [
      "normal",
      "multiply",
      "screen",
      "overlay",
      "darken",
      "lighten",
      "color-burn",
      "color-dodge",
      "hard-light",
      "soft-light",
      "difference",
      "exclusion",
    ];
    return (
      <div className="bg-gray-800 p-2 space-y-2 text-xs">
        <div className="font-bold">Image › Adjust</div>
        <label className="block">
          Brightness
          <div className="flex items-center gap-1">
            <input
              type="range"
              min={0}
              max={200}
              step={1}
              value={Math.round(adj.brightness * 100)}
              onChange={(e) => setAdj("brightness", Number(e.target.value) / 100)}
            />
            <input
              type="number"
              min={0}
              max={200}
              className="w-16 bg-gray-700 p-1 text-white"
              value={Math.round(adj.brightness * 100)}
              onChange={(e) => setAdj("brightness", Number(e.target.value) / 100)}
            />
          </div>
        </label>
        <label className="block">
          Contrast
          <div className="flex items-center gap-1">
            <input
              type="range"
              min={0}
              max={200}
              step={1}
              value={Math.round(adj.contrast * 100)}
              onChange={(e) => setAdj("contrast", Number(e.target.value) / 100)}
            />
            <input
              type="number"
              min={0}
              max={200}
              className="w-16 bg-gray-700 p-1 text-white"
              value={Math.round(adj.contrast * 100)}
              onChange={(e) => setAdj("contrast", Number(e.target.value) / 100)}
            />
          </div>
        </label>
        <label className="block">
          Saturation
          <div className="flex items-center gap-1">
            <input
              type="range"
              min={0}
              max={200}
              step={1}
              value={Math.round(adj.saturation * 100)}
              onChange={(e) => setAdj("saturation", Number(e.target.value) / 100)}
            />
            <input
              type="number"
              min={0}
              max={200}
              className="w-16 bg-gray-700 p-1 text-white"
              value={Math.round(adj.saturation * 100)}
              onChange={(e) => setAdj("saturation", Number(e.target.value) / 100)}
            />
          </div>
        </label>
        <label className="block">
          Hue
          <div className="flex items-center gap-1">
            <input
              type="range"
              min={-180}
              max={180}
              step={1}
              value={adj.hue}
              onChange={(e) => setAdj("hue", Number(e.target.value))}
            />
            <input
              type="number"
              min={-180}
              max={180}
              className="w-16 bg-gray-700 p-1 text-white"
              value={adj.hue}
              onChange={(e) => setAdj("hue", Number(e.target.value))}
            />
          </div>
        </label>
        <label className="block">
          Blur
          <div className="flex items-center gap-1">
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={adj.blur}
              onChange={(e) => setAdj("blur", Number(e.target.value))}
            />
            <input
              type="number"
              min={0}
              max={50}
              className="w-16 bg-gray-700 p-1 text-white"
              value={adj.blur}
              onChange={(e) => setAdj("blur", Number(e.target.value))}
            />
          </div>
        </label>
        <label className="block">
          Opacity
          <div className="flex items-center gap-1">
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(adj.opacity * 100)}
              onChange={(e) => setAdj("opacity", Number(e.target.value) / 100)}
            />
            <input
              type="number"
              min={0}
              max={100}
              className="w-16 bg-gray-700 p-1 text-white"
              value={Math.round(adj.opacity * 100)}
              onChange={(e) => setAdj("opacity", Number(e.target.value) / 100)}
            />
          </div>
        </label>
        <label className="block">
          Blend Mode
          <select
            className="w-full bg-gray-700 ml-1 p-1 text-white"
            value={img.props.blend || "normal"}
            onChange={(e) => updateImage(img.id, { blend: e.target.value as BlendMode })}
          >
            {blendModes.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>
        <button
          className="w-full p-1 bg-gray-700"
          onClick={() => updateImage(img.id, { adjustments: DEFAULT_ADJ, blend: "normal" })}
        >
          Reset
        </button>
      </div>
    );
  }
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
      <label className="flex items-center gap-1">
        <input
          type="checkbox"
          checked={path.isMask || false}
          onChange={() => toggleMask(path.id)}
        />
        Use as Mask
      </label>
      <div className="text-[10px] text-gray-400">
        Applies to subsequent siblings until another mask appears.
      </div>
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
