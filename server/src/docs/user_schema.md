You are acting as a senior backend architect helping me debug and complete a real-world SaaS backend.

Project: Visitor Management System (VMS) – SaaS

Tech Stack:
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Role-based access control
- Razorpay (test/dummy mode for now)

SaaS Overview:
This is a multi-tenant SaaS Visitor Management System for companies (factories, offices, IT parks).

Core Roles:
1. SuperAdmin (platform owner – us)
2. Company Admin (client who pays for subscription)
3. Staff / HR
4. Security (gatekeeper)
5. Visitor (public, no auth)

High-level Flow:
- SuperAdmin creates Plans (Basic / Pro / Premium)
- SuperAdmin creates Companies
- Each Company has ONE Company Admin (payer)
- Company Admin manages employees (HR, Security)
- Company Admin purchases subscription plan
- Subscription controls system access (company.isActive)

Visitor Flow:
- Company generates unique QR (qrToken)
- Visitor scans QR → fills form (name, phone, email, purpose, HR selection, live selfie)
- HR receives notification → Approve / Reject
- Security allows entry (check-in) & exit (check-out)
- Visitor status is trackable via public API

Subscription & Enforcement:
- Subscription has startDate, endDate, status
- If subscription expires:
  - company.isActive = false
  - Visitor check-in blocked
  - Security entry blocked
  - Employee creation blocked
- Payment must be allowed even if company is inactive

Payment:
- Razorpay used in test mode
- Flow:
  1. Company Admin creates order
  2. Payment success (dummy for now)
  3. Subscription activated
  4. company.isActive = true

Important Constraint:
- SuperAdmin must NOT be allowed to pay
- Only Company Admin can access payment APIs

Your task is to understand this SaaS fully before debugging or suggesting changes.
