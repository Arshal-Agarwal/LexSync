# Auth Service — Technical Documentation

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Models](#data-models)
3. [API Reference](#api-reference)
4. [Authentication Flow](#authentication-flow)
5. [Token Strategy](#token-strategy)
6. [Session Management](#session-management)
7. [Security Measures](#security-measures)
8. [Event Publishing](#event-publishing)
9. [Middleware Reference](#middleware-reference)
10. [Utility Reference](#utility-reference)
11. [Configuration Reference](#configuration-reference)
12. [Error Handling](#error-handling)

---

## Architecture Overview

The auth service is a standalone Node.js microservice responsible for the full authentication lifecycle within LexSync. It connects to three external systems:

```
Client
  │
  ▼
Express App (index.js)
  │
  ├── Middlewares (Helmet, CORS, Rate Limiter, Cookie Parser)
  │
  ├── Routes (/auth/*)
  │     └── Controllers → Services
  │
  ├── PostgreSQL (via Prisma)   — persistent user & token storage
  ├── Redis                     — token cache + access token blacklist
  └── RabbitMQ                  — async event publishing
```

On startup, the service sequentially connects to Postgres, Redis, and RabbitMQ before accepting traffic.

---

## Data Models

### `users` table

| Column          | Type      | Notes                          |
|-----------------|-----------|--------------------------------|
| `id`            | UUID (PK) | Auto-generated                 |
| `email`         | String    | Unique, indexed                |
| `password_hash` | String    | bcrypt, 12 salt rounds         |
| `is_verified`   | Boolean   | Default `false`                |
| `revoked`       | Boolean   | Default `false`; blocks login  |
| `created_at`    | DateTime  | Auto-set                       |
| `updated_at`    | DateTime  | Auto-updated                   |

### `refresh_tokens` table

| Column       | Type      | Notes                                  |
|--------------|-----------|----------------------------------------|
| `id`         | UUID (PK) | Auto-generated                         |
| `user_id`    | UUID (FK) | References `users.id`, cascade delete  |
| `token_hash` | String    | SHA-256 hash of the raw token; unique  |
| `expires_at` | DateTime  | 7 days from issuance                   |
| `created_at` | DateTime  | Auto-set                               |

> Raw refresh tokens are **never stored**. Only their SHA-256 hash is persisted.

---

## API Reference

All auth routes are prefixed with `/auth`.

---

### `POST /auth/signup`

Register a new user account.

**Rate limit:** 5 requests / minute per IP

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "minEightChars"
}
```

**Validation rules:**
- `email`: valid email format, max 255 chars
- `password`: min 8, max 128 chars

**Responses:**

| Status | Body                                      |
|--------|-------------------------------------------|
| 201    | `{ "message": "Account created", "userId": "<uuid>" }` |
| 400    | `{ "error": ["<validation messages>"] }`  |
| 409    | `{ "error": "Email already registered" }` |

**Side effect:** Publishes `auth.user.created` event to RabbitMQ.

---

### `POST /auth/login`

Authenticate a user and issue tokens.

**Rate limit:** 5 requests / minute per IP

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "yourPassword"
}
```

**Responses:**

| Status | Body / Cookie                                                  |
|--------|----------------------------------------------------------------|
| 200    | `{ "accessToken": "<jwt>", "expiresAt": "<ISO date>" }` + `Set-Cookie: refreshToken=<uuid>; HttpOnly; SameSite=Strict` |
| 401    | `{ "error": "Invalid credentials" }`                          |

**Cookie attributes:**
- `HttpOnly` — not accessible via JavaScript
- `Secure` — HTTPS only in production
- `SameSite=Strict`
- `Max-Age` — 7 days

**Side effect:** Publishes `auth.user.login` event.

---

### `POST /auth/refresh`

Rotate the refresh token and issue a new access token.

**Rate limit:** 5 requests / minute per IP

**Requires:** `refreshToken` cookie (set automatically on login)

**Responses:**

| Status | Body / Cookie                                                  |
|--------|----------------------------------------------------------------|
| 200    | `{ "accessToken": "<jwt>", "expiresAt": "<ISO date>" }` + new `refreshToken` cookie |
| 401    | `{ "error": "Invalid or expired refresh token" }`             |

**Rotation behavior:** The old refresh token is deleted from both Postgres and Redis. A new token pair is issued atomically.

---

### `POST /auth/logout`

**Auth required:** `Authorization: Bearer <accessToken>`

Invalidates the current session.

**Responses:**

| Status | Body                      |
|--------|---------------------------|
| 200    | `{ "message": "Logged out" }` |
| 401    | `{ "error": "Missing token" }` |

**What happens:**
1. Refresh token deleted from Postgres and Redis.
2. Access token's `jti` is added to the Redis blacklist with TTL equal to remaining token lifetime.
3. `refreshToken` cookie is cleared.

**Side effect:** Publishes `auth.user.logout` event.

---

### `POST /auth/session/validate`

**Auth required:** `Authorization: Bearer <accessToken>`

Confirms the session is still active.

**Responses:**

| Status | Body                              |
|--------|-----------------------------------|
| 200    | `{ "valid": true, "userId": "<uuid>" }` |
| 401    | `{ "error": "Session invalid" }`  |

---

### `POST /auth/session/revoke`

**Auth required:** `Authorization: Bearer <accessToken>`

Revokes **all** sessions for the authenticated user (force logout everywhere).

**Responses:**

| Status | Body                              |
|--------|-----------------------------------|
| 200    | `{ "message": "All sessions revoked" }` |
| 401    | `{ "error": "Missing token" }`    |

**What happens:**
1. All `RefreshToken` rows for the user are deleted.
2. User's `revoked` flag is set to `true` in Postgres.
3. All refresh token Redis keys are deleted.
4. `refreshToken` cookie is cleared.

**Side effect:** Publishes `auth.user.revoked` event.

---

### `POST /auth/forgot-password`

**Rate limit:** 5 requests / minute per IP

**Request body:**
```json
{ "email": "user@example.com" }
```

**Response (always 200 to prevent email enumeration):**
```json
{ "message": "If that email exists, a reset link was sent." }
```

> Full implementation pending.

---

### `POST /auth/reset-password`

**Rate limit:** 5 requests / minute per IP

**Request body:**
```json
{
  "token": "<reset_token>",
  "password": "newPassword123"
}
```

> Full implementation pending.

---

## Authentication Flow

### Signup → Login → Refresh → Logout

```
1. POST /auth/signup
   └── Hash password (bcrypt, 12 rounds)
   └── Create user in Postgres
   └── Publish auth.user.created

2. POST /auth/login
   └── Verify password against hash
   └── Generate JWT access token (15m TTL, includes jti, sub, roles)
   └── Generate UUID refresh token
   └── Store SHA-256(refreshToken) in Postgres + Redis (7d TTL)
   └── Return accessToken in body, refreshToken in HttpOnly cookie

3. POST /auth/refresh  (before access token expires)
   └── Read refreshToken from cookie
   └── SHA-256 hash it → look up in Redis (fast path)
   └── Verify against Postgres record + expiry
   └── Delete old token (rotation)
   └── Issue new token pair

4. POST /auth/logout
   └── Delete refresh token from Postgres + Redis
   └── Blacklist access token jti in Redis (TTL = remaining lifetime)
   └── Clear cookie
```

---

## Token Strategy

### Access Token (JWT)

```json
{
  "iss": "lexsync-auth",
  "sub": "<userId>",
  "aud": "lexsync-api",
  "jti": "<uuid>",
  "roles": [],
  "team_id": null,
  "org_id": null,
  "iat": 1234567890,
  "exp": 1234568790
}
```

- Default TTL: **15 minutes** (configurable via `JWT_EXPIRES`)
- Verified with `audience` and `issuer` checks
- Revoked via Redis blacklist on logout (keyed by `jti`)

### Refresh Token

- A raw UUID v4 — never stored in plaintext
- Stored as `SHA-256(token)` in both Postgres and Redis
- TTL: **7 days**
- Rotated on every use (old token deleted, new one issued)
- Delivered exclusively via `HttpOnly` cookie

---

## Session Management

| Action              | Postgres                        | Redis                                  |
|---------------------|---------------------------------|----------------------------------------|
| Login               | Insert `RefreshToken` row       | `SET refresh:<hash> <userId> EX 604800`|
| Refresh             | Delete old row, insert new row  | Delete old key, set new key            |
| Logout              | Delete `RefreshToken` row       | Delete refresh key, set blacklist key  |
| Revoke all sessions | Delete all rows, set `revoked=true` | Delete all refresh keys            |

Redis is used as a **fast-path cache** for refresh token lookups. Postgres is the source of truth.

---

## Security Measures

| Measure                  | Implementation                                              |
|--------------------------|-------------------------------------------------------------|
| Password hashing         | bcrypt with 12 salt rounds                                  |
| Refresh token storage    | SHA-256 hash only — raw token never persisted               |
| Access token revocation  | Redis blacklist keyed by `jti`                              |
| Refresh token rotation   | Old token deleted on every use                              |
| HttpOnly cookies         | Refresh token inaccessible to JavaScript                    |
| Secure cookies           | HTTPS-only in production                                    |
| Rate limiting (auth)     | 5 req/min per IP on all auth endpoints                      |
| Rate limiting (general)  | 60 req/min per IP globally                                  |
| Input validation         | Joi schemas — strips unknown fields, validates types/length |
| Security headers         | Helmet (CSP, HSTS, X-Frame-Options, etc.)                   |
| CORS                     | Restricted to `ALLOWED_ORIGINS` env variable                |
| Payload size limit       | `express.json({ limit: '10kb' })`                           |
| Credential error messages| Generic "Invalid credentials" — no user enumeration        |

---

## Event Publishing

Events are published to the `lexsync.events` RabbitMQ topic exchange with `persistent: true`.

| Routing Key            | Trigger                  | Payload                        |
|------------------------|--------------------------|--------------------------------|
| `auth.user.created`    | Successful signup        | `{ userId, email }`            |
| `auth.user.login`      | Successful login         | `{ userId }`                   |
| `auth.user.logout`     | Logout                   | `{ userId }`                   |
| `auth.user.revoked`    | All sessions revoked     | `{ userId }`                   |

Publishing failures are caught and logged — they do not interrupt the HTTP response.

---

## Middleware Reference

### `authenticate`

Validates the `Authorization: Bearer <token>` header.

1. Extracts and verifies the JWT (audience + issuer checks).
2. Checks Redis blacklist for the token's `jti`.
3. Attaches the decoded payload to `req.user`.

### `validate(schemaName)`

Joi-based request body validation. Available schemas:

| Schema name      | Fields validated                  |
|------------------|-----------------------------------|
| `signup`         | `email`, `password`               |
| `login`          | `email`, `password`               |
| `forgotPassword` | `email`                           |
| `resetPassword`  | `token`, `password`               |

Returns `400` with an array of error messages on failure.

### `authLimiter`

`express-rate-limit` — 5 requests per minute per IP. Applied to all `/auth/*` mutation endpoints.

### `generalLimiter`

`express-rate-limit` — 60 requests per minute per IP. Applied globally.

---

## Utility Reference

### `utils/tokens.js`

| Function                  | Description                                              |
|---------------------------|----------------------------------------------------------|
| `generateAccessToken(user)` | Signs a JWT with user claims, `jti`, issuer, audience  |
| `generateRefreshToken()`  | Returns a UUID v4 string                                 |
| `verifyAccessToken(token)`| Verifies JWT with audience + issuer; throws on failure   |

### `utils/hash.js`

| Function                        | Description                                  |
|---------------------------------|----------------------------------------------|
| `hashPassword(password)`        | bcrypt hash, 12 rounds                       |
| `comparePassword(password, hash)` | bcrypt compare                             |
| `hashToken(token)`              | SHA-256 hex digest of a string               |

### `utils/publisher.js`

| Function                          | Description                                         |
|-----------------------------------|-----------------------------------------------------|
| `publishEvent(routingKey, payload)` | Publishes JSON payload to `lexsync.events` exchange |

---

## Configuration Reference

### `config/prisma.js`

Exports a singleton `PrismaClient` with `error` and `warn` logging enabled.

### `config/redis.js`

Exports `getRedis()` — lazy singleton that connects on first call with exponential reconnect backoff (capped at 3s).

---

## Error Handling

All controllers follow this pattern:

```js
try {
  // ...
} catch (err) {
  res.status(err.status || 500).json({ error: err.message });
}
```

Service-layer errors are thrown as plain objects `{ status, message }`. Unhandled errors fall back to `500`.

Validation errors return `400` with an array of Joi messages.

---

## File Structure

```
auth-service/
├── config/
│   ├── prisma.js              # Prisma singleton
│   └── redis.js               # Redis singleton (lazy connect)
├── controllers/
│   └── authController.js      # HTTP handlers (signup, login, refresh, logout, ...)
├── database/
│   ├── connectDB.js           # Postgres bootstrap
│   ├── connectRedis.js        # Redis bootstrap
│   └── connectRabbitMQ.js     # RabbitMQ bootstrap + channel accessor
├── docs/
│   ├── API.md                 # This file
│   ├── docker_commands.md
│   └── prisma_commands.md
├── middlewares/
│   ├── authenticate.js        # JWT verification + blacklist check
│   ├── rateLimiter.js         # authLimiter + generalLimiter
│   └── validate.js            # Joi validation middleware factory
├── prisma/
│   ├── schema.prisma          # Data model
│   └── migrations/            # Migration history
├── routes/
│   └── authRoutes.js          # Express router
├── services/
│   └── authService.js         # Business logic (signup, login, refresh, logout, ...)
├── utils/
│   ├── hash.js                # bcrypt + SHA-256 helpers
│   ├── publisher.js           # RabbitMQ event publisher
│   └── tokens.js              # JWT generate + verify
├── .env.sample                # Environment variable template
├── .gitignore
├── docker-compose.yaml        # Postgres + Redis + RabbitMQ
├── index.js                   # App entry point
├── package.json
└── README.md
```
