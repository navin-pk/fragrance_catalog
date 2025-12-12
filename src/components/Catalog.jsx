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
  const [showAddForm, setShowAddForm] = useState(false)

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
      console.log('Fetching fragrances with params:', { search, sort, selectedNotes })
      const res = await API.get('/api/fragrances', {
        params: { 
          search: search || undefined, 
          sort: sort || undefined,
          notes: selectedNotes.length > 0 ? selectedNotes : undefined
        }
      })
      console.log('Received fragrances:', res.data?.length, 'items')
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

  async function handleAddFragrance(formData){
    try {
      setError(null)
      const response = await API.post('/api/fragrances', formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      setShowAddForm(false)
      setSearch('')
      setSelectedNotes([])

      await fetchFragrances()
    } 
    catch (err) {
      console.error('Error adding fragrance:', err)
    }
  }

  async function handleDeleteFragrance(fragId){
    if (!window.confirm('Are you sure you want to delete this fragrance?')) return
    
    try {
      setError(null)
      await API.delete(`/api/fragrances/${fragId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      fetchFragrances()
    } 
    catch (err) {
      console.error('Error deleting fragrance:', err)
      setError(err.response?.data?.error || 'Failed to delete fragrance')
    }
  }

  if (selectedId) {
    return <DetailView data={selectedId} onBack={() => setSelectedId(null)} user={user} token={token} onReviewAdded={loadDetails} onDelete={handleDeleteFragrance} />
  }

  if (showAddForm) {
    return <AddFragranceForm onSubmit={handleAddFragrance} onCancel={() => setShowAddForm(false)} />
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
        {/* add fragrance button */}
        {user && (
          <button onClick={() => setShowAddForm(true)} className="add-btn">
            + Add Fragrance
          </button>
        )}
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
function DetailView({ data, onBack, user, token, onReviewAdded, onDelete }){
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
      
      setRating(5)
      setReviewText('')
      
      await onReviewAdded(frag.id)
    } 
    catch (err) {
      console.error('Error submitting review:', err)
      setError(err.response?.data?.error || 'Failed to submit review')
    } 
    finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    await onDelete(frag.id)
    onBack()
  }
  
  return (
    <div className="detail">
      <div className="detail-header">
        <button onClick={onBack} className="back-btn">← Back</button>
        {user && (
          <button onClick={handleDelete} className="delete-btn">Delete</button>
        )}
      </div>
      <h2>{frag.name}</h2>
      {frag.house && <p className="house">{frag.house}</p>}
      
      {frag.perfumer && <p className="perfumer"><strong>Perfumer:</strong> {frag.perfumer}</p>}
      
      {frag.description && <p className="description">{frag.description}</p>}
      
      <div className="info">
        <div><strong>Rating:</strong> ★  {frag.rating ?? '—'}</div>
        <div><strong>Reviews:</strong> {frag.popularity ?? 0}</div>
        {frag.price && <div><strong>Price:</strong> ${frag.price}</div>}
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

// add fragrance form
function AddFragranceForm({ onSubmit, onCancel }){
  const [name, setName] = useState('')
  const [house, setHouse] = useState('')
  const [releaseDate, setReleaseDate] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [size, setSize] = useState('100ml')
  const [selectedNotes, setSelectedNotes] = useState({ top: [], middle: [], base: [] })
  const [allNotes, setAllNotes] = useState([])

  useEffect(() => {
    fetchNotes()
  }, [])

  async function fetchNotes() {
    try {
      const res = await API.get('/api/notes')
      setAllNotes(res.data || [])
    } catch (err) {
      console.error('Error loading notes:', err)
    }
  }

  const toggleNote = (noteName, type) => {
    setSelectedNotes(prev => ({
      ...prev,
      [type]: prev[type].includes(noteName)
        ? prev[type].filter(n => n !== noteName)
        : [...prev[type], noteName]
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Fragrance name is required')
      return
    }
    
    const notes = [
      ...selectedNotes.top,
      ...selectedNotes.middle,
      ...selectedNotes.base
    ]

    onSubmit({
      name,
      house: house || null,
      release_date: releaseDate || null,
      description: description || null,
      price: price ? parseFloat(price) : null,
      size: size || '100ml',
      notes: notes.length > 0 ? notes : null
    })
  }

  const notesByType = {
    Top: allNotes.filter(n => n.type === 'Top'),
    Middle: allNotes.filter(n => n.type === 'Middle'),
    Base: allNotes.filter(n => n.type === 'Base')
  }

  return (
    <div className="add-form">
      <h2>Add New Fragrance</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Fragrance Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter fragrance name"
            required
          />
        </div>
        
        <div className="form-group">
          <label>House/Brand</label>
          <input
            type="text"
            value={house}
            onChange={(e) => setHouse(e.target.value)}
            placeholder="Enter house or brand name"
          />
        </div>
        
        <div className="form-group">
          <label>Release Date</label>
          <input
            type="date"
            value={releaseDate}
            onChange={(e) => setReleaseDate(e.target.value)}
          />
        </div>
        
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter a description of the fragrance"
            rows="5"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Price (USD)</label>
            <input
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
            />
          </div>
          
          <div className="form-group">
            <label>Size</label>
            <select value={size} onChange={(e) => setSize(e.target.value)}>
              <option value="30ml">30ml</option>
              <option value="50ml">50ml</option>
              <option value="75ml">75ml</option>
              <option value="100ml">100ml</option>
              <option value="125ml">125ml</option>
              <option value="150ml">150ml</option>
            </select>
          </div>
        </div>

        <div className="form-group notes-selection">
          <label>Notes</label>
          {['Top', 'Middle', 'Base'].map(type => (
            <div key={type} className="note-type-section">
              <h4>{type} Notes</h4>
              <div className="checkbox-group">
                {notesByType[type]?.map(note => (
                  <label key={note.note_name} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedNotes[type.toLowerCase()].includes(note.note_name)}
                      onChange={() => toggleNote(note.note_name, type.toLowerCase())}
                    />
                    {note.note_name}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="form-actions">
          <button type="submit" className="submit-btn">Add Fragrance</button>
          <button type="button" onClick={onCancel} className="cancel-btn">Cancel</button>
        </div>
      </form>
    </div>
  )
}
