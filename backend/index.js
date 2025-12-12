import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './db.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

// get all notes
app.get('/api/notes', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT note_name, type FROM notes ORDER BY type, note_name`
    )
    res.json(rows)
  } catch (err) {
    console.error('Error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// fragrance list
app.get('/api/fragrances', async (req, res) => {
  try {
    const { search, sort, notes } = req.query
    let base = 
      `SELECT f.frag_id AS id, 
              f.frag_name AS name, 
              h.house_name AS house,
              ROUND(AVG(r.rating), 2) AS rating,
              COUNT(r.review_id) AS popularity,
              MIN(pr.amount) AS price
      FROM fragrances f
      LEFT JOIN houses h ON f.house_id = h.house_id
      LEFT JOIN reviews r ON f.frag_id = r.frag_id
      LEFT JOIN details d ON f.frag_id = d.frag_id
      LEFT JOIN prices pr ON d.details_id = pr.details_id`

    // search & filter
    const params = []
    const conditions = []
  
    if (search) {
      conditions.push(`(f.frag_name ILIKE $${params.length + 1} OR h.house_name ILIKE $${params.length + 1})`)
      params.push(`%${search}%`)
    }

    // filter by notes
    if (notes) {
      const noteList = Array.isArray(notes) ? notes : [notes]
      base += ` JOIN fragrance_notes fn ON f.frag_id = fn.frag_id
                JOIN notes n ON fn.note_id = n.note_id`
      conditions.push(`n.note_name = ANY($${params.length + 1})`)
      params.push(noteList)
    }

    if (conditions.length > 0) {
      base += ` WHERE ` + conditions.join(' AND ')
    }

    base += ` GROUP BY f.frag_id, f.frag_name, h.house_name`
    
    // sorting
    if (sort === 'price_asc') {
      base += ` ORDER BY price ASC`
    } 
    else if (sort === 'price_desc') {
      base += ` ORDER BY price DESC`
    } 
    else if (sort === 'rating') {
      base += ` ORDER BY rating DESC`
    } 
    else if (sort === 'name_asc') {
      base += ` ORDER BY f.frag_name ASC`
    } 
    else if (sort === 'name_desc') {
      base += ` ORDER BY f.frag_name DESC`
    } 
    else {
      base += ` ORDER BY popularity DESC`
    }
    
    const { rows } = await pool.query(base, params)
    res.json(rows)
  } 
  // errors
  catch (err) {
    console.error('Error:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// fragrance details
app.get('/api/fragrances/:id', async (req, res) => {
  try {
    // fragrance info
    const id = req.params.id
    const { rows: frows } = await pool.query(
      `SELECT f.frag_id AS id, 
              f.frag_name AS name, 
              f.description, 
              f.release_date, 
              h.house_name AS house,
              ROUND(AVG(r.rating), 2) AS rating,
              COUNT(r.review_id) AS popularity
      FROM fragrances f 
      LEFT JOIN houses h ON f.house_id = h.house_id
      LEFT JOIN reviews r ON f.frag_id = r.frag_id
      WHERE f.frag_id = $1
      GROUP BY f.frag_id, f.frag_name, f.description, f.release_date, h.house_name`,
      [id]
    )

    if (!frows.length) return res.status(404).json({ error: 'not found' })
    const f = frows[0]

    // notes
    const notesQ = await pool.query(
      `SELECT n.note_name, n.type 
      FROM notes n 
      JOIN fragrance_notes fn ON n.note_id = fn.note_id 
      WHERE fn.frag_id = $1`,
      [id]
    )

    // perfumers
    const perfumersQ = await pool.query(
      `SELECT p.perfumer_id, p.first_name, p.last_name 
      FROM perfumers p 
      JOIN fragrance_perfumers fp ON p.perfumer_id = fp.perfumer_id 
      WHERE fp.frag_id = $1`,
      [id]
    )

    // prices
    const pricesQ = await pool.query(
      `SELECT pr.price_id, pr.amount, pr.currency, r.retail_name, d.size 
      FROM prices pr
      JOIN details d ON pr.details_id = d.details_id
      LEFT JOIN retailers r ON pr.retail_id = r.retail_id
      WHERE d.frag_id = $1`,
      [id]
    )

    // reviews
    const reviewsQ = await pool.query(
      `SELECT review_id AS id, rating, review_text AS text, reviewer_name, created_at 
      FROM reviews 
      WHERE frag_id = $1 
      ORDER BY created_at DESC`,
      [id]
    )

    const perfumer = perfumersQ.rows.length ? `${perfumersQ.rows[0].first_name} ${perfumersQ.rows[0].last_name}` : null

    res.json({
      fragrance: { id: f.id, name: f.name, house: f.house, perfumer, price: pricesQ.rows.length ? pricesQ.rows[0].amount : null, popularity: f.popularity, rating: f.rating, description: f.description, release_date: f.release_date },
      notes: notesQ.rows,
      reviews: reviewsQ.rows,
      perfumers: perfumersQ.rows,
      prices: pricesQ.rows
    })
  }
  // error 
  catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

// reviews
app.post('/api/reviews', async (req, res) => {
  try {
    const { fragrance_id, rating, text, reviewer_name } = req.body
    const { rows } = await pool.query(
      'INSERT INTO reviews(frag_id, rating, review_text, reviewer_name, created_at) VALUES($1,$2,$3,$4,now()) RETURNING *',
      [fragrance_id, rating, text || null, reviewer_name || 'Anonymous']
    )
    res.status(201).json(rows[0])
  } 
  // error
  catch (err) {
    console.error(err)
    res.status(500).json({ error: 'server error' })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})