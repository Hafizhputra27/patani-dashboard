import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import App from './App'
import { stubFetchAll } from './test-fixtures'

const realMatchMedia = window.matchMedia
beforeEach(() => { stubFetchAll(); window.location.hash = '#/' })
afterEach(() => { window.location.hash = '#/'; window.matchMedia = realMatchMedia })

test('nav route links valid: 6 rute sidebar', async () => {
  render(<App />)
  await waitFor(() => expect(screen.getByRole('link', { name: /Prediksi Model/i })).toBeInTheDocument())
  const hrefs = [...document.querySelectorAll('nav a[href^="#/"]')].map((a) => a.getAttribute('href')).sort()
  expect(hrefs).toEqual(['#/', '#/cuaca', '#/eksplorasi', '#/prediksi', '#/rekomendasi', '#/riset'])
})

test('chart frames expose role=img with a label', async () => {
  render(<App />)
  await waitFor(() => expect(document.querySelectorAll('div[role="img"]').length).toBeGreaterThanOrEqual(1))
  document.querySelectorAll('div[role="img"]').forEach((el) => expect(el).toHaveAttribute('aria-label'))
})

test('setiap chart punya alternatif tabel di halamannya', async () => {
  render(<App />)
  await waitFor(() => expect(screen.getAllByText('Lihat sebagai tabel').length).toBeGreaterThanOrEqual(1))
  for (const hash of ['#/eksplorasi', '#/prediksi']) {
    window.location.hash = hash
    window.dispatchEvent(new Event('hashchange'))
    await waitFor(() => expect(screen.getAllByText('Lihat sebagai tabel').length).toBeGreaterThanOrEqual(1))
  }
})

test('picker popover: radiogroup + chip radio; timeline node punya aria-label', async () => {
  render(<App />)
  await waitFor(() => expect(screen.getByRole("button", { name: /^Komoditas:/ })).toBeInTheDocument())
  fireEvent.click(screen.getByRole("button", { name: /^Komoditas:/ }))
  expect(screen.getByRole('radiogroup', { name: /komoditas/i })).toBeInTheDocument()
  expect(screen.getAllByRole('radio').length).toBeGreaterThan(0)
  window.location.hash = '#/riset'
  window.dispatchEvent(new Event('hashchange'))
  await waitFor(() => expect(screen.getAllByRole('button', { name: /^Tahap \d+:/ }).length).toBeGreaterThanOrEqual(1))
})

test('reduced-transparency: render #/ dan #/prediksi tanpa error', async () => {
  window.matchMedia = (q) => ({
    matches: /prefers-reduced-transparency|prefers-reduced-motion/.test(q),
    media: q, onchange: null,
    addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
  })
  window.location.hash = '#/prediksi'
  render(<App />)
  await waitFor(() => expect(screen.getByText(/dihitung dari data terakhir/i)).toBeInTheDocument())
})