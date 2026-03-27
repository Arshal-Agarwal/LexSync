# Auth Service — LexSync

Handles user registration, authentication, session management, and token lifecycle for the LexSync platform.

---

## Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Runtime      | Node.js (CommonJS)                |
| Framework    | Express v5                        |
| Database     | PostgreSQL via Prisma ORM         |
| Cache / Store| Redis                             |
| Message Bus  | RabbitMQ (amqplib)                |
| Auth         | JWT (access) + UUID (refresh)     |
| Validation   | Joi                               |
| Security     | Helmet, CORS, express-rate-limit  |

---

## Prerequisites

- Node.js >= 18
- Docker & Docker Compose (for infrastructure)
- `npm` or `yarn`

---

## Quick Start

### 1. Start infrastructure (Postgres, Redis, RabbitMQ)

```bash
docker compose up -d
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.sample .env
```

Edit `.env` and fill in the required values:

```env
PORT=3001
DATABASE_URL=postgresql://admin:admin123@localhost:5432/lexsync
JWT_SECRET=your_strong_secret_here
JWT_EXPIRES=15m
rabbitMQ_username=admin
rabbitMQ_password=admin123
ALLOWED_ORIGINS=http://localhost:3000
NODE_ENV=development
```

> `JWT_SECRET` must be a long, random string. Generate one with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

### 4. Run database migrations

```bash
npx prisma migrate deploy
```

### 5. Start the service

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

The service will be available at `http://localhost:3001`.

---

## Health Check

```
GET /health
→ { "status": "ok", "service": "auth-service" }
```

---

## API Endpoints

| Method | Path                   | Auth Required | Description                  |
|--------|------------------------|---------------|------------------------------|
| POST   | `/auth/signup`         | No            | Register a new user          |
| POST   | `/auth/login`          | No            | Login and receive tokens     |
| POST   | `/auth/refresh`        | No (cookie)   | Rotate refresh token         |
| POST   | `/auth/logout`         | Yes           | Logout current session       |
| POST   | `/auth/session/validate` | Yes         | Validate active session      |
| POST   | `/auth/session/revoke` | Yes           | Revoke all sessions for user |
| POST   | `/auth/forgot-password`| No            | Request password reset link  |
| POST   | `/auth/reset-password` | No            | Reset password with token    |

See [`docs/API.md`](./docs/API.md) for full request/response details.

---

## Docker Infrastructure

The `docker-compose.yaml` spins up:

| Service    | Port(s)          | Credentials          |
|------------|------------------|----------------------|
| PostgreSQL | `5432`           | admin / admin123     |
| Redis      | `6379`           | —                    |
| RabbitMQ   | `5672`, `15672`  | admin / admin123     |

RabbitMQ management UI: `http://localhost:15672`

---

## Prisma Commands

```bash
# Create a new migration after schema changes
npx prisma migrate dev --name <migration_name>

# Apply migrations in production
npx prisma migrate deploy

# Open Prisma Studio (DB GUI)
npx prisma studio

# Regenerate Prisma client
npx prisma generate
```

---

## Project Structure

```
auth-service/
├── config/           # Prisma client & Redis client singletons
├── controllers/      # Route handler functions
├── database/         # DB/Redis/RabbitMQ connection bootstrappers
├── docs/             # Service-level documentation
├── middlewares/      # authenticate, validate, rateLimiter
├── prisma/           # Schema and migrations
├── routes/           # Express router
├── services/         # Core business logic
├── utils/            # hash, tokens, event publisher
├── .env.sample       # Environment variable template
├── docker-compose.yaml
└── index.js          # App entry point
```

---

## Environment Variables Reference

| Variable           | Required | Default                  | Description                        |
|--------------------|----------|--------------------------|------------------------------------|
| `PORT`             | No       | `3001`                   | Port the service listens on        |
| `DATABASE_URL`     | Yes      | —                        | PostgreSQL connection string       |
| `JWT_SECRET`       | Yes      | —                        | Secret for signing JWTs            |
| `JWT_EXPIRES`      | No       | `15m`                    | Access token TTL                   |
| `rabbitMQ_username`| Yes      | —                        | RabbitMQ username                  |
| `rabbitMQ_password`| Yes      | —                        | RabbitMQ password                  |
| `ALLOWED_ORIGINS`  | No       | `http://localhost:3000`  | Comma-separated CORS origins       |
| `NODE_ENV`         | No       | `development`            | `development` or `production`      |
