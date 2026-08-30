"use client"
import { useEffect, useState } from 'react'

export default function ExamesPage() {
  const [tipo, setTipo] = useState('Hemograma')
  const [reqs, setReqs] = useState<any[]>([])

  async function solicitar() {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/labs/lab_requests', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ tipo_exame: tipo, parceiro_lab: 'Lab Alpha' })
    })
    const data = await res.json()
    setReqs(r => [data, ...r])
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Exames</h1>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={tipo} onChange={e=>setTipo(e.target.value)} />
        <button onClick={solicitar}>Solicitar</button>
      </div>
      <ul style={{ marginTop: 12 }}>
        {reqs.map(r => (
          <li key={r.id}>{r.type} — {new Date(r.dateTime).toLocaleString()} — {r.partnerLab}</li>
        ))}
      </ul>
    </main>
  )
}