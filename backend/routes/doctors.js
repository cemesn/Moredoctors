import express from 'express'
import { prisma } from '../src/server.js'

const router = express.Router()

router.get('/', async (req, res) => {
	const docs = await prisma.doctor.findMany({ include: { user: true } })
	res.json(docs.map(d => ({ id: d.userId, nome: d.user.name, email: d.user.email, especialidade: d.specialty, crm: d.crm, telemedicina: d.telemedicine })))
})

router.get('/:id/availability', async (req, res) => {
	const id = req.params.id
	const doc = await prisma.doctor.findUnique({ where: { userId: id } })
	if (!doc) return res.status(404).json({ error: 'Not found' })
	// Mock availability from scheduleConfig or default slots next 14 days
	const slots = []
	const now = new Date()
	for (let d = 0; d < 14; d++) {
		for (const hour of [9, 10, 11, 14, 15, 16]) {
			const dt = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, hour, 0, 0)
			slots.push(dt.toISOString())
		}
	}
	res.json({ doctor_id: id, slots })
})

export default router