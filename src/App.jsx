import { useState, useEffect } from 'react'
import Catalog from './components/Catalog'
import Auth from './components/Auth'
import './App.css'

function App() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    // Check if user is already logged in
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogin = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    setShowAuth(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setToken(null)
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Fragrance Catalog</h1>
        <div className="auth-buttons">
          {user ? (
            <>
              <span className="welcome">Welcome, {user.username}!</span>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </>
          ) : (
            <button onClick={() => setShowAuth(true)} className="login-btn">Login / Sign Up</button>
          )}
        </div>
      </header>
      <main className="app-main">
        <Catalog user={user} token={token} />
      </main>
      {showAuth && <Auth onLogin={handleLogin} onClose={() => setShowAuth(false)} />}
    </div>
  )
}

export default App
