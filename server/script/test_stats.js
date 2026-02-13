require("dotenv").config();
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const Company = require("../src/models/Company");
const Subscription = require("../src/models/Subscription");
const Payment = require("../src/models/Payment");
const Visitor = require("../src/models/Visitor");
const connectDB = require("../src/config/db");
const mongoose = require("mongoose");

let server;

const startServer = async () => {
    await connectDB();
    server = app.listen(5003);
    console.log("🚀 Stats Test Server Started on 5003");
};

const stopServer = async () => {
    await mongoose.connection.close();
    server.close();
    console.log("🛑 Test Server Stopped");
};

const runStatsTest = async () => {
    try {
        await startServer();

        // 1. Setup & Cleanup
        console.log("\n🧹 Cleaning DB for Stats Test...");
        await User.deleteMany({ email: { $in: ["super@stats.com", "admin@stats.com", "emp1@stats.com"] } });
        await Company.deleteMany({ email: "admin@stats.com" });
        await Subscription.deleteMany({}); // Warning: Clears all subs
        await Payment.deleteMany({});      // Warning: Clears all payments
        await Visitor.deleteMany({});      // Warning: Clears all visitors

        // 2. Create Super Admin
        console.log("\n1. Setup Super Admin");
        const superAdmin = await User.create({
            name: "Super Stats",
            email: "super@stats.com",
            password: "password123",
            role: "SuperAdmin"
        });

        let res = await request(app).post("/auth/login").send({ email: "super@stats.com", password: "password123" });
        const superToken = res.body.token;

        // 3. Create Company & Admin
        console.log("\n2. Setup Company & Admin");
        const company = await Company.create({
            name: "Stats Co",
            email: "admin@stats.com",
            phone: "123",
            address: "Test Addr",
            industry: "IT",
            qrToken: "statsqr",
            isActive: true
        });

        const companyAdmin = await User.create({
            companyId: company._id,
            name: "Admin Stats",
            email: "admin@stats.com",
            password: "password123",
            role: "Admin",
            isActive: true,
            isFirstLogin: false
        });

        res = await request(app).post("/auth/login").send({ email: "admin@stats.com", password: "password123" });
        const adminToken = res.body.token;

        // 4. Create Subs & Payments (For Super Admin Stats)
        console.log("\n3. Seeding Data for Super Admin Stats");
        await Subscription.create({
            companyId: company._id,
            planId: new mongoose.Types.ObjectId(),
            status: "active",
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });

        await Payment.create({
            companyId: company._id,
            amount: 1000,
            status: "success",
            transactionId: "TXN_1",
            date: new Date()
        });

        await Payment.create({
            companyId: company._id,
            amount: 500, // Pending
            status: "pending",
            transactionId: "TXN_2",
            date: new Date()
        });

        // 5. Verify Super Admin Stats
        console.log("\n4. Verifying Super Admin Stats");
        res = await request(app)
            .get("/super-admin/dashboard/stats")
            .set("Authorization", `Bearer ${superToken}`);

        console.log("   Super Admin Stats:", res.body);

        if (res.body.totalCompanies >= 1 && res.body.revenue >= 1000 && res.body.activeSubscriptions >= 1 && res.body.pendingPayments >= 1) {
            console.log("   ✅ Super Admin Stats Correct");
        } else {
            console.error("❌ Super Admin Stats Incorrect");
            throw new Error("Stats Mismatch");
        }

        // 6. Create Visitors & Employees (For Company Admin Stats)
        // Need HR first for hrId
        console.log("\n5. Seeding Data for Company Admin Stats");

        const hr = await User.create({
            companyId: company._id,
            name: "Employee 1",
            email: "emp1@stats.com",
            password: "pass",
            role: "Staff"
        });

        await Visitor.create({
            companyId: company._id,
            name: "Visitor 1",
            phone: "111",
            purpose: "Meeting",
            status: "CHECKED_IN",
            checkInAt: new Date(),
            selfie: "dummy_base64_string",
            hrId: hr._id
        });

        await Visitor.create({
            companyId: company._id,
            name: "Visitor 2",
            phone: "222",
            purpose: "Meeting",
            status: "APPROVED",
            createdAt: new Date(),
            selfie: "dummy_base64_string",
            hrId: hr._id
        });

        // 7. Verify Company Admin Stats
        console.log("\n6. Verifying Company Admin Stats");
        res = await request(app)
            .get("/admin/dashboard/stats")
            .set("Authorization", `Bearer ${adminToken}`);

        console.log("   Company Admin Stats:", res.body);

        if (res.body.totalVisitors === 2 && res.body.activeVisitors === 1 && res.body.totalEmployees === 1 && res.body.todayVisitors === 2) {
            console.log("   ✅ Company Admin Stats Correct");
        } else {
            console.error("❌ Company Admin Stats Incorrect");
            throw new Error("Company Stats Mismatch");
        }

        console.log("\n🎉 DASHBOARD STATS APIs VERIFIED!");
        await stopServer();
        process.exit(0);

    } catch (err) {
        console.error("❌ TEST FAILED:", err);
        await stopServer();
        process.exit(1);
    }
};

runStatsTest();
