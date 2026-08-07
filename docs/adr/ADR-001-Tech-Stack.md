# ADR-001: Technology Stack Selection

## Status
Accepted

## Context

The project requires a modern, scalable, free, and production-ready technology stack suitable for a modular monolith architecture.

## Decision

Frontend:
- React
- TypeScript
- Tailwind CSS

Backend:
- FastAPI

Database:
- PostgreSQL (Supabase)

Authentication:
- Supabase Auth

Storage:
- Supabase Storage

Deployment:
- Vercel
- Render

## Alternatives Considered

### MERN Stack

Pros:
- Single language (JavaScript)

Cons:
- We want to strengthen Python skills.
- PostgreSQL is better suited for relational financial data.

### Django

Pros:
- Batteries included.

Cons:
- Less flexibility than FastAPI for the architecture we want.

## Consequences

Pros:
- Modern
- Free
- Scalable
- Strong ecosystem
- Good learning value

Cons:
- Need to learn TypeScript and FastAPI well.