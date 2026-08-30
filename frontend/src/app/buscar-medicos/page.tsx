"use client"
import { useEffect, useState } from 'react'

export default function BuscarMedicosPage() {
  const [doctors, setDoctors] = useState<any[]>([])
  useEffect(()=>{ (async ()=>{
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/doctors')
    setDoctors(await res.json())
  })() },[])

  return (
    <main style={{ padding: 24 }}>
      <h1>Buscar Médicos</h1>
      <ul>
        {doctors.map(d => (
          <li key={d.id} style={{ marginBottom: 8 }}>
            <b>{d.nome}</b> — {d.especialidade} · {d.telemedicina ? 'Tele' : ''}
            <div><a href={`/agenda?doctor=${d.id}`}>Ver horários</a></div>
          </li>
        ))}
      </ul>
    </main>
  )
}