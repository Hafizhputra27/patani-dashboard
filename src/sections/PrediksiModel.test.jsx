import { render, screen, waitFor } from '@testing-library/react'
import { DataProvider } from '../store/DataContext'
import { FilterProvider } from '../store/FilterContext'
import { ThemeProvider } from '../store/ThemeContext'
import PrediksiModel from './PrediksiModel'
import { stubFetchAll } from '../test-fixtures'

beforeEach(() => stubFetchAll())

const wrap = (ui) => <ThemeProvider><DataProvider><FilterProvider>{ui}</FilterProvider></DataProvider></ThemeProvider>

test('prediksi chip shows model paired with baseline + MAE label; banner shows anchor date', async () => {
  render(wrap(<PrediksiModel />))
  await waitFor(() => expect(screen.getByText(/dihitung dari data terakhir/i)).toBeInTheDocument())
  expect(screen.getAllByText(/22 Agu 2026/).length).toBeGreaterThan(0)
  expect(screen.getAllByText(/35\.000/).length).toBeGreaterThan(0) // baseline
  expect(screen.getAllByText(/35\.111/).length).toBeGreaterThan(0) // model H+7
  expect(screen.getAllByText(/\+40/).length).toBeGreaterThan(0) // "+40.1% MAE" label
})
