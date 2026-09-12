import { render, screen, act } from '@testing-library/react'
import { FilterProvider, useFilter } from './FilterContext'
import { ThemeProvider, useTheme, useTokens } from './ThemeContext'
import { parseHash } from '../router'

afterEach(() => { window.history.replaceState(null, '', '#/') })

function FProbe({ target = 'BAWANG MERAH' }) {
  const f = useFilter()
  return <button onClick={() => f.setKomoditas(target)}>{f.komoditas}|{f.rentang}</button>
}
test('filter defaults and setter', () => {
  window.history.replaceState(null, '', '#/')
  render(<FilterProvider><FProbe /></FilterProvider>)
  const b = screen.getByRole('button')
  expect(b).toHaveTextContent('CABE MERAH KERITING|2thn')
  act(() => b.click())
  expect(b).toHaveTextContent('BAWANG MERAH|2thn')
})

test('FilterProvider init dari URL query dan sync balik', () => {
  window.history.replaceState(null, '', '#/prediksi?k=BAWANG%20MERAH&r=1thn')
  render(<FilterProvider><FProbe target="SAYURAN TOMAT" /></FilterProvider>)
  const b = screen.getByRole('button')
  expect(b).toHaveTextContent('BAWANG MERAH|1thn')
  act(() => b.click())
  const { path, query } = parseHash(window.location.hash)
  expect(path).toBe('/prediksi')
  expect(query.get('k')).toBe('SAYURAN TOMAT')
})

function TProbe() {
  const { theme, toggle } = useTheme()
  const t = useTokens()
  return <button onClick={toggle}>{theme}:{t.cat3}</button>
}
test('theme is locked to the clean white palette', () => {
  render(<ThemeProvider><TProbe /></ThemeProvider>)
  const b = screen.getByRole('button')
  expect(b).toHaveTextContent('light:#F59E0B')
  act(() => b.click())
  expect(b).toHaveTextContent('light:#F59E0B')
  expect(document.documentElement.dataset.theme).toBe('light')
})
