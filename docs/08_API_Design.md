# API Design

## Document Information

**Status:** Draft v1  
**Last Updated:** 2026-08-01

---

# Purpose

This document defines the REST API design for the AI-Native Operations Platform.

It specifies:

- API conventions
- Authentication strategy
- Endpoint structure
- Request/Response formats
- Error handling
- Authorization rules

The API follows REST principles and is designed for a React frontend communicating with a FastAPI backend.

---

# API Principles

The API follows these principles:

- RESTful resource-based design
- Stateless communication
- JSON request and response bodies
- JWT-based authentication
- Consistent error responses
- Predictable endpoint naming
- Versioned APIs

Base URL:

```
/api/v1
```

---

# Authentication

Authentication uses JWT access tokens.

```
Authorization: Bearer <access_token>
```

Every protected endpoint validates:

- Authentication
- Organization Membership
- Role Permissions

---

# Standard Response Format

## Success Response

```json
{
  "success": true,
  "message": "Expense created successfully.",
  "data": {}
}
```

---

## Error Response

```json
{
  "success": false,
  "message": "Expense not found.",
  "errors": []
}
```

---

# Authentication APIs

## Register

POST

```
/auth/register
```

Creates a new user account.

---

## Login

POST

```
/auth/login
```

Returns JWT access token.

---

## Logout

POST

```
/auth/logout
```

Invalidates current session.

---

## Current User

GET

```
/auth/me
```

Returns authenticated user.

---

# Organization APIs

## Create Organization

POST

```
/organizations
```

---

## Get All Organizations

GET

```
/organizations
```

Returns organizations where the user is a member.

---

## Get Organization

GET

```
/organizations/{organization_id}
```

---

## Update Organization

PUT

```
/organizations/{organization_id}
```

---

## Delete Organization

DELETE

```
/organizations/{organization_id}
```

Soft delete.

---

# Member APIs

## Invite Member

POST

```
/organizations/{organization_id}/members/invite
```

---

## Get Members

GET

```
/organizations/{organization_id}/members
```

---

## Update Member Role

PATCH

```
/organizations/{organization_id}/members/{member_id}
```

---

## Remove Member

DELETE

```
/organizations/{organization_id}/members/{member_id}
```

Marks membership inactive.

---

# Budget APIs

## Create Budget

POST

```
/organizations/{organization_id}/budgets
```

---

## Get Budgets

GET

```
/organizations/{organization_id}/budgets
```

---

## Update Budget

PUT

```
/budgets/{budget_id}
```

---

## Delete Budget

DELETE

```
/budgets/{budget_id}
```

Soft delete.

---

# Expense APIs

## Create Expense

POST

```
/organizations/{organization_id}/expenses
```

---

## Get Expenses

GET

```
/organizations/{organization_id}/expenses
```

Supports:

- Pagination
- Filtering
- Searching
- Sorting

---

## Get Expense

GET

```
/expenses/{expense_id}
```

---

## Update Expense

PUT

```
/expenses/{expense_id}
```

---

## Delete Expense

DELETE

```
/expenses/{expense_id}
```

Soft delete.

---

## Approve Expense

PATCH

```
/expenses/{expense_id}/approve
```

Only authorized roles.

---

## Reject Expense

PATCH

```
/expenses/{expense_id}/reject
```

---

# Receipt APIs

## Upload Receipt

POST

```
/expenses/{expense_id}/receipts
```

Multipart file upload.

---

## Get Receipts

GET

```
/expenses/{expense_id}/receipts
```

---

## Delete Receipt

DELETE

```
/receipts/{receipt_id}
```

---

## Verify OCR Result

PATCH

```
/receipts/{receipt_id}/verify
```

User confirms extracted values.

---

# OCR APIs

## Extract Receipt Data

POST

```
/receipts/{receipt_id}/ocr
```

Returns:

- Vendor
- Amount
- Date
- Invoice Number
- GST Number

OCR never updates financial records automatically.

---

# Payment APIs

## Create Payment

POST

```
/expenses/{expense_id}/payments
```

---

## Get Payments

GET

```
/expenses/{expense_id}/payments
```

---

## Update Payment

PUT

```
/payments/{payment_id}
```

---

# Notification APIs

## Get Notifications

GET

```
/notifications
```

---

## Mark Notification Read

PATCH

```
/notifications/{notification_id}/read
```

---

# Dashboard APIs

## Dashboard Summary

GET

```
/organizations/{organization_id}/dashboard
```

Returns:

- Budget Summary
- Expense Summary
- Payment Summary
- Recent Activity
- Pending Approvals

---

# Report APIs

## Generate Report

POST

```
/organizations/{organization_id}/reports
```

Supports:

- Monthly
- Quarterly
- Yearly
- Custom Date Range

---

## Download Report

GET

```
/reports/{report_id}/download
```

---

# Audit APIs

## Get Audit Logs

GET

```
/organizations/{organization_id}/audit-logs
```

Visible only to authorized roles.

---

# Filtering

Example

```
GET /expenses?status=approved
```

```
GET /expenses?category=Electronics
```

```
GET /expenses?vendor=Amazon
```

```
GET /expenses?from=2026-01-01&to=2026-12-31
```

---

# Pagination

```
?page=1
&limit=20
```

---

# Sorting

```
?sort=created_at
```

```
?order=desc
```

---

# Searching

```
?search=laptop
```

Searches:

- Title
- Vendor
- Description

---

# HTTP Status Codes

| Code | Meaning |
|-------|----------|
| 200 | Success |
| 201 | Created |
| 204 | Deleted Successfully |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

---

# Authorization Matrix

| Endpoint | Member | Treasurer | Admin | Owner |
|-----------|--------|------------|--------|--------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| Create Expense | ❌ | ✅ | ✅ | ✅ |
| Approve Expense | ❌ | ✅ | ✅ | ✅ |
| Manage Members | ❌ | ❌ | ✅ | ✅ |
| Manage Organization | ❌ | ❌ | ✅ | ✅ |
| Delete Organization | ❌ | ❌ | ❌ | ✅ |

---

# API Versioning

Current Version

```
/api/v1
```

Future versions:

```
/api/v2
/api/v3
```

Older versions remain supported during migration.

---

# Security Considerations

- JWT Authentication
- RBAC Authorization
- Input Validation
- File Type Validation
- File Size Limits
- Rate Limiting
- SQL Injection Protection
- XSS Protection
- CSRF Protection (if applicable)
- Secure File Storage
- Audit Logging

---

# Future APIs

Future versions may include:

- AI Insights
- Budget Forecasting
- Duplicate Receipt Detection
- Vendor Management
- Expense Analytics
- Webhooks
- Public APIs
- Mobile APIs

These are intentionally excluded from the MVP.

---

# Design Decisions

- Resource-oriented REST API
- Stateless authentication
- Organization-first routing
- Consistent JSON responses
- OCR is an assistive service
- Human verification required before updating financial records
- Soft deletion for business-critical entities
- Versioned APIs for backward compatibility