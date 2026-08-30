import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main style={{ padding: 24, maxWidth: 960, margin: '0 auto' }}>
      <h1 style={{ fontSize: 36, marginBottom: 8 }}>MoreDoctors.ai</h1>
      <p style={{ color: '#555', marginBottom: 24 }}>
        Seu hub de saúde com triagem por IA, telemedicina, exames e farmácia integrada.
      </p>
      <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
        <a href="/login" style={{ background: '#0ea5e9', color: 'white', padding: '10px 16px', borderRadius: 8, textDecoration: 'none' }}>Começar agora</a>
        <a href="/triage" style={{ border: '1px solid #0ea5e9', color: '#0ea5e9', padding: '10px 16px', borderRadius: 8, textDecoration: 'none' }}>Fazer Triagem</a>
      </div>
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        <div style={{ border: '1px solid #eee', borderRadius: 10, padding: 16 }}>
          <h3>Triagem Inteligente</h3>
          <p>Descreva seus sintomas e receba recomendações imediatas.</p>
        </div>
        <div style={{ border: '1px solid #eee', borderRadius: 10, padding: 16 }}>
          <h3>Telemedicina</h3>
          <p>Agende consultas por vídeo com especialistas.</p>
        </div>
        <div style={{ border: '1px solid #eee', borderRadius: 10, padding: 16 }}>
          <h3>Exames Integrados</h3>
          <p>Solicite exames e visualize resultados no app.</p>
        </div>
        <div style={{ border: '1px solid #eee', borderRadius: 10, padding: 16 }}>
          <h3>Farmácia MoreDoctors</h3>
          <p>Compre com substituição genérica inteligente e entrega rápida.</p>
        </div>
      </section>
    </main>
  )
}
