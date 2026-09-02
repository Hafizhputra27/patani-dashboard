import { render, screen } from '@testing-library/react'
import ChartFrame from './ChartFrame'

test('ChartFrame renders figure, caption, and a table view', () => {
  render(
    <ChartFrame judul="Uji" caption="unit rupiah" tabel={{ kolom: ['Tanggal', 'Harga'], baris: [['1 Jan', 1000]] }}>
      <div>chart</div>
    </ChartFrame>,
  )
  expect(screen.getByRole('figure')).toBeInTheDocument()
  expect(screen.getByText('unit rupiah')).toBeInTheDocument()
  expect(screen.getByText('Lihat sebagai tabel')).toBeInTheDocument()
  expect(screen.getByRole('columnheader', { name: 'Harga' })).toBeInTheDocument()
  expect(screen.getByRole('cell', { name: '1.000' })).toBeInTheDocument()
})
