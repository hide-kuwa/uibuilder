'use client'
import Dexie, { Table } from 'dexie'

export interface Draft { id: string; data: any; updatedAt: number }
export interface Outbox { id?: number; target: string; method: 'PUT'|'PATCH'; body: any; createdAt: number }

class BuilderDB extends Dexie {
  drafts!: Table<Draft, string>
  outbox!: Table<Outbox, number>
  constructor() {
    super('builder-db')
    this.version(1).stores({
      drafts: 'id,updatedAt',
      outbox: '++id,createdAt',
    })
  }
}

export const db = new BuilderDB()

