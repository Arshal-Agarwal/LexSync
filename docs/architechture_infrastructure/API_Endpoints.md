# ⚖️ LexSync API Specification

## Auth Service

POST /auth/signup POST /auth/login POST /auth/logout POST /auth/refresh
POST /auth/forgot-password POST /auth/reset-password POST
/auth/verify-email POST /auth/2fa/setup POST /auth/2fa/verify POST
/auth/2fa/disable POST /auth/session/validate POST /auth/session/revoke

## User & Role Service

GET /users POST /users GET /users/{id} PUT /users/{id} PATCH /users/{id}
DELETE /users/{id}

GET /users/{id}/profile PATCH /users/{id}/profile POST
/users/{id}/avatar DELETE /users/{id}/avatar

GET /roles POST /roles GET /roles/{id} PUT /roles/{id} DELETE
/roles/{id}

GET /permissions POST /permissions GET /permissions/{id} PUT
/permissions/{id} DELETE /permissions/{id}

POST /users/{id}/assign-role POST /users/{id}/remove-role

## Case Service

GET /cases POST /cases GET /cases/{id} PUT /cases/{id} PATCH /cases/{id}
DELETE /cases/{id}

## Document Service

GET /documents POST /documents GET /documents/{id} PUT /documents/{id}
PATCH /documents/{id} DELETE /documents/{id}

## Chat Service

GET /chats POST /chats GET /chats/{id} DELETE /chats/{id}

## Scheduler Service

GET /appointments POST /appointments

## Notification Service

GET /notifications POST /notifications

## OCR & NLP Service

POST /ocr GET /ocr/{id}/status GET /ocr/{id}/result

## Search Service

GET /search POST /search

## Audit Service

GET /audit/logs

## Billing Service

GET /billing/invoices POST /billing/invoices

## Client Portal

GET /client/cases GET /client/documents POST /client/documents
