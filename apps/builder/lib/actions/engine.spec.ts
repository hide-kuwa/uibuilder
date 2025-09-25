import { describe, beforeEach, afterEach, it, expect } from 'vitest'
import { ActionEngine, collectRulesFromDataAttrs } from './engine'
import type { ActionRule } from './types'

declare global {
  interface Window {
    __lastObserver?: FakeIntersectionObserver
  }
}

type FakeEntry = { target: Element; isIntersecting: boolean }

class FakeIntersectionObserver {
  private callback: IntersectionObserverCallback
  private observed = new Set<Element>()

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback
    window.__lastObserver = this
  }

  observe(target: Element) {
    this.observed.add(target)
  }

  unobserve(target: Element) {
    this.observed.delete(target)
  }

  disconnect() {
    this.observed.clear()
  }

  trigger(entry: FakeEntry) {
    if (!this.observed.has(entry.target)) return
    const record: IntersectionObserverEntry = {
      boundingClientRect: entry.target.getBoundingClientRect(),
      intersectionRatio: entry.isIntersecting ? 1 : 0,
      intersectionRect: entry.target.getBoundingClientRect(),
      isIntersecting: entry.isIntersecting,
      rootBounds: null,
      target: entry.target,
      time: Date.now(),
    }
    this.callback([record], this as unknown as IntersectionObserver)
  }
}

describe('ActionEngine', () => {
  let originalObserver: typeof IntersectionObserver

  beforeEach(() => {
    document.body.innerHTML = ''
    originalObserver = window.IntersectionObserver
    window.IntersectionObserver = FakeIntersectionObserver as unknown as typeof IntersectionObserver
  })

  afterEach(() => {
    window.IntersectionObserver = originalObserver
    delete window.__lastObserver
  })

  it('handles hover, click and inView triggers', () => {
    const source = document.createElement('div')
    source.setAttribute('data-node-id', 'source')
    source.setAttribute('data-int', '[]')
    const target = document.createElement('div')
    target.setAttribute('data-node-id', 'target')
    document.body.append(source, target)

    const rules: ActionRule[] = [
      {
        sourceId: 'source',
        triggers: [{ kind: 'click' }],
        effects: [{ kind: 'class', target: 'target', add: ['clicked'] }],
      },
      {
        sourceId: 'source',
        triggers: [{ kind: 'hover', phase: 'enter' }],
        effects: [{ kind: 'class', target: 'target', add: ['hovered'] }],
      },
      {
        sourceId: 'source',
        triggers: [{ kind: 'hover', phase: 'leave' }],
        effects: [{ kind: 'class', target: 'target', remove: ['hovered'] }],
      },
      {
        sourceId: 'source',
        triggers: [{ kind: 'inView', once: true }],
        effects: [{ kind: 'class', target: 'target', add: ['visible'] }],
      },
    ]

    const engine = ActionEngine.bind(document, [{ element: source, rules }])
    expect(engine).toBeInstanceOf(ActionEngine)

    source.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }))
    expect(target.classList.contains('hovered')).toBe(true)

    source.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }))
    expect(target.classList.contains('hovered')).toBe(false)

    source.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(target.classList.contains('clicked')).toBe(true)

    const io = window.__lastObserver!
    io.trigger({ target: source, isIntersecting: true })
    expect(target.classList.contains('visible')).toBe(true)

    // second trigger ignored due to once:true
    target.classList.remove('visible')
    io.trigger({ target: source, isIntersecting: true })
    expect(target.classList.contains('visible')).toBe(false)

    engine.destroy()
  })

  it('respects concurrency strategies', async () => {
    const clickOnce = document.createElement('div')
    clickOnce.setAttribute('data-node-id', 'ignore')
    clickOnce.setAttribute('data-int', '[]')
    const clickRestart = document.createElement('div')
    clickRestart.setAttribute('data-node-id', 'restart')
    clickRestart.setAttribute('data-int', '[]')
    document.body.append(clickOnce, clickRestart)

    let ignoreCount = 0
    let restartCount = 0
    const ignoreListener = () => ignoreCount++
    const restartListener = () => restartCount++
    window.addEventListener('ignore-event', ignoreListener)
    window.addEventListener('restart-event', restartListener)

    const pairs = [
      {
        element: clickOnce,
        rules: [
          {
            sourceId: 'ignore',
            concurrency: 'ignore',
            transition: { durationMs: 40 },
            triggers: [{ kind: 'click' }],
            effects: [{ kind: 'emit', name: 'ignore-event' }],
          },
        ],
      },
      {
        element: clickRestart,
        rules: [
          {
            sourceId: 'restart',
            concurrency: 'restart',
            transition: { durationMs: 40 },
            triggers: [{ kind: 'click' }],
            effects: [{ kind: 'emit', name: 'restart-event' }],
          },
        ],
      },
    ]

    const engine = ActionEngine.bind(document, pairs)

    clickOnce.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    clickOnce.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    clickRestart.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    clickRestart.dispatchEvent(new MouseEvent('click', { bubbles: true }))

    await new Promise((resolve) => setTimeout(resolve, 60))

    expect(ignoreCount).toBe(1)
    expect(restartCount).toBe(2)

    engine.destroy()
    window.removeEventListener('ignore-event', ignoreListener)
    window.removeEventListener('restart-event', restartListener)
  })

  it('collects rules from data attributes', () => {
    const el = document.createElement('div')
    el.setAttribute('data-node-id', 'x')
    el.setAttribute('data-int', '{"tr":[{"k":"c"}],"fx":[{"k":"c","add":"active"}]}')
    document.body.appendChild(el)

    const pairs = collectRulesFromDataAttrs(document)
    expect(pairs.length).toBe(1)
    expect(pairs[0].rules[0].effects[0]).toMatchObject({ kind: 'class', add: ['active'] })
  })
})
