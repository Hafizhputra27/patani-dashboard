import { render, screen, act } from '@testing-library/react'
import { vi } from 'vitest'
import { useToday, hariIniISO } from './today'

function Probe() {
  const d = useToday(1000)
  return <span>{hariIniISO(d)}</span>
}

test('useToday mengikuti waktu sistem dan update tiap interval', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-09-06T10:00:00'))
  render(<Probe />)
  expect(screen.getByText('2026-09-06')).toBeInTheDocument()
  act(() => { vi.setSystemTime(new Date('2026-09-07T10:00:00')); vi.advanceTimersByTime(1000) })
  expect(screen.getByText('2026-09-07')).toBeInTheDocument()
})

test('hariIniISO memformat lokal', () => {
  expect(hariIniISO(new Date('2026-03-09T23:30:00'))).toBe('2026-03-09')
})
