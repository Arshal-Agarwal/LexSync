Folder Structure

LexSync/
│
├── database/
├── gateway-api/                     # API Gateway (Routing, Auth check, Rate limiting)
├── auth-service/                   # Authentication, JWT, OAuth2
├── user-service/                   # User profiles, roles, leadership, team mgmt
├── case-service/                   # Core case data, tags, assignments
├── document-service/              # File uploads, metadata, access control
├── ocr-service/                   # OCR (Tesseract/OpenCV), PDF/Image parsing
├── chat-service/                  # WebSocket-based client-lawyer chat
├── appointment-service/           # Scheduling, reminders, calendar sync
├── search-service/                # Elasticsearch + NLP-based legal doc search
├── audit-log-service/             # Kafka-based audit trails for compliance
├── notification-service/          # Email/SMS/Push alerts
├── analytics-service/             # Reporting, dashboard stats, usage tracking
├── gateway-logs/                  # Centralized logs from all services (ELK/EFK stack)
├── config-service/                # Centralized config server (e.g., using Spring Cloud)
│
├── shared-libs/                   # Shared utilities (DTOs, validation, middleware)
│
├── deployments/                   # K8s manifests / Docker Compose files
│   ├── dev/
│   ├── staging/
│   └── prod/
│
├── infra/                         # Terraform, Ansible, Infra-as-code
│
├── docs/                          # Architecture diagrams, API docs, ADRs
├── .github/                       # GitHub actions (CI/CD pipelines)
├── docker-compose.yml
├── README.md
└── package.json / pom.xml         # If using monorepo tooling
