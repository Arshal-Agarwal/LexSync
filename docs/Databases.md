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