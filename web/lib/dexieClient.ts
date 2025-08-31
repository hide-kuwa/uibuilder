'use client'
import Dexie, { Table } from 'dexie'

export interface ImageRecord { id: string; url: string; createdAt: number }

class AssetsDB extends Dexie {
  images!: Table<ImageRecord, string>
  constructor() {
    super('tamadigi-assets')
    this.version(1).stores({ images: 'id, createdAt' })
  }
}

let _db: AssetsDB | null = null
export function getAssetsDB(): AssetsDB | null {
  if (typeof window === 'undefined') return null
  if (!_db) _db = new AssetsDB()
  return _db
}

