import React, { useEffect, useMemo, useState } from 'react';

interface PropMeta {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description: string;
}

interface ComponentMeta {
  displayName: string;
  props: PropMeta[];
}

interface AutoPropsEditorProps {
  selectedComponentType: string;
  selectedProps: Record<string, any>;
  onChange: (nextProps: Record<string, any>) => void;
}

// Attempt to extract union/enum values from a type string like '"a" | "b"' or 'Enum.A | Enum.B'
function parseLiteralUnion(type: string): string[] | null {
  const parts = type
    .split('|')
    .map((p) => p.trim())
    .filter(Boolean);
  if (!parts.length) return null;
  const values: string[] = [];
  for (const part of parts) {
    const strMatch = part.match(/^['"](.+)["']$/);
    if (strMatch) {
      values.push(strMatch[1]);
      continue;
    }
    const enumMatch = part.match(/^[A-Za-z0-9_\.]+$/);
    if (enumMatch) {
      values.push(part);
      continue;
    }
    return null;
  }
  return values;
}

const AutoPropsEditor: React.FC<AutoPropsEditorProps> = ({
  selectedComponentType,
  selectedProps,
  onChange,
}) => {
  const [componentMeta, setComponentMeta] = useState<ComponentMeta[]>([]);
  const [localProps, setLocalProps] = useState<Record<string, any>>({});

  // load component meta
  useEffect(() => {
    let cancelled = false;
    fetch('/component-meta.json')
      .then((res) => res.json())
      .then((data: ComponentMeta[]) => {
        if (!cancelled) {
          setComponentMeta(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setComponentMeta([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // keep local props in sync with selected props
  useEffect(() => {
    setLocalProps(selectedProps || {});
  }, [selectedComponentType, selectedProps]);

  // debounce onChange
  useEffect(() => {
    const handle = setTimeout(() => {
      onChange(localProps);
    }, 300);
    return () => clearTimeout(handle);
  }, [localProps, onChange]);

  const meta = useMemo(
    () => componentMeta.find((m) => m.displayName === selectedComponentType),
    [componentMeta, selectedComponentType]
  );

  const updateProp = (name: string, value: any) => {
    setLocalProps((prev) => ({ ...prev, [name]: value }));
  };

  const renderControl = (prop: PropMeta, missing: boolean) => {
    const value = localProps[prop.name];
    const common = `w-full border rounded px-2 py-1 ${missing ? 'border-red-500' : 'border-gray-300'}`;

    const unionValues = parseLiteralUnion(prop.type);
    if (unionValues) {
      return (
        <select
          className={common}
          value={value ?? ''}
          onChange={(e) => updateProp(prop.name, e.target.value)}
        >
          <option value="" disabled>
            Select an option
          </option>
          {unionValues.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      );
    }

    if (prop.type === 'boolean') {
      return (
        <input
          type="checkbox"
          className={`h-4 w-4 ${missing ? 'ring-1 ring-red-500' : ''}`}
          checked={!!value}
          onChange={(e) => updateProp(prop.name, e.target.checked)}
        />
      );
    }

    if (prop.type === 'number') {
      return (
        <input
          type="number"
          className={common}
          value={value ?? ''}
          onChange={(e) => {
            const val = e.target.value;
            updateProp(prop.name, val === '' ? undefined : Number(val));
          }}
        />
      );
    }

    // default to text input
    return (
      <input
        type="text"
        className={common}
        value={value ?? ''}
        onChange={(e) => updateProp(prop.name, e.target.value)}
      />
    );
  };

  if (!selectedComponentType) {
    return <div className="p-2 text-sm text-gray-500">No component selected</div>;
  }

  return (
    <div className="space-y-4 p-2">
      <div>
        <label className="block text-sm font-medium mb-1">className</label>
        <input
          type="text"
          className="w-full border border-gray-300 rounded px-2 py-1"
          value={localProps.className ?? ''}
          onChange={(e) => updateProp('className', e.target.value)}
        />
      </div>
        {meta ? (
          meta.props
            .filter((p) => p.name !== 'className')
            .map((prop) => {
              const value = localProps[prop.name];
              const missing = prop.required && (value === undefined || value === '');
              return (
                <div key={prop.name} className="flex items-center space-x-2">
                  <label className={`w-32 text-sm ${missing ? 'text-red-600' : ''}`}>
                    {prop.name}
                  </label>
                  <div className="flex-1">{renderControl(prop, missing)}</div>
                </div>
              );
            })
        ) : (
          <div className="text-sm text-gray-500">No props info</div>
        )}
      </div>
    );
  };

export default AutoPropsEditor;
