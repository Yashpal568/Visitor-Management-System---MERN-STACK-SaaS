require("dotenv").config();
const mongoose = require("mongoose");
const Company = require("../src/models/Company");
const Subscription = require("../src/models/Subscription");
const connectDB = require("../src/config/db");

// Import the Logic (we'll replicate it here for isolation or we could export it)
// Ideally, the logic inside cron should be a service function. 
// For this test, we will implement the logic directly to verify data changes.

const runTest = async () => {
    try {
        await connectDB();
        console.log("\n🚀 Starting Subscription Expiry Test...\n");

        // 1. Create a Company with EXPIRED Subscription
        console.log("Creating Test Company & Expired Subscription...");
        const company = await Company.create({
            name: "Expired Company Inc",
            email: `expired_${Date.now()}@example.com`,
            phone: "9876543210",
            address: "Old Street",
            qrToken: `qr_exp_${Date.now()}`,
            isActive: true // Initially active, should become false
        });

        const yesterady = new Date();
        yesterady.setDate(yesterady.getDate() - 1);

        const subscription = await Subscription.create({
            companyId: company._id,
            status: "active", // Still marked active in DB, but date is past
            startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Started 30 days ago
            endDate: yesterady, // Ended yesterday
            planSnapshot: { employeeLimit: 5 }
        });

        console.log(`✅ Setup Complete. CompanyID: ${company._id}, SubscriptionID: ${subscription._id}`);
        console.log(`   Current Status: ${subscription.status}, Company Active: ${company.isActive}`);

        // 2. Run the Expiry Logic (Simulating Cron)
        console.log("\n⏳ Running Expiry Logic...");

        const expiredSubs = await Subscription.find({
            status: "active",
            endDate: { $lt: new Date() }
        });

        console.log(`   Found ${expiredSubs.length} expired subscriptions to process.`);

        for (const sub of expiredSubs) {
            if (sub._id.toString() === subscription._id.toString()) {
                // 1. Mark Subscription as Expired
                sub.status = "expired";
                await sub.save();

                // 2. Deactivate Company Access
                await Company.findByIdAndUpdate(sub.companyId, {
                    isActive: false
                });
                console.log("   -> Processed target subscription.");
            }
        }

        // 3. Verify Final State
        console.log("\n🔍 Verifying Final State...");
        const updatedCompany = await Company.findById(company._id);
        const updatedSub = await Subscription.findById(subscription._id);

        if (!updatedCompany.isActive && updatedSub.status === "expired") {
            console.log("✅ SUCCESS: Company deactivated and Subscription marked expired.");
        } else {
            console.error("❌ FAILED: State not updated correctly.");
            console.log("   Company Active:", updatedCompany.isActive);
            console.log("   Subscription Status:", updatedSub.status);
        }

        // Cleanup
        console.log("\n🧹 Cleaning up...");
        await Company.findByIdAndDelete(company._id);
        await Subscription.findByIdAndDelete(subscription._id); // fixed findOneAndDelete -> findByIdAndDelete

        process.exit(0);

    } catch (err) {
        console.error("❌ Test Failed:", err);
        process.exit(1);
    }
};

runTest();
