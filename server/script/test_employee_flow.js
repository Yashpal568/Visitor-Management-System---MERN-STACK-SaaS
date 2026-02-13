require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../src/models/User");
const Company = require("../src/models/Company");
const Subscription = require("../src/models/Subscription");
const adminCtrl = require("../src/controllers/admin.controller");
const authCtrl = require("../src/controllers/auth.controller");
const connectDB = require("../src/config/db");

// Mock Express Req/Res
const mockReq = (body = {}, user = {}, params = {}) => ({
    body,
    user,
    params
});

const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

const mockNext = (err) => {
    if (err) console.error("❌ Error in Controller:", err);
};

const runTest = async () => {
    try {
        await connectDB();
        console.log("\n🚀 Starting Employee Flow Test...\n");

        // 1. Setup Company & Admin
        console.log("Creating Test Company & Admin...");
        const company = await Company.create({
            name: "Test Company Inc",
            email: `company_${Date.now()}@example.com`,
            phone: "9876543210",
            address: "Tech Park, City",
            qrToken: `qr_${Date.now()}`
        });

        // Create Active Subscription
        await Subscription.create({
            companyId: company._id,
            status: "active",
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            planSnapshot: {
                employeeLimit: 10
            }
        });

        const admin = await User.create({
            name: "Company Admin",
            email: `admin_${Date.now()}@example.com`,
            password: "password123", // In real app, this is hashed
            role: "Admin",
            companyId: company._id,
            isActive: true
        });

        const adminUserContext = {
            userId: admin._id,
            role: "Admin",
            companyId: company._id
        };

        // 2. Create Staff (HR) Employee
        console.log("\n👉 Testing Create Staff (HR)...");
        const hrEmail = `hr_${Date.now()}@example.com`;
        const req1 = mockReq(
            {
                name: "HR Manager",
                email: hrEmail,
                phone: "1112223333",
                role: "Staff",
                department: "HR",
                designation: "Manager"
            },
            adminUserContext
        );
        const res1 = mockRes();

        await adminCtrl.createEmployee(req1, res1, mockNext);

        if (res1.statusCode && res1.statusCode !== 201) {
            console.error("❌ Failed to Create HR:", res1.data);
            process.exit(1);
        }
        console.log("✅ HR Employee Created:", res1.data);

        // 3. Create Security Employee
        console.log("\n👉 Testing Create Security...");
        const secEmail = `sec_${Date.now()}@example.com`;
        const req2 = mockReq(
            {
                name: "Gate Keeper",
                email: secEmail,
                phone: "4445556666",
                role: "Security",
                department: "Security",
                designation: "Guard"
            },
            adminUserContext
        );
        const res2 = mockRes();

        await adminCtrl.createEmployee(req2, res2, mockNext);

        if (res2.statusCode && res2.statusCode !== 201) {
            console.error("❌ Failed to Create Security:", res2.data);
            process.exit(1);
        }
        console.log("✅ Security Employee Created:", res2.data);

        // 4. Set Password for HR
        console.log("\n👉 Testing Set Password (HR)...");
        const req3 = mockReq({ email: hrEmail, newPassword: "securePassHR" });
        const res3 = mockRes();

        await authCtrl.setPassword(req3, res3, mockNext);

        if (res3.data && res3.data.message.includes("Password set")) {
            console.log("✅ HR Password Set Successfully");
        } else {
            console.error("❌ Failed to Set HR Password:", res3.data);
        }

        // 5. Login as HR
        console.log("\n👉 Testing Login (HR)...");
        const req4 = mockReq({ email: hrEmail, password: "securePassHR" });
        const res4 = mockRes();

        await authCtrl.login(req4, res4, mockNext);

        if (res4.data && res4.data.token) {
            console.log("✅ HR Logged In Successfully");
            console.log("   Role:", res4.data.user.role);
            console.log("   Dashboard Access:", res4.data.user.role === "Staff" ? "Staff Dashboard" : "Unknown");
            console.log("   Subscription Status:", res4.data.user.subscriptionStatus);
        } else {
            console.error("❌ HR Login Failed:", res4.data);
        }

        // 6. Login as Security
        console.log("\n👉 Testing Set Password & Login (Security)...");
        // Set Pass
        await authCtrl.setPassword(mockReq({ email: secEmail, newPassword: "securePassSec" }), mockRes(), mockNext);

        // Login
        const req5 = mockReq({ email: secEmail, password: "securePassSec" });
        const res5 = mockRes();

        await authCtrl.login(req5, res5, mockNext);

        if (res5.data && res5.data.token) {
            console.log("✅ Security Logged In Successfully");
            console.log("   Role:", res5.data.user.role);
            console.log("   Dashboard Access:", res5.data.user.role === "Security" ? "Security Dashboard" : "Unknown");
        } else {
            console.error("❌ Security Login Failed:", res5.data);
        }

        // Cleanup
        console.log("\n🧹 Cleaning up Test Data...");
        await Company.findByIdAndDelete(company._id);
        await Subscription.findOneAndDelete({ companyId: company._id });
        await User.deleteMany({ companyId: company._id });

        console.log("✅ Employee Flow Verification Completed!");
        process.exit(0);

    } catch (err) {
        console.error("❌ Test Failed:", err);
        process.exit(1);
    }
};

runTest();
