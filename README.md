# NextCut

NextCut is a full-stack digital salon queue management system with two roles:
- Customer: discover nearby salons, join queue remotely, track live position
- Barber: manage chairs, assign next customer, mark done/no-show in real-time

## Tech Stack
- Frontend: React + Vite, Tailwind CSS, React Router v6, Axios, Socket.IO Client, React Hot Toast, Lucide
- Backend: Node.js, Express, Prisma, PostgreSQL, Redis, Socket.IO, JWT, bcrypt, Nodemailer

## Project Structure
- `client/` React app
- `server/` Express + Prisma + Socket.IO API

## Prerequisites
- Node.js 20+
- PostgreSQL
- Redis

## Setup
1. Install dependencies
```bash
cd server && npm install
cd ../client && npm install
```

2. Configure environment files
- Copy `server/.env.example` to `server/.env`
- Copy `client/.env.example` to `client/.env`

3. Run Prisma
```bash
cd server
npm run prisma:generate
npm run prisma:migrate
```

4. Start backend
```bash
cd server
npm run dev
```

5. Start frontend
```bash
cd client
npm run dev
```

Frontend runs at `http://localhost:5173` and backend at `http://localhost:5000`.

## API Summary
### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/barber-register/:token`
- `POST /api/auth/admin/send-invite`

### Salons
- `GET /api/salons?lat=&lng=&radius=5`
- `GET /api/salons/:id`

### Queue (Customer)
- `POST /api/queue/join`
- `GET /api/queue/my-status`
- `DELETE /api/queue/leave`

### Queue/Chair (Barber)
- `GET /api/barber/queue`
- `PATCH /api/barber/chair/:chairId/assign`
- `PATCH /api/barber/chair/:chairId/done`
- `PATCH /api/barber/chair/:chairId/idle`
- `PATCH /api/barber/queue/:entryId/noshow`
- `GET /api/barber/chairs`
- `POST /api/barber/chairs`
- `DELETE /api/barber/chairs/:id`

## Socket Events
### Client -> Server
- `join-salon-room`
- `leave-salon-room`
- `barber-join`
- `customer-join`

### Server -> Client
- `queue-updated`
- `chair-updated`
- `your-turn`
- `position-changed`
- `kicked-from-queue`
- `chair-service-suggestion`

## Notes
- PostgreSQL is source of truth.
- Redis is used as fast state layer for queues/chairs/socket/rate limits.
- Queue/chair updates use Prisma transactions where needed.
- On server startup, Redis is rehydrated from PostgreSQL active records.