# CutLine

A real-time salon queue management app. Customers join queues remotely and track their position live. Barbers manage chairs and move the queue - no more walk-in chaos.

![CutLine Screenshot](./cutline.gif)

🔗 [Live Demo](https://cut-line.vercel.app/) • [Source Code](https://github.com/theakshaymore/Cut-Line)

---

## What it does

**For customers**

- Discover nearby salons and join their queue remotely
- See live queue position and estimated wait time
- Get notified when it's their turn

**For barbers**

- Manage multiple chairs in real time
- Assign next customer, mark done or no-show
- Onboard via invite link (no open signups)

---

## Tech Stack

| Layer     | Tools                                        |
| --------- | -------------------------------------------- |
| Frontend  | React + Vite, Tailwind CSS, Socket.IO Client |
| Backend   | Node.js, Express, Prisma, PostgreSQL, Redis  |
| Auth      | JWT, bcrypt                                  |
| Real-time | Socket.IO                                    |
| Media     | ImageKit                                     |

---

## Project Structure

```
cutline/
├── client/   # React frontend
└── server/   # Express API + Socket.IO
```

---

## Running locally

```bash
# Clone the repo
git clone https://github.com/theakshaymore/cutline

# Setup backend
cd server
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev

# Setup frontend
cd ../client
cp .env.example .env
npm install
npm run dev
```

> Requires PostgreSQL and Redis running locally. See `docker-compose.yml` to spin them up quickly.

---

Made by [Akshay More](https://akshaymore.com)
