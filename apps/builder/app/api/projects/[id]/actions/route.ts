import { NextResponse, type NextRequest } from 'next/server'
import type { ActionPreset } from '@/lib/actions/types'

type StoreShape = {
  list: string[]
  presets: Record<string, ActionPreset>
  currentId?: string
}

const memory = new Map<string, StoreShape>()

const emptyState = (): StoreShape => ({ list: [], presets: {}, currentId: undefined })

function ensureArray<T>(input: any, mapper: (value: any, index: number) => T | undefined) {
  if (!Array.isArray(input)) return []
  const result: T[] = []
  input.forEach((value, index) => {
    const next = mapper(value, index)
    if (next !== undefined) result.push(next)
  })
  return result
}

function toPreset(value: any, index: number): ActionPreset | undefined {
  if (!value || typeof value !== 'object') return undefined
  const id = typeof value.id === 'string' && value.id ? value.id : `import_${index}_${Math.random().toString(36).slice(2, 9)}`
  const name = typeof value.name === 'string' && value.name ? value.name : `Preset ${index + 1}`
  const triggers = Array.isArray(value.triggers) ? (value.triggers as string[]).filter((v) => typeof v === 'string') : []
  const effects = Array.isArray(value.effects) ? value.effects : []
  const when = Array.isArray(value.when) ? value.when : undefined
  return {
    id,
    name,
    description: typeof value.description === 'string' ? value.description : undefined,
    triggers: triggers as any,
    effects: effects as any,
    transitionMs: typeof value.transitionMs === 'number' ? value.transitionMs : undefined,
    easing: typeof value.easing === 'string' ? value.easing : undefined,
    tags: Array.isArray(value.tags) ? value.tags.filter((tag: unknown) => typeof tag === 'string') : undefined,
    updatedAt: typeof value.updatedAt === 'number' ? value.updatedAt : Date.now(),
    createdAt: typeof value.createdAt === 'number' ? value.createdAt : undefined,
    when: when as any,
    actions: Array.isArray(value.actions) ? (value.actions as any) : undefined,
  }
}

function normalizePayload(payload: any): StoreShape {
  if (Array.isArray(payload)) {
    const presets = ensureArray(payload, toPreset)
    const list = presets.map((preset) => preset.id)
    const map = Object.fromEntries(presets.map((preset) => [preset.id, preset]))
    return { list, presets: map, currentId: list[0] }
  }

  if (payload && typeof payload === 'object') {
    const mapInput = payload.presets && typeof payload.presets === 'object' ? payload.presets : {}
    const listInput = Array.isArray(payload.list)
      ? payload.list.filter((id: unknown): id is string => typeof id === 'string')
      : []

    const presetEntries: [string, ActionPreset][] = []
    const seen = new Set<string>()

    if (listInput.length) {
      listInput.forEach((id, index) => {
        const raw = (mapInput as Record<string, any>)[id]
        const preset = raw ? toPreset({ id, ...raw }, index) : undefined
        if (preset && !seen.has(preset.id)) {
          seen.add(preset.id)
          presetEntries.push([preset.id, preset])
        }
      })
    } else {
      Object.entries(mapInput as Record<string, any>).forEach(([id, raw], index) => {
        const preset = toPreset({ id, ...raw }, index)
        if (preset && !seen.has(preset.id)) {
          seen.add(preset.id)
          presetEntries.push([preset.id, preset])
        }
      })
    }

    const list = presetEntries.map(([id]) => id)
    const map = Object.fromEntries(presetEntries)
    const currentId =
      typeof payload.currentId === 'string' && list.includes(payload.currentId)
        ? payload.currentId
        : list[0]

    return { list, presets: map, currentId }
  }

  return emptyState()
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const projectId = decodeURIComponent(params.id)
  const state = memory.get(projectId) ?? emptyState()
  return NextResponse.json(state)
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const projectId = decodeURIComponent(params.id)
  let payload: any = null
  try {
    payload = await req.json()
  } catch {
    payload = null
  }
  const state = normalizePayload(payload)
  memory.set(projectId, state)
  return NextResponse.json({ ok: true, ...state })
}

export async function PUT(req: NextRequest, ctx: { params: { id: string } }) {
  return POST(req, ctx)
}
