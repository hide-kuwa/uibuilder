import { ComponentNode } from '../src/store'

const dashboard: ComponentNode[] = [
  {
    id: 'header',
    type: 'header',
    isContainer: true,
    children: [
      { id: 'title', type: 'h1', props: { children: 'Dashboard' } }
    ]
  },
  {
    id: 'layout',
    type: 'div',
    props: { className: 'flex' },
    isContainer: true,
    children: [
      {
        id: 'sidebar',
        type: 'aside',
        props: { className: 'w-48' },
        isContainer: true,
        children: [
          { id: 'nav', type: 'nav', isContainer: true }
        ]
      },
      {
        id: 'content',
        type: 'main',
        isContainer: true,
        children: [
          { id: 'section', type: 'section', isContainer: true }
        ]
      }
    ]
  }
]

export default dashboard
