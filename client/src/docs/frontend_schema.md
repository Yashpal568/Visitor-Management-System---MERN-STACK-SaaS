# VMS SaaS – Frontend Architecture  
(ShadCN + React + Tailwind Version)

---

# 1️⃣ Project Overview

This frontend is for a multi-tenant SaaS Visitor Management System (VMS) built for industrial companies.

The backend is fully completed with:

- Multi-tenant architecture
- Role-based authentication (SuperAdmin, Admin, Staff, Security)
- Visitor lifecycle (Check-in → HR Approval → Security Entry → Exit)
- Manual QR-based subscription billing
- Subscription enforcement middleware
- Subscription expiry automation (cron-based)
- Visitor analytics & history
- SuperAdmin payment approval system

Frontend must be:

- Enterprise-grade
- Demo-ready
- Clean & professional
- Industrial-friendly
- Scalable
- PWA enabled

---

# 2️⃣ Tech Stack

- React (Vite)
- Tailwind CSS
- shadcn/ui
- React Router DOM
- Axios
- Context API (or Zustand)
- Recharts (for analytics)
- React Webcam (for visitor selfie)
- PWA (manifest + service worker)

---

# 3️⃣ Global Application Architecture

Single application with role-based rendering.

After login:

```
/dashboard → role-based rendering
```

Roles:
- SuperAdmin
- Admin (Company Admin)
- Staff (HR)
- Security

---

# 4️⃣ Folder Structure

```
src/
  components/
    ui/                → shadcn components
    layout/
    shared/
  pages/
    auth/
    admin/
    hr/
    security/
    superadmin/
    visitor/
  routes/
  services/
  context/
  utils/
```

---

# 5️⃣ Core Layout System

## 5.1 AppLayout Component

Shared layout for protected routes.

Structure:
- Sidebar
- Header
- Main Content
- Profile dropdown

Components used:
- Sidebar
- NavigationMenu
- DropdownMenu
- Avatar
- Button
- Separator

Features:
- Role-based sidebar menu
- Active route highlight
- Logout
- Collapsible sidebar

Usage:

```
<AppLayout>
  <Outlet />
</AppLayout>
```

---

## 5.2 ProtectedRoute Component

Responsibilities:

- Check authentication
- Check role
- Check subscription status
- Redirect if invalid

Rules:
- Not logged in → redirect to login
- Role mismatch → redirect to dashboard
- Subscription expired → redirect to subscription page

---

# 6️⃣ Authentication Layer

## 6.1 Login Page

Components:
- Card
- Input
- Label
- Button
- Alert

States:
- Loading
- Error
- Success

---

## 6.2 Auth Context

Global state must store:

- user
- role
- token
- companyId
- subscription status

Axios interceptor:
- Attach token
- Redirect on 401

---

# 7️⃣ SuperAdmin Frontend Structure

## 7.1 Dashboard

Components:
- Card (stats)
- Table
- Badge
- Tabs

Sections:
- Total companies
- Active subscriptions
- Expired subscriptions
- Pending payments
- Revenue overview (manual)

---

## 7.2 Payment Approval Page

Components:
- Table
- Dialog (Approve confirmation)
- Button (Approve / Reject)
- Badge

Actions:
- Approve → Activate subscription
- Reject → Mark rejected

---

# 8️⃣ Company Admin Frontend Structure

## 8.1 Admin Dashboard

Components:
- Card grid
- Quick action buttons
- Subscription warning banner

Stats:
- Total visitors
- Employees count
- Subscription status
- Pending approvals

---

## 8.2 Employee Management

Components:
- Table
- Dialog (Add/Edit)
- Select (Role)
- Input
- Badge
- Pagination

Features:
- Create employee
- Edit employee
- Delete employee
- Employee limit alert banner

---

## 8.3 Visitor History Page

Components:
- Date Range Picker
- Select filters
- Table
- Badge
- Pagination

Filters:
- Status
- HR
- Date range

---

## 8.4 Analytics Page

Components:
- Card
- BarChart (Recharts)
- PieChart
- Grid layout

Metrics:
- Total visitors
- Approved
- Rejected
- Peak hours

---

## 8.5 QR Generator Page

Components:
- Card
- QR image display
- Download button
- Copy link button

---

## 8.6 Subscription Page

Components:
- Plan cards
- Billing cycle toggle
- QR payment display
- Confirm payment button
- Status badge

---

# 9️⃣ HR (Staff) Interface

## 9.1 Pending Visitors Page

Components:
- Table
- Avatar (visitor selfie)
- Approve button
- Reject button
- Dialog (details view)

---

## 9.2 HR History Page

Limited fields:
- Visitor name
- Status
- Date
- Purpose

---

# 🔟 Security Dashboard

Design Requirements:

- Large buttons
- High contrast
- Touch-friendly
- Minimal clutter

## 10.1 Approved Visitors List

Components:
- Card list
- Large Check-In button
- Large Check-Out button
- Status badge
- Visitor photo preview

---

# 1️⃣1️⃣ Visitor Public Check-In Page

Route:

```
/visitor/checkin/:qrToken
```

## 11.1 Form Components

- Card
- Input
- Select (HR list)
- React Webcam
- Submit button

---

## 11.2 Status Screen

Auto-poll backend every 5 seconds.

Display:
- Pending
- Approved
- Rejected
- Checked In
- Checked Out

Mobile-first design.

---

# 1️⃣2️⃣ Subscription Expiry UI Handling

If subscription expired:

- Show top Alert banner
- Disable navigation links
- Redirect to subscription page
- Prevent protected actions

Allow access only to:
- Subscription page
- Payment page

---

# 1️⃣3️⃣ Payment UI (Manual QR Model)

Flow:

1. Select plan
2. Select billing cycle
3. Show QR
4. Display exact amount
5. "I have paid" button
6. Confirmation message

SuperAdmin:
- Pending payments table
- Approve / Reject

---

# 1️⃣4️⃣ UI Design Guidelines

Target: Industrial companies

Avoid:
- Overly colorful UI
- Heavy gradients
- Fancy animations

Use:
- Light theme
- Zinc / Slate background
- Blue accent
- Clean typography
- Clear badges

Primary palette:

- background: white
- card: zinc-50
- primary: blue-600
- destructive: red-500
- success: green-600
- muted: gray-500

---

# 1️⃣5️⃣ PWA Requirements

- Manifest.json
- Service worker
- Installable app
- Offline fallback page
- App icon

Security dashboard must be installable.

---

# 1️⃣6️⃣ Frontend Development Roadmap

## Phase 1 – Foundation (2–3 Days)

- Setup Vite + Tailwind + shadcn
- Layout component
- Routing
- Auth context
- ProtectedRoute

---

## Phase 2 – Admin Features (4–6 Days)

- Admin dashboard
- Employee CRUD
- Visitor history
- Analytics
- QR generator
- Subscription page

---

## Phase 3 – HR + Security (3–4 Days)

- HR approval screen
- Security check-in/out UI
- Status badges

---

## Phase 4 – SuperAdmin Panel (3–4 Days)

- Payment approval
- Company list
- Stats dashboard

---

## Phase 5 – Visitor Public Page (2–3 Days)

- QR check-in form
- Camera integration
- Status polling
- Mobile optimization

---

## Phase 6 – PWA Optimization (2 Days)

- Manifest
- Service worker
- Install testing

---

# 1️⃣7️⃣ Estimated Timeline

Minimum: 15–18 days  
Focused execution: 3–4 weeks

---

# 1️⃣8️⃣ Definition of Completion

Frontend is complete when:

- Login works
- Role-based dashboards work
- Visitor lifecycle works end-to-end
- Subscription blocking works
- Manual payment works
- QR check-in works
- Mobile responsive
- Installable PWA
- Professional industrial-ready design

---

# 1️⃣9️⃣ Business Objective

Frontend must:

- Be demo-ready for industrial companies
- Be polished for payment gateway approval
- Support future Razorpay integration
- Be scalable for agency model
- Look trustworthy and enterprise-grade

---

END OF FRONTEND ARCHITECTURE DOCUMENT
