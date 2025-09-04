import { create } from 'zustand'
import { nanoid } from 'nanoid'
import { type Elm } from '@/store/builderStore'
import type { ThemeTokens } from '@/lib/builder/themes/themeTokens'
import { migratePage, PAGE_VERSION } from '../../src/lib/migrations/page'
import { toast } from '@/lib/toast'

export type PageId = string
export type RoutePath = `/${string}`

export type Page = {
    id: PageId
    title: string
    path: RoutePath
    tree: Elm[]
    bindings: Record<`${string}:${string}`, unknown>
    pageOverrides: {
      theme?: Partial<ThemeTokens>
    }
    meta: {
      title?: string
      description?: string
      ogImage?: {
        mode: 'auto' | 'custom'
        url?: string
      }
    }
    version: number
  }

interface PageState {
  pages: Page[]
  currentPageId: PageId
}

interface PageActions {
  selectPage: (id: PageId) => void
  addPage: (init?: Partial<Page>) => PageId
  removePage: (id: PageId) => void
  duplicatePage: (id: PageId) => PageId
  updatePageMeta: (
    id: PageId,
    patch: Partial<Pick<Page, 'title' | 'path'>>,
  ) => void
  getTree: () => Elm[]
  setTree: (tree: Elm[]) => void
  getBindings: () => Page['bindings']
  setBindings: (b: Page['bindings']) => void
  getTheme: () => Page['pageOverrides']['theme']
  setTheme: (theme: Page['pageOverrides']['theme']) => void
  getMeta: () => Page['meta']
  setMeta: (meta: Page['meta']) => void
  exportJSON: () => string
  importJSON: (json: string) => void
}

  function defaultPage(idx: number): Page {
    return {
      id: `page_${nanoid(6)}`,
      title: idx === 0 ? 'Home' : `Page ${idx + 1}`,
      path: idx === 0 ? '/' : (`/page-${idx + 1}` as RoutePath),
      tree: [],
      bindings: {},
      pageOverrides: { theme: {} },
      meta: { title: '', description: '', ogImage: { mode: 'auto' } },
      version: PAGE_VERSION,
    }
  }

const initial = defaultPage(0)

export const usePageStore = create<PageState & PageActions>((set, get) => ({
  pages: [initial],
  currentPageId: initial.id,

  selectPage(id) {
    const exists = get().pages.some((p) => p.id === id)
    if (exists) set({ currentPageId: id })
  },

  addPage(init) {
    const pages = get().pages
    const idx = pages.length
      const page: Page = {
        ...defaultPage(idx),
        ...init,
        id: `page_${nanoid(6)}`,
        path: init?.path ?? (`/page-${idx + 1}` as RoutePath),
        title: init?.title ?? `Page ${idx + 1}`,
        tree: init?.tree ?? [],
        bindings: init?.bindings ?? {},
        pageOverrides: { theme: init?.pageOverrides?.theme ?? {} },
        meta: init?.meta ?? { title: '', description: '', ogImage: { mode: 'auto' } },
        version: PAGE_VERSION,
      }
    set({ pages: [...pages, page], currentPageId: page.id })
    return page.id
  },

  removePage(id) {
    set((s) => {
      const pages = s.pages.filter((p) => p.id !== id)
      let currentPageId = s.currentPageId
      if (s.currentPageId === id && pages.length) {
        currentPageId = pages[0].id
      }
      return { pages, currentPageId }
    })
  },

  duplicatePage(id) {
    const src = get().pages.find((p) => p.id === id)
    if (!src) return get().currentPageId
    const idx = get().pages.length
      const newPage: Page = {
        ...src,
        id: `page_${nanoid(6)}`,
        title: `${src.title} Copy`,
        path: (`/page-${idx + 1}` as RoutePath),
        tree: JSON.parse(JSON.stringify(src.tree)),
        bindings: JSON.parse(JSON.stringify(src.bindings)),
        pageOverrides: JSON.parse(JSON.stringify(src.pageOverrides ?? {})),
        meta: JSON.parse(JSON.stringify(src.meta ?? { title: '', description: '', ogImage: { mode: 'auto' } })),
        version: PAGE_VERSION,
      }
    set((s) => ({ pages: [...s.pages, newPage], currentPageId: newPage.id }))
    return newPage.id
  },

  updatePageMeta(id, patch) {
    set((s) => ({
      pages: s.pages.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }))
  },

  getTree() {
    const p = get().pages.find((p) => p.id === get().currentPageId)
    return p ? p.tree : []
  },

  setTree(tree) {
    set((s) => ({
      pages: s.pages.map((p) =>
        p.id === s.currentPageId ? { ...p, tree } : p,
      ),
    }))
  },

  getBindings() {
    const p = get().pages.find((p) => p.id === get().currentPageId)
    return p ? p.bindings : {}
  },

  setBindings(b) {
    set((s) => ({
      pages: s.pages.map((p) =>
        p.id === s.currentPageId ? { ...p, bindings: b } : p,
      ),
    }))
  },

  getTheme() {
    const p = get().pages.find((p) => p.id === get().currentPageId)
    return p?.pageOverrides?.theme ?? {}
  },

  setTheme(theme) {
    set((s) => ({
      pages: s.pages.map((p) =>
        p.id === s.currentPageId
          ? { ...p, pageOverrides: { ...(p.pageOverrides ?? {}), theme } }
          : p,
      ),
    }))
  },

  getMeta() {
    const p = get().pages.find((p) => p.id === get().currentPageId)
    return p?.meta ?? { title: '', description: '', ogImage: { mode: 'auto' } }
  },

  setMeta(meta) {
    set((s) => ({
      pages: s.pages.map((p) =>
        p.id === s.currentPageId ? { ...p, meta } : p,
      ),
    }))
  },

    exportJSON() {
      return JSON.stringify(get().pages)
    },

    importJSON(json) {
      try {
        const parsed = JSON.parse(json)
        const arr = Array.isArray(parsed)
          ? parsed
          : Array.isArray((parsed as any).pages)
            ? (parsed as any).pages
            : null
        if (arr && arr.length) {
          const pages = arr.map((p: any) => migratePage(p))
          set({ pages, currentPageId: pages[0].id })
        } else {
          throw new Error('Invalid page data')
        }
      } catch (e: any) {
        toast.error(e?.message ?? 'Failed to import pages')
      }
    },
  }))

