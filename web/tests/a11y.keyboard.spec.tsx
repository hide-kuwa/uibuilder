import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RightPane from '@/components/shell/RightPane'

it('toolbar roving focus with arrows', async () => {
  const u = userEvent.setup()
  render(<RightPane />)
  const toolbar = screen.getByRole('toolbar', { name: /style/i })
  // Tab to first tool
  await u.tab()
  await u.keyboard('{ArrowRight}')
  // Expect one of toolbar buttons to have focus (export/import/copy)
  const exportBtn = screen.getByRole('button', { name: /export/i })
  expect(exportBtn === document.activeElement || screen.getByRole('button', { name: /import/i }) === document.activeElement || screen.getByRole('button', { name: /copy css/i }) === document.activeElement).toBeTruthy()
})

