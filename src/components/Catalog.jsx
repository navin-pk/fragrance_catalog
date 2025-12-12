import { useEffect, useState } from 'react'
import API from '../api'
import './catalog.css'

export default function Catalog({ user, token }){
  const [fragrances, setFragrances] = useState([])
  const [error, setError] = useState(null)
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('popularity')
  const [selectedId, setSelectedId] = useState(null)
  const [allNotes, setAllNotes] = useState([])
  const [selectedNotes, setSelectedNotes] = useState([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => { fetchNotes() }, [])
  useEffect(() => { fetchFragrances() }, [search, sort, selectedNotes])

  async function fetchNotes(){
    try {
      const res = await API.get('/api/notes')
      setAllNotes(res.data || [])
    } catch (err) {
      console.error('Error loading notes:', err)
    }
  }

  async function fetchFragrances(){
    try {
      setError(null)
      const res = await API.get('/api/fragrances', {
        params: { 
          search: search || undefined, 
          sort: sort || undefined,
          notes: selectedNotes.length > 0 ? selectedNotes : undefined
        }
      })
      setFragrances(res.data || [])
    } 
    catch (err) {
      console.error('Error:', err)
      setError('Failed to load fragrances')
      setFragrances([])
    } 
  }

  function toggleNote(noteName){
    setSelectedNotes(prev => 
      prev.includes(noteName) 
        ? prev.filter(n => n !== noteName)
        : [...prev, noteName]
    )
  }

  async function loadDetails(fragId){
    try {
      const res = await API.get(`/api/fragrances/${fragId}`)
      setSelectedId({ ...res.data, id: fragId })
    } 
    catch (err) {
      console.error('Error:', err)
    }
  }

  if (selectedId) {
    return <DetailView data={selectedId} onBack={() => setSelectedId(null)} user={user} token={token} onReviewAdded={loadDetails} />
  }

  // catalog view
  return (
    <div className="catalog">
      <div className="controls">
        {/* searching */}
        <input
          type="text"
          placeholder="Search fragrances..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
        {/* sorting */}
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="sort-select">
          <option value="popularity">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="name_asc">Name: A to Z</option>
          <option value="name_desc">Name: Z to A</option>
        </select>
        {/* filter button */}
        <button onClick={() => setShowFilters(!showFilters)} className="filter-btn">
          {showFilters ? 'Hide Filters' : 'Filter by Notes'} {selectedNotes.length > 0 && `(${selectedNotes.length})`}
        </button>
      </div>

      {/* note filters */}
      {showFilters && (
        <div className="filters">
          <div className="filter-header">
            <h4>Filter by Notes</h4>
            {selectedNotes.length > 0 && (
              <button onClick={() => setSelectedNotes([])} className="clear-btn">Clear All</button>
            )}
          </div>
          <div className="checkbox-group">
            {allNotes.map(note => (
              <label key={note.note_name} className="checkbox-label">
                <input
                  type="checkbox"
                  checked={selectedNotes.includes(note.note_name)}
                  onChange={() => toggleNote(note.note_name)}
                />
                {note.note_name}
              </label>
            ))}
          </div>
        </div>
      )}
      
      {error && <p className="error">{error}</p>}

      <div className="grid">
        {/* fragrances */}
        {fragrances.map(f => (
          <div key={f.id} className="card" onClick={() => loadDetails(f.id)} style={{ cursor: 'pointer' }}>
            <h3>{f.name}</h3>
            <p className="house">{f.house}</p>
            {f.perfumer && <p className="perfumer">{f.perfumer}</p>}
            <div className="footer">
              <span className="rating">★ {f.rating ?? '—'}</span>
              <span className="price">${f.price ?? '—'}</span>
            </div>
          </div>
        ))}
      </div>

      {fragrances.length === 0 && <p className="empty">No fragrances found.</p>}
    </div>
  )
}

// fragrance detail window
function DetailView({ data, onBack, user, token, onReviewAdded }){
  const { fragrance: frag, notes = [], perfumers = [], prices = [], reviews = [] } = data
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      await API.post('/api/reviews', 
        {
          fragrance_id: frag.id,
          rating,
          text: reviewText
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      // Clear form
      setRating(5)
      setReviewText('')
      
      // Reload details to show new review
      await onReviewAdded(frag.id)
    } catch (err) {
      console.error('Error submitting review:', err)
      setError(err.response?.data?.error || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }
  
  return (
    <div className="detail">
      <button onClick={onBack} className="back-btn">← Back</button>
      <h2>{frag.name}</h2>
      <p className="house">{frag.house}</p>
      
      {frag.perfumer && <p className="perfumer"><strong>Perfumer:</strong> {frag.perfumer}</p>}
      
      {frag.description && <p className="description">{frag.description}</p>}
      
      <div className="info">
        <div><strong>Rating:</strong> ⭐ {frag.rating ?? '—'}</div>
        <div><strong>Reviews:</strong> {frag.popularity ?? 0}</div>
        <div><strong>Price:</strong> ${frag.price ?? '—'}</div>
        {frag.release_date && <div><strong>Released:</strong> {new Date(frag.release_date).getFullYear()}</div>}
      </div>

      <div className="notes-section">
        <h3>Notes</h3>
        {notes.length > 0 ? (
          <div className="notes-grid">
            {['Top', 'Middle', 'Base'].map(type => {
              const typeNotes = notes.filter(n => n.type === type)
              if (typeNotes.length === 0) return null
              return (
                <div key={type} className="note-category">
                  <h4>{type} Notes</h4>
                  <ul>
                    {typeNotes.map((n, i) => <li key={i}>{n.note_name}</li>)}
                  </ul>
                </div>
              )
            })}
          </div>
        ) : (
          <p>No notes available</p>
        )}
      </div>

      {prices.length > 0 && (
        <div className="prices-section">
          <h3>Available Prices</h3>
          <ul>
            {prices.map(p => (
              <li key={p.price_id}>
                <strong>{p.size}</strong> - {p.retail_name ? `${p.retail_name}: ` : ''}
                {p.amount} {p.currency || 'USD'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {user && (
        <div className="review-form-section">
          <h3>Leave a Review</h3>
          <form onSubmit={handleSubmitReview} className="review-form">
            <div className="form-group">
              <label>Rating: {rating} ★</label>
              <input
                type="range"
                min="1"
                max="5"
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="rating-slider"
              />
            </div>
            <div className="form-group">
              <label>Your Review (optional)</label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your thoughts about this fragrance..."
                rows="4"
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button type="submit" disabled={submitting} className="submit-review-btn">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        </div>
      )}

      {reviews.length > 0 && (
        <div className="reviews-section">
          <h3>Reviews</h3>
          {reviews.map(r => (
            <div key={r.id} className="review">
              <div className="review-header">
                <strong>{r.reviewer_name}</strong>
                <span className="review-rating">★ {r.rating}</span>
              </div>
              {r.text && <p>{r.text}</p>}
              <small>{new Date(r.created_at).toLocaleDateString()}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
