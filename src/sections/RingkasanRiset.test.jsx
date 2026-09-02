import { render, screen, waitFor } from '@testing-library/react'
import { DataProvider } from '../store/DataContext'
import { ThemeProvider } from '../store/ThemeContext'
import RingkasanRiset from './RingkasanRiset'
import { stubFetchAll } from '../test-fixtures'

beforeEach(() => stubFetchAll())

test('renders numbered stages, horizon table, conclusion', async () => {
  render(<ThemeProvider><DataProvider><RingkasanRiset /></DataProvider></ThemeProvider>)
  await waitFor(() => expect(screen.getByText('Bug data kotor')).toBeInTheDocument())
  expect(screen.getByText(/Fitur tidak cukup/)).toBeInTheDocument()
  expect(screen.getByRole('cell', { name: '619' })).toBeInTheDocument()
})
