import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { DataProvider } from '../store/DataContext'
import { FilterProvider } from '../store/FilterContext'
import { ThemeProvider } from '../store/ThemeContext'
import ProyeksiChart from './ProyeksiChart'
import { stubFetchAll } from '../test-fixtures'

beforeEach(() => { stubFetchAll(); vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date('2026-09-06T09:00:00')) })
const wrap = (ui) => <ThemeProvider><DataProvider><FilterProvider>{ui}</FilterProvider></DataProvider></ThemeProvider>

test('render proyeksi: judul, caption band-empiris, penanda HARI INI', async () => {
  render(wrap(<ProyeksiChart />))
  await waitFor(() => expect(screen.getByText(/Proyeksi harga CABE MERAH KERITING/i)).toBeInTheDocument())
  expect(screen.getByText(/band empiris/i)).toBeInTheDocument()
  await waitFor(() => expect(screen.getByText('HARI INI')).toBeInTheDocument())
})
