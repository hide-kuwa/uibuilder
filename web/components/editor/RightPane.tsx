  if (node && node.type === "Instance") {
    const inst = node as InstanceNode;
    const componentId = inst.componentId;
    const component = useEditorStore((s) =>
      componentId ? s.components[componentId] : undefined,
    );
    const components = useEditorStore((s) => s.components);
    const swap = useEditorStore((s) => s.swapInstanceDef);
    const clearAllOverrides = useEditorStore((s) => s.clearAllOverrides);
    const addComponentProp = useEditorStore((s) => s.addComponentProp);
    const setInstanceProp = useEditorStore((s) => s.setInstanceProp);

    const handleAdd = () => {
      const name = prompt("Prop name?");
      if (!name) return;
      const type =
        (prompt(
          "Type (boolean,text,number,color)",
          "text",
        ) as ComponentProp["type"]) || "text";
      const id = nanoid();
      const defVal =
        type === "boolean"
          ? false
          : type === "number"
          ? 0
          : type === "color"
          ? "#000000"
          : "";
      addComponentProp(inst.componentId, {
        id,
        name,
        type,
        default: defVal,
      });
    };

    const curr = components[inst.componentId];
    const opts = Object.values(components).filter(
      (c) => curr && isCompatible(curr, c),
    );

    return (
      <div className="bg-gray-800 p-2 space-y-4 text-xs">
        {/* Props */}
        {component && (
          <div>
            <div className="font-bold">Props</div>
            {component.props?.map((p) => (
              <div key={p.id} className="flex items-center gap-1">
                <label className="flex-1">{p.name}</label>
                {p.type === "boolean" ? (
                  <input
                    type="checkbox"
                    checked={inst.propValues?.[p.id] ?? p.default ?? false}
                    onChange={(e) =>
                      setInstanceProp(inst.id, p.id, e.target.checked)
                    }
                  />
                ) : p.type === "number" ? (
                  <input
                    type="number"
                    className="w-full bg-gray-700 p-1 text-white"
                    value={inst.propValues?.[p.id] ?? p.default ?? 0}
                    onChange={(e) =>
                      setInstanceProp(inst.id, p.id, Number(e.target.value))
                    }
                  />
                ) : p.type === "color" ? (
                  <input
                    type="color"
                    value={inst.propValues?.[p.id] ?? p.default ?? "#000000"}
                    onChange={(e) =>
                      setInstanceProp(inst.id, p.id, e.target.value)
                    }
                  />
                ) : (
                  <input
                    type="text"
                    className="w-full bg-gray-700 p-1 text-white"
                    value={inst.propValues?.[p.id] ?? p.default ?? ""}
                    onChange={(e) =>
                      setInstanceProp(inst.id, p.id, e.target.value)
                    }
                  />
                )}
              </div>
            ))}
            <button className="p-1 bg-gray-700" onClick={handleAdd}>
              + Prop
            </button>
          </div>
        )}

        {/* Swap */}
        <div>
          <div className="font-bold">Instance</div>
          <label className="block">
            Swap
            <select
              className="w-full bg-gray-700 p-1 text-white"
              value={inst.componentId}
              onChange={(e) => swap(inst.id, e.target.value)}
            >
              {opts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Overrides */}
        <div>
          <div className="font-bold flex items-center">
            Overrides
            <button
              className="ml-auto px-1 bg-gray-700"
              onClick={() => clearAllOverrides(inst.id)}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    );
  }
