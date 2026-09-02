import { render, screen, waitFor } from '@testing-library/react'
import KursChart from './KursChart'
import { DataProvider } from '../store/DataContext'
import { ThemeProvider } from '../store/ThemeContext'

const wrap = (ui) => <ThemeProvider><DataProvider>{ui}</DataProvider></ThemeProvider>

test('KursChart renders and its table has the data points', async () => {
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({
    tanggal_awal: '2024-08-22', kurs_usd_idr: [15600, 15650, 15700],
  }) })))
  render(wrap(<KursChart />))
  await waitFor(() => expect(screen.getByText(/Kurs USD\/IDR/i)).toBeInTheDocument())
  screen.getByText('Lihat sebagai tabel').click()
  expect(await screen.findByRole('cell', { name: '15.700' })).toBeInTheDocument()
})
