import express from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { authenticator } from 'otplib'
import { prisma } from '../src/server.js'

const router = express.Router()

function signToken(user) {
	const payload = { sub: user.id, role: user.role, email: user.email }
	return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })
}

router.post('/register', async (req, res) => {
	try {
		const { name, email, password, role } = req.body
		if (!name || !email || !password || !role) return res.status(400).json({ error: 'Missing fields' })
		const exists = await prisma.user.findUnique({ where: { email } })
		if (exists) return res.status(409).json({ error: 'Email in use' })
		const passwordHash = await bcrypt.hash(password, 10)
		const user = await prisma.user.create({ data: { name, email, passwordHash, role } })
		if (role === 'patient') {
			await prisma.patient.create({ data: { userId: user.id, birthDate: new Date('1990-01-01'), sex: 'N/A', address: 'Rua Demo 123', allergies: [], conditions: [], healthPlan: 'DEMO' } })
		}
		if (role === 'doctor') {
			await prisma.doctor.create({ data: { userId: user.id, specialty: 'Clínica Geral', crm: `CRM${Math.floor(Math.random()*100000)}`, bio: '', practiceLocations: ['Clínica Central'], telemedicine: true, scheduleConfig: {} } })
		}
		const token = signToken(user)
		res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
	} catch (e) {
		res.status(500).json({ error: 'Server error' })
	}
})

router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body
		const user = await prisma.user.findUnique({ where: { email } })
		if (!user) return res.status(401).json({ error: 'Invalid credentials' })
		const valid = await bcrypt.compare(password, user.passwordHash)
		if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
		const token = signToken(user)
		res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } })
	} catch (e) {
		res.status(500).json({ error: 'Server error' })
	}
})

router.post('/mfa/verify', (req, res) => {
	const { token, secret } = req.body
	if (!token || !secret) return res.status(400).json({ error: 'Missing' })
	const ok = authenticator.verify({ token, secret })
	res.json({ valid: ok })
})

export default router