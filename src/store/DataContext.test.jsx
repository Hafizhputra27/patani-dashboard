import { render, screen, waitFor } from '@testing-library/react'
import { DataProvider, useData } from './DataContext'

function Probe({ file }) {
  const { data, loading } = useData(file)
  return <div>{loading ? 'loading' : JSON.stringify(data)}</div>
}

test('fetches once and caches', async () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ a: 1 }) })
  vi.stubGlobal('fetch', fetchMock)
  const { rerender } = render(<DataProvider><Probe file="x.json" /></DataProvider>)
  await waitFor(() => expect(screen.getByText('{"a":1}')).toBeInTheDocument())
  rerender(<DataProvider><Probe file="x.json" /><Probe file="x.json" /></DataProvider>)
  await waitFor(() => expect(screen.getAllByText('{"a":1}').length).toBe(2))
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('/data/x.json'))
})
