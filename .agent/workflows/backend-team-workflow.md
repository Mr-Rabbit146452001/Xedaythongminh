# Workflow: Backend Software Development Multi-Agent SOP

This Standard Operating Procedure (SOP) coordinates the 7 specialized backend AI agents sequentially and collaboratively to design, build, test, secure, and deploy enterprise-grade backend microservices and APIs.

---

## Phase 1: Product Requirements & Architecture Design
- **Agents Assigned**: `backend-pm` ➔ `backend-architect`
- **Actions**:
  1. Analyze user/business requirements and map into actionable User Stories and API endpoints.
  2. Define API Specifications (REST/OpenAPI/gRPC), data payload schemas, and HTTP status codes.
  3. Design overall architecture (Clean Architecture/DDD/Monolith vs Microservice) and sequence diagrams.
- **Exit Gate**: Technical Architecture Spec and API Contract approved.

---

## Phase 2: Database Schema & Migration Engineering
- **Agent Assigned**: `database-engineer`
- **Actions**:
  1. Create ER diagrams, table schemas, relationships (PK/FK), and constraints.
  2. Write raw SQL migration files (`.sql`) or ORM models (Prisma/Knex/TypeORM/SQLAlchemy).
  3. Set up Redis key-value caching structures and query indexes.
- **Exit Gate**: Database schema migrations tested and verified against target database (PostgreSQL/SQLite/Redis).

---

## Phase 3: Core Logic & API Implementation
- **Agent Assigned**: `backend-developer`
- **Actions**:
  1. Implement controller, service, repository, and middleware layers.
  2. Build REST/gRPC endpoints, Webhooks, payment gateway integrations, and background job queues.
  3. Ensure modularity, solid design patterns, and clean error handling.
- **Exit Gate**: All API endpoints operational and business logic functional.

---

## Phase 4: Security & Authentication Hardening
- **Agent Assigned**: `security-engineer`
- **Actions**:
  1. Audit endpoints for JWT/OAuth2 authentication, RBAC authorization, and input validation (Zod/Joi/Pydantic).
  2. Implement OWASP security hardening (Sanitization, Rate Limiting, CORS, Argon2/Bcrypt hashing, SQLi protection).
  3. Ensure zero hardcoded secrets (`.env` compliance).
- **Exit Gate**: Security audit clean, zero high/critical vulnerability findings.

---

## Phase 5: Quality Assurance & Integration Testing
- **Agent Assigned**: `backend-qa-tester`
- **Actions**:
  1. Write automated integration tests (Jest/Supertest/PyTest) and unit test coverage.
  2. Execute API contract validation, error scenario tests, and edge case checking.
  3. Perform load/stress testing and response latency benchmarks.
- **Exit Gate**: 100% core test suites passing with valid responses and edge-case handling.

---

## Phase 6: Infrastructure & DevOps Delivery
- **Agent Assigned**: `backend-devops`
- **Actions**:
  1. Prepare/update `Dockerfile`, `docker-compose.yml`, and unified runner scripts (`start_all.js`).
  2. Configure reverse proxy (Nginx), HTTPS tunneling (Ngrok), and process execution.
  3. Validate service port listening, health endpoints (`/health`), and environment variable configs.
- **Exit Gate**: Services running smoothly with zero environment or deployment errors.
