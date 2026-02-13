console.log("STARTING TEST SCRIPT");
require("dotenv").config();
console.log("DOTENV LOADED");

try {
    const bcrypt = require("bcryptjs");
    console.log("BCRYPTJS LOADED");
} catch (e) {
    console.error("BCRYPTJS FAILED:", e);
}

const mongoose = require("mongoose");
console.log("MONGOOSE LOADED");

const User = require("../src/models/User");
console.log("USER MODEL REQUIRED");

const connectDB = require("../src/config/db");

const run = async () => {
    try {
        console.log("CONNECTING DB...");
        await connectDB();
        console.log("DB Connected");

        console.log("User Model Type:", typeof User);
        if (User && User.deleteMany) {
            console.log("User.deleteMany exists");
        } else {
            console.log("User.deleteMany MISSING");
        }

        console.log("Deleting Users...");
        await User.deleteMany({});
        console.log("Users Deleted");

        console.log("Creating User...");
        const user = await User.create({
            name: "Test User",
            email: "test@example.com",
            password: "password123",
            role: "SuperAdmin"
        });
        console.log("User Created:", user);

        console.log("Exiting...");
        process.exit(0);
    } catch (err) {
        console.error("ERROR CAUGHT IN MAIN:", err);
        process.exit(1);
    }
};

run();
