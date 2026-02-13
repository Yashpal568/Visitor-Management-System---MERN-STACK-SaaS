require("dotenv").config();
const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/User");
const Company = require("../src/models/Company");
const connectDB = require("../src/config/db");
const mongoose = require("mongoose");

let server;
let staffToken, adminToken;
let staffId;

const startServer = async () => {
    await connectDB();
    server = app.listen(5002);
    console.log("🚀 Profile Test Server Started on 5002");
};

const stopServer = async () => {
    await mongoose.connection.close();
    server.close();
    console.log("🛑 Test Server Stopped");
};

const runProfileTest = async () => {
    try {
        await startServer();

        // CLEANUP
        await User.deleteMany({ email: { $in: ["staff@test.com", "admin@test.com"] } });
        await Company.deleteMany({ email: "admin@test.com" });

        console.log("\n1. Setup Users");

        // Create Company
        const company = await Company.create({
            name: "Test Co",
            email: "admin@test.com",
            phone: "123",
            address: "Test Addr",
            industry: "IT",
            qrToken: "testqr"
        });

        // Create Company Admin
        const admin = await User.create({
            companyId: company._id,
            name: "Admin User",
            email: "admin@test.com",
            password: "password123", // Will be hashed by hook if not careful, but usually we mock or use hook
            role: "Admin",
            isActive: true,
            isFirstLogin: false
        });

        // Login Admin
        let res = await request(app).post("/auth/login").send({ email: "admin@test.com", password: "password123" });
        adminToken = res.body.token;

        // Create Staff
        const staff = await User.create({
            companyId: company._id,
            name: "Staff User",
            email: "staff@test.com",
            password: "password123",
            role: "Staff",
            isActive: true,
            isFirstLogin: false
        });

        // Login Staff
        res = await request(app).post("/auth/login").send({ email: "staff@test.com", password: "password123" });
        staffToken = res.body.token;
        staffId = staff._id;

        console.log("   ✅ Users Setup & Logged In");

        // TEST 1: Staff Updates Own Profile
        console.log("\n2. Staff Updates Own Profile");
        res = await request(app)
            .put("/auth/me")
            .set("Authorization", `Bearer ${staffToken}`)
            .send({
                name: "Updated Staff Name",
                phone: "9999999999",
                department: "Engineering" // Allowed
            });

        if (res.status === 200 && res.body.user.name === "Updated Staff Name") {
            console.log("   ✅ Staff Profile Updated");
        } else {
            console.error("❌ Staff Update Failed:", res.body);
            throw new Error("Staff Update Failed");
        }

        // TEST 2: Verify Persistence
        const updatedStaff = await User.findById(staffId);
        if (updatedStaff.phone === "9999999999") {
            console.log("   ✅ Update Persisted in DB");
        } else {
            throw new Error("Update not persisted");
        }

        // TEST 3: Output Whitelist Check (Try to update role)
        console.log("\n3. Security Check (Role Update)");
        res = await request(app)
            .put("/auth/me")
            .set("Authorization", `Bearer ${staffToken}`)
            .send({
                role: "SuperAdmin" // Should be ignored
            });

        if (res.body.user.role === "Staff") {
            console.log("   ✅ Role Update Ignored (Security Pass)");
        } else {
            console.error("❌ SECURITY FAIL: Role was updated!");
            throw new Error("Security Fail");
        }

        // TEST 4: Company Admin Update
        console.log("\n4. Company Admin Updates Own Profile");
        res = await request(app)
            .put("/auth/me")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                designation: "CTO"
            });

        if (res.body.user.designation === "CTO") {
            console.log("   ✅ Admin Profile Updated");
        } else {
            console.error("❌ Admin Update Failed");
            throw new Error("Admin Update Failed");
        }

        console.log("\n🎉 PROFILE APIs WORKING CORRECTLY!");
        await stopServer();
        process.exit(0);

    } catch (err) {
        console.error("❌ TEST FAILED:", err);
        await stopServer();
        process.exit(1);
    }
};

runProfileTest();
