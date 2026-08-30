import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import { createServer } from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { PrismaClient } from '../generated/prisma/index.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)
const io = new SocketIOServer(httpServer, {
  cors: { origin: '*', methods: ['GET', 'POST'] }
})

app.use(cors())
app.use(bodyParser.json())

export const prisma = new PrismaClient()

// Audit log (simple)
app.use((req, _res, next) => {
  if (process.env.DEMO_MODE === 'true') {
    // eslint-disable-next-line no-console
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  }
  next()
})

// Health
app.get('/health', (req, res) => {
  res.json({ ok: true, env: process.env.NODE_ENV || 'development' })
})

// Routes
import authRouter from '../routes/auth.js'
import aiRouter from '../routes/ai.js'
import doctorsRouter from '../routes/doctors.js'
import appointmentsRouter from '../routes/appointments.js'
import labRouter from '../routes/labs.js'
import pharmacyRouter from '../routes/pharmacy.js'
import emergencyRouter from '../routes/emergency.js'
import adminRouter from '../routes/admin.js'

app.use('/auth', authRouter)
app.use('/ai', aiRouter)
app.use('/doctors', doctorsRouter)
app.use('/appointments', appointmentsRouter)
app.use('/labs', labRouter)
app.use('/pharmacy', pharmacyRouter)
app.use('/emergency', emergencyRouter)
app.use('/admin', adminRouter)

io.on('connection', (socket) => {
  socket.on('join', (room) => socket.join(room))
})

const PORT = process.env.PORT || 4000
httpServer.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`MoreDoctors backend listening on :${PORT}`)
})