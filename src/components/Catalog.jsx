import { useEffect, useState } from 'react'
import API from '../api'
import './catalog.css'

export default function Catalog(){
  const [fragrances, setFragrances] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('popularity')
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => { fetchFragrances() }, [search, sort])

  async function fetchFragrances(){
    try {
      setLoading(true)
      setError(null)
      const res = await API.get('/api/fragrances', {
        params: { search: search || undefined, sort: sort || undefined }
      })
      setFragrances(res.data || [])
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to load fragrances')
      setFragrances([])
    } finally {
      setLoading(false)
    }
  }

  async function loadDetails(fragId){
    try {
      const res = await API.get(`/api/fragrances/${fragId}`)
      setSelectedId({ ...res.data, id: fragId })
    } catch (err) {
      console.error('Error:', err)
    }
  }

  if (selectedId) {
    return <DetailView frag={selectedId.fragrance} onBack={() => setSelectedId(null)} />
  }

  return (
    <div className="catalog">
      <div className="controls">
        <input
          type="text"
          placeholder="Search fragrances..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="sort-select">
          <option value="popularity">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>

      {loading && <p className="status">Loading fragrances…</p>}
      {error && <p className="error">{error}</p>}

      <div className="grid">
        {fragrances.map(f => (
          <div
            key={f.id}
            className="card"
            onClick={() => loadDetails(f.id)}
            style={{ cursor: 'pointer' }}
          >
            <h3>{f.name}</h3>
            <p className="house">{f.house}</p>
            {f.perfumer && <p className="perfumer">{f.perfumer}</p>}
            <div className="footer">
              <span className="rating">⭐ {f.rating ?? '—'}</span>
              <span className="price">${f.price ?? '—'}</span>
            </div>
          </div>
        ))}
      </div>

      {fragrances.length === 0 && !loading && <p className="empty">No fragrances found.</p>}
    </div>
  )
}

function DetailView({ frag, onBack }){
  return (
    <div className="detail">
      <button onClick={onBack} className="back-btn">← Back</button>
      <h2>{frag.name}</h2>
      <p className="house">{frag.house}</p>
      {frag.description && <p>{frag.description}</p>}
      <div className="info">
        <div><strong>Rating:</strong> {frag.rating ?? '—'}</div>
        <div><strong>Reviews:</strong> {frag.popularity ?? 0}</div>
        <div><strong>Price:</strong> ${frag.price ?? '—'}</div>
      </div>
    </div>
  )
}
