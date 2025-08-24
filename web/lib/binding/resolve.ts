import type { ComponentNode } from '@/types/editor';

export function resolveBinding(
  root: ComponentNode,
  props: Record<string, any> = {}
): ComponentNode {
  const clone: ComponentNode = JSON.parse(JSON.stringify(root));
  const apply = (node: any) => {
    if (node.bindings) {
      Object.entries(node.bindings).forEach(([key, b]: any) => {
        try {
          const fn = new Function('props', `return (${b.expr});`);
          const val = fn(props);
          if (key === 'text') node.text = val;
          else if (key === 'visible')
            node.props = { ...(node.props || {}), visible: val };
          else node.props = { ...(node.props || {}), [key]: val };
        } catch (e) {
          if (b.fallback !== undefined) {
            if (key === 'text') node.text = b.fallback;
            else if (key === 'visible')
              node.props = { ...(node.props || {}), visible: b.fallback };
            else node.props = { ...(node.props || {}), [key]: b.fallback };
          }
        }
      });
    }
    if (node.children) node.children.forEach(apply);
  };
  apply(clone);
  return clone;
}
