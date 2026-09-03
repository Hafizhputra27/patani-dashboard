import { render, screen, waitFor } from '@testing-library/react'
import { DataProvider } from '../store/DataContext'
import { FilterProvider } from '../store/FilterContext'
import { ThemeProvider } from '../store/ThemeContext'
import KonteksHistoris from './KonteksHistoris'
import { stubFetchAll } from '../test-fixtures'

beforeEach(() => stubFetchAll())
const wrap = (ui) => <ThemeProvider><DataProvider><FilterProvider>{ui}</FilterProvider></DataProvider></ThemeProvider>

test('render mini-chart + kartu band normal & Lebaran', async () => {
  render(wrap(<KonteksHistoris />))
  await waitFor(() => expect(screen.getByText(/Konteks historis — CABE MERAH KERITING/i)).toBeInTheDocument())
  expect(screen.getByText(/Kondisi normal/i)).toBeInTheDocument()
  expect(screen.getByText(/Menjelang Lebaran/i)).toBeInTheDocument()
  expect(screen.getByText(/lebar band 41\.7%/)).toBeInTheDocument()
})
