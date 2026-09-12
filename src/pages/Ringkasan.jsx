import OverviewMetricCards from '../components/OverviewMetricCards'
import PrediksiHorizonWidget from '../components/PrediksiHorizonWidget'
import Hero from '../sections/Hero'

export default function Ringkasan() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <OverviewMetricCards />
      <div className="card"><Hero /></div>
      <PrediksiHorizonWidget />
    </div>
  )
}