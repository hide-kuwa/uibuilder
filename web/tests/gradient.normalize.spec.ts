import { normalizeStops, disambiguateStops } from '@/lib/style/gradientCodec'

it('normalizes and sorts stops with clamping', () => {
  const s = normalizeStops([{ pos: 1.2, color: 'red' }, { pos: -0.1, color: 'blue' }])
  expect(s[0].pos).toBe(0)
  expect(s[1].pos).toBe(1)
})

it('disambiguates equal positions monotonically', () => {
  const s = disambiguateStops([{ pos: 0.5, color: 'a' }, { pos: 0.5, color: 'b' }])
  expect(s[0].pos).toBe(0.5)
  expect(s[1].pos).toBeGreaterThan(0.5)
})

