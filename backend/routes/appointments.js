import express from 'express'
import { prisma } from '../src/server.js'

const router = express.Router()

router.get('/', async (req, res) => {
	const { patient_id, doctor_id } = req.query
	const where = {}
	if (patient_id) where.patientId = String(patient_id)
	if (doctor_id) where.doctorId = String(doctor_id)
	const list = await prisma.appointment.findMany({ where, orderBy: { dateTime: 'asc' } })
	res.json(list)
})

router.post('/', async (req, res) => {
	try {
		const { patient_id, doctor_id, tipo, data_hora, notas } = req.body
		const appt = await prisma.appointment.create({ data: {
			patientId: patient_id,
			doctorId: doctor_id,
			kind: tipo === 'presencial' ? 'presencial' : 'tele',
			dateTime: new Date(data_hora),
			status: 'agendado',
			notes: notas || null
		}})
		res.json({ ...appt })
	} catch (e) {
		res.status(400).json({ error: 'Invalid data' })
	}
})

router.post('/:id/status', async (req, res) => {
	const { status } = req.body
	try {
		const appt = await prisma.appointment.update({ where: { id: req.params.id }, data: { status } })
		res.json(appt)
	} catch (e) {
		res.status(404).json({ error: 'Not found' })
	}
})

export default router