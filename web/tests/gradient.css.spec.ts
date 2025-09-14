import { selectionToCss } from '@/lib/style/selectionToCss'

it('linear gradient CSS', () => {
  const css = selectionToCss([{ fill: { type:'linear', angle: 45, stops:[
    { pos:0, color:'#000' }, { pos:1, color:{ token:'primary', fallback:'#0af' } }
  ]} as any }])
  expect(css).toMatch(/linear-gradient\(45deg, #000 0\.0%, var\(--primary, #0af\) 100\.0%\)/)
})

it('radial gradient CSS', () => {
  const css = selectionToCss([{ fill: { type:'radial', shape:'circle', size:'closest-side', stops:[
    { pos:0.25, color:'red' }, { pos:0.75, color:'blue' }
  ]} as any }])
  expect(css).toMatch(/radial-gradient\(circle closest-side, red 25\.0%, blue 75\.0%\)/)
})

