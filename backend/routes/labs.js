import express from 'express'
import { prisma } from '../src/server.js'

const router = express.Router()

router.post('/lab_requests', async (req, res) => {
	try {
		const { appointment_id, tipo_exame, parceiro_lab, data_hora } = req.body
		const lr = await prisma.labRequest.create({ data: {
			appointmentId: appointment_id || null,
			type: tipo_exame,
			status: 'solicitado',
			partnerLab: parceiro_lab || 'DEMO-LAB',
			dateTime: new Date(data_hora || new Date())
		}})
		// auto-generate result in background after a short delay
		setTimeout(async () => {
			try {
				await prisma.labResult.create({ data: {
					labRequestId: lr.id,
					resultsJson: { conclusao: 'Dentro da normalidade', valores: [{ nome: 'Hemoglobina', valor: 14.2, un: 'g/dL' }] },
					releasedToDoctor: true,
					attachmentsUrl: 'https://example.com/laudo.pdf'
				}})
				await prisma.labRequest.update({ where: { id: lr.id }, data: { status: 'concluido' } })
			} catch {}
		}, 3000)
		res.json(lr)
	} catch (e) {
		res.status(400).json({ error: 'Invalid' })
	}
})

router.get('/lab_results/:id', async (req, res) => {
	const id = req.params.id
	const result = await prisma.labResult.findUnique({ where: { id } })
	if (!result) return res.status(404).json({ error: 'Not found' })
	res.json(result)
})

export default router