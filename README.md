# 🏢 Visitor Management System (VMS) - SaaS Monorepo

> A robust, scalable, and secure Multi-Tenant Visitor Management System (SaaS).
> This repository contains both the **Frontend Client** and **Backend Server**.

## 📂 Project Structure

-   **`/client`**: Frontend Application (React/Next.js)
-   **`/server`**: Backend API (Node.js/Express/MongoDB)

---

## 🚀 Backend Features (`/server`)

### 🔐 Authentication & Security
-   **Role-Based Access Control (RBAC)**: Super Admin, Company Admin, Staff (HR), and Security Guard roles.
-   **Secure Auth**: JWT-based authentication with bcrypt password hashing.
-   **Employee Onboarding**: Secure invitation and password setup flow for employees.

### 💳 Subscription & Payments
-   **SaaS Model**: Supports Monthly and Yearly subscription plans.
-   **Manual Payment Flow**:
    -   Generate custom QR codes for offline payments.
    -   Users submit transaction IDs for verification.
    -   **Super Admin Approval Workflow**: Verify > Approve (Auto-activate) / Reject.
-   **Automated Expiry**:
    -   Daily Cron Job checks for expired subscriptions.
    -   Auto-deactivates companies and blocks access upon expiry.

### 👥 Company & Employee Management
-   **Multi-Tenancy**: Data isolation by `companyId`.
-   **Employee Limits**: Enforces plan-based limits on employee creation.
-   **Dashboard Data**: Role-specific data for HR vs. Security dashboards.

---

## 🛠️ Backend Tech Stack

-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **Database**: MongoDB (Mongoose ODM)
-   **Security**: Helmet, CORS, HPP (Http Parameter Pollution protection), Rate Limiting.
-   **Scheduling**: node-cron (for subscription expiry).

---

## ⚡ Backend Setup

### Prerequisites
-   Node.js (v16+)
-   MongoDB (Local or Atlas URI)
-   Git

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Environment Variables
Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Run the Server
```bash
# Development Mode (with Nodemon)
npm run dev

# Production Mode
npm start
```

---

## 📚 API Guidelines

### Authentication
-   **Header**: `Authorization: Bearer <token>` (Required for protected routes)

### Key Endpoints

| Method | Endpoint | Description | Role |
| :--- | :--- | :--- | :--- |
| **POST** | `/api/auth/login` | Login user | All |
| **POST** | `/api/payment/mark-paid` | Submit Payment Info | Admin |
| **GET** | `/api/payment/pending-requests` | View Pending Payments | SuperAdmin |
| **POST** | `/api/payment/approve-request` | Approve Payment | SuperAdmin |
| **POST** | `/api/admin/create-employee` | Create Staff/Security | Admin |

> **Note**: For full API details, import the Postman Collection included in docs (if available) or check `src/routes`.

---

## 🔄 Automated Jobs (Cron)
-   **Subscription Check**: Runs daily at `00:00` (Midnight).
    -   Checks for active subscriptions where `endDate < today`.
    -   Updates status to `expired`.
    -   Sets `company.isActive = false`.

---

## 🤝 Contributing
1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---

## 📝 License
This project is licensed under the MIT License.
