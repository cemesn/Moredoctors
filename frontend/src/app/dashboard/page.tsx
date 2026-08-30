"use client"
import { useEffect, useState } from 'react'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  useEffect(() => {
    const u = localStorage.getItem('user')
    if (u) setUser(JSON.parse(u))
  }, [])

  if (!user) return <main style={{ padding: 24 }}><a href="/login">Login</a></main>

  return (
    <main style={{ padding: 24 }}>
      <h1>Olá, {user.name}</h1>
      {user.role === 'patient' && (
        <div style={{ display: 'grid', gap: 8 }}>
          <a href="/triage">Fazer Triagem</a>
          <a href="/buscar-medicos">Buscar Médicos</a>
          <a href="/farmacia">Farmácia</a>
          <a href="/exames">Exames</a>
          <a href="/emergencia">Emergência</a>
        </div>
      )}
      {user.role === 'doctor' && (
        <div style={{ display: 'grid', gap: 8 }}>
          <a href="/agenda">Minha Agenda</a>
          <a href="/teleconsulta">Sala de Teleconsulta</a>
          <a href="/exames">Resultados de Exames</a>
        </div>
      )}
      {user.role === 'admin' && (
        <div style={{ display: 'grid', gap: 8 }}>
          <a href="/admin">Painel Admin</a>
        </div>
      )}
    </main>
  )
}