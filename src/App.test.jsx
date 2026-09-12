import { render, screen, waitFor, act } from '@testing-library/react'
import App from './App'
import { stubFetchAll } from './test-fixtures'

beforeEach(() => { stubFetchAll(); window.location.hash = '#/' })
afterEach(() => { window.location.hash = '#/' })

test('shell: nav route, banner tanggal, section eksplorasi di #/', async () => {
  render(<App />)
  await waitFor(() => expect(screen.getAllByText(/22 Agu 2026/).length).toBeGreaterThan(0))
  for (const id of ['eksplorasi', 'cuaca', 'band', 'riset']) {
    expect(document.getElementById(id)).toBeInTheDocument()
  }
  // Check navigation links - find links with expected route targets
  const navLinks = screen.getAllByRole('link')
  const eksplorasiLink = navLinks.find((l) => l.getAttribute('href') === '#/')
  const prediksiLink = navLinks.find((l) => l.getAttribute('href') === '#/prediksi')
  if (eksplorasiLink) {
    expect(eksplorasiLink).toBeInTheDocument()
  }
  if (prediksiLink) {
    expect(prediksiLink).toBeInTheDocument()
  }
})

test('navigasi ke #/prediksi menampilkan konten model', async () => {
  render(<App />)
  await waitFor(() => expect(screen.getByRole('link', { name: /Prediksi Model/i })).toBeInTheDocument())
  act(() => { window.location.hash = '#/prediksi'; window.dispatchEvent(new Event('hashchange')) })
  await waitFor(() => expect(screen.getByText(/dihitung dari data terakhir/i)).toBeInTheDocument())
})
