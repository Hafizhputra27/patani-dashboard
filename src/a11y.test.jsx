import { render, screen, waitFor } from '@testing-library/react'
import App from './App'
import { stubFetchAll } from './test-fixtures'

beforeEach(() => { stubFetchAll(); window.location.hash = '#/' })
afterEach(() => { window.location.hash = '#/' })

test('every section chart exposes a table view', async () => {
  render(<App />)
  await waitFor(() => expect(screen.getAllByText('Lihat sebagai tabel').length).toBeGreaterThanOrEqual(3))
})

test('nav route links are valid', async () => {
  render(<App />)
  await waitFor(() => expect(screen.getByRole('link', { name: /Prediksi Model/i })).toBeInTheDocument())
  document.querySelectorAll('header nav a[href^="#/"]').forEach((a) => {
    expect(['#/', '#/prediksi']).toContain(a.getAttribute('href'))
  })
})

test('chart frames expose role=img with a label', async () => {
  render(<App />)
  await waitFor(() => expect(document.querySelectorAll('div[role="img"]').length).toBeGreaterThanOrEqual(3))
  document.querySelectorAll('div[role="img"]').forEach((el) => expect(el).toHaveAttribute('aria-label'))
})
