import { useState } from 'react'
import API from '../api'
import './Auth.css'

export default function Auth({ onLogin, onClose }) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const endpoint = isLogin ? '/api/login' : '/api/signup'
      const payload = isLogin ? { username, password } : { username, email, password }
      const response = await API.post(endpoint, payload)
      
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      onLogin(response.data.user, response.data.token)
    } catch (err) {
      setError('Error')
    }
  }

  return (
    <div className="auth-overlay" onClick={onClose}>
      <div className="auth-box">
        <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          {!isLogin && <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />}
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error && <p className="error">{error}</p>}
          <button type="submit">{isLogin ? 'Login' : 'Sign Up'}</button>
        </form>
        <p><a onClick={() => setIsLogin(!isLogin)}>{isLogin ? 'Sign Up' : 'Login'}</a></p>
      </div>
    </div>
  )
}
