import React, { useEffect, useState } from 'react';
import { ComponentNode, PropBinding } from './store';
import { useDataSources, DataSource } from './dataSources';

function getByPath(obj: any, path: string) {
  if (!path || !path.startsWith('$.')) return undefined;
  const parts = path.slice(2).split('.');
  let cur = obj;
  for (const p of parts) {
    if (cur == null) return undefined;
    cur = cur[p];
  }
  return cur;
}

const fetchCache = new Map<string, any>();

async function fetchBinding(binding: PropBinding, sources: DataSource[]) {
  const src = sources.find((s) => s.name === binding.source);
  if (!src) throw new Error('unknown source');
  const key = `${binding.source}:${binding.endpoint}`;
  if (fetchCache.has(key)) return fetchCache.get(key);
  const headers: Record<string, string> = { ...(src.headers || {}) };
  if (src.token) headers['Authorization'] = `Bearer ${src.token}`;
  const res = await fetch(src.baseURL + binding.endpoint, { headers });
  const data = await res.json();
  fetchCache.set(key, data);
  return data;
}

interface NodeRendererProps {
  node: ComponentNode;
}

const NodeRenderer: React.FC<NodeRendererProps> = ({ node }) => {
  const { sources } = useDataSources();
  const [dataMap, setDataMap] = useState<Record<string, any>>({});
  const [status, setStatus] = useState<Record<string, { loading: boolean; error: boolean }>>({});

  useEffect(() => {
    if (!node.bindings) return;
    Object.entries(node.bindings).forEach(([prop, binding]) => {
      setStatus((s) => ({ ...s, [prop]: { loading: true, error: false } }));
      fetchBinding(binding, sources)
        .then((data) => {
          const val = getByPath(data, binding.path);
          setDataMap((m) => ({ ...m, [prop]: val }));
          setStatus((s) => ({ ...s, [prop]: { loading: false, error: false } }));
        })
        .catch(() => {
          setStatus((s) => ({ ...s, [prop]: { loading: false, error: true } }));
        });
    });
  }, [node.bindings, sources]);

  const props: Record<string, any> = { ...(node.props || {}) };
  if (node.bindings) {
    for (const [prop, binding] of Object.entries(node.bindings)) {
      const st = status[prop];
      if (st?.loading) {
        props[prop] = (
          <span className="inline-block bg-gray-200 animate-pulse h-4 w-16" />
        );
      } else if (st?.error) {
        props[prop] = binding.fallback ?? '';
      } else if (prop in dataMap) {
        const val = dataMap[prop];
        props[prop] = val !== undefined ? val : binding.fallback ?? '';
      }
    }
  }

  const type = node.type;
  const Comp =
    type[0] === type[0].toLowerCase()
      ? type
      : (require('../lib/registry').components as any)[type] || type;
  const children = node.children?.map((c) => <NodeRenderer key={c.id} node={c} />);
  return React.createElement(Comp as any, props, children);
};

interface PageRendererProps {
  tree: ComponentNode[];
}

const PageRenderer: React.FC<PageRendererProps> = ({ tree }) => {
  return <>{tree.map((n) => <NodeRenderer key={n.id} node={n} />)}</>;
};

export default PageRenderer;

