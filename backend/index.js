const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  host: process.env.PGHOST || 'db',
  user: process.env.PGUSER || 'fragrance_user',
  password: process.env.PGPASSWORD || 'fragrance_pass',
  database: process.env.PGDATABASE || 'fragrance_db',
  port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
});

app.get('/api/fragrances', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM fragrances ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'DB query failed' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Connected to Postgres');
  } catch (err) {
    console.error('Unable to connect to DB on startup', err);
  }
  console.log(`Server listening on ${PORT}`);
});
