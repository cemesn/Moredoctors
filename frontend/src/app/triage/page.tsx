"use client"
import { useEffect, useState } from 'react'

export default function TriagePage() {
  const [symptoms, setSymptoms] = useState('febre e dor garganta')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(()=>{ const u = localStorage.getItem('user'); if (u) setUser(JSON.parse(u)) },[])

  async function runTriage() {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/ai/triage', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ patient_id: user?.id, sintomas_texto: symptoms })
      })
      const data = await res.json()
      setResult(data)
    } finally { setLoading(false) }
  }

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <h1>Triagem por IA</h1>
      <textarea value={symptoms} onChange={e=>setSymptoms(e.target.value)} rows={5} style={{ width: '100%', padding: 8 }} />
      <button onClick={runTriage} disabled={loading} style={{ marginTop: 8, background: '#0ea5e9', color: 'white', padding: '8px 12px', borderRadius: 6 }}>
        {loading ? 'Processando...' : 'Enviar'}
      </button>
      {result && (
        <div style={{ marginTop: 16, border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
          <h3>Recomendação: {result.destino_sugerido}</h3>
          {result.especialidade_sugerida && <p>Especialidade: {result.especialidade_sugerida}</p>}
          {result.lista_exames && <p>Exames sugeridos: {result.lista_exames.join(', ')}</p>}
          <p>Risco: {Math.round(result.risco*100)}% · Confiança: {Math.round(result.confiança*100)}%</p>
          <p style={{ color: '#555' }}>{result.justificativa}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <a href="/buscar-medicos" style={{ border: '1px solid #0ea5e9', padding: '8px 12px', borderRadius: 6 }}>Agendar</a>
            <a href="/exames" style={{ border: '1px solid #0ea5e9', padding: '8px 12px', borderRadius: 6 }}>Solicitar Exame</a>
            <a href="/farmacia" style={{ border: '1px solid #0ea5e9', padding: '8px 12px', borderRadius: 6 }}>Ir para Farmácia</a>
            <a href="/emergencia" style={{ background: '#ef4444', color: 'white', padding: '8px 12px', borderRadius: 6 }}>Emergência</a>
          </div>
        </div>
      )}
    </main>
  )
}