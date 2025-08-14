import express from 'express'
import { prisma } from '../src/server.js'
import { requireAuth, requireRole } from '../utils/auth.js'

const router = express.Router()

router.get('/metrics', requireAuth, requireRole('admin'), async (req, res) => {
	const [appointments, orders, users] = await Promise.all([
		prisma.appointment.count(),
		prisma.pharmacyOrder.count(),
		prisma.user.count()
	])
	const revenueFarm = await prisma.payment.aggregate({ _sum: { amount: true }, where: { object: 'farmacia', status: 'succeeded' } })
	res.json({ appointments, orders, users, revenueFarmacia: revenueFarm._sum.amount || 0 })
})

router.post('/inventory/replenish', requireAuth, requireRole('admin'), async (req, res) => {
	const { sku, qty, preço_override } = req.body
	try {
		const item = await prisma.pharmacyInventory.update({ where: { sku }, data: { stock: { increment: qty || 0 }, basePrice: preço_override ?? undefined } })
		res.json(item)
	} catch (e) {
		res.status(404).json({ error: 'SKU not found' })
	}
})

router.post('/partners', requireAuth, requireRole('admin'), async (req, res) => {
	try {
		const { tipo, nome, api_base_url, credenciais, regiões } = req.body
		const p = await prisma.partner.create({ data: { type: tipo, name: nome, apiBaseUrl: api_base_url || null, credentials: credenciais || null, regions: regiões || [] } })
		res.json(p)
	} catch (e) {
		res.status(400).json({ error: 'Invalid partner data' })
	}
})

export default router