require("dotenv").config();
const mongoose = require("mongoose");
const Payment = require("../src/models/Payment");
const Subscription = require("../src/models/Subscription");
const Plan = require("../src/models/Plan");
const Company = require("../src/models/Company");
const paymentCtrl = require("../src/controllers/payment.controller");
const connectDB = require("../src/config/db");

// Mock Express Req/Res
const mockReq = (body = {}, user = {}) => ({
    body,
    user
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
        console.log("\n🚀 Starting Manual Payment Flow Test...\n");

        // 1. Setup Test Data
        console.log("Creating Test Company & Plan...");
        const company = await Company.create({
            name: "Test Company",
            email: `test_${Date.now()}@example.com`,
            phone: "1234567890",
            address: "123 Test St, Test City",
            qrToken: `test_qr_${Date.now()}`
        });

        const plan = await Plan.create({
            name: "Test Plan",
            priceMonthly: 500,
            priceYearly: 5000,
            employeeLimit: 10,
            features: ["Test Feature"]
        });

        const user = { companyId: company._id, companyName: company.name };
        const transactionId = `txn_${Date.now()}`;

        // 2. Test markPaymentRequest
        console.log("\n👉 Testing markPaymentRequest...");
        const req1 = mockReq(
            { planId: plan._id, billingCycle: "monthly", transactionId },
            user
        );
        const res1 = mockRes();

        await paymentCtrl.markPaymentRequest(req1, res1, mockNext);

        if (res1.data && res1.data.success) {
            console.log("✅ Payment Request Submitted:", res1.data);
        } else {
            console.error("❌ Failed to Submit Request:", res1.data);
            process.exit(1);
        }

        const paymentId = res1.data.paymentId;

        // 3. Verify DB State (Pending)
        const payment = await Payment.findById(paymentId);
        if (payment.status === "pending" && payment.amount === 500) {
            console.log("✅ Payment Record Verified (Pending)");
        } else {
            console.error("❌ Payment Record Verification Failed:", payment);
        }

        const sub = await Subscription.findOne({ companyId: company._id });
        if (sub.status === "pending") {
            console.log("✅ Subscription Record Verified (Pending)");
        } else {
            console.error("❌ Subscription Record Verification Failed:", sub);
        }

        // 4. Test getPendingPayments
        console.log("\n👉 Testing getPendingPayments...");
        const req2 = mockReq({}, { role: "SuperAdmin" });
        const res2 = mockRes();

        await paymentCtrl.getPendingPayments(req2, res2, mockNext);

        if (res2.data.success && res2.data.count > 0) {
            console.log(`✅ Retrieved ${res2.data.count} Pending Payments`);
        } else {
            console.error("❌ Failed to Get Pending Payments");
        }

        // 5. Test approvePayment
        console.log("\n👉 Testing approvePayment...");
        const req3 = mockReq({ paymentId });
        const res3 = mockRes();

        await paymentCtrl.approvePayment(req3, res3, mockNext);

        if (res3.data.success) {
            console.log("✅ Payment Approved:", res3.data.message);
        } else {
            console.error("❌ Failed to Approve Payment:", res3.data);
        }

        // 6. Verify DB State (Active)
        const approvedPayment = await Payment.findById(paymentId);
        if (approvedPayment.status === "success") {
            console.log("✅ Payment Record Verified (Success)");
        } else {
            console.error("❌ Payment Record Verification Failed (Expected Success):", approvedPayment);
        }

        const activeSub = await Subscription.findOne({ companyId: company._id });
        if (activeSub.status === "active" && activeSub.startDate) {
            console.log("✅ Subscription Activated:", activeSub.startDate);
        } else {
            console.error("❌ Subscription Activation Failed:", activeSub);
        }

        // Cleanup
        console.log("\n🧹 Cleaning up Test Data...");
        await Company.findByIdAndDelete(company._id);
        await Plan.findByIdAndDelete(plan._id);
        await Payment.findByIdAndDelete(paymentId);
        await Subscription.findOneAndDelete({ companyId: company._id });

        console.log("✅ Test Completed Successfully!");
        process.exit(0);

    } catch (err) {
        console.error("❌ Test Failed:", err);
        process.exit(1);
    }
};

runTest();
