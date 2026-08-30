# MoreDoctors.ai (Demo Prototype)

Monorepo: backend (Express + Prisma/SQLite), frontend (Next.js).

## Setup

1) Backend

- env: `cp /workspace/backend/.env /workspace/backend/.env` (already set with demo defaults)
- install: `cd /workspace/backend && npm i`
- migrate: `npx prisma migrate dev`
- seed: `npm run seed`
- run: `npm run start` (port 4000)

2) Frontend

- env: create `/workspace/frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:4000`
- install: `cd /workspace/frontend && npm i`
- run: `npm run dev` (port 3000)

Demo users:
- admin@demo.com / Demo123!
- medico@demo.com / Demo123!
- paciente@demo.com / Demo123!

## Endpoints (samples)

- Auth: POST `/auth/register`, `/auth/login`, `/auth/mfa/verify`
- IA: POST `/ai/triage`, POST `/ai/forecast`, GET `/ai/forecast/:sku`, POST `/ai/substitutions`
- Médicos: GET `/doctors`, GET `/doctors/:id/availability`
- Appointments: GET `/appointments`, POST `/appointments`, POST `/appointments/:id/status`
- Exames: POST `/labs/lab_requests`, GET `/labs/lab_results/:id`
- Prescrição/Farmácia: GET `/pharmacy/inventory`, POST `/pharmacy/prescriptions`, POST `/pharmacy/orders`, GET `/pharmacy/orders/:id`, POST `/pharmacy/checkout`
- Emergência: POST `/emergency/emergency_requests`
- Admin: GET `/admin/metrics`, POST `/admin/inventory/replenish`, POST `/admin/partners`

## Pages

- Landing `/`
- Login `/login`
- Dashboard `/dashboard`
- Triagem `/triage`
- Buscar Médicos `/buscar-medicos`
- Agenda `/agenda`
- Teleconsulta `/teleconsulta`
- Exames `/exames`
- Farmácia `/farmacia`
- Emergência `/emergencia`
- Admin `/admin`

## Feature Flags

- `DEMO_MODE=true`
- `FEATURE_PAYMENTS_REAL=false`
- `FEATURE_EXTERNAL_LABS=false`
- `FEATURE_AMBULANCE_DISPATCH=false`

## Notes

- Data privacy simulated; JWT auth simple.
- Payments sandboxed; Stripe only used if `FEATURE_PAYMENTS_REAL=true`.
- Lab integrations mocked; results can be extended.
