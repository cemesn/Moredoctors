import { PrismaClient } from '../generated/prisma/index.js'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

function randChoice(arr) { return arr[Math.floor(Math.random()*arr.length)] }

function randomDateWithinDays(days) {
	const now = new Date()
	const offset = Math.floor(Math.random()*days)
	return new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset)
}

async function main() {
	// Clear
	await prisma.$transaction([
		prisma.pharmacyOrderItem.deleteMany(),
		prisma.pharmacyOrder.deleteMany(),
		prisma.prescriptionItem.deleteMany(),
		prisma.prescription.deleteMany(),
		prisma.labResult.deleteMany(),
		prisma.labRequest.deleteMany(),
		prisma.appointment.deleteMany(),
		prisma.emergencyRequest.deleteMany(),
		prisma.symptomCheck.deleteMany(),
		prisma.demandForecast.deleteMany(),
		prisma.pharmacyInventory.deleteMany(),
		prisma.partner.deleteMany(),
		prisma.patient.deleteMany(),
		prisma.doctor.deleteMany(),
		prisma.payment.deleteMany(),
		prisma.user.deleteMany(),
	])

	const password = await bcrypt.hash('Demo123!', 10)

	// Admin
	await prisma.user.create({ data: { name: 'Admin', email: 'admin@demo.com', passwordHash: password, role: 'admin' } })

	// Doctors
	const specialties = ['Cardiologia','Clínica Geral','Pediatria','Dermatologia','Ortopedia','Ginecologia','Psiquiatria','Endocrinologia','Neurologia','Oftalmologia']
	const doctorUsers = []
	for (let i = 0; i < 10; i++) {
		const u = await prisma.user.create({ data: { name: `Dr(a). Demo ${i+1}`, email: `medico${i+1}@demo.com`, passwordHash: password, role: 'doctor' } })
		await prisma.doctor.create({ data: { userId: u.id, specialty: specialties[i % specialties.length], crm: `CRM${10000+i}`, bio: 'Profissional experiente.', practiceLocations: ['Clínica Central'], telemedicine: true, scheduleConfig: { days: ['Mon','Tue','Wed','Thu','Fri'], hours: [9,10,11,14,15,16] } } })
		doctorUsers.push(u)
	}

	// Patients
	const patientUsers = []
	for (let i = 0; i < 50; i++) {
		const u = await prisma.user.create({ data: { name: `Paciente ${i+1}`, email: `paciente${i+1}@demo.com`, passwordHash: password, role: 'patient' } })
		const alergiaPen = i < 5 ? ['penicilina'] : []
		await prisma.patient.create({ data: { userId: u.id, birthDate: new Date(1985, i%12, (i%28)+1), sex: i%2===0?'M':'F', address: `Rua ${i+1}`, allergies: alergiaPen, conditions: [], healthPlan: i%3===0 ? 'Plano Ouro' : 'SUS' } })
		patientUsers.push(u)
	}

	// Inventory 60 SKUs
	const baseSkus = [
		{ sku: 'AMOX500', name: 'Amoxicilina 500mg', ai: 'amoxicilina' },
		{ sku: 'AZIT500', name: 'Azitromicina 500mg', ai: 'azitromicina' },
		{ sku: 'DIPI500', name: 'Dipirona 500mg', ai: 'dipirona' },
		{ sku: 'PARA750', name: 'Paracetamol 750mg', ai: 'paracetamol' },
		{ sku: 'IBU400', name: 'Ibuprofeno 400mg', ai: 'ibuprofeno' },
		{ sku: 'LOSA50', name: 'Losartana 50mg', ai: 'losartana' },
		{ sku: 'METF850', name: 'Metformina 850mg', ai: 'metformina' },
		{ sku: 'SINV20', name: 'Sinvastatina 20mg', ai: 'sinvastatina' },
		{ sku: 'OMEP20', name: 'Omeprazol 20mg', ai: 'omeprazol' },
		{ sku: 'ANTIGRIP', name: 'Antigripal Composto', ai: 'antigripal' },
	]
	const inventory = []
	for (let i = 0; i < 60; i++) {
		const b = baseSkus[i % baseSkus.length]
		inventory.push(await prisma.pharmacyInventory.create({ data: {
			sku: `${b.sku}-${Math.floor(i/10)+1}`,
			name: `${b.name} Genérico ${Math.floor(i/10)+1}`,
			activeIngredient: b.ai,
			presentation: 'comprimidos',
			basePrice: 5 + (i%10)*2,
			stock: 20 + (i%30),
			reorderPoint: 15,
			supplier: 'Fornecedor Demo',
			leadTimeDays: 5
		}}))
	}

	// Demand history for 12 months for 30 SKUs
	const skusForForecast = inventory.slice(0,30)
	for (const item of skusForForecast) {
		const history = []
		const now = new Date()
		for (let m = 11; m >= 0; m--) {
			const d = new Date(now.getFullYear(), now.getMonth()-m, 1)
			const ym = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}`
			let base = 20 + Math.floor(Math.random()*30)
			// winter bump for antigripal
			if ([6,7,8].includes(d.getMonth()+1) && item.activeIngredient === 'antigripal') base = Math.round(base*1.6)
			history.push({ yyyymm: ym, vendas: base })
		}
		await prisma.demandForecast.create({ data: { sku: item.sku, monthlyHistory: history, nextMonthsForecast: [] } })
	}

	// Partners: 3 lab, 2 image, 1 ambulance
	const partners = [
		{ type: 'lab', name: 'Lab Alpha', apiBaseUrl: 'https://lab-alpha.test', credentials: 'token-abc', regions: ['SP'] },
		{ type: 'lab', name: 'Lab Beta', apiBaseUrl: 'https://lab-beta.test', credentials: 'token-b', regions: ['RJ'] },
		{ type: 'lab', name: 'Lab Gama', apiBaseUrl: 'https://lab-gama.test', credentials: 'token-g', regions: ['MG'] },
		{ type: 'imagem', name: 'Imagem Plus', apiBaseUrl: 'https://imagem-plus.test', credentials: 'token-i', regions: ['SP','RJ'] },
		{ type: 'imagem', name: 'ImagemMax', apiBaseUrl: 'https://imagem-max.test', credentials: 'token-x', regions: ['RS'] },
		{ type: 'ambulancia', name: 'Resgate 24h', apiBaseUrl: 'https://ambulancia.test', credentials: 'token-z', regions: ['SP','PR'] },
	]
	for (const p of partners) {
		await prisma.partner.create({ data: { type: p.type, name: p.name, apiBaseUrl: p.apiBaseUrl, credentials: p.credentials, regions: p.regions } })
	}

	// A few future appointments to show schedules
	for (let i = 0; i < 20; i++) {
		const p = randChoice(patientUsers)
		const d = randChoice(doctorUsers)
		await prisma.appointment.create({ data: {
			patientId: p.id,
			doctorId: d.id,
			kind: Math.random() > 0.5 ? 'tele' : 'presencial',
			dateTime: randomDateWithinDays(14),
			status: 'agendado'
		}})
	}

	// Default demo logins
	await prisma.user.create({ data: { name: 'Dr. Login', email: 'medico@demo.com', passwordHash: password, role: 'doctor', doctor: { create: { specialty: 'Clínica Geral', crm: 'CRMD3M0', bio: '', practiceLocations: ['Clínica Central'], telemedicine: true, scheduleConfig: {} } } } })
	await prisma.user.create({ data: { name: 'Paciente Login', email: 'paciente@demo.com', passwordHash: password, role: 'patient', patient: { create: { birthDate: new Date(1992,1,1), sex: 'F', address: 'Rua Login', allergies: [], conditions: [], healthPlan: 'SUS' } } } })

	console.log('Seed completed')
}

main().catch(e => {
	console.error(e)
	process.exit(1)
}).finally(async () => {
	await prisma.$disconnect()
})