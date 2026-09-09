import { useData } from '../store/DataContext'
import { useFilter } from '../store/FilterContext'

const rp = (v) => (v == null ? '—' : 'Rp ' + Math.round(v).toLocaleString('id-ID'))

export default function MarketListWidget() {
  const { data: harga } = useData('harga.json')
  const { data: meta } = useData('meta.json')
  const { komoditas, pasar, setPasar } = useFilter()

  if (!harga || !meta) return null

  const perPasar = harga.komoditas[komoditas] || {}

  return (
    <div className="card market-list-widget">
      <div className="card__header">
        <div>
          <h3 className="card__title">Harga di 9 Pasar</h3>
          <p className="card__subtitle">{komoditas}</p>
        </div>
        <button
          type="button"
          className={`pill-btn ${pasar === '__semua__' ? 'pill-btn--active' : ''}`}
          onClick={() => setPasar('__semua__')}
          title="Tampilkan rentang semua pasar"
        >
          Semua Pasar
        </button>
      </div>

      <div className="market-list">
        {meta.pasar.map((namaPasar, idx) => {
          const arr = perPasar[namaPasar] || []
          let latestPrice = null
          for (let i = arr.length - 1; i >= 0; i--) {
            if (arr[i] != null) { latestPrice = arr[i]; break }
          }
          const isSelected = pasar === namaPasar

          return (
            <div
              key={namaPasar}
              className={`market-item ${isSelected ? 'market-item--selected' : ''}`}
              onClick={() => setPasar(namaPasar)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter') setPasar(namaPasar) }}
            >
              <div className="market-item__avatar">
                <span>{idx + 1}</span>
              </div>
              <div className="market-item__info">
                <div className="market-item__name">{namaPasar}</div>
                <div className="market-item__status">
                  {latestPrice != null ? '● Laporan aktif' : '○ Data kosong'}
                </div>
              </div>
              <div className="market-item__price mono">
                <strong>{rp(latestPrice)}</strong>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
