import { render, screen, waitFor } from '@testing-library/react'
import { DataProvider } from '../store/DataContext'
import { FilterProvider } from '../store/FilterContext'
import { ThemeProvider } from '../store/ThemeContext'
import Prediksi from './Prediksi'
import { stubFetchAll } from '../test-fixtures'

beforeEach(() => stubFetchAll())
const wrap = (ui) => <ThemeProvider><DataProvider><FilterProvider>{ui}</FilterProvider></DataProvider></ThemeProvider>

test('halaman prediksi: banner + backtest + chip model/baseline + MAE', async () => {
  render(wrap(<Prediksi />))
  await waitFor(() => expect(screen.getByText(/dihitung dari data terakhir/i)).toBeInTheDocument())
  expect(screen.getAllByText(/35\.000/).length).toBeGreaterThan(0)
  expect(screen.getAllByText(/35\.111/).length).toBeGreaterThan(0)
  expect(screen.getAllByText(/\+40/).length).toBeGreaterThan(0)
  expect(screen.getByText(/MAE model vs baseline per horizon/i)).toBeInTheDocument()
})
