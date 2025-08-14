import express from 'express'
import { prisma } from '../src/server.js'
import Stripe from 'stripe'

const router = express.Router()
const stripe = new Stripe(process.env.STRIPE_KEY_TEST || 'sk_test_mock', { apiVersion: '2024-06-20' })

router.get('/inventory', async (req, res) => {
	const items = await prisma.pharmacyInventory.findMany({ orderBy: { name: 'asc' } })
	res.json(items)
})

router.get('/prescriptions/:id', async (req, res) => {
	const rx = await prisma.prescription.findUnique({ where: { id: req.params.id }, include: { items: true } })
	if (!rx) return res.status(404).json({ error: 'Not found' })
	res.json(rx)
})

router.get('/orders/:id', async (req, res) => {
	const order = await prisma.pharmacyOrder.findUnique({ where: { id: req.params.id }, include: { items: true } })
	if (!order) return res.status(404).json({ error: 'Not found' })
	res.json(order)
})

router.post('/prescriptions', async (req, res) => {
	try {
		const { appointment_id, patient_id, itens, observacoes } = req.body
		const rx = await prisma.prescription.create({ data: {
			appointmentId: appointment_id,
			patientId: patient_id,
			status: 'emitida',
			notes: observacoes || null,
			items: { create: itens.map(i => ({ medication: i.medicamento, dosage: i.dosagem, quantity: i.qty, genericOk: !!i.genérico_ok_bool })) }
		}, include: { items: true } })
		res.json(rx)
	} catch (e) {
		res.status(400).json({ error: 'Invalid' })
	}
})

router.post('/orders', async (req, res) => {
	try {
		const { prescription_id, patient_id, itens } = req.body
		const total = itens.reduce((sum, it) => sum + it.preço_unit * it.qty, 0)
		const order = await prisma.pharmacyOrder.create({ data: {
			prescriptionId: prescription_id || null,
			patientId: patient_id,
			total,
			status: 'pedido',
			items: { create: itens.map(i => ({ sku: i.sku, quantity: i.qty, unitPrice: i.preço_unit })) }
		}, include: { items: true } })
		res.json(order)
	} catch (e) {
		res.status(400).json({ error: 'Invalid' })
	}
})

router.post('/orders/:id/status', async (req, res) => {
	try {
		const { status } = req.body
		const order = await prisma.pharmacyOrder.update({ where: { id: req.params.id }, data: { status } })
		res.json(order)
	} catch (e) {
		res.status(404).json({ error: 'Not found' })
	}
})

router.post('/checkout', async (req, res) => {
	try {
		const { order_id } = req.body
		const order = await prisma.pharmacyOrder.findUnique({ where: { id: order_id }, include: { items: true } })
		if (!order) return res.status(404).json({ error: 'Order not found' })
		if (process.env.FEATURE_PAYMENTS_REAL === 'true') {
			const session = await stripe.checkout.sessions.create({
				mode: 'payment',
				payment_method_types: ['card'],
				success_url: 'https://example.com/success',
				cancel_url: 'https://example.com/cancel',
				line_items: order.items.map(i => ({ quantity: i.quantity, price_data: { currency: 'brl', unit_amount: Math.round(i.unitPrice*100), product_data: { name: i.sku } } }))
			})
			return res.json({ checkout_url: session.url })
		}
		// sandbox: immediately mark paid
		await prisma.payment.create({ data: { userId: order.patientId, object: 'farmacia', amount: order.total, currency: 'BRL', status: 'succeeded', gateway: 'sandbox', reference: order.id } })
		await prisma.pharmacyOrder.update({ where: { id: order_id }, data: { status: 'separacao', trackingCode: `MD${order_id.slice(-6).toUpperCase()}` } })
		res.json({ ok: true })
	} catch (e) {
		res.status(500).json({ error: 'Checkout error' })
	}
})

export default router