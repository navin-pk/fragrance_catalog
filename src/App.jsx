import { useState } from 'react'
import Catalog from './components/Catalog'
import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1>Fragrance Catalog</h1>
      </header>
      <main className="app-main">
        <Catalog />
      </main>
    </div>
  )
}

export default App
