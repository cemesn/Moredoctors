import express from 'express'
import { prisma } from '../src/server.js'

const router = express.Router()

// Helpers
function winterMonthsAdjust(yyyymm) {
	const m = parseInt(yyyymm.slice(4), 10)
	return [6,7,8].includes(m) ? 1.25 : 1
}

router.get('/forecast/:sku', async (req, res) => {
	const df = await prisma.demandForecast.findUnique({ where: { sku: req.params.sku } })
	if (!df) return res.status(404).json({ error: 'Not found' })
	res.json(df)
})

router.post('/triage', async (req, res) => {
	try {
		const { patient_id, sintomas_texto, sinais_vitais } = req.body
		const text = (sintomas_texto || '').toLowerCase()
		let destino = 'tele', especialidade, exames, risco = 0.3, confianca = 0.7, justificativa = 'Avaliação inicial por telemedicina.'
		if (text.includes('dor no peito') && (text.includes('falta de ar') || text.includes('dispneia'))) {
			destino = 'ER'; risco = 0.9; confianca = 0.9; justificativa = 'Dor torácica associada a dispneia sugere emergência.'
			especialidade = 'Cardiologia'
		}
		else if (text.includes('febre') && (text.includes('garganta') || text.includes('dor garganta'))) {
			destino = 'tele'; risco = 0.4; confianca = 0.8; justificativa = 'Quadro sugestivo de IVAS, considerar teste rápido.'
			especialidade = 'Clínica Geral'; exames = ['Strep A rápido']
		}
		else if (text.includes('renovação') || text.includes('renovacao') || text.includes('renovar receita')) {
			destino = 'farmacia'; risco = 0.1; confianca = 0.9; justificativa = 'Renovação de receita pode ser resolvida por tele + farmácia.'
		}

		const output = { destino_sugerido: destino, especialidade_sugerida: especialidade, lista_exames: exames, risco, confiança: confianca, justificativa }
		const saved = await prisma.symptomCheck.create({ data: {
			patientId: patient_id,
			inputText: sintomas_texto,
			vitalsJson: sinais_vitais || undefined,
			aiOutputJson: output,
			suggestedDestination: destino === 'ER' ? 'ER' : destino,
			suggestedSpecialty: especialidade || null,
			risk: risco,
			confidence: confianca
		}})
		res.json({ ...output, id: saved.id })
	} catch (e) {
		res.status(500).json({ error: 'AI error' })
	}
})

router.post('/forecast', async (req, res) => {
	try {
		const { sku, historico_mensal } = req.body
		const values = (historico_mensal || []).map((x) => x.vendas)
		const mm3 = values.length >= 3 ? Math.round((values.slice(-3).reduce((a,b)=>a+b,0))/3) : Math.round((values.reduce((a,b)=>a+b,0))/(values.length||1))
		const lastYm = (historico_mensal || []).slice(-1)[0]?.yyyymm || '202501'
		function nextYm(ym, k) {
			const y = parseInt(ym.slice(0,4),10)
			const m = parseInt(ym.slice(4),10)
			const d = new Date(y, m-1+k, 1)
			const yy = d.getFullYear()
			const mm = (d.getMonth()+1).toString().padStart(2,'0')
			return `${yy}${mm}`
		}
		const forecast = [1,2,3].map((k)=>{
			const ym = nextYm(lastYm, k)
			const saz = winterMonthsAdjust(ym)
			return { yyyymm: ym, qty_prevista: Math.round(mm3*saz) }
		})
		const interval = { low: Math.max(0, Math.round(mm3*0.8)), high: Math.round(mm3*1.3) }
		await prisma.demandForecast.upsert({
			where: { sku },
			update: { monthlyHistory: historico_mensal || [], nextMonthsForecast: forecast, lastUpdated: new Date() },
			create: { sku, monthlyHistory: historico_mensal || [], nextMonthsForecast: forecast }
		})
		res.json({ metodo: 'média_móvel', previsão_prox_3_meses: forecast, intervalo_confianca: interval })
	} catch (e) {
		res.status(500).json({ error: 'Forecast error' })
	}
})

const BETA_LACTAMS = ['amoxicilina','ampicilina','penicilina','oxacilina','ceftriaxona','cefalexina']

router.post('/substitutions', async (req, res) => {
	try {
		const { medicamento, princípio_ativo, alergias_paciente } = req.body
		const allergies = (alergias_paciente || []).map((s)=>s.toLowerCase())
		let note = 'Alternativas com base em equivalência e preço.'
		if (allergies.some(a=>a.includes('penicil'))) note = 'Evitar betalactâmicos devido a alergia informada.'
		// fetch inventory for same active ingredient or therapeutic class (mock by matching activeIngredient)
		const inv = await prisma.pharmacyInventory.findMany()
		const alternatives = inv.filter(i => i.activeIngredient.toLowerCase() === (princípio_ativo || '').toLowerCase())
			.map(i => ({ nome: i.name, princípio_ativo: i.activeIngredient, equivalente_bool: true, contraindicação: (allergies.some(a=>BETA_LACTAMS.some(b=>i.activeIngredient.toLowerCase().includes(b)))) ? 'Alergia potencial' : undefined, preço: i.basePrice, sku: i.sku }))
			.sort((a,b)=>a.preço-b.preço)
		res.json({ alternativas: alternatives.slice(0,5), nota_segurança: note })
	} catch (e) {
		res.status(500).json({ error: 'Substitution error' })
	}
})

export default router