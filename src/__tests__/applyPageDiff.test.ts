import { applyPageDiff, PageNode, PatchOp } from '../applyPageDiff';
import { PropBinding } from '../store';

test('add, remove, move and replace operations', () => {
  const start: PageNode = {
    id: 'root',
    type: 'div',
    children: [{ id: 'a', type: 'span' }, { id: 'b', type: 'p' }],
  };
  const diff: PatchOp[] = [
    { op: 'add', path: '/children/2', node: { id: 'c', type: 'h1' } },
    { op: 'remove', path: '/children/0' },
    { op: 'move', from: '/children/0', path: '/children/1' },
    {
      op: 'replaceProps',
      path: '/children/1',
      props: { className: 'cls' },
    },
    {
      op: 'replaceBindings',
      path: '/children/1',
      bindings: {
        text: { source: 'x', endpoint: '/', path: '$.a' } as PropBinding,
      },
    },
  ];
  const res = applyPageDiff(start, diff);
  expect(res.children?.map((c) => c.id)).toEqual(['b', 'c']);
  expect(res.children?.[0].props).toEqual({ className: 'cls' });
  expect(res.children?.[0].bindings?.text).toBeTruthy();
});

test('invalid path throws', () => {
  const start: PageNode = { id: 'r', type: 'div' };
  expect(() => applyPageDiff(start, [{ op: 'remove', path: '/bad/0' } as any])).toThrow();
});
