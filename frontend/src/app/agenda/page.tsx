"use client"
import { useEffect, useMemo, useState } from 'react'

export default function AgendaPage() {
  const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
  const doctorId = params.get('doctor')
  const [slots, setSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(()=>{ (async ()=>{
    if (!doctorId) return
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + `/doctors/${doctorId}/availability`)
    const data = await res.json()
    setSlots(data.slots)
  })() },[doctorId])

  async function agendar(slot: string) {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/appointments', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ patient_id: user.id, doctor_id: doctorId, tipo: 'tele', data_hora: slot })
      })
      const data = await res.json()
      if (!res.ok) throw new Error('Erro ao agendar')
      localStorage.setItem('lastAppointmentId', data.id)
      alert('Consulta agendada!')
      window.location.href = '/teleconsulta'
    } finally { setLoading(false) }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Agenda</h1>
      {!doctorId ? <p>Selecione um médico em Buscar Médicos.</p> : (
        <ul>
          {slots.slice(0,20).map(s => (
            <li key={s} style={{ marginBottom: 8 }}>
              {new Date(s).toLocaleString()} — <button disabled={loading} onClick={()=>agendar(s)}>Agendar</button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}