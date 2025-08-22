import tokensJson from './tokens.json'
import type { Tokens } from './schema'

export const tokens = tokensJson as Tokens

export type Theme = 'light' | 'dark'

export function tokensToCSS(theme: Theme): Record<string, string> {
  const vars: Record<string, string> = {}
  const { color } = tokens
  const walk = (obj: any, path: string[] = []) => {
    for (const key in obj) {
      const nextPath = [...path, key]
      const value = obj[key]
      if (value && typeof value === 'object' && 'light' in value) {
        vars[`--${nextPath.join('-')}`] = value[theme]
      } else {
        walk(value, nextPath)
      }
    }
  }
  walk(color, ['color'])
  return vars
}
