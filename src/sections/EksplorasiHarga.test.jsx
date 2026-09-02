import { render, screen, waitFor } from '@testing-library/react'
import { DataProvider } from '../store/DataContext'
import { FilterProvider } from '../store/FilterContext'
import { ThemeProvider } from '../store/ThemeContext'
import EksplorasiHarga from './EksplorasiHarga'
import { stubFetchAll } from '../test-fixtures'

beforeEach(() => stubFetchAll())

const wrap = (ui) => <ThemeProvider><DataProvider><FilterProvider>{ui}</FilterProvider></DataProvider></ThemeProvider>

test('shows last price stat for default commodity (avg envelope)', async () => {
  render(wrap(<EksplorasiHarga />))
  await waitFor(() => expect(screen.getByText(/Eksplorasi Harga/i)).toBeInTheDocument())
  // avg[i] = 39000 + 110*i, i=0..39 → terakhir = max = 43290
  expect(screen.getAllByText('Rp 43.290').length).toBeGreaterThanOrEqual(1)
  expect(screen.getByText('Rp 39.000')).toBeInTheDocument() // terendah

})
