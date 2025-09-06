import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { generatePageCode } from '@chizu/renderer'
import type { Page, Frame } from '@chizu/types'

const root = resolve(process.cwd(), 'apps/preview')
const page: Page = JSON.parse(readFileSync(resolve(root, 'samples/page.map-home.json'), 'utf-8'))
const frame: Frame = JSON.parse(readFileSync(resolve(root, 'samples/frame.basic.json'), 'utf-8'))
const { tsx, fileName } = generatePageCode({ page, frame, registryImport: '@chizu/registry' })
const out = resolve(root, 'generated/pages', fileName)
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, tsx, 'utf-8')
console.log('generated:', out)

