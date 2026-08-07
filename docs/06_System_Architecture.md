# System Architecture
# AI-Native Operations Platform — Internal Architecture Document

**Status:** Draft v1
**Scope:** MVP through Phase 2 (post-MVP AI integration)
**Audience:** Solo/small student engineering team, 6–8 month build

---

## 0. Framing

This document treats the system the way a platform team would: the *organization* is the tenant, *members* belong to organizations, and every domain module (finance, payments, expenses, reports, OCR) operates on top of that tenancy boundary. Clubs are simply the first tenant type — nothing in the schema, API, or module boundaries should hardcode "club." Where a decision could go two ways, the reasoning is given so you can defend it in an interview, not just follow it.

---

## 1. High-Level Architecture

### 1.1 Component overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                         │
│              React + TypeScript + Tailwind (Vite/Next)           │
│  - Auth session (Supabase JS client)                             │
│  - API calls via typed fetch/axios client                        │
└───────────────────────────┬───────────────────────────────────────┘
                             │ HTTPS (JSON, Bearer JWT)
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION SERVER (Render)                   │
│                         FastAPI (Python)                         │
│                                                                    │
│  ┌───────────────┐  ┌────────────────┐  ┌─────────────────────┐   │
│  │ Presentation  │→│  Application    │→│      Domain         │   │
│  │  (routers)    │  │ (services/use  │  │ (entities, business │   │
│  │               │  │  cases)        │  │  rules)             │   │
│  └───────────────┘  └────────────────┘  └─────────────────────┘   │
│                             │                                     │
│                             ▼                                     │
│                   ┌────────────────────┐                          │
│                   │  Infrastructure     │                          │
│                   │  (repositories,     │                          │
│                   │  Supabase client,   │                          │
│                   │  storage, OCR)      │                          │
│                   └──────────┬──────────┘                          │
└──────────────────────────────┼──────────────────────────────────┘
                                │
              ┌─────────────────┼───────────────────┐
              ▼                 ▼                   ▼
     ┌────────────────┐ ┌───────────────┐  ┌──────────────────┐
     │  PostgreSQL     │ │ Supabase      │  │  Supabase Auth    │
     │  (Supabase)     │ │ Storage       │  │  (JWT issuer)     │
     │  - RLS enabled  │ │ (receipts,    │  │                    │
     │  - audit tables │ │  documents)   │  │                    │
     └────────────────┘ └───────────────┘  └──────────────────┘
```

### 1.2 Request flow — browser to database

1. **Browser** sends a request with a Supabase-issued JWT in the `Authorization` header.
2. **FastAPI dependency** (`get_current_user`) validates the JWT signature against Supabase's JWKS, extracts `user_id` and `org_id` claims.
3. **Router** (presentation layer) parses/validates the request body against a Pydantic schema, delegates to a **service** — routers contain no business logic, only HTTP concerns (status codes, request/response shaping).
4. **Service** (application layer) orchestrates the use case: checks authorization rules, calls one or more **repositories**, applies domain logic, returns a domain result.
5. **Repository** (infrastructure layer) executes the actual SQL/Supabase client call, mapped through an interface so the service never talks to Postgres directly.
6. **PostgreSQL** enforces **Row Level Security** as a second, database-level authorization layer — even if a service-layer bug leaks a query, RLS stops cross-org data access.
7. Response flows back up: repository → service → router → Pydantic response model → JSON to browser.

**Why this matters:** the reason to separate router/service/repository isn't ceremony — it's that you can unit-test the service layer with a fake repository (no DB needed), and you can swap Supabase for self-hosted Postgres later by rewriting only the infrastructure layer.

---

## 2. Layered Architecture

| Layer | Responsibility | Must NOT do |
|---|---|---|
| **Presentation** (`routers/`) | HTTP concerns: parse request, validate shape, call service, map result to response schema, set status codes | Contain business rules, talk to the DB directly |
| **Application** (`services/`) | Orchestrate use cases: "approve expense," "generate monthly report." Enforces authorization decisions, coordinates multiple repositories/domain objects, manages transactions | Know about HTTP (no `Request`/`Response` objects), know about SQL |
| **Domain** (`domain/`) | Core business entities and rules that are true regardless of framework: what makes an expense "valid," what states a payment can transition through | Depend on FastAPI, Supabase, or any infrastructure detail |
| **Infrastructure** (`repositories/`, `integrations/`) | Talk to Postgres, Supabase Storage, OCR engine, email/notification providers. Implements interfaces defined by the application layer | Contain business logic or authorization decisions |

**Dependency rule:** dependencies point inward. Presentation depends on Application, Application depends on Domain, Infrastructure implements interfaces that Application defines. Domain depends on nothing. This is what lets you unit test services against a fake repository and swap Postgres for something else without touching business logic — this is the actual, defensible reason to do Clean Architecture on a solo project, not "it's what companies do."

---

## 3. Module Architecture

```
app/
├── auth/            # Session validation, JWT parsing, current-user dependency
├── organizations/   # Org creation, membership, org-level settings, invites
├── members/         # User profile within an org, roles, permissions
├── finance/         # Budgets, ledgers, financial summaries — aggregates expenses+income
├── expenses/         # Expense CRUD, categorization, approval workflow
├── income/           # Income entries (dues, sponsorships, grants)
├── payments/         # Payment records, linking to expenses/income, reconciliation
├── receipts/          # Receipt upload, storage linkage, OCR trigger + verification
├── ocr/              # OCR engine wrapper, field extraction, confidence scoring
├── reports/           # Report generation (aggregation over finance data), export
├── notifications/    # In-app + email notification dispatch
├── audit/            # Audit log writer, queryable audit trail
└── shared/            # Cross-cutting: base repository, pagination, error types, DTOs
```

**Module responsibility boundaries (why each exists as its own module, not folded into another):**

- **`organizations` vs `members`**: an org is the tenant boundary; members is the many-to-many join with role data. Separating them means you can later add org-level billing/settings without touching membership logic, and vice versa.
- **`finance` vs `expenses`/`income`**: `finance` is a read-oriented aggregation module (budgets, balances, summaries) that *depends on* `expenses` and `income` but doesn't own their CRUD. This avoids a "God module" that both writes transactions and computes rollups — a very common source of tangled logic in student projects.
- **`receipts` vs `ocr`**: `receipts` owns the upload/storage/verification workflow; `ocr` is a stateless extraction service `receipts` calls. This boundary is what lets you swap PaddleOCR for a different engine later by touching one module.
- **`audit`**: deliberately separate and write-only from every other module's perspective — other modules call `audit.log(...)`, they never read from it directly. This keeps audit trail integrity independent of business logic bugs elsewhere.
- **`shared`**: only cross-cutting primitives (pagination helpers, base repository class, common exceptions, DTO base classes). If you find yourself importing a *business* concept from `shared`, that's a signal a boundary is wrong.

---

## 4. Folder Structure

### Backend (FastAPI)

```
backend/
├── app/
│   ├── main.py                    # FastAPI app instantiation, router registration
│   ├── config.py                  # Settings (env vars via pydantic-settings)
│   ├── dependencies.py            # Shared DI: get_current_user, get_db_session
│   │
│   ├── auth/
│   │   ├── router.py              # /auth endpoints (if any beyond Supabase-managed)
│   │   ├── service.py
│   │   └── schemas.py             # Pydantic request/response models
│   │
│   ├── organizations/
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── repository.py
│   │   ├── domain.py              # Organization entity + business rules
│   │   └── schemas.py
│   │
│   ├── expenses/
│   │   ├── router.py
│   │   ├── service.py
│   │   ├── repository.py
│   │   ├── domain.py
│   │   └── schemas.py
│   │
│   ├── ocr/
│   │   ├── service.py             # Orchestrates extraction
│   │   ├── engine.py              # PaddleOCR wrapper (swappable)
│   │   └── schemas.py
│   │
│   ├── shared/
│   │   ├── base_repository.py
│   │   ├── exceptions.py
│   │   ├── pagination.py
│   │   └── dto.py
│   │
│   └── db/
│       ├── session.py             # DB connection/session management
│       └── migrations/            # Alembic migrations
│
├── tests/
│   ├── unit/                      # Service-layer tests with fake repositories
│   ├── integration/               # Repository tests against a test DB
│   └── e2e/                       # Full API tests
│
├── pyproject.toml
└── alembic.ini
```

**Why per-module `router/service/repository/domain/schemas`, not per-layer top-level folders:** grouping by feature (vertical slice) rather than by layer (horizontal slice — one giant `routers/` folder for the whole app) means when you're working on expenses, everything relevant is in one place. This scales much better for a solo developer than hunting across `routers/`, `services/`, `models/` top-level folders for everything related to one feature.

### Frontend (React + TS)

```
frontend/
├── src/
│   ├── app/                       # Routing, layout shells
│   ├── features/
│   │   ├── expenses/
│   │   │   ├── components/
│   │   │   ├── hooks/             # useExpenses, useCreateExpense
│   │   │   ├── api.ts             # Typed API calls for this feature
│   │   │   └── types.ts
│   │   ├── receipts/
│   │   └── reports/
│   ├── shared/
│   │   ├── components/            # Buttons, tables, modals (design system)
│   │   ├── api/                   # Base fetch client, auth header injection
│   │   ├── hooks/
│   │   └── types/
│   ├── lib/                       # Supabase client init, utility functions
│   └── styles/
├── tests/
└── vite.config.ts
```

Same rationale: feature-based (`features/expenses`) beats type-based (`components/`, `hooks/`, `api/` all flat) once the app grows past a handful of screens.

---

## 5. Clean Architecture Details

- **Dependency flow:** Router → Service (depends on a Repository *interface*, not a concrete class) → Domain entities. Infrastructure (concrete repository using Supabase client) implements that interface at the outer edge. In Python, this is usually done with a `Protocol` or abstract base class rather than heavy DI frameworks.
- **Interfaces:** e.g. `ExpenseRepositoryInterface` (Protocol) defines `get_by_id`, `list_by_org`, `create`, `update`. `SupabaseExpenseRepository` implements it. The `ExpenseService` only ever type-hints against the interface.
- **Services:** hold orchestration logic — e.g. `ExpenseService.approve_expense()` checks the requester's role (via `MembersService`), updates status, writes an audit log entry, triggers a notification — coordinating multiple repositories in one transaction boundary.
- **Repositories:** one per aggregate root (Organization, Expense, Payment, Receipt), each responsible only for persistence of that entity, no business rules.
- **DTOs:** Pydantic schemas at the API boundary (`ExpenseCreateRequest`, `ExpenseResponse`) are *not* the same class as domain entities. This decoupling means changing your API's public shape doesn't force changes to internal domain logic, and vice versa — small overhead now, real payoff once the API has external consumers.
- **Dependency injection:** FastAPI's built-in `Depends()` is sufficient — no need for a heavier DI container. `get_expense_service` depends on `get_expense_repository` depends on `get_db_session`, wired via `Depends()` chains. This is idiomatic FastAPI and avoids over-engineering.

---

## 6. Database Design Strategy

*(Boundaries and strategy, not table definitions — as requested.)*

- **Entity boundaries:** `Organization` is the tenant root. `Member` is a join entity between `User` and `Organization` carrying `role`. `Expense`, `Income`, `Payment`, `Receipt` all belong to exactly one `Organization` (foreign key, never nullable) — this single FK is what makes multi-tenancy enforceable both in application code and in RLS policies.
- **Relationships:** Expenses and Payments are related but distinct — a Payment can *settle* an Expense (one-to-many or many-to-many via a join table, since partial payments and split payments are realistic even for a club). Receipts belong to a Payment or Expense (polymorphic association, or two nullable FKs with a check constraint — pick one and document why; a check-constrained dual-FK is usually easier to query than a polymorphic pattern in Postgres).
- **Transaction handling:** any operation that touches more than one table (e.g., "approve expense" which updates status *and* writes an audit row *and* may create a notification) must run inside a single DB transaction at the service layer, so partial failures don't leave inconsistent state.
- **Audit strategy:** a single append-only `audit_log` table (actor, org, entity type, entity id, action, before/after snapshot as JSONB, timestamp) rather than per-table audit columns — one strategy to maintain, one place to query "what happened to this org."
- **Soft deletes:** use a `deleted_at` nullable timestamp rather than hard deletes on financial records — you never want to actually lose expense history, and soft-deleted rows still support audit and "undo" workflows. Hard deletes are fine for genuinely ephemeral data (draft entries never submitted).
- **Indexes:** every foreign key (`org_id`, `created_by`, etc.) needs an index since nearly every query filters by organization; add a composite index on `(org_id, created_at)` for the common "recent expenses for this org" query pattern once you have real query patterns to optimize.
- **Future scalability:** because every table carries `org_id`, sharding by organization (if you ever needed it) or migrating a heavy tenant to dedicated infrastructure is a mechanical exercise, not a redesign. This is the actual payoff of taking multi-tenancy seriously from day one even while your only tenant is one club.

---

## 7. API Design Strategy

- **REST conventions:** resource-oriented URLs (`/organizations/{org_id}/expenses`, not `/getExpenses`). Nesting reflects ownership (expenses belong to an org) but avoid nesting more than two levels deep — use query params instead (`/expenses?org_id=...&status=pending`) once nesting gets unwieldy.
- **Naming:** plural nouns for collections (`/expenses`), snake_case for JSON fields (matches Python/Postgres convention, avoids a translation layer) — document this choice explicitly since camelCase is more common in JS-land and your frontend team (you) needs to know which convention wins.
- **Versioning:** prefix with `/api/v1/` from day one — costs nothing now, avoids a painful migration if you ever need a breaking change with external consumers.
- **Response format:** a consistent envelope, e.g. `{ "data": ..., "meta": {...} }` for success and `{ "error": { "code": ..., "message": ..., "details": [...] } }` for failures — makes frontend error handling uniform instead of ad hoc per-endpoint.
- **Error handling:** FastAPI exception handlers mapping domain exceptions (`ExpenseNotFoundError`, `UnauthorizedActionError`) to consistent HTTP status codes (404, 403) and the error envelope above — services raise domain exceptions, never HTTPException directly, keeping the service layer framework-agnostic.
- **Validation:** Pydantic schemas at the router boundary handle shape/type validation; business-rule validation (e.g. "expense amount must not exceed remaining budget") lives in the service/domain layer, not in Pydantic validators — keeps business rules testable independent of FastAPI.
- **Pagination:** cursor-based for anything that could grow unbounded (expense lists), offset-based is fine for small bounded lists (org members) — document which endpoints use which and why.
- **Filtering/sorting:** consistent query param conventions (`?status=pending&sort=-created_at`) applied via a shared query-parsing utility in `shared/`, not reinvented per module.

---

## 8. Security Architecture

- **Authentication:** delegated entirely to Supabase Auth (JWT issuance, refresh tokens, password/OAuth flows) — don't build your own auth system; verifying a JWT correctly is a solved problem, building one is a common source of student-project vulnerabilities.
- **Authorization / RBAC:** roles (`owner`, `admin`, `treasurer`, `member`) scoped per-organization, stored on the `Member` join row (not on `User` — a user can be `admin` in one org and `member` in another). Enforced at two layers: application-level checks in services (for business-rule-aware decisions like "only treasurer can approve expenses over ₹X") *and* database-level RLS (defense in depth — if a service-layer check is ever missed, RLS still blocks cross-org or unauthorized reads).
- **JWT:** validated on every request via Supabase's public JWKS; org/role context is derived from the DB (member lookup), not trusted blindly from the JWT payload, since roles can change after token issuance.
- **Input validation:** Pydantic at the API boundary for shape; explicit sanitization/parameterized queries everywhere (never string-format SQL) to prevent injection — especially critical for any NLP-to-SQL feature later, where generated queries must go through a strict allow-listed query builder, never raw execution.
- **Rate limiting:** middleware-level (e.g. `slowapi`) on auth endpoints and OCR upload endpoints specifically (the two most abuse-prone and resource-expensive routes).
- **Logging:** structured JSON logs (request id, user id, org id, route, status, latency) — enables tracing an issue across the request lifecycle without a heavy observability stack.
- **Audit:** as described in Section 6 — a queryable, append-only trail of who did what to which financial record, when.
- **File security:** receipts uploaded to Supabase Storage in **private** buckets, accessed only via short-lived **signed URLs** generated server-side after an authorization check — never public bucket URLs for financial documents.
- **Secrets management:** environment variables via Render's secret management / `.env` (never committed), separate secrets per environment (dev/staging/prod), Supabase service-role key never exposed to the frontend.
- **OWASP considerations:** parameterized queries (injection), RLS + service-layer checks (broken access control), signed URLs + private buckets (sensitive data exposure), rate limiting on auth (brute force), dependency scanning via `pip-audit`/`npm audit` in CI (vulnerable components).

---

## 9. AI Integration Strategy (no implementation)

The architecture is designed so AI slots into existing module boundaries rather than requiring a redesign:

- **OCR** plugs into the `receipts` module as a service call: `receipts.service` calls `ocr.service.extract(image)`, gets back structured fields with confidence scores, and *proposes* values for the user to confirm rather than auto-writing them — this keeps a human-in-the-loop checkpoint that's both good UX and a safety net against OCR errors on financial data.
- **NLP querying** should plug in as a new module (`nlp_query/`) that translates a natural-language question into a *constrained, pre-approved query template* (never raw generated SQL executed directly) — the module calls existing repository methods with parsed parameters, so it inherits all existing authorization and RLS protection automatically instead of needing its own security review.
- **Anomaly/duplicate detection** plugs in as a post-write hook in the `expenses`/`payments` services — after a transaction is created, an `audit`/`security` check runs (starting as simple heuristic rules, upgradeable later to a real model) and flags results back through the existing `notifications` module.
- **Analytics/forecasting** plugs into `reports` as an additional report *type* that reads from the same repositories other reports use — no new data access pattern needed.

Because every AI feature is designed as "call into an existing module boundary" rather than "new parallel system," none of them require restructuring the modular monolith later — they're additive.

---

## 10. Scalability Strategy — monolith to microservices later

The modular monolith is deliberately structured so that a future split is a **networking change, not a rewrite**:

1. Each module already has a clean service interface (Section 5) — internal calls today (`expense_service.get(...)`) become HTTP/RPC calls tomorrow if that module is extracted.
2. Each module owns its own repository/data access — no cross-module direct SQL queries — so extracting a module's tables into its own database later doesn't require untangling shared queries.
3. The most likely first candidate for extraction, if it ever became necessary, is `ocr` — it's the most compute-heavy, stateless, and easiest to isolate behind a queue/worker pattern (e.g., receipt upload triggers a background job rather than a synchronous OCR call, which is also a good idea for latency reasons well before you'd ever need microservices).
4. This is explicitly framed as *optionality*, not a plan — a modular monolith comfortably serves this application's real scale (a handful of student organizations) far past 6-8 months. Don't build the extraction; build the ability to extract later.

---

## 11. Development Workflow

```
Requirement (user story: "Treasurer needs to upload a receipt and verify OCR-extracted amount")
   ↓
Architecture (which module owns this? does it touch receipts + ocr + expenses?)
   ↓
Database (migration: any new columns/tables needed — e.g. receipt.ocr_confidence)
   ↓
Backend (repository → service → router → schema, unit tests alongside)
   ↓
Frontend (API client → hook → component, with loading/error states)
   ↓
Testing (unit tests for service logic, integration test for the endpoint, manual QA)
   ↓
Documentation (update API docs / README if public contract changed)
   ↓
Deployment (merge to main → CI runs tests → auto-deploy to Render/Vercel)
```

For a solo/small team, the discipline that matters most isn't process ceremony — it's: **write the test for the service layer before moving to the next feature**, and **never merge a migration without a rollback plan**. Everything else in this workflow can be lightweight.

---

## 12. Common Beginner Mistakes at This Scale

- **Fat routers**: putting business logic directly in FastAPI route handlers instead of services — makes testing impossible without spinning up the whole HTTP stack.
- **Skipping the repository interface**: calling the Supabase client directly from services — works fine until you need to test or swap infrastructure, then you're stuck.
- **No RLS, relying only on application checks**: one missed `WHERE org_id = ...` clause becomes a cross-tenant data leak. RLS as a second layer is not optional for a multi-tenant financial app.
- **Building the generalized "any organization type" schema before there's a second real organization type** — premature abstraction that adds complexity for a use case that doesn't exist yet.
- **Treating "agent" as a branding word rather than an architecture** — labeling a single LLM prompt call an "AI agent" inflates scope claims and doesn't hold up under technical questioning.
- **No eval/accuracy tracking for OCR** — shipping OCR without a labeled test set means you can't say anything credible about how well it works, which undermines the feature's value as a resume artifact.
- **Hard deletes on financial records** — loses audit trail, breaks "what did this look like last month" queries.
- **Scope creep before the core loop works** — adding NLP querying or forecasting before expense CRUD + OCR are used by a real org on real data. Ship the smallest real loop first; every section above is designed to support that once it's proven.

---

*This document is a living reference — as real usage reveals which assumptions were wrong (they will be), update the relevant section rather than starting a new document from scratch.*