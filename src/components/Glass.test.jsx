import { render, screen } from '@testing-library/react'
import Glass from './Glass'

test('Glass default → .glass; tone → .glass--tone; as + props diteruskan', () => {
  const { rerender } = render(<Glass>isi</Glass>)
  expect(screen.getByText('isi')).toHaveClass('glass')

  rerender(<Glass tone="lime" className="x">isi</Glass>)
  const el = screen.getByText('isi')
  expect(el).toHaveClass('glass', 'glass--lime', 'x')

  rerender(<Glass as="section" aria-label="panel">isi</Glass>)
  expect(screen.getByLabelText('panel').tagName).toBe('SECTION')
})
