# 🔐 Backend Security Checklist

## 1. Transport Layer Security

-   Use HTTPS (TLS 1.2 or 1.3)
-   Enforce HSTS
-   Disable HTTP in production

## 2. Authentication & Authorization

-   JWT (Access + Refresh tokens) or OAuth2
-   Short-lived tokens
-   Refresh token rotation
-   RBAC

## 3. Don't Trust the Frontend

-   Validate all input
-   Enforce permissions server-side

## 4. Input Validation & Sanitization

-   Prevent SQL Injection, XSS
-   Use Joi, Zod, Yup
-   Use parameterized queries

## 5. Database Security

### Passwords

-   bcrypt / argon2 \### Sensitive Data
-   AES-256 encryption at rest

## 6. Rate Limiting

-   IP-based and user-based limits
-   Use Redis + middleware

## 7. API Security

-   API keys (internal)
-   mTLS
-   Request signing (optional)

## 8. Security Headers

-   CSP
-   X-Frame-Options
-   X-Content-Type-Options
-   X-XSS-Protection

## 9. CORS

-   Restrict origins
-   Avoid wildcard (\*)

## 10. Logging & Monitoring

-   Log suspicious activity
-   Use ELK / Grafana / Datadog

## 11. Secrets Management

-   No hardcoding
-   Use .env (dev)
-   Use Vault / AWS Secrets Manager (prod)

## 12. Dependency Scanning

-   npm audit
-   Snyk / Dependabot

## 13. CSRF Protection

-   CSRF tokens or SameSite cookies

## 14. Session Security

-   HttpOnly, Secure, SameSite cookies

## 15. Microservices Security

-   mTLS or signed tokens
-   Secure Kafka/RabbitMQ
-   Zero-trust architecture
