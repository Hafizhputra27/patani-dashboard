import MarketListWidget from '../components/MarketListWidget'
import EksplorasiHarga from '../sections/EksplorasiHarga'

export default function Eksplorasi() {
  return (
    <div className="dashboard-columns-grid">
      <MarketListWidget />
      <div className="card"><EksplorasiHarga /></div>
    </div>
  )
}