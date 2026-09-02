import { render, screen, act } from '@testing-library/react'
import { FilterProvider, useFilter } from './FilterContext'
import { ThemeProvider, useTheme, useTokens } from './ThemeContext'

function FProbe() {
  const f = useFilter()
  return <button onClick={() => f.setKomoditas('BAWANG MERAH')}>{f.komoditas}|{f.rentang}</button>
}
test('filter defaults and setter', () => {
  render(<FilterProvider><FProbe /></FilterProvider>)
  const b = screen.getByRole('button')
  expect(b).toHaveTextContent('CABE MERAH KERITING|2thn')
  act(() => b.click())
  expect(b).toHaveTextContent('BAWANG MERAH|2thn')
})

function TProbe() {
  const { theme, toggle } = useTheme()
  const t = useTokens()
  return <button onClick={toggle}>{theme}:{t.cat3}</button>
}
test('theme toggle swaps tokens + data-theme attr', () => {
  render(<ThemeProvider><TProbe /></ThemeProvider>)
  const b = screen.getByRole('button')
  const first = b.textContent
  act(() => b.click())
  expect(b.textContent).not.toBe(first)
  expect(['light', 'dark']).toContain(document.documentElement.dataset.theme)
})
