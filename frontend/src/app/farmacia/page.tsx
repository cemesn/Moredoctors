"use client"
import { useEffect, useState } from 'react'

export default function FarmaciaPage() {
  const [inventory, setInventory] = useState<any[]>([])
  const [cart, setCart] = useState<any[]>([])
  const [subs, setSubs] = useState<any[]>([])
  const [order, setOrder] = useState<any>(null)

  useEffect(()=>{ (async ()=>{
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/pharmacy/inventory')
    const inv = await res.json()
    setInventory(inv)
    const lastRx = localStorage.getItem('lastPrescriptionId')
    if (lastRx) {
      const rxRes = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/pharmacy/prescriptions/' + lastRx)
      const rx = await rxRes.json()
      if (rx?.items) {
        const mapped = rx.items.map((it:any) => {
          const candidates = inv.filter((p:any) => p.activeIngredient.toLowerCase().includes(it.medication.split(' ')[0].toLowerCase()))
          const cheapest = candidates.sort((a:any,b:any)=>a.basePrice-b.basePrice)[0] || inv[0]
          return { sku: cheapest.sku, nome: cheapest.name, preço_unit: cheapest.basePrice, qty: it.quantity, princípio_ativo: cheapest.activeIngredient }
        })
        setCart(mapped)
      }
    }
  })() },[])

  function addToCart(item: any) {
    setCart(c => [...c, { sku: item.sku, nome: item.name, preço_unit: item.basePrice, qty: 1, princípio_ativo: item.activeIngredient }])
  }

  async function sugerirGenerico(item: any) {
    const alergias: string[] = []
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/ai/substitutions', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ medicamento: item.nome, princípio_ativo: item.princípio_ativo, alergias_paciente: alergias })
    })
    const data = await res.json()
    setSubs(data.alternativas)
  }

  async function criarPedido() {
    const token = localStorage.getItem('token')
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    const res = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/pharmacy/orders', {
      method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
      body: JSON.stringify({ patient_id: user.id, itens: cart })
    })
    const data = await res.json()
    setOrder(data)
  }

  async function checkout() {
    if (!order) return
    await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/pharmacy/checkout', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id: order.id })
    })
    const updated = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') + '/pharmacy/orders/' + order.id)
    setOrder(await updated.json())
  }

  const total = cart.reduce((s, i)=> s + i.preço_unit*i.qty, 0)

  return (
    <main style={{ padding: 24 }}>
      <h1>Farmácia</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        <div>
          <h3>Catálogo</h3>
          <ul>
            {inventory.slice(0, 20).map(item => (
              <li key={item.sku} style={{ marginBottom: 8 }}>
                {item.name} — R$ {item.basePrice.toFixed(2)}
                <button style={{ marginLeft: 8 }} onClick={()=>addToCart(item)}>Adicionar</button>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3>Carrinho</h3>
          <ul>
            {cart.map((c,i)=>(
              <li key={i} style={{ marginBottom: 8 }}>
                {c.nome} x{c.qty} — R$ {(c.preço_unit*c.qty).toFixed(2)}
                <button style={{ marginLeft: 8 }} onClick={()=>sugerirGenerico(c)}>Sugestão Genérico</button>
              </li>
            ))}
          </ul>
          <p>Total: R$ {total.toFixed(2)}</p>
          <button onClick={criarPedido} disabled={!cart.length}>Criar Pedido</button>
          {order && <>
            <p>Pedido #{order.id} — Status: {order.status} {order.trackingCode ? `· Rastreamento: ${order.trackingCode}` : ''}</p>
            <button onClick={checkout}>Checkout (sandbox)</button>
          </>}
          {subs.length>0 && (
            <div style={{ marginTop: 12 }}>
              <h4>Alternativas</h4>
              <ul>
                {subs.map((s:any, idx:number)=>(<li key={idx}>{s.nome} — {s.princípio_ativo} — {s.preço?.toFixed?.(2)}</li>))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}