# 🛡️ Security Hardening Guide

This document covers **production-level protections** for:
- SQL Injection
- Brute Force Attacks
- Authentication & API Security

---

# 🔐 1. SQL Injection Prevention

## ✅ Use Parameterized Queries (MANDATORY)

❌ Bad:
```js
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

✅ Good:
```js
const query = "SELECT * FROM users WHERE email = $1";
await db.query(query, [email]);
```

---

## ✅ Use ORM / Query Builder

Recommended:
- Prisma
- Sequelize
- Knex

---

## 🧱 Input Validation

- Validate schema (Zod / Joi)
- Reject unexpected fields
- Enforce strict types

---

## 🔒 Database-Level Security

- Use least privilege DB user
- Disable multi-statements
- Separate read/write roles

---

# 🔐 2. Brute Force Protection

## 🚫 Rate Limiting

- Limit login attempts per IP
- Example:
  - 5 requests per minute

---

## 🔁 Account Locking

- 5 failed attempts → 15 min lock
- Exponential backoff:
  - 5 → 5 min
  - 10 → 30 min

---

## 🔐 Password Storage

- Use bcrypt
- Cost factor: 10–12

```js
const hash = await bcrypt.hash(password, 12);
```

---

## 🧠 Detection Signals

Track:
- IP address
- Device fingerprint
- Location anomalies

---

## 🧩 CAPTCHA (Optional)

- Trigger after multiple failures

---

# 🔑 3. Authentication Security

## 🎟️ Token Strategy

- Access Token: 15 min expiry
- Refresh Token: stored in httpOnly cookie

---

## 🔄 Refresh Token Rotation

- Issue new token on refresh
- Invalidate old token

---

## 🍪 Cookie Security

- httpOnly = true
- secure = true
- sameSite = strict

---

# 🌐 4. API Security

## 🧱 Input Validation Layer

- Zod / Joi validation
- Reject oversized payloads

---

## 🚫 Mass Assignment Protection

❌ Bad:
```js
User.create(req.body)
```

✅ Good:
```js
User.create({
  email: req.body.email,
  password: req.body.password
})
```

---

## 🛡️ HTTP Security Headers

Use Helmet:
- XSS protection
- Clickjacking prevention

---

# 🔥 5. Other Critical Attacks

## 🧨 XSS

- Escape output
- Use CSP headers

---

## 🔁 CSRF

- Use CSRF tokens
- SameSite cookies

---

## 📦 DoS / DDoS

- Rate limiting
- Load balancer

---

## 🧬 GraphQL Attacks

- Depth limiting
- Query cost analysis

---

# 🧠 6. Microservices Security

## 🧩 API Gateway

- Centralized auth
- Rate limiting
- Logging

---

## 📡 Internal Communication

- Private network only
- JWT or mTLS between services

---

## 📩 Messaging Reliability

- Avoid pub/sub for critical flows
- Use queues (RabbitMQ / Kafka)

---

# 🧪 7. Monitoring & Logging

- Log failed logins
- Detect anomalies
- Use ELK stack

---

# ✅ Final Checklist

- [ ] Parameterized queries everywhere
- [ ] Rate limiting enabled
- [ ] Passwords hashed (bcrypt)
- [ ] Tokens secured in cookies
- [ ] Input validation enforced
- [ ] API gateway configured
- [ ] Monitoring enabled

---

# 🚀 Next Steps

- Implement auth service with these rules
- Add Redis for rate limiting
- Introduce API gateway later

---

**End of Document**

