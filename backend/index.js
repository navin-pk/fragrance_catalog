import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from './db.js'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const JWT_SECRET = process.env.JWT_SECRET

// auth
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]
  if (!token) return res.json({ error: 'Access denied' })
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.json({ error: 'Invalid token' })
    req.user = user
    next()
  })
}

// signup
app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // insert statement
    const { rows } = await pool.query(
      'INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING user_id, username, email',
      [username, email, hashedPassword]
    )
    
    const user = rows[0]
    const token = jwt.sign({ userId: user.user_id, username: user.username }, JWT_SECRET)
    
    res.json({ token, user: { id: user.user_id, username: user.username, email: user.email } })
  } 
  catch (err) {
    res.json({ error: 'Could not create account' })
  }
})

// login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body
    
    // check username
    const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username])
    if (rows.length === 0) return res.json({ error: 'User does not exist' })
    
    // check password
    const user = rows[0]
    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) return res.json({ error: 'Invalid password' })
    
    const token = jwt.sign({ userId: user.user_id, username: user.username }, JWT_SECRET)
    res.json({ token, user: { id: user.user_id, username: user.username, email: user.email } })
  } 
  catch (err) {
    res.json({ error: 'Server error' })
  }
})

// get all notes
app.get('/api/notes', async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT DISTINCT note_name, type FROM notes ORDER BY type, note_name`
    )
    res.json(rows)
  } 
  catch (err) {
    console.error('Error:', err.message)
    res.json({ error: err.message })
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
      base += ` ORDER BY price ASC, f.frag_name ASC`
    } 
    else if (sort === 'price_desc') {
      base += ` ORDER BY price DESC, f.frag_name ASC`
    } 
    else if (sort === 'rating') {
      base += ` ORDER BY rating DESC, f.frag_name ASC`
    } 
    else if (sort === 'name_asc') {
      base += ` ORDER BY f.frag_name ASC`
    } 
    else if (sort === 'name_desc') {
      base += ` ORDER BY f.frag_name DESC`
    } 
    else {
      base += ` ORDER BY popularity DESC, f.frag_name ASC`
    }
    
    const { rows } = await pool.query(base, params)
    res.json(rows)
  } 
  // errors
  catch (err) {
    console.error('Error:', err.message)
    res.json({ error: err.message })
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

    if (!frows.length) return res.json({ error: 'not found' })
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
      `SELECT review_id AS id, user_id, rating, review_text AS text, reviewer_name, created_at 
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
    res.json({ error: 'server error' })
  }
})

// reviews
app.post('/api/reviews', authenticateToken, async (req, res) => {
  try {
    const { fragrance_id, rating, text } = req.body
    const userId = req.user.userId
    const username = req.user.username
    
    const { rows } = await pool.query(
      'INSERT INTO reviews(frag_id, user_id, rating, review_text, reviewer_name, created_at) VALUES($1,$2,$3,$4,$5,now()) RETURNING *',
      [fragrance_id, userId, rating, text || null, username]
    )
    res.json(rows[0])
  } 
  // error
  catch (err) {
    console.error(err)
    res.json({ error: 'server error' })
  }
})

// edit review
app.put('/api/reviews/:id', authenticateToken, async (req, res) => {
  try {
    const reviewId = req.params.id
    const { rating, text } = req.body
    const userId = req.user.userId
    
    // verify user owns this review
    const { rows: checkRows } = await pool.query(
      'SELECT user_id FROM reviews WHERE review_id = $1',
      [reviewId]
    )
    
    if (checkRows.length === 0) {
      return res.json({ error: 'Review not found' })
    }
    
    if (checkRows[0].user_id !== userId) {
      return res.json({ error: 'Not authorized to edit this review' })
    }
    
    // update the review
    const { rows } = await pool.query(
      'UPDATE reviews SET rating = $1, review_text = $2 WHERE review_id = $3 RETURNING *',
      [rating, text || null, reviewId]
    )
    
    res.json(rows[0])
  } 
  catch (err) {
    console.error(err)
    res.json({ error: 'server error' })
  }
})

// add fragrance
app.post('/api/fragrances', authenticateToken, async (req, res) => {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    
    const { name, house, release_date, description, price, size, notes } = req.body
    
    // house input
    let houseId = null
    if (house) {
      const { rows: houseRows } = await client.query(
        'SELECT house_id FROM houses WHERE house_name = $1',
        [house]
      )
      
      if (houseRows.length > 0) {
        houseId = houseRows[0].house_id
      } 
      else {
        const { rows: newHouse } = await client.query(
          'INSERT INTO houses(house_name, country, founded) VALUES($1, $2, $3) RETURNING house_id',
          [house, 'Unknown', 2000]
        )
        houseId = newHouse[0].house_id
      }
    }
    
    // insert fragrance
    const { rows } = await client.query(
      'INSERT INTO fragrances(frag_name, house_id, release_date, description) VALUES($1, $2, $3, $4) RETURNING frag_id',
      [name, houseId, release_date || new Date(), description || null]
    )
    
    const fragId = rows[0].frag_id

    if (price && size) {
      // size input
      const { rows: detailsRows } = await client.query(
        'INSERT INTO details(frag_id, concentration, size, sillage, gender) VALUES($1, $2, $3, $4, $5) RETURNING details_id',
        [fragId, 'EDP', size, 'Moderate', 'Unisex']
      )
      
      const detailsId = detailsRows[0].details_id
      
      // price input
      await client.query(
        'INSERT INTO prices(details_id, amount, currency) VALUES($1, $2, $3)',
        [detailsId, price, 'USD']
      )
    }

    if (notes && notes.length > 0) {
      for (const noteName of notes) {
        // notes input
        const { rows: noteRows } = await client.query(
          'SELECT note_id FROM notes WHERE note_name = $1',
          [noteName]
        )
        
        if (noteRows.length > 0) {
          const noteId = noteRows[0].note_id
          await client.query(
            'INSERT INTO fragrance_notes(frag_id, note_id) VALUES($1, $2)',
            [fragId, noteId]
          )
        }
      }
    }
    
    await client.query('COMMIT')
    res.json({ id: fragId, message: 'Fragrance added successfully' })
  } 
  catch (err) {
    await client.query('ROLLBACK')
    console.error(err)
    res.json({ error: 'Failed to add fragrance' })
  } 
  finally {
    client.release()
  }
})

// delete fragrance
app.delete('/api/fragrances/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id
    await pool.query('DELETE FROM fragrances WHERE frag_id = $1', [id])
    res.json({ message: 'Fragrance deleted successfully' })
  } 
  catch (err) {
    console.error(err)
    res.json({ error: 'Failed to delete fragrance' })
  }
})

// update price
app.put('/api/prices/:id', authenticateToken, async (req, res) => {
  try {
    const priceId = req.params.id
    const { amount } = req.body
    
    if (!amount || amount <= 0) {
      return res.json({ error: 'Valid price amount is required' })
    }
    
    const { rows } = await pool.query(
      'UPDATE prices SET amount = $1 WHERE price_id = $2 RETURNING *',
      [amount, priceId]
    )
    
    if (rows.length === 0) {
      return res.json({ error: 'Price not found' })
    }
    
    res.json(rows[0])
  } 
  catch (err) {
    console.error(err)
    res.json({ error: 'Failed to update price' })
  }
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})