import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import App from './App'
import { stubFetchAll } from './test-fixtures'

beforeEach(() => { stubFetchAll(); window.location.hash = '#/' })
afterEach(() => { window.location.hash = '#/' })

test('nav: 6 rute sidebar, rute valid, #/ menampilkan Ringkasan', async () => {
  render(<App />)
  await waitFor(() => expect(screen.getAllByText(/22 Agu 2026/).length).toBeGreaterThan(0))
  const hrefs = document.querySelectorAll('nav a[href^="#/"]').length
  expect(hrefs).toBe(6)
  expect(screen.getByText('Pita Ketidakpastian')).toBeInTheDocument()
  expect(screen.getByText(/Prediksi Harga 3 Hari/i)).toBeInTheDocument()
})

test('hamburger toggle: sidebar bisa di-hide dan di-tampilkan', async () => {
  render(<App />)
  await waitFor(() => expect(document.querySelector('.app-shell')).not.toHaveClass('nav-closed'))
  fireEvent.click(screen.getByRole('button', { name: /Sembunyikan menu/i }))
  expect(document.querySelector('.app-shell')).toHaveClass('nav-closed')
  fireEvent.click(screen.getByRole('button', { name: /Tampilkan menu/i }))
  expect(document.querySelector('.app-shell')).not.toHaveClass('nav-closed')
})

test.each([
  ['#/eksplorasi', /Perbandingan Harga/i],
  ['#/prediksi', /dihitung dari data terakhir/i],
  ['#/cuaca', /Kondisi Lingkungan/i],
  ['#/rekomendasi', /Estimasi Rentang Harga 7 Hari/i],
  ['#/riset', /8 Tahap Evaluasi Model/i],
])('navigasi %s menampilkan halamannya sendiri', async (hash, expected) => {
  render(<App />)
  act(() => { window.location.hash = hash; window.dispatchEvent(new Event('hashchange')) })
  await waitFor(() => expect(screen.getByText(expected)).toBeInTheDocument())
})