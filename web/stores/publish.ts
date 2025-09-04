'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type PublishState = {
  lastPublishedAt?: string
  schema?: any
  publish: (schema: any) => void
}
export const usePublishStore = create<PublishState>()(
  persist(
    (set) => ({
      publish: (schema) => set({ schema, lastPublishedAt: new Date().toISOString() }),
    }),
    { name: 'geokore-publish' }
  )
)
