import express from 'express'
import { prisma } from '../src/server.js'

const router = express.Router()

router.post('/emergency_requests', async (req, res) => {
	try {
		const { patient_id, geoloc, nivel } = req.body
		const hospitals = ['Hospital Central', 'Santa Maria', 'São Lucas']
		const suggested = hospitals[Math.floor(Math.random()*hospitals.length)]
		const level = nivel || 'alto'
		const aiRecommendation = level === 'alto' ? 'ER' : (level === 'medio' ? 'Urgencia' : 'Tele')
		const er = await prisma.emergencyRequest.create({ data: {
			patientId: patient_id,
			lat: geoloc?.lat || -23.55,
			lng: geoloc?.lng || -46.63,
			level,
			aiRecommendation,
			suggestedHospital: suggested,
			status: 'aberta'
		}})
		res.json(er)
	} catch (e) {
		res.status(400).json({ error: 'Invalid' })
	}
})

export default router