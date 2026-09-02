import { render, screen, waitFor } from '@testing-library/react'
import { DataProvider } from '../store/DataContext'
import { FilterProvider } from '../store/FilterContext'
import { ThemeProvider } from '../store/ThemeContext'
import CuacaKurs from './CuacaKurs'
import { stubFetchAll } from '../test-fixtures'

beforeEach(() => stubFetchAll())

const wrap = (ui) => <ThemeProvider><DataProvider><FilterProvider>{ui}</FilterProvider></DataProvider></ThemeProvider>

test('renders separate rain, temp, kurs charts (no dual axis)', async () => {
  render(wrap(<CuacaKurs />))
  await waitFor(() => expect(screen.getByText(/Curah Hujan — /i)).toBeInTheDocument())
  expect(screen.getByText(/Suhu — /i)).toBeInTheDocument()
  expect(screen.getAllByText(/Kurs USD\/IDR/i).length).toBeGreaterThan(0)
})
