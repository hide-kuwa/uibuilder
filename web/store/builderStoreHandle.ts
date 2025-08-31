'use client'
import { useBuilderStore } from '@/store/builderStore'
if (typeof window !== 'undefined') {
  ;(window as any).useBuilderStore = useBuilderStore
}

