# 🌌 TaskFlow API

TaskFlow is a production-ready, full-stack task and project management ecosystem engineered for reliability, security, and scalability. Built using a decoupled, type-safe architecture, it serves as an enterprise-grade blueprint for modern team collaboration tools.

The system features an Express/TypeScript REST API backed by PostgreSQL, cached via Redis, and seamlessly integrated with a Next.js 14 frontend.

---

![Node.js](https://img.shields.io/badge/Node.js-22+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.x-DC382D?logo=redis&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-14-000000?logo=next.js&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-06B6D4?logo=tailwindcss&logoColor=white)
![Zustand](https://img.shields.io/badge/Zustand-State%20Management-764ABC)
![JWT](https://img.shields.io/badge/Auth-JWT-orange)
![Docker](https://img.shields.io/badge/Docker-Containerized-2496ED?logo=docker&logoColor=white)
![Swagger](https://img.shields.io/badge/API-Swagger-85EA2D?logo=swagger&logoColor=black)
![License](https://img.shields.io/badge/License-MIT-green)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Contributions](https://img.shields.io/badge/Contributions-Welcome-brightgreen)

---

# 🛠️ Tech Stack

TaskFlow is built on a modern, unified TypeScript stack across all layers:

| Layer | Technology | Key Purpose |
| :--- | :--- | :--- |
| **Backend** | Node.js + Express + TypeScript | Fast, decoupled, modular RESTful API engine |
| **Database** | PostgreSQL + Prisma ORM | Relational durability with strict, type-safe schema synchronization |
| **Caching/Queue** | Redis (Optional / Pre-configured) | Cache-aside data layer optimization and state sharing |
| **Authentication** | JWT (Access/Refresh Tokens) + bcrypt | Secure, stateless, role-based access management |
| **Data Validation** | Zod | Strict runtime network boundary input schema validation |
| **API Docs** | Swagger / OpenAPI 3.0 | Fully interactive browser-based live API playground |
| **Frontend** | Next.js 14 (App Router) + TypeScript | Server-optimized UI rendering and dynamic routing |
| **State & Style** | Zustand + Tailwind CSS | Ultra-lightweight global state management and utility UI styling |
| **DevOps** | Docker + Docker Compose | Deterministic, multi-containerized system environment orchestration |

---

# 🏗️ Folder Structure

```text
taskflow/
├── backend/
│   ├── prisma/             # Database schemas, migrations, and seed scripts
│   └── src/
│       ├── modules/        # Domain modules (Auth, Tasks, Users)
│       ├── middleware/     # Auth guards, error handlers, rate limiters
│       ├── utils/          # Shared helper utilities
│       ├── config/         # Environment configurations
│       ├── routes/         # API route mapping
│       ├── docs/           # Swagger specifications
│       ├── types/          # Global TypeScript definitions
│       ├── app.ts          # Express app configuration
│       └── server.ts       # Application bootstrap
├── frontend/
│   ├── app/                # Next.js App Router
│   ├── components/         # Reusable UI components
│   ├── store/              # Zustand state management
│   ├── lib/                # API client utilities
│   └── types/              # Frontend interfaces and contracts
├── docker-compose.yml
└── README.md
```

---

# 🚀 Quick Start Guide

## Prerequisites

Ensure you have the following installed:

- Node.js >= 18
- Docker & Docker Compose
- npm or yarn

---

## 1. Clone Repository

```bash
git clone https://github.com/your-org/taskflow.git
cd taskflow
```

---

## 2. Start Infrastructure Services

TaskFlow uses Docker for PostgreSQL and Redis.

> ⚠️ Ensure ports `5432` and `6379` are available.
>
> If not, update the host port mappings inside `docker-compose.yml`.

Start services:

```bash
docker compose up -d postgres redis
```

Verify containers are running:

```bash
docker ps
```

---

## 3. Backend Setup

Navigate to backend:

```bash
cd backend
npm install
cp .env.example .env
```

Update `.env`:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/taskflow?schema=public"
JWT_SECRET="your_super_secret_jwt_key_at_least_32_chars"
JWT_EXPIRES_IN="7d"
JWT_REFRESH_SECRET="your_refresh_secret_key"
PORT=5000
```

If you changed ports in Docker, update `DATABASE_URL` accordingly.

Run migrations and generate Prisma client:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Seed the database:

```bash
npm run prisma:seed
```

Start backend:

```bash
npm run dev
```

### Backend URLs

| Service | URL |
|---------|-----|
| API Base URL | `http://localhost:5000/api/v1` |
| Health Check | `http://localhost:5000/api/v1/health` |
| Swagger Docs | `http://localhost:5000/api-docs` |

---

## 4. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
cp .env.example .env.local
```

Configure:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

Start frontend:

```bash
npm run dev
```

Application URL:

```text
http://localhost:3000
```

---

# 👥 Seed Credentials & RBAC

TaskFlow ships with Role-Based Access Control (RBAC).

| Role | Email | Password | Permissions |
|------|-------|----------|------------|
| ADMIN | admin@taskflow.io | Admin@123456 | Full access to users, analytics, and workspaces |
| USER | john@taskflow.io | User@123456 | Personal tasks and collaborative editing |

---

# 📑 API Endpoints

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Authenticate user and return JWT |
| GET | `/auth/profile` | Current authenticated user |

---

## Tasks API (`/api/v1/tasks`)

All task routes require JWT authentication.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/tasks` | Retrieve all visible tasks |
| GET | `/tasks/:id` | Retrieve task details |
| POST | `/tasks` | Create task |
| PUT | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Delete task |

---

## Advanced Query Parameters

Example:

```text
?page=1&limit=10&status=TODO&priority=HIGH&search=billing_api&sortBy=createdAt&sortOrder=desc
```

---

# 🧪 Swagger Testing

1. Open:

```text
http://localhost:5000/api-docs
```

2. Login using:

```text
POST /auth/login
```

3. Copy the returned JWT token.

4. Click **Authorize**.

5. Paste:

```text
Bearer <your_jwt_token>
```

6. Click **Authorize** again.

You can now test all protected endpoints.

---

# 📈 Scalability Architecture

```text
                 [ Internet / Client Traffic ]
                               │
                               ▼
                   ┌───────────────────────┐
                   │  NGINX Load Balancer  │
                   └───────────┬───────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         ▼                     ▼                     ▼
 ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
 │ API Cluster 1 │     │ API Cluster 2 │     │ API Cluster 3 │
 └───────┬───────┘     └───────┬───────┘     └───────┬───────┘
         │                     │                     │
         └──────────────┐      │      ┌──────────────┘
                        ▼      ▼      ▼
              ┌─────────────────────────────────┐
              │ Prisma Connection Multiplexer  │
              └────────┬───────────────┬────────┘
                       │               │
                       ▼               ▼
             ┌────────────┐     ┌───────────────┐
             │ PostgreSQL │     │ Redis Cluster │
             │ (Primary)  │     │ (Cache Aside) │
             └────────────┘     └───────────────┘
```

### Stateless Horizontal Scaling

JWT-based authentication allows multiple backend instances without sticky sessions.

### Cache-Aside Pattern

Enable Redis caching using:

```env
REDIS_ENABLED=true
```

to reduce database load and improve response times.

### Microservice Migration Path

Each domain module can be extracted independently into separate services as traffic grows.

### Background Jobs

Heavy tasks such as:

- Email delivery
- Report generation
- Notifications

can be delegated to workers using:

- BullMQ
- Redis Queues

---

# ⚠️ Troubleshooting

## 1. `psql` command not found

### Cause

PostgreSQL binaries are missing from your system PATH.

### Fix

Add:

```text
C:\Program Files\PostgreSQL\<version>\bin
```

to your system environment variables and restart the terminal.

---

## 2. Prisma Connection Failed

### Cause

Database URL does not match Docker credentials or port mappings.

### Fix

Verify:

- `DATABASE_URL`
- Docker container status
- Port conflicts on `5432`

Check running containers:

```bash
docker ps
```

---

## 3. Swagger Returns 401 Unauthorized

### Cause

Incorrect Authorization header format.

### Correct Format

```text
Bearer eyJhbGciOiJIUzI1NiIs...
```

### Incorrect Format

```text
Bearer Bearer eyJhbGciOiJIUzI1NiIs...
```

---

# 🎯 Production Ready Features

- JWT Authentication
- Refresh Tokens
- RBAC Authorization
- Prisma ORM
- PostgreSQL Persistence
- Redis Caching
- Swagger Documentation
- Dockerized Infrastructure
- Type-safe APIs
- Input Validation with Zod
- Scalable Modular Architecture
- Background Job Support
- Horizontal Scaling Ready

---

# 📄 License

This project is licensed under the MIT License.