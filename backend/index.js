import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './db.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 8000

// List fragrances with optional search and sort
app.get('/api/fragrances', async (req, res) => {
  try {
    const { search, sort, limit = 50, offset = 0 } = req.query
    // Simplified query: just return basic fragrance data
    let base = `SELECT f.frag_id AS id, f.frag_name AS name, h.house_name AS house,
      COALESCE((SELECT ROUND(AVG(r.rating)::numeric,2) FROM reviews r WHERE r.frag_id = f.frag_id), 0) AS rating,
      COALESCE((SELECT COUNT(*) FROM reviews r WHERE r.frag_id = f.frag_id), 0) AS popularity,
      NULL AS perfumer,
      NULL AS price
      FROM fragrances f
      LEFT JOIN houses h ON f.house_id = h.house_id`

    const clauses = []
    const params = []
    if (search) {
      params.push(`%${search}%`)
      clauses.push(`(f.frag_name ILIKE $${params.length} OR h.house_name ILIKE $${params.length})`)
    }
    if (clauses.length) base += ` WHERE ` + clauses.join(' AND ')
    if (sort === 'price_asc') base += ` ORDER BY f.frag_id ASC`
    else if (sort === 'price_desc') base += ` ORDER BY f.frag_id DESC`
    else if (sort === 'rating') base += ` ORDER BY rating DESC`
    else base += ` ORDER BY popularity DESC`
    params.push(parseInt(limit, 10))
    params.push(parseInt(offset, 10))
    base += ` LIMIT $${params.length - 1} OFFSET $${params.length}`
    const { rows } = await pool.query(base, params)
    res.json(rows)
  } catch (err) {
    console.error('Error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Get fragrance details
app.get('/api/fragrances/:id', async (req, res) => {
  try {
    const id = req.params.id
    const { rows: frows } = await pool.query(
      `SELECT f.frag_id AS id, f.frag_name AS name, f.description, f.release_date, h.house_name AS house,
        (SELECT ROUND(AVG(r.rating)::numeric,2) FROM reviews r WHERE r.frag_id = f.frag_id) AS rating,
        (SELECT COUNT(*) FROM reviews r WHERE r.frag_id = f.frag_id) AS popularity
       FROM fragrances f LEFT JOIN houses h ON f.house_id = h.house_id WHERE f.frag_id = $1`,
      [id]
    )
    if (!frows.length) return res.status(404).json({ error: 'not found' })
    const f = frows[0]

    const notesQ = await pool.query(
      `SELECT n.note_name, n.type FROM notes n JOIN fragrance_notes fn ON n.note_id = fn.note_id WHERE fn.frag_id = $1`,
      [id]
    )

    const perfumersQ = await pool.query(
      `SELECT p.perfumer_id, p.first_name, p.last_name FROM perfumers p JOIN fragrance_perfumers fp ON p.perfumer_id = fp.perfumer_id WHERE fp.frag_id = $1`,
      [id]
    )

    const pricesQ = await pool.query(
      `SELECT pr.price_id, pr.amount, pr.currency, r.retail_name FROM prices pr
       JOIN details d ON pr.details_id = d.details_id
       LEFT JOIN retailers r ON pr.retail_id = r.retail_id
       WHERE d.frag_id = $1`,
      [id]
    )

    const reviewsQ = await pool.query(
      `SELECT review_id AS id, rating, review_text AS text, reviewer_name, created_at FROM reviews WHERE frag_id = $1 ORDER BY created_at DESC`,
      [id]
    )

    // Map perfumer to a single string for frontend compatibility
    const perfumer = perfumersQ.rows.length ? `${perfumersQ.rows[0].first_name} ${perfumersQ.rows[0].last_name}` : null

    res.json({
      fragrance: { id: f.id, name: f.name, house: f.house, perfumer, price: pricesQ.rows.length ? pricesQ.rows[0].amount : null, popularity: f.popularity, rating: f.rating, description: f.description, release_date: f.release_date },
      notes: notesQ.rows,
      reviews: reviewsQ.rows,
      perfumers: perfumersQ.rows,
      prices: pricesQ.rows
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

// Submit review
app.post('/api/reviews', async (req, res) => {
  try {
    const { fragrance_id, rating, text, reviewer_name } = req.body
    const { rows } = await pool.query(
      'INSERT INTO reviews(frag_id, rating, review_text, reviewer_name, created_at) VALUES($1,$2,$3,$4,now()) RETURNING *',
      [fragrance_id, rating, text || null, reviewer_name || 'Anonymous']
    )
    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

// Proxy to Python trends service
app.get('/api/trends', async (req, res) => {
  try {
    const trendsUrl = process.env.TRENDS_URL || 'http://localhost:8001/trends'
    const response = await fetch(trendsUrl)
    const data = await response.json()
    res.json(data)
  } catch (err) {
    console.error('trend proxy error', err)
    res.status(502).json({ error: 'trends service unavailable' })
  }
})

app.listen(PORT, () => {
  console.log(`Backend listening on ${PORT}`)
})
