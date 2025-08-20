import { PropBinding } from './store';

export interface PageNode {
  id: string;
  type: string;
  props?: Record<string, any>;
  bindings?: Record<string, PropBinding>;
  children?: PageNode[];
}

export type PatchOp =
  | { op: 'add'; path: string; node: PageNode }
  | { op: 'remove'; path: string }
  | { op: 'move'; from: string; path: string }
  | { op: 'replaceProps'; path: string; props: Record<string, any> }
  | { op: 'replaceBindings'; path: string; bindings: Record<string, PropBinding> };

function parsePath(path: string): string[] {
  if (path === '' || path === '/') return [];
  if (!path.startsWith('/')) throw new Error(`Invalid path: ${path}`);
  return path.split('/').slice(1);
}

function splitParent(segments: string[]): { parent: string[]; index: number } {
  if (segments.length < 2) throw new Error(`Invalid path: /${segments.join('/')}`);
  const prop = segments[segments.length - 2];
  const idxStr = segments[segments.length - 1];
  if (prop !== 'children') throw new Error(`Invalid path segment '${prop}'`);
  const index = parseInt(idxStr, 10);
  if (Number.isNaN(index)) throw new Error(`Invalid index '${idxStr}'`);
  return { parent: segments.slice(0, -2), index };
}

function updateNode(
  node: PageNode,
  segments: string[],
  updater: (n: PageNode) => PageNode
): PageNode {
  if (segments.length === 0) return updater(node);
  const prop = segments[0];
  const idxStr = segments[1];
  if (prop !== 'children') throw new Error(`Invalid path segment '${prop}'`);
  const index = parseInt(idxStr, 10);
  if (Number.isNaN(index)) throw new Error(`Invalid index '${idxStr}'`);
  if (!node.children || index < 0 || index >= node.children.length)
    throw new Error(`Index out of bounds at '${idxStr}'`);
  const rest = segments.slice(2);
  const child = updateNode(node.children[index], rest, updater);
  const children = [...node.children];
  children[index] = child;
  return { ...node, children };
}

function cloneNode(node: PageNode): PageNode {
  return {
    ...node,
    props: node.props ? { ...node.props } : undefined,
    bindings: node.bindings ? { ...node.bindings } : undefined,
    children: node.children ? node.children.map(cloneNode) : undefined,
  };
}

function addNode(
  root: PageNode,
  path: string,
  node: PageNode,
  cloneInserted = true
): PageNode {
  const segments = parsePath(path);
  const { parent, index } = splitParent(segments);
  return updateNode(root, parent, (parentNode) => {
    const children = parentNode.children ? [...parentNode.children] : [];
    if (index < 0 || index > children.length)
      throw new Error(`Index out of bounds at '${index}'`);
    const toInsert = cloneInserted ? cloneNode(node) : node;
    children.splice(index, 0, toInsert);
    return { ...parentNode, children };
  });
}

function removeNode(root: PageNode, path: string): { tree: PageNode; removed: PageNode } {
  const segments = parsePath(path);
  const { parent, index } = splitParent(segments);
  let removed: PageNode | undefined;
  const tree = updateNode(root, parent, (parentNode) => {
    const children = parentNode.children ? [...parentNode.children] : [];
    if (index < 0 || index >= children.length)
      throw new Error(`Index out of bounds at '${index}'`);
    removed = children.splice(index, 1)[0];
    if (!removed) throw new Error(`Invalid remove path '${path}'`);
    return { ...parentNode, children };
  });
  return { tree, removed: removed! };
}

function replaceProps(root: PageNode, path: string, props: Record<string, any>): PageNode {
  const segments = parsePath(path);
  return updateNode(root, segments, (node) => ({
    ...node,
    props: { ...(node.props || {}), ...props },
  }));
}

function replaceBindings(
  root: PageNode,
  path: string,
  bindings: Record<string, PropBinding>
): PageNode {
  const segments = parsePath(path);
  return updateNode(root, segments, (node) => ({
    ...node,
    bindings: { ...(node.bindings || {}), ...bindings },
  }));
}

export function applyPageDiff(currentTree: PageNode, diff: PatchOp[]): PageNode {
  let tree = currentTree;
  const pathMap = new Map<string, string>();
  for (const op of diff) {
    const mappedPath = pathMap.get(op.path) || op.path;
    const mappedFrom = (op as any).from ? pathMap.get((op as any).from) || (op as any).from : undefined;
    switch (op.op) {
      case 'add':
        tree = addNode(tree, mappedPath, op.node);
        break;
      case 'remove':
        tree = removeNode(tree, mappedPath).tree;
        break;
      case 'move': {
        const fromSeg = parsePath(mappedFrom!);
        const toSeg = parsePath(mappedPath);
        const fromInfo = splitParent(fromSeg);
        const toInfo = splitParent(toSeg);
        let target = mappedPath;
        if (
          fromInfo.parent.join('/') === toInfo.parent.join('/') &&
          fromInfo.index < toInfo.index
        ) {
          toSeg[toSeg.length - 1] = String(toInfo.index - 1);
          target = '/' + toSeg.join('/');
        }
        const res = removeNode(tree, mappedFrom!);
        tree = addNode(res.tree, target, res.removed, false);
        pathMap.set(op.path, target);
        break;
      }
      case 'replaceProps':
        tree = replaceProps(tree, mappedPath, op.props);
        break;
      case 'replaceBindings':
        tree = replaceBindings(tree, mappedPath, op.bindings);
        break;
      default: {
        const _exhaustive: never = op;
        throw new Error(`Unknown op ${(op as any).op}`);
      }
    }
  }
  return tree;
}
