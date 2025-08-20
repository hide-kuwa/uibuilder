import React, { useEffect } from 'react';
// @ts-ignore - react-test-renderer types are not needed for tests
import TestRenderer, { act } from 'react-test-renderer';
import PageRenderer from '../PageRenderer';
import { ComponentNode } from '../store';
import { DataSourcesProvider, useDataSources, DataSource } from '../dataSources';

function renderTree(tree: ComponentNode[], sources: DataSource[] = [], previewHover = false) {
  const SetSources: React.FC<{ sources: DataSource[] }> = ({ sources }) => {
    const { setSources } = useDataSources();
    useEffect(() => {
      setSources(sources);
    }, [sources]);
    return null;
  };

  let renderer: TestRenderer.ReactTestRenderer;
  return act(async () => {
    renderer = TestRenderer.create(
      <DataSourcesProvider>
        <SetSources sources={sources} />
        <PageRenderer tree={tree} previewHover={previewHover} />
      </DataSourcesProvider>
    );
    await Promise.resolve();
  }).then(() => renderer!);
}

test.skip('renders nested children and className', async () => {
  const tree: ComponentNode[] = [
    {
      id: '1',
      type: 'div',
      props: { className: 'root' },
      children: [
        { id: '2', type: 'span', props: { className: 'child', children: 'hi' } },
      ],
    },
  ];
  const renderer = await renderTree(tree);
  expect(renderer.toJSON()).toEqual({
    type: 'div',
    props: { className: 'root' },
    children: [
      { type: 'span', props: { className: 'child' }, children: ['hi'] },
    ],
  });
});

test.skip('resolves data binding', async () => {
  (global as any).fetch = jest.fn().mockResolvedValue({
    json: async () => ({ info: { message: 'bound' } }),
  });
  const tree: ComponentNode[] = [
    {
      id: '1',
      type: 'div',
      bindings: {
        children: {
          source: 'api',
          endpoint: '/t',
          path: '$.info.message',
          fallback: 'fb',
        },
      },
    },
  ];
  const renderer = await renderTree(tree, [{ name: 'api', baseURL: '' }]);
  await act(async () => {});
  expect(renderer.toJSON()).toEqual({
    type: 'div',
    props: {},
    children: ['bound'],
  });
});

test.skip('uses fallback on fetch error', async () => {
  (global as any).fetch = jest.fn().mockRejectedValue(new Error('boom'));
  const tree: ComponentNode[] = [
    {
      id: '1',
      type: 'div',
      bindings: {
        children: {
          source: 'api',
          endpoint: '/t',
          path: '$.missing',
          fallback: 'fb',
        },
      },
    },
  ];
  const renderer = await renderTree(tree, [{ name: 'api', baseURL: '' }]);
  await act(async () => {});
  expect(renderer.toJSON()).toEqual({
    type: 'div',
    props: {},
    children: ['fb'],
  });
});

test('applies hover variant', async () => {
  const tree: ComponentNode[] = [
    {
      id: '1',
      type: 'div',
      props: { className: 'bg-blue-500' },
      variants: { hover: { className: 'bg-blue-600' } },
    },
  ];
  const renderer = await renderTree(tree, [], true);
  expect(renderer.toJSON()).toEqual({
    type: 'div',
    props: { className: 'bg-blue-500 bg-blue-600' },
    children: null,
  });
});
