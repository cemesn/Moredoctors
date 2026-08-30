"use client"
import { useEffect, useState } from 'react'

export default function AdminPage() {
  const [metrics, setMetrics] = useState<any>(null)
  const [sku, setSku] = useState('ANTIGRIP-1')
  const [forecast, setForecast] = useState<any>(null)

  useEffect(()=>{ (async ()=>{
    const token = localStorage.getItem('token')
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/admin/metrics', { headers: { Authorization: token ? `Bearer ${token}` : '' } })
    setMetrics(await res.json())
  })() },[])

  async function loadForecast() {
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/ai/forecast/' + sku)
    setForecast(await res.json())
  }

  function Chart() {
    if (!forecast?.nextMonthsForecast) return null
    const data = forecast.nextMonthsForecast as { yyyymm: string, qty_prevista: number }[]
    const max = Math.max(...data.map(d=>d.qty_prevista), 1)
    const w = 320, h = 160, pad = 24
    const points = data.map((d,i)=>({ x: pad + i*(w-2*pad)/2, y: h - pad - (d.qty_prevista/max)*(h-2*pad) }))
    const path = points.map((p,i)=>`${i===0?'M':'L'} ${p.x} ${p.y}`).join(' ')
    return (
      <svg width={w} height={h} style={{ border: '1px solid #eee', borderRadius: 8 }}>
        <path d={path} stroke="#0ea5e9" fill="none" strokeWidth={2} />
        {points.map((p,i)=>(<circle key={i} cx={p.x} cy={p.y} r={3} fill="#0ea5e9" />))}
        {data.map((d,i)=> (<text key={i} x={pad + i*(w-2*pad)/2} y={h-6} fontSize={10} textAnchor="middle">{d.yyyymm}</text>))}
      </svg>
    )
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Admin</h1>
      {metrics && (
        <div style={{ display: 'flex', gap: 24 }}>
          <div>Consultas: {metrics.appointments}</div>
          <div>Pedidos Farmácia: {metrics.orders}</div>
          <div>Usuários: {metrics.users}</div>
          <div>Receita Farmácia: R$ {metrics.revenueFarmacia.toFixed(2)}</div>
        </div>
      )}
      <div style={{ marginTop: 24 }}>
        <h3>Previsão de Demanda</h3>
        <input value={sku} onChange={e=>setSku(e.target.value)} />
        <button onClick={loadForecast}>Carregar</button>
        {forecast && (
          <div>
            <pre style={{ background: '#f9fafb', padding: 8, borderRadius: 6 }}>{JSON.stringify(forecast.nextMonthsForecast, null, 2)}</pre>
            <Chart />
          </div>
        )}
      </div>
    </main>
  )
}