import { render, screen } from '@testing-library/react'
import { ShareMenu } from '@/component/builder/ShareMenu'

describe('ShareMenu', () => {
  it('renders stable relative href', () => {
    render(<ShareMenu slug="demo" />)
    const link = screen.getByRole('link', { name: 'Preview' })
    expect(link).toHaveAttribute('href', '/preview/demo')
  })
})
