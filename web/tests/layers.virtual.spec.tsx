import { render, screen } from '@testing-library/react'
import LayersVirtual from '@/components/panels/LayersVirtual'

it('renders only a slice of rows', () => {
  const rows = Array.from({ length: 2000 }, (_, i) => ({ id: String(i) }))
  render(<div style={{ height: 320 }}><LayersVirtual rows={rows} /></div>)
  const items = screen.getAllByText(/^\d+$/)
  expect(items.length).toBeLessThan(400)
})

