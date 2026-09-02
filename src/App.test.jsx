import { render, screen, waitFor } from '@testing-library/react'
import App from './App'
import { stubFetchAll } from './test-fixtures'

beforeEach(() => stubFetchAll())

test('shell renders nav, data-date banner, sections', async () => {
  render(<App />)
  await waitFor(() => expect(screen.getAllByText(/22 Agu 2026/).length).toBeGreaterThan(0))
  for (const id of ['eksplorasi', 'cuaca', 'prediksi', 'band', 'riset']) {
    expect(document.getElementById(id)).toBeInTheDocument()
  }
  expect(screen.getByRole('link', { name: /Eksplorasi Harga/i })).toHaveAttribute('href', '#eksplorasi')
})
