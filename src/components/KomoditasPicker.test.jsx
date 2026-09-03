import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DataProvider } from '../store/DataContext'
import { FilterProvider, useFilter } from '../store/FilterContext'
import { ThemeProvider } from '../store/ThemeContext'
import KomoditasPicker from './KomoditasPicker'
import { stubFetchAll } from '../test-fixtures'

beforeEach(() => stubFetchAll())
function Echo() { return <span data-testid="k">{useFilter().komoditas}</span> }
const wrap = (ui) => <ThemeProvider><DataProvider><FilterProvider>{ui}<Echo /></FilterProvider></DataProvider></ThemeProvider>

test('search memfilter, klik chip mengubah komoditas, caveat bertanda', async () => {
  render(wrap(<KomoditasPicker />))
  await waitFor(() => expect(screen.getByRole('radiogroup', { name: /komoditas/i })).toBeInTheDocument())
  fireEvent.change(screen.getByLabelText(/cari komoditas/i), { target: { value: 'batu' } })
  const chip = screen.getByRole('radio', { name: /BAWANG MERAH BATU/ })
  expect(chip).toHaveTextContent('⚠')
  fireEvent.click(chip)
  expect(screen.getByTestId('k')).toHaveTextContent('BAWANG MERAH BATU')
})

test('search tanpa hasil → pesan kosong', async () => {
  render(wrap(<KomoditasPicker />))
  await waitFor(() => expect(screen.getByLabelText(/cari komoditas/i)).toBeInTheDocument())
  fireEvent.change(screen.getByLabelText(/cari komoditas/i), { target: { value: 'zzz' } })
  expect(screen.getByText(/tidak ada komoditas cocok/i)).toBeInTheDocument()
})
