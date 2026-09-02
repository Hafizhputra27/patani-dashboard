import { render } from '@testing-library/react'
import { ThemeProvider } from '../store/ThemeContext'
import PitaKetidakpastian from './PitaKetidakpastian'

test('renders median line and reference lines for Lebaran dates', () => {
  const data = [
    { t: '1 Jan', p10: 90, median: 100, p90: 115 },
    { t: '2 Jan', p10: 92, median: 101, p90: 130 },
  ]
  const { container } = render(
    <ThemeProvider><PitaKetidakpastian data={data} kondisi="normal" tinggi={200} lebaranX={['1 Jan']} /></ThemeProvider>,
  )
  expect(container.querySelectorAll('path.recharts-line-curve').length).toBeGreaterThanOrEqual(1)
  expect(container.querySelector('.recharts-reference-line')).toBeInTheDocument()
})
