import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DataProvider } from '../store/DataContext'
import { FilterProvider, useFilter } from '../store/FilterContext'
import { ThemeProvider } from '../store/ThemeContext'
import KomoditasPicker from './KomoditasPicker'
import { stubFetchAll } from '../test-fixtures'

beforeEach(() => stubFetchAll())
function Echo() { return <span data-testid="k">{useFilter().komoditas}</span> }
const wrap = (ui) => <ThemeProvider><DataProvider><FilterProvider>{ui}<Echo /></FilterProvider></DataProvider></ThemeProvider>

test('popover: tombol menampilkan komoditas aktif; buka → chip-grid', async () => {
  render(wrap(<KomoditasPicker />))
  await waitFor(() => expect(screen.getByRole("button", { name: /^Komoditas:/ })).toBeInTheDocument())
  expect(screen.queryByRole('dialog')).toBeNull()
  fireEvent.click(screen.getByRole("button", { name: /^Komoditas:/ }))
  expect(screen.getByRole('dialog', { name: /pemilih komoditas/i })).toBeInTheDocument()
})

test('search memfilter, klik chip mengubah komoditas + menutup popover, caveat bertanda', async () => {
  render(wrap(<KomoditasPicker />))
  await waitFor(() => screen.getByRole("button", { name: /^Komoditas:/ }))
  fireEvent.click(screen.getByRole("button", { name: /^Komoditas:/ }))
  fireEvent.change(screen.getByLabelText(/cari komoditas/i), { target: { value: 'batu' } })
  const chip = screen.getByRole('radio', { name: /BAWANG MERAH BATU/ })
  expect(chip).toHaveAttribute('title', 'data 1–3 pasar jarang lapor')
  fireEvent.click(chip)
  expect(screen.getByTestId('k')).toHaveTextContent('BAWANG MERAH BATU')
  expect(screen.queryByRole('dialog')).toBeNull() // popover tertutup
})

test('search tanpa hasil → pesan kosong', async () => {
  render(wrap(<KomoditasPicker />))
  await waitFor(() => screen.getByRole("button", { name: /^Komoditas:/ }))
  fireEvent.click(screen.getByRole("button", { name: /^Komoditas:/ }))
  fireEvent.change(screen.getByLabelText(/cari komoditas/i), { target: { value: 'zzz' } })
  expect(screen.getByText(/tidak ada komoditas cocok/i)).toBeInTheDocument()
})

test('Escape menutup popover', async () => {
  render(wrap(<KomoditasPicker />))
  await waitFor(() => screen.getByRole("button", { name: /^Komoditas:/ }))
  fireEvent.click(screen.getByRole("button", { name: /^Komoditas:/ }))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(screen.queryByRole('dialog')).toBeNull()
})
