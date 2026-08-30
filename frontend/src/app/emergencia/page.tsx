"use client"
import { useState } from 'react'

export default function EmergenciaPage() {
  const [status, setStatus] = useState('')

  async function pedirAjuda() {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/emergency/emergency_requests', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ patient_id: user.id, geoloc: { lat: -23.55, lng: -46.63 }, nivel: 'alto' })
    })
    const data = await res.json()
    setStatus(`Solicitação aberta. Hospital sugerido: ${data.suggestedHospital}`)
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Emergência</h1>
      <button onClick={pedirAjuda} style={{ background: '#ef4444', color: 'white', padding: '8px 12px', borderRadius: 6 }}>Botão de Emergência</button>
      {status && <p style={{ marginTop: 12 }}>{status}</p>}
    </main>
  )
}