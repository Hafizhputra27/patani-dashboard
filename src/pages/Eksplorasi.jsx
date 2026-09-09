import OverviewMetricCards from '../components/OverviewMetricCards'
import MarketListWidget from '../components/MarketListWidget'
import PrediksiHorizonWidget from '../components/PrediksiHorizonWidget'
import Hero from '../sections/Hero'
import EksplorasiHarga from '../sections/EksplorasiHarga'
import CuacaKurs from '../sections/CuacaKurs'
import RekomendasiBand from '../sections/RekomendasiBand'
import RingkasanRiset from '../sections/RingkasanRiset'

export default function Eksplorasi() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Top Overview Pastel Cards */}
      <OverviewMetricCards />

      {/* Main Grid: Sidebar Widgets + Main Visualizations */}
      <div className="dashboard-columns-grid">
        {/* Left Column: Market List & Recommendations */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <MarketListWidget />
          <section id="band"><RekomendasiBand /></section>
        </div>

        {/* Right Column: Hero Chart, Forecast Feature, Detail Exploration */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="card">
            <Hero />
          </div>

          {/* Quick Forecast for 3-Day & 7-Day Chili / Commodity */}
          <PrediksiHorizonWidget />

          <section id="eksplorasi" className="card"><EksplorasiHarga /></section>
          <section id="cuaca" className="card"><CuacaKurs /></section>
          <section id="riset" className="card"><RingkasanRiset /></section>
        </div>
      </div>
    </div>
  )
}
