import { describe, it, expect } from 'vitest'
import { generatePageCode } from '../src/codegen'
import type { Page, Frame } from '@chizu/types'

const frame: Frame = { id:'frame-basic', name:'Basic', slots:[{name:'header'},{name:'sidebar'},{name:'content',required:true},{name:'footer'}] }

describe('generatePageCode determinism', () => {
  it('same JSON → same TSX', () => {
    const page: Page = {
      id: 't1',
      title: 'T',
      frameId: 'frame-basic',
      content: [{ id:'a', type:'Text', props:{ text:'x' }}]
    }
    const A = generatePageCode({ page, frame })
    const B = generatePageCode({ page, frame })
    expect(A.fileName).toBe(B.fileName)
    expect(A.tsx).toBe(B.tsx)
  })
})

