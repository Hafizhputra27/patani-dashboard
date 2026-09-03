import { render, screen, act } from '@testing-library/react'
import { parseHash, useRoute, Route, RouteLink } from './router'

test('parseHash normalizes path and reads query', () => {
  expect(parseHash('#/').path).toBe('/')
  expect(parseHash('').path).toBe('/')
  expect(parseHash('#/prediksi/').path).toBe('/prediksi')
  const { path, query } = parseHash('#/prediksi?k=CABE%20MERAH&r=1thn')
  expect(path).toBe('/prediksi')
  expect(query.get('k')).toBe('CABE MERAH')
  expect(query.get('r')).toBe('1thn')
})

function Probe() {
  const { path, navigate } = useRoute()
  return <button onClick={() => navigate('/prediksi')}>{path}</button>
}

test('useRoute tracks hash and navigate updates it', () => {
  window.location.hash = '#/'
  render(<Probe />)
  const b = screen.getByRole('button')
  expect(b).toHaveTextContent('/')
  act(() => b.click())
  expect(b).toHaveTextContent('/prediksi')
  expect(window.location.hash).toBe('#/prediksi')
})

test('Route renders only on match; RouteLink marks current', () => {
  window.location.hash = '#/prediksi'
  render(
    <>
      <Route path="/"><span>home</span></Route>
      <Route path="/prediksi"><span>pred</span></Route>
      <RouteLink to="/prediksi">link</RouteLink>
    </>,
  )
  expect(screen.queryByText('home')).toBeNull()
  expect(screen.getByText('pred')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'link' })).toHaveAttribute('aria-current', 'page')
})
