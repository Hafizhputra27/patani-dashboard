import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DataProvider } from '../store/DataContext'
import { FilterProvider } from '../store/FilterContext'
import { ThemeProvider } from '../store/ThemeContext'
import RekomendasiBand from './RekomendasiBand'
import { stubFetchAll } from '../test-fixtures'

beforeEach(() => stubFetchAll())

const wrap = (ui) => <ThemeProvider><DataProvider><FilterProvider>{ui}</FilterProvider></DataProvider></ThemeProvider>

test('kalkulator: input harga → rentang + peringatan Lebaran', async () => {
  render(wrap(<RekomendasiBand />))
  await waitFor(() => expect(screen.getByLabelText(/harga .* sekarang/i)).toBeInTheDocument())
  fireEvent.change(screen.getByLabelText(/harga .* sekarang/i), { target: { value: '35000' } })
  fireEvent.click(screen.getByLabelText(/menjelang lebaran/i))
  expect(screen.getByText(/Rp 24\.500/)).toBeInTheDocument()
  expect(screen.getByText(/Rp 47\.985/)).toBeInTheDocument()
  expect(screen.getByText(/2 kejadian/)).toBeInTheDocument()
})
