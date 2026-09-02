import { render, screen, waitFor } from '@testing-library/react'
import App from './App'
import { stubFetchAll } from './test-fixtures'

beforeEach(() => stubFetchAll())

test('every section chart exposes a table view', async () => {
  render(<App />)
  await waitFor(() => expect(screen.getAllByText('Lihat sebagai tabel').length).toBeGreaterThanOrEqual(5))
})

test('nav links point to existing section ids', async () => {
  render(<App />)
  await waitFor(() => {
    document.querySelectorAll('nav a[href^="#"]').forEach((a) => {
      expect(document.getElementById(a.getAttribute('href').slice(1))).toBeInTheDocument()
    })
  })
})

test('chart frames expose role=img with a label', async () => {
  render(<App />)
  await waitFor(() => expect(document.querySelectorAll('div[role="img"]').length).toBeGreaterThanOrEqual(5))
  document.querySelectorAll('div[role="img"]').forEach((el) => expect(el).toHaveAttribute('aria-label'))
})
