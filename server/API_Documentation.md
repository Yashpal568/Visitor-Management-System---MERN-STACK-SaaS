# VMS API Documentation

Base URL: `http://localhost:5000`

## Authentication (`/api/auth`)

### Login
- **Method:** `POST`
- **Endpoint:** `/api/auth/login`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response:** `{ token: "..." }`

### Logout
- **Method:** `POST`
- **Endpoint:** `/api/auth/logout`
- **Headers:** `Authorization: Bearer <token>`

### Get My Profile
- **Method:** `GET`
- **Endpoint:** `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`

### Update My Profile
- **Method:** `PUT`
- **Endpoint:** `/api/auth/me`
- **Headers:** `Authorization: Bearer <token>`
- **Body:**
  ```json
  {
    "name": "New Name",
    "phone": "9876543210",
    "department": "Engineering",
    "designation": "Manager"
  }
  ```

### Set Password
- **Method:** `POST`
- **Endpoint:** `/api/auth/set-password`
- **Body:**
  ```json
  {
    "email": "user@example.com",
    "newPassword": "newpassword123"
  }
  ```

---

## Super Admin (`/api/super-admin`)

### Dashboard Stats
- **Method:** `GET`
- **Endpoint:** `/api/super-admin/dashboard/stats`
- **Headers:** `Authorization: Bearer <SuperAdminToken>`

### Create Company
- **Method:** `POST`
- **Endpoint:** `/api/company/create`
- **Headers:** `Authorization: Bearer <SuperAdminToken>`
- **Body:**
  ```json
  {
    "companyName": "Tech Corp",
    "companyEmail": "info@tech.com",
    "companyPhone": "1234567890",
    "address": "123 Tech St",
    "industry": "IT",
    "adminName": "Admin User",
    "adminEmail": "admin@tech.com",
    "adminPhone": "0987654321",
    "adminPassword": "password123"
  }
  ```

### Get All Companies
- **Method:** `GET`
- **Endpoint:** `/api/super-admin/companies`
- **Headers:** `Authorization: Bearer <SuperAdminToken>`

### Create Plan
- **Method:** `POST`
- **Endpoint:** `/api/super-admin/plans`
- **Headers:** `Authorization: Bearer <SuperAdminToken>`
- **Body:**
  ```json
  {
    "name": "Gold",
    "priceMonthly": 100,
    "priceYearly": 1000,
    "employeeLimit": 50,
    "features": ["Feature 1", "Feature 2"]
  }
  ```

---

## Company Admin (`/api/admin`)

### Dashboard Stats
- **Method:** `GET`
- **Endpoint:** `/api/admin/dashboard/stats`
- **Headers:** `Authorization: Bearer <AdminToken>`

### Get Company QR Code
- **Method:** `GET`
- **Endpoint:** `/api/company/qr`
- **Headers:** `Authorization: Bearer <AdminToken>`

### Create Employee
- **Method:** `POST`
- **Endpoint:** `/api/admin/create-employee`
- **Headers:** `Authorization: Bearer <AdminToken>`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@company.com",
    "phone": "9876543210",
    "role": "Staff", // or "Security"
    "department": "HR",
    "designation": "Manager"
  }
  ```

### Get Employees
- **Method:** `GET`
- **Endpoint:** `/api/admin/employees`
- **Headers:** `Authorization: Bearer <AdminToken>`

---

## Payments (`/api/payment`)

### Submit Manual Payment
- **Method:** `POST`
- **Endpoint:** `/api/payment/mark-paid`
- **Headers:** `Authorization: Bearer <AdminToken>`
- **Body:**
  ```json
  {
    "planId": "PLAN_ID",
    "billingCycle": "monthly", // or "yearly"
    "transactionId": "TXN_12345"
  }
  ```

### Get Pending Requests (Super Admin)
- **Method:** `GET`
- **Endpoint:** `/api/payment/pending-requests`
- **Headers:** `Authorization: Bearer <SuperAdminToken>`

### Approve Payment (Super Admin)
- **Method:** `POST`
- **Endpoint:** `/api/payment/approve-request`
- **Headers:** `Authorization: Bearer <SuperAdminToken>`
- **Body:**
  ```json
  {
    "paymentId": "PAYMENT_ID"
  }
  ```

---

## Visitor Management (`/api/visitor`)

### Check-In (Public)
- **Method:** `POST`
- **Endpoint:** `/api/visitor/check-in/:qrToken`
- **Body:**
  ```json
  {
    "name": "Visitor Name",
    "phone": "9876543210",
    "email": "visitor@example.com",
    "purpose": "Meeting",
    "hrId": "HR_USER_ID",
    "selfie": "base64_image_string"
  }
  ```

### Get My Pending Visitors (HR)
- **Method:** `GET`
- **Endpoint:** `/api/visitor/my-pending`
- **Headers:** `Authorization: Bearer <StaffToken>`

### Update Visitor Status (Approve/Reject/Check-In)
- **Method:** `PATCH`
- **Endpoint:** `/api/visitor/:visitorId/action`
- **Headers:** `Authorization: Bearer <StaffToken/SecurityToken>`
- **Body:**
  ```json
  {
    "action": "APPROVED" // or "REJECTED", "CHECKED_IN", "CHECKED_OUT"
  }
  ```

### Visitor Analytics (Admin)
- **Method:** `GET`
- **Endpoint:** `/api/visitor/analytics`
- **Headers:** `Authorization: Bearer <AdminToken>`

---

## Notifications (`/api/notification`)

### Get My Notifications
- **Method:** `GET`
- **Endpoint:** `/api/notification`
- **Headers:** `Authorization: Bearer <token>`

### Mark Notification as Read
- **Method:** `PATCH`
- **Endpoint:** `/api/notification/:id/read`
- **Headers:** `Authorization: Bearer <token>`
