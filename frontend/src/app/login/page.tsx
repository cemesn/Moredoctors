"use client"
import { useState } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('paciente@demo.com')
  const [password, setPassword] = useState('Demo123!')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro de login')
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.location.href = '/dashboard'
    } catch (e: any) {
      setError(e.message)
    } finally { setLoading(false) }
  }

  return (
    <main style={{ padding: 24, maxWidth: 420, margin: '0 auto' }}>
      <h1>Entrar</h1>
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          Email
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required style={{ width: '100%', padding: 8 }} />
        </label>
        <label>
          Senha
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required style={{ width: '100%', padding: 8 }} />
        </label>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <button disabled={loading} type="submit" style={{ background: '#0ea5e9', color: 'white', padding: '10px 16px', borderRadius: 8 }}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <p style={{ fontSize: 12, color: '#666' }}>Demos: paciente@demo.com / medico@demo.com / admin@demo.com com senha Demo123!</p>
      </form>
    </main>
  )
}