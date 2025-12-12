import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres@localhost:5433/fragrances_db'

let currentPool = new Pool({
  connectionString,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

const delegator = {
  query: async (...args) => {
    return currentPool.query(...args)
  }
}

currentPool.connect().then((client) => {
  console.log('✓ Database connected successfully')
  client.release()
}).catch((err) => {
  console.warn('DB connection failed, using mock pool:', err.message)
  currentPool = {
    query: async () => ({ rows: [], rowCount: 0 })
  }
})

export default delegator
