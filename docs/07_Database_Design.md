# Database Design

## Document Information

**Status:** Draft v1  
**Last Updated:** 2026-08-01

---

# Purpose

This document defines the logical database design for the AI-Native Operations Platform.

It describes:

- Database architecture
- Entities
- Relationships
- Constraints
- Normalization
- Indexing strategy
- Soft deletion strategy

This document is derived from the Domain Model and serves as the foundation for backend implementation.

---

# Database Overview

The platform uses a relational database.

Database Engine:

- PostgreSQL (Supabase)

Design Principles:

- Third Normal Form (3NF)
- UUID Primary Keys
- Foreign Key Constraints
- Soft Deletes
- Auditability
- Multi-Tenant Architecture

---

# Database Architecture

The database is organized around the Organization entity.

```
Organization
    │
    ├── Members
    ├── Budgets
    ├── Expenses
    ├── Payments
    ├── Audit Logs
    └── Reports
```

Every financial record belongs to exactly one Organization.

---

# Entity Overview

| Entity | Purpose |
|----------|----------|
| Users | Global user accounts |
| Organizations | Tenant boundary |
| Members | User-Organization relationship |
| Budgets | Financial allocation |
| Expenses | Expense records |
| Receipts | Payment proof |
| Payments | Financial transactions |
| Notifications | User notifications |
| Invitations | Organization invitations |
| Audit Logs | Historical activity |

---

# Users

## Purpose

Stores user account information.

## Fields

| Field | Description |
|---------|-------------|
| id | Primary Key |
| full_name | User's name |
| email | Unique email |
| phone | Contact number |
| profile_image_url | Profile image |
| created_at | Record creation timestamp |
| updated_at | Last update timestamp |

---

# Organizations

## Purpose

Represents an organization using the platform.

## Fields

| Field | Description |
|---------|-------------|
| id | Primary Key |
| name | Organization name |
| description | Description |
| logo_url | Organization logo |
| created_by | User who created organization |
| created_at | Created timestamp |
| updated_at | Updated timestamp |

---

# Members

## Purpose

Represents membership of a user within an organization.

Stores organization-specific information.

## Fields

| Field | Description |
|---------|-------------|
| id | Primary Key |
| organization_id | FK → Organizations |
| user_id | FK → Users |
| role | Owner/Admin/Treasurer/Member |
| position | Committee position |
| membership_status | Active/Inactive |
| joined_at | Join date |
| left_at | Leave date |
| invited_by | FK → Users |
| approved_by | FK → Users |
| created_at | Created timestamp |
| updated_at | Updated timestamp |

---

# Budgets

## Purpose

Represents allocated budgets.

## Fields

| Field | Description |
|---------|-------------|
| id | Primary Key |
| organization_id | FK |
| title | Budget title |
| allocated_amount | Budget allocation |
| financial_year | Financial year |
| created_by | FK → Users |
| created_at | Created timestamp |
| updated_at | Updated timestamp |

**Note**

Spent amount is intentionally **not stored**.

It is calculated from approved expenses to prevent data inconsistency.

---

# Expenses

## Purpose

Represents organizational expenses.

## Fields

| Field | Description |
|---------|-------------|
| id | Primary Key |
| organization_id | FK |
| budget_id | FK |
| created_by | FK → Users |
| approved_by | FK → Users (nullable) |
| title | Expense title |
| description | Description |
| vendor_name | Vendor name |
| category | Expense category |
| amount | Expense amount |
| status | Current status |
| expense_date | Expense date |
| created_at | Created timestamp |
| updated_at | Updated timestamp |
| deleted_at | Soft delete timestamp |

---

# Receipts

## Purpose

Stores uploaded receipts supporting expenses.

## Fields

| Field | Description |
|---------|-------------|
| id | Primary Key |
| expense_id | FK → Expenses |
| uploaded_by | FK → Users |
| file_url | Receipt location |
| ocr_status | OCR progress |
| verification_status | User verification |
| ocr_data | OCR extracted JSON |
| created_at | Created timestamp |
| updated_at | Updated timestamp |

---

# Payments

## Purpose

Represents financial payments.

## Fields

| Field | Description |
|---------|-------------|
| id | Primary Key |
| organization_id | FK |
| expense_id | FK |
| paid_by | FK → Users |
| payment_method | Cash / UPI / Bank Transfer |
| transaction_id | Payment reference |
| amount | Payment amount |
| payment_date | Payment date |
| status | Payment status |
| created_at | Created timestamp |
| updated_at | Updated timestamp |

---

# Notifications

## Purpose

Stores user notifications.

## Fields

| Field | Description |
|---------|-------------|
| id | Primary Key |
| user_id | FK |
| title | Notification title |
| message | Notification body |
| type | Notification type |
| is_read | Read status |
| created_at | Created timestamp |

---

# Invitations

## Purpose

Stores organization invitations.

## Fields

| Field | Description |
|---------|-------------|
| id | Primary Key |
| organization_id | FK |
| email | Invited email |
| role | Assigned role |
| invited_by | FK → Users |
| status | Invitation status |
| expires_at | Expiration date |
| created_at | Created timestamp |

---

# Audit Logs

## Purpose

Maintains historical records of important actions.

## Fields

| Field | Description |
|---------|-------------|
| id | Primary Key |
| organization_id | FK |
| user_id | FK |
| entity_type | Expense, Budget, etc. |
| entity_id | Related entity |
| action | Created, Updated, Deleted |
| old_value | Previous JSON |
| new_value | Updated JSON |
| created_at | Timestamp |

---

# Entity Relationships

## User ↔ Organization

Relationship:

Many-to-Many

Implemented using:

Member

---

## Organization → Budget

One Organization

↓

Many Budgets

---

## Organization → Expense

One Organization

↓

Many Expenses

---

## Budget → Expense

One Budget

↓

Many Expenses

---

## Expense → Receipt

One Expense

↓

Many Receipts

Each receipt belongs to exactly one expense.

---

## Expense → Payment

One Expense

↓

Many Payments

Supports partial payments.

---

## User → Notification

One User

↓

Many Notifications

---

## Organization → Audit Log

One Organization

↓

Many Audit Logs

---

# Cardinality Summary

| Relationship | Cardinality |
|--------------|-------------|
| User ↔ Organization | Many : Many |
| Organization → Budget | One : Many |
| Organization → Expense | One : Many |
| Budget → Expense | One : Many |
| Expense → Receipt | One : Many |
| Expense → Payment | One : Many |
| User → Notification | One : Many |
| Organization → Audit Log | One : Many |

---

# Primary Keys

Every table uses:

- UUID Primary Key

Benefits:

- Globally unique
- Better for distributed systems
- Difficult to guess
- Safer for APIs

---

# Foreign Keys

Foreign key constraints enforce referential integrity.

Examples:

- Expense must reference an existing Organization.
- Receipt must reference an existing Expense.
- Member must reference both User and Organization.

---

# Soft Delete Strategy

Business-critical entities use soft deletion.

Applicable tables:

- Organizations
- Budgets
- Expenses
- Payments
- Members

Soft delete field:

```
deleted_at
```

Records remain available for audit and reporting.

---

# Indexing Strategy

Indexes should be created for:

- email
- organization_id
- user_id
- expense_date
- status
- created_at
- payment_date

Composite indexes:

- (organization_id, status)
- (organization_id, expense_date)
- (organization_id, created_at)

---

# Normalization

The schema follows Third Normal Form (3NF).

Avoided redundancies:

- User information is stored only once.
- Organization information is stored only once.
- Membership data is separated from Users.
- Financial summaries are calculated instead of stored.

---

# Design Decisions

- Multi-tenant architecture using Organizations.
- Users can belong to multiple Organizations.
- Roles are assigned through Memberships.
- OCR data is stored with Receipts.
- OCR never modifies financial records automatically.
- One Expense may contain multiple Receipts.
- One Expense may have multiple Payments.
- Financial summaries are calculated rather than duplicated.
- Business-critical records use soft deletion.

---

# Future Enhancements

Potential future additions:

- Vendor Entity
- Category Entity
- Approval Workflow
- Custom Roles & Permissions
- Payment Splits
- Receipt Versioning
- Budget Categories
- Multi-Currency Support

These features are intentionally excluded from the MVP.