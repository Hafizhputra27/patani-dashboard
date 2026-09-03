import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { DataProvider } from '../store/DataContext'
import { FilterProvider } from '../store/FilterContext'
import { ThemeProvider } from '../store/ThemeContext'
import ProyeksiBergulir from './ProyeksiBergulir'
import { stubFetchAll } from '../test-fixtures'

const wrap = (ui) => <ThemeProvider><DataProvider><FilterProvider>{ui}</FilterProvider></DataProvider></ThemeProvider>
beforeEach(() => { stubFetchAll(); vi.useFakeTimers({ toFake: ['Date'] }) })

test('headline = proyeksiBand hari ini + chip +N hari + caption wajib', async () => {
  vi.setSystemTime(new Date('2026-09-06T09:00:00')) // d0=2026-08-22 → n=15
  render(wrap(<ProyeksiBergulir />))
  await waitFor(() => expect(screen.getByText(/Estimasi hari ini/i)).toBeInTheDocument())
  expect(screen.getByText(/\+15 hari sejak data terakhir 22 Agu 2026/)).toBeInTheDocument()
  expect(screen.getByText(/bukan prediksi bergulir model ML/)).toBeInTheDocument()
  expect(screen.getByText('Rp 43.290')).toBeInTheDocument()
})

test('n>30 → mode peringatan refresh', async () => {
  vi.setSystemTime(new Date('2026-10-05T09:00:00')) // n=44
  render(wrap(<ProyeksiBergulir />))
  await waitFor(() => expect(screen.getByText(/jalankan ulang pipeline scraping/i)).toBeInTheDocument())
})
