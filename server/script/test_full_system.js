require("dotenv").config();
const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const Company = require("../src/models/Company");
const Plan = require("../src/models/Plan");
const Subscription = require("../src/models/Subscription");
const Visitor = require("../src/models/Visitor");
const Payment = require("../src/models/Payment");

let server;
let superAdminToken, companyToken, hrToken, securityToken;
let companyId, planId, paymentId, visitorId, hrId, securityId;
let qrToken;

const connectDB = require("../src/config/db");

// Helper to start server
const startServer = async () => {
    await connectDB();
    server = app.listen(5001); // Use different port for testing
    console.log("🚀 Test Server Started on 5001");
};

// Helper to stop server
const stopServer = async () => {
    await mongoose.connection.close();
    server.close();
    console.log("🛑 Test Server Stopped");
};

const runFullTest = async () => {
    try {
        await startServer();

        // --- PHASE 0: CLEANUP ---
        console.log("\n🧹 Cleaning DB...");
        await User.deleteMany({});
        await Company.deleteMany({});
        await Plan.deleteMany({});
        await Subscription.deleteMany({});
        await Visitor.deleteMany({});
        await Payment.deleteMany({});

        // --- PHASE 1: SUPER ADMIN SETUP ---
        console.log("\n🤴 [1] Setup Super Admin & Plan");
        // Create Super Admin Manually
        await User.create({
            name: "Super Admin",
            email: "super@admin.com",
            password: "password123",
            role: "SuperAdmin"
        });

        // Login Super Admin
        let res = await request(app).post("/auth/login").send({
            email: "super@admin.com",
            password: "password123"
        });
        console.log("Super Admin Login Response:", res.body);
        if (!res.body.token) {
            console.error("❌ Super Admin Login Failed:", res.body);
            throw new Error("Super Admin Login Failed");
        }

        superAdminToken = res.body.token;
        console.log("   ✅ Super Admin Logged In");

        // Create Plan
        res = await request(app)
            .post("/super-admin/plans")
            .set("Authorization", `Bearer ${superAdminToken}`)
            .send({
                name: "Gold Plan",
                priceMonthly: 999,
                priceYearly: 9999,
                employeeLimit: 10
            });

        if (!res.body.plan) {
            console.error("❌ Plan Creation Failed:", res.body);
            throw new Error("Plan not created");
        }

        planId = res.body.plan._id;
        console.log("   ✅ Plan Created:", res.body.plan.name);

        // --- PHASE 2: COMPANY REGISTRATION ---
        console.log("\n🏢 [2] Company Registration");
        res = await request(app).post("/company/create").set("Authorization", `Bearer ${superAdminToken}`).send({
            companyName: "Tech Corp",
            companyEmail: "info@techcorp.com",
            companyPhone: "9876543210",
            address: "Silicon Valley",
            industry: "IT",
            adminName: "CEO John",
            adminEmail: "ceo@techcorp.com",
            adminPhone: "9876543210",
            adminPassword: "password123"
        });

        if (res.status !== 201) {
            console.error("❌ Company Registration Failed:", res.body);
            throw new Error("Company Registration Failed");
        }


        // Login Company Admin
        res = await request(app).post("/auth/login").send({
            email: "ceo@techcorp.com",
            password: "password123"
        });
        console.log("   Company Login Response:", res.body);

        if (!res.body.user) {
            console.error("❌ Company Login Failed:", res.body);
            throw new Error("Company Login Failed");
        }

        companyToken = res.body.token;
        companyId = res.body.user.companyId;
        console.log("   ✅ Company Registered & Logged In");

        // --- PHASE 3: SUBSCRIPTION & PAYMENT ---
        console.log("\n💳 [3] Subscription & Payment");
        // 1. Submit Manual Payment
        res = await request(app)
            .post("/payment/mark-paid")
            .set("Authorization", `Bearer ${companyToken}`)
            .send({
                planId: planId,
                billingCycle: "monthly",
                transactionId: "TXN_" + Date.now()
            });

        if (res.status !== 200 && res.status !== 201) {
            console.error("❌ Manual Payment Failed:", res.body);
            throw new Error("Manual Payment Failed");
        }
        console.log("   ✅ Manual Payment Submitted");

        // 2. Super Admin Approves
        const payments = await Payment.find({});
        paymentId = payments[0]._id;

        res = await request(app)
            .post("/payment/approve-request")
            .set("Authorization", `Bearer ${superAdminToken}`)
            .send({
                paymentId: paymentId
            });

        if (res.body.success) {
            console.log("   ✅ Payment Approved by SuperAdmin");
        } else {
            console.error("❌ Payment Approval Failed:", res.body);
            throw new Error("Payment Approval Failed");
        }

        // 3. Verify Company Active
        const company = await Company.findById(companyId);
        if (company.isActive) console.log("   ✅ Company is now ACTIVE");
        qrToken = company.qrToken;


        // --- PHASE 4: EMPLOYEE CREATION ---
        console.log("\n👥 [4] Employee Creation (HR & Security)");

        // Create HR
        res = await request(app)
            .post("/admin/create-employee")
            .set("Authorization", `Bearer ${companyToken}`)
            .send({
                name: "HR Manager",
                email: "hr@techcorp.com",
                phone: "1122334455",
                role: "Staff",
                department: "HR"
            });
        console.log("   ✅ HR Created");

        // Set HR Password
        await request(app).post("/auth/set-password").send({ email: "hr@techcorp.com", newPassword: "password123" });

        // Login HR
        res = await request(app).post("/auth/login").send({ email: "hr@techcorp.com", password: "password123" });
        hrToken = res.body.token;
        hrId = res.body.user.id; // Corrected from userId
        console.log("   ✅ HR Logged In");

        // Create Security
        res = await request(app)
            .post("/admin/create-employee")
            .set("Authorization", `Bearer ${companyToken}`)
            .send({
                name: "Security Guard",
                email: "guard@techcorp.com",
                phone: "9988776655",
                role: "Security",
                department: "Security"
            });
        console.log("   ✅ Security Created");

        // Set Security Password
        await request(app).post("/auth/set-password").send({ email: "guard@techcorp.com", newPassword: "password123" });

        // Login Security
        res = await request(app).post("/auth/login").send({ email: "guard@techcorp.com", password: "password123" });
        securityToken = res.body.token;
        securityId = res.body.user.id; // Corrected from userId
        console.log("   ✅ Security Logged In");


        // --- PHASE 5: VISITOR FLOW ---
        console.log("\n🚶 [5] Visitor Flow");

        // 1. Visitor Check-in (Public)
        res = await request(app)
            .post(`/visitor/check-in/${qrToken}`)
            .send({
                name: "John Visitor",
                phone: "5555555555",
                purpose: "Meeting",
                hrId: hrId, // Selected HR
                selfie: "base64_image_string"
            });
        if (res.status !== 201) {
            console.error("❌ Visitor Check-in Failed:", res.body);
            throw new Error("Visitor Check-in Failed");
        }
        visitorId = res.body.visitorId;
        console.log("   ✅ Visitor Check-in Request Sent");

        // 2. HR Approves
        res = await request(app)
            .patch(`/visitor/${visitorId}/action`)
            .set("Authorization", `Bearer ${hrToken}`)
            .send({ action: "APPROVED" });

        if (res.status !== 200) {
            console.error("❌ HR Approval Failed:", res.body);
            throw new Error("HR Approval Failed");
        }
        console.log("   ✅ HR Approved Visitor");

        // 3. Security Checks Status
        res = await request(app).get(`/visitor/status/${visitorId}`);
        if (res.body.status === "APPROVED") console.log("   ✅ Visitor Status: APPROVED");

        // 4. Security Checks In (New Feature)
        res = await request(app)
            .patch(`/visitor/${visitorId}/action`)
            .set("Authorization", `Bearer ${securityToken}`)
            .send({ action: "CHECKED_IN" });

        if (!res.body.visitor) {
            console.error("❌ Security Check-in Failed:", res.body);
            throw new Error("Security Check-in Failed");
        }

        if (res.body.visitor.status === "CHECKED_IN") console.log("   ✅ Security Checked In Visitor");

        // 5. Security Checks Out
        res = await request(app)
            .patch(`/visitor/${visitorId}/action`)
            .set("Authorization", `Bearer ${securityToken}`)
            .send({ action: "CHECKED_OUT" });

        if (res.body.visitor.status === "CHECKED_OUT") console.log("   ✅ Security Checked Out Visitor");

        // --- PHASE 6: ANALYTICS ---
        console.log("\n📊 [6] Analytics");
        res = await request(app)
            .get("/visitor/analytics")
            .set("Authorization", `Bearer ${companyToken}`);

        if (res.body.totalVisitors >= 1) console.log("   ✅ Analytics: Visitor Count Correct");

        console.log("\n🎉 FULL SYSTEM TEST COMPLETED SUCCESSFULLY!");
        await stopServer();
        process.exit(0);

    } catch (err) {
        console.error("\n❌ TEST FAILED:", err);
        await stopServer();
        process.exit(1);
    }
};

runFullTest();
