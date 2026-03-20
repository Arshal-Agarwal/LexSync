# ⚖️ LexSync – Data Architecture (Storage & Models)

---

# 🧷 PostgreSQL — Relational Tables (Transactional & Structured Data)

## 👤 Users & Roles

| Table Name         | Purpose                                      |
|-------------------|----------------------------------------------|
| users             | User profile, contact info, org mapping      |
| roles             | Global roles (admin, partner, intern)        |
| permissions       | CRUD actions mapped to resources             |
| user_roles        | Users ↔ roles (many-to-many)                 |
| teams             | Named teams (Litigation, Corporate)          |
| team_memberships  | Users assigned to teams                      |
| delegations       | Access delegation (user → user)              |

---

## 🧑‍⚖️ Cases & Assignments

| Table Name            | Purpose                                      |
|----------------------|----------------------------------------------|
| cases                | Case metadata (title, type, jurisdiction)    |
| case_tags            | Tags (urgent, family, GST, etc.)             |
| case_assignees       | Users/teams assigned to cases                |
| case_sections        | Legal sections (IPC, CrPC, etc.)             |
| case_timeline_events | Events (created, filed, hearing, closed)     |
| case_conflicts       | Conflict check results                       |

---

## 📅 Scheduling & Calendar

| Table Name    | Purpose                                      |
|---------------|----------------------------------------------|
| appointments  | Lawyer–client appointments                   |
| court_dates   | Court hearing dates                          |
| availability  | Lawyer availability                          |
| calendar_sync | Google/Outlook integration metadata          |

---

## 🧾 Billing & Time Logging

| Table Name      | Purpose                                      |
|----------------|----------------------------------------------|
| time_logs      | Time tracking (hourly/task-based)            |
| invoices       | Generated invoices per case/user             |
| payments       | Payment status, gateway tracking             |
| billing_configs| Rates, taxes, discounts, overrides           |

---

## 🔔 Notifications & Triggers

| Table Name              | Purpose                                      |
|------------------------|----------------------------------------------|
| notification_templates | Role-based templates                         |
| user_notifications     | In-app notifications + read status           |
| email_logs             | Email history, failures, timestamps          |

---

# 🗂 MongoDB — Flexible Collections (Unstructured / Nested)

| Collection Name   | Purpose                                      |
|------------------|----------------------------------------------|
| documents        | File metadata                                |
| document_versions| Version history (hash, comments)             |
| evidence         | Tagged legal evidence                        |
| access_logs      | File access audit                            |
| ocr_results      | OCR text + confidence                        |
| conversations    | Chat threads                                 |
| messages         | Chat messages                                |
| attachments      | Chat file references                         |
| audit_logs       | User/case action logs                        |

---

# 🔍 ElasticSearch — Search Indexes

| Index Name          | Purpose                                      |
|--------------------|----------------------------------------------|
| documents_index    | Full-text search                             |
| clauses_index      | NLP-tagged clauses/snippets                  |
| precedents_index   | Prior cases, legal arguments                 |
| ocr_text_index     | OCR searchable content                       |
| search_logs        | (Optional) Search activity tracking          |

---

# 🧠 Redis — Keyspaces / Patterns

| Key Pattern                | Purpose                                      |
|---------------------------|----------------------------------------------|
| acl:user:{userId}         | Cached ACL permissions                       |
| session:{tokenId}         | Session / refresh tokens                     |
| chat:stream:{caseId}      | Real-time chat streams                       |
| notifications:{userId}    | Notification queue                           |
| rate_limit:{ip}           | API rate limiting                            |
| otp:{userId}              | OTP / temporary auth                         |

---

# 🗃 Audit & Analytics (PostgreSQL / ClickHouse)

| Table Name     | Purpose                                      |
|----------------|----------------------------------------------|
| audit_logs     | Immutable logs (view/edit/download)          |
| user_activity  | Login/logout/IP/device tracking              |
| api_traces     | API usage patterns                           |

---

# 📦 Object Storage

| Storage        | Purpose                                      |
|----------------|----------------------------------------------|
| S3 / GridFS    | File storage (documents, attachments)        |

---

# 📊 System Overview

| Storage        | Approx Models | Notes                                      |
|----------------|--------------|--------------------------------------------|
| PostgreSQL     | ~25          | Structured core logic (RBAC, cases, billing) |
| MongoDB        | ~10          | Documents, chat, audit                     |
| ElasticSearch  | ~4–5         | Search indexing                            |
| Redis          | ~6 patterns  | Caching, real-time                         |
| Kafka          | ~5 topics    | Events, OCR, notifications                 |
| S3/GridFS      | 1 bucket     | File storage                               |

---

# Audit Logs

audit_logs
- id
- user_id
- team_id        ← VERY IMPORTANT
- org_id         ← optional (future multi-tenant)
- action
- resource_type
- resource_id
- timestamp

# Auth

Postgres

users
- id (uuid)
- email (unique)
- password_hash
- is_verified
- created_at
- updated_at
- revoked boolean default flase

refresh_tokens

- id
- user_id
- token_hash
- expires_at
- created_at

Redis

Refresh_token

key: refresh:<token_hash>
value: user_id
TTL: expires_at

Blacklist

key: blacklist:<token_hash>
value: true
TTL: remaining_token_lifetime

## Token payload

{
  "iss": "lexsync-auth",        // issuer (Auth Service)
  "sub": "user_id",             // subject (unique user id)
  "aud": "lexsync-api",         // audience (your services)

  "iat": 1710000000,            // issued at (timestamp)
  "exp": 1710000900,            // expiry (short-lived)

  "jti": "uuid-token-id",       // unique token id (for blacklist)

  "roles": ["lawyer"],          // RBAC roles
  "team_id": "team_123",        // team context
  "org_id": "org_456"           // future multi-tenant support
}