import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '../store/ThemeContext'
import Timeline from './Timeline'

const items = [
  { n: 1, judul: 'Tahap A', isi: 'isi a' },
  { n: 2, judul: 'Tahap B', isi: 'isi b' },
  { n: 3, judul: 'Tahap C', isi: 'isi c' },
]
const wrap = (ui) => <ThemeProvider>{ui}</ThemeProvider>

test('default aktif=0; panah berikutnya memajukan; klik node melompat', () => {
  render(wrap(<Timeline items={items} />))
  expect(screen.getByRole('button', { name: /Tahap 1: Tahap A/ })).toHaveAttribute('aria-current', 'step')
  fireEvent.click(screen.getByRole('button', { name: /tahap berikutnya/i }))
  expect(screen.getByRole('button', { name: /Tahap 2: Tahap B/ })).toHaveAttribute('aria-current', 'step')
  fireEvent.click(screen.getByRole('button', { name: /Tahap 3: Tahap C/ }))
  expect(screen.getByRole('button', { name: /tahap berikutnya/i })).toBeDisabled()
})
