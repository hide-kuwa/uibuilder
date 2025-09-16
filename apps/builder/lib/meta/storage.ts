'use client'

import Dexie, { type Table } from 'dexie'
import type { Page } from '@chizu/types'
import { DEFAULT_BUILDER_MANIFEST } from './builderManifest'

const STORAGE_KEY = 'builder-ui-v1'

type ManifestRecord = {
  key: string
  data: Page
  updatedAt: number
}

class BuilderMetaDB extends Dexie {
  manifests!: Table<ManifestRecord, string>

  constructor() {
    super('builder-meta')
    this.version(1).stores({
      manifests: '&key,updatedAt',
    })
  }
}

const db = new BuilderMetaDB()

function clone<T>(value: T): T {
  try {
    return structuredClone(value)
  } catch {
    return JSON.parse(JSON.stringify(value)) as T
  }
}

export async function loadBuilderManifest(): Promise<Page> {
  try {
    const record = await db.manifests.get(STORAGE_KEY)
    if (record?.data) {
      return clone(record.data)
    }
  } catch {}
  return clone(DEFAULT_BUILDER_MANIFEST)
}

export async function saveBuilderManifest(manifest: Page): Promise<void> {
  await db.manifests.put({
    key: STORAGE_KEY,
    data: clone(manifest),
    updatedAt: Date.now(),
  })
}
