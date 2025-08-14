"use client"
import { useEffect, useRef, useState } from 'react'

export default function TeleconsultaPage() {
  const [messages, setMessages] = useState<string[]>(['Conectado à sala de teleconsulta.'])
  const [input, setInput] = useState('Olá, doutor(a)!')
  const [user, setUser] = useState<any>(null)
  const [prescItems, setPrescItems] = useState<any[]>([{ medicamento: 'Azitromicina 500mg', dosagem: '1 cp ao dia por 3 dias', qty: 3, genérico_ok_bool: true }])

  useEffect(()=>{ const u = localStorage.getItem('user'); if (u) setUser(JSON.parse(u)) },[])

  function send() { setMessages(m=>[...m, `Você: ${input}`]); setInput('') }

  async function emitirPrescricao() {
    const token = localStorage.getItem('token')
    const patient = user?.role === 'doctor' ? JSON.parse(localStorage.getItem('patientContext') || '{}').id : user?.id
    const appointmentId = localStorage.getItem('lastAppointmentId') || undefined
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/pharmacy/prescriptions', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      body: JSON.stringify({ appointment_id: appointmentId, patient_id: patient, itens: prescItems, observacoes: 'Receita eletrônica' })
    })
    const data = await res.json()
    if (!res.ok) return alert('Erro: ' + (data.error || ''))
    localStorage.setItem('lastPrescriptionId', data.id)
    alert('Receita emitida! Deseja enviar para Farmácia MoreDoctors?')
    window.location.href = '/farmacia'
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Sala de Teleconsulta (simulada)</h1>
      <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 8, minHeight: 120, marginBottom: 12 }}>
        {messages.map((m,i)=>(<div key={i}>{m}</div>))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={input} onChange={e=>setInput(e.target.value)} style={{ flex: 1, padding: 8 }} />
        <button onClick={send}>Enviar</button>
      </div>

      <h3 style={{ marginTop: 24 }}>Emitir Prescrição</h3>
      <pre style={{ background: '#f9fafb', padding: 8, borderRadius: 6 }}>{JSON.stringify(prescItems, null, 2)}</pre>
      <button onClick={emitirPrescricao} style={{ background: '#0ea5e9', color: 'white', padding: '8px 12px', borderRadius: 6 }}>Emitir</button>
    </main>
  )
}