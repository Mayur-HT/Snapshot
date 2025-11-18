# Snapshot Photo Distribution App

Tech stack
- Next.js 14 (app router)
- Tailwind CSS
- NestJS
- Prisma ORM
- PostgreSQL

Features
- Account creation with mandatory selfie upload
- Upload photos; automatic face embedding + match to registered users
- Create groups and grant access; distribute matched photos to group members
- Social sharing (Web Share API + shareable links)
- Modern UI with Tailwind and shadcn/ui

Quick start
1) Prereqs: Node 18+, Docker
2) Start DB
```
docker compose up -d db
```
3) Backend
```
cd api
cp .env.example .env
npm i
npm run prisma:generate
npm run prisma:migrate
npm run start:dev
```
4) Frontend
```
cd web
cp .env.example .env
npm i
npm run dev
```

Env
- api/.env
```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/snapshot
JWT_SECRET=supersecret
PORT=3001
UPLOAD_DIR=./uploads
PUBLIC_BASE_URL=http://localhost:3001
```
- web/.env
```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Docker
```
docker compose up -d
```

Notes
- First time start will download face-api models at api/models.
- For production, configure persistent storage for uploads and models.
