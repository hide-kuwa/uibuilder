'use client'
import Dexie from 'dexie'

export interface Draft { id: string; data: any; updatedAt: number }
export interface Outbox { id?: number; target: string; method: 'PUT'|'PATCH'; body: any; createdAt: number }

class BuilderDB extends Dexie {
  drafts!: any
  outbox!: any
  constructor() {
    super('builder-db')
    this.version(1).stores({
      drafts: 'id,updatedAt',
      outbox: '++id,createdAt',
    })
  }
}

export const db = new BuilderDB()
