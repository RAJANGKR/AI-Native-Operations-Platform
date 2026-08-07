# User Personas

## Document Information

**Status:** Draft v1  
**Last Updated:** 2026-08-01

---

# Purpose

This document identifies the primary users of the platform and explains their goals, responsibilities, permissions, and workflows.

The purpose is to ensure that every feature developed solves a real user problem rather than being implemented solely because it is technically interesting.

The personas defined here will drive:

- Role-Based Access Control (RBAC)
- Database Design
- API Authorization
- UI/UX Design
- Feature Prioritization

---

# Primary Personas

The MVP focuses on four primary user roles.

1. Organization Owner
2. Treasurer
3. Member
4. Faculty Advisor (Optional)

---

# Persona 1 — Organization Owner

## Description

The Organization Owner is responsible for creating and managing the organization.

This user has the highest level of authority and can manage members, permissions, and organizational settings.

---

## Responsibilities

- Create organization
- Invite members
- Assign roles
- View reports
- Manage organization settings
- Monitor overall activities

---

## Goals

- Keep the organization well managed.
- Ensure transparency.
- Monitor financial activities.
- Control member permissions.

---

## Pain Points

- Managing many members manually.
- Lack of centralized records.
- Difficulty tracking organization activities.

---

## Permissions

- Full access
- Manage members
- Assign roles
- View all reports
- Configure organization settings

---

## Typical Workflow

Login
↓
View Dashboard
↓
Review Organization Status
↓
Manage Members
↓
Review Reports
↓
Logout

---

# Persona 2 — Treasurer

## Description

The Treasurer manages all financial activities of the organization.

This is the primary user of the MVP.

---

## Responsibilities

- Record expenses
- Record payments
- Upload receipts
- Verify OCR results
- Manage budgets
- Generate reports

---

## Goals

- Reduce manual work.
- Maintain accurate financial records.
- Verify receipts quickly.
- Generate reports efficiently.

---

## Pain Points

- Manual receipt verification.
- Duplicate data entry.
- Managing screenshots from multiple platforms.
- Time-consuming report preparation.

---

## Permissions

- Create expenses
- Edit expenses
- Upload receipts
- Verify OCR
- Approve financial records (based on organization policy)
- View financial dashboard
- Generate reports

---

## Typical Workflow

Login
↓
Dashboard
↓
Upload Receipt
↓
OCR Extracts Information
↓
Verify Extracted Data
↓
Save Transaction
↓
Generate Report

---

# Persona 3 — Member

## Description

A Member participates in organization activities but has limited permissions.

Members mainly create requests and monitor their own submissions.

---

## Responsibilities

- Submit payments
- Upload receipts
- View personal submissions
- Track request status

---

## Goals

- Submit information quickly.
- Know current payment status.
- Receive updates on submitted requests.

---

## Pain Points

- Unclear payment status.
- Delayed verification.
- Lack of transparency.

---

## Permissions

- View own profile
- Upload receipts
- Submit payment information
- View personal history

---

## Typical Workflow

Login
↓
Submit Payment
↓
Upload Receipt
↓
Wait for Verification
↓
Receive Status Update

---

# Persona 4 — Faculty Advisor (Optional)

## Description

Faculty Advisors supervise organizations and monitor activities without participating in day-to-day operations.

---

## Responsibilities

- Review reports
- Monitor budgets
- Track organization activities

---

## Goals

- Ensure transparency.
- Monitor financial health.
- Review organizational progress.

---

## Permissions

- Read-only access
- View reports
- View dashboards
- View financial summaries

---

## Typical Workflow

Login
↓
Dashboard
↓
Review Reports
↓
Logout

---

# Persona Comparison

| Capability | Owner | Treasurer | Member | Faculty |
|------------|--------|------------|---------|----------|
| Manage Organization | ✅ | ❌ | ❌ | ❌ |
| Manage Members | ✅ | ❌ | ❌ | ❌ |
| Manage Expenses | ✅ | ✅ | ❌ | ❌ |
| Upload Receipts | ✅ | ✅ | ✅ | ❌ |
| Verify OCR | ✅ | ✅ | ❌ | ❌ |
| Generate Reports | ✅ | ✅ | ❌ | ✅ |
| View Dashboard | ✅ | ✅ | Limited | ✅ |

---

# User Journey Summary

## Owner

Login
↓
Manage Organization
↓
Monitor Reports
↓
Logout

---

## Treasurer

Login
↓
Manage Expenses
↓
Upload Receipts
↓
Verify OCR
↓
Generate Reports
↓
Logout

---

## Member

Login
↓
Submit Payment
↓
Upload Receipt
↓
Track Status
↓
Logout

---

## Faculty

Login
↓
View Reports
↓
Review Activities
↓
Logout

---

# Future Personas

The following personas are intentionally excluded from the MVP but may be introduced later.

- Auditor
- Sponsor
- Vendor
- Accountant
- External Reviewer

---

# Decision Summary

Primary User: Treasurer

Highest Authority: Organization Owner

Most Frequent User: Treasurer

Primary Workflow: Receipt Upload → OCR → Verification → Transaction → Report

Access Model: Role-Based Access Control (RBAC)

Future Expansion: Additional personas can be introduced without redesigning the permission system.