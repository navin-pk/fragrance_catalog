import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/fragrances_db'

let currentPool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

// Delegator exported to other modules. Its `query` always forwards to
// `currentPool`, which we can replace with a mock if the DB is unreachable.
const delegator = {
  query: async (...args) => {
    return currentPool.query(...args)
  }
}

// Try a quick connect; if it fails, replace currentPool with a mock implementation.
currentPool.connect().then((client) => {
  client.release()
}).catch((err) => {
  console.warn('DB connection failed, using mock pool:', err.message)
  currentPool = {
    query: async () => ({ rows: [], rowCount: 0 })
  }
})

export default delegator
