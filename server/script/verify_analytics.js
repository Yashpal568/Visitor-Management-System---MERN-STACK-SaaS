const axios = require('axios');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config({ path: 'e:/VMS/server/.env' });

const User = require('../src/models/User'); // For fetching tokens
const Company = require('../src/models/Company'); // For qrToken

const BASE_URL = 'http://127.0.0.1:' + (process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || 'qqwweerrtt';

// Connect to DB for helper queries
mongoose.connect(process.env.MONGO_URI).then(() => console.log('✅ DB Connected for Script'));

async function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    try {
        console.log('🚀 Starting Analytics Verification...');

        // 1. Forge SuperAdmin Token
        const superToken = jwt.sign({ userId: '000000000000000000000000', role: 'SuperAdmin' }, JWT_SECRET);

        // 2. Create Company
        const emailSuffix = Date.now();
        const companyData = {
            companyName: `Analytics Test Corp ${emailSuffix}`,
            companyEmail: `corp${emailSuffix}@test.com`,
            companyPhone: '9998887776',
            address: '123 Analytics Rd',
            industry: 'Data',
            adminName: 'Admin Guy',
            adminEmail: `admin${emailSuffix}@test.com`,
            adminPhone: '9998887770',
            adminPassword: 'password123'
        };

        console.log('⏳ Creating Company...');
        const compRes = await axios.post(`${BASE_URL}/company/create`, companyData, {
            headers: { Authorization: `Bearer ${superToken}` }
        });
        const companyId = compRes.data.companyId;
        // Note: response might vary based on controller, assuming standard success response

        // 3. Login Admin
        console.log('⏳ Admin Login...');
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: companyData.adminEmail,
            password: companyData.adminPassword
        });
        const adminToken = loginRes.data.token;

        // 4. Activate Subscription (Mock)
        console.log('⏳ Activating Subscription...');
        await axios.post(`${BASE_URL}/payment/activate`, {
            planId: '6989c2fdcf9ce758f5d3140c',
            billingCycle: 'monthly'
        }, { headers: { Authorization: `Bearer ${adminToken}` } });

        // Helper to create employee and get token
        async function createAndLoginEmployee(name, prefix, role) {
            console.log(`⏳ Creating ${role}: ${name}...`);
            const empEmail = `${prefix}${emailSuffix}@test.com`;
            await axios.post(`${BASE_URL}/admin/create-employee`, {
                name, email: empEmail, phone: '1231231234', role, department: 'Ops', designation: role
            }, { headers: { Authorization: `Bearer ${adminToken}` } });

            // Fetch Token from DB
            const user = await User.findOne({ email: empEmail }).select('+invitationToken');
            if (!user) throw new Error(`User ${empEmail} not found in DB`);

            // Set Password
            await axios.post(`${BASE_URL}/auth/set-password`, {
                email: empEmail,
                newPassword: 'password123',
                token: user.invitationToken
            });

            // Login
            const res = await axios.post(`${BASE_URL}/auth/login`, {
                email: empEmail, password: 'password123'
            });
            return res.data.token;
        }

        // 5. Create Staff & Security
        const staffToken = await createAndLoginEmployee('Staff User', 'staff', 'Staff');
        const securityToken = await createAndLoginEmployee('Security Guard', 'sec', 'Security');

        // 6. Get Company QR Token
        const company = await Company.findById(companyId);
        const qrToken = company.qrToken;
        console.log('✅ QR Token Fetched');

        // 7. Register Visitor
        console.log('⏳ Registering Visitor...');
        const visRes = await axios.post(`${BASE_URL}/visitor/check-in/${qrToken}`, {
            name: 'Visitor One', phone: '5555555555', email: 'vis@test.com',
            purpose: 'Meeting', hrId: (await User.findOne({ email: `staff${emailSuffix}@test.com` }))._id,
            selfie: 'base64_string'
        });
        const visitorId = visRes.data.visitorId;

        // 8. Approve Visitor (Staff)
        console.log('⏳ Approving Visitor...');
        await axios.patch(`${BASE_URL}/visitor/${visitorId}/action`, { action: 'APPROVED' }, {
            headers: { Authorization: `Bearer ${staffToken}` }
        });

        // 9. Check-In (Security)
        console.log('⏳ Security Check-In...');
        await axios.patch(`${BASE_URL}/security/check-in/${visitorId}`, {}, {
            headers: { Authorization: `Bearer ${securityToken}` }
        });

        // 10. Check-Out (Security)
        console.log('⏳ Security Check-Out...');
        await axios.patch(`${BASE_URL}/security/check-out/${visitorId}`, {}, {
            headers: { Authorization: `Bearer ${securityToken}` }
        });

        // 11. Verify History
        console.log('🔍 Verifying HISTORY API...');
        const histRes = await axios.get(`${BASE_URL}/visitor/history?status=CHECKED_OUT&fromDate=2024-01-01`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('📜 History Count:', histRes.data.count);
        // Find our visitor
        const inHistory = histRes.data.visitors.find(v => v._id === visitorId);
        if (inHistory) console.log('✅ Visitor found in History');
        else console.error('❌ Visitor NOT found in History');

        // 12. Verify Analytics
        console.log('🔍 Verifying ANALYTICS API...');
        const anaRes = await axios.get(`${BASE_URL}/visitor/analytics`, {
            headers: { Authorization: `Bearer ${adminToken}` }
        });
        console.log('📊 Analytics Data:', JSON.stringify(anaRes.data, null, 2));

        if (anaRes.data.totalVisitors >= 1) console.log('✅ Analytics Check Passed');
        else console.error('❌ Analytics returned 0 visitors');

    } catch (err) {
        console.error('🔥 Script Failed:', err.message);
        if (err.response) console.error('Data:', err.response.data);
    } finally {
        mongoose.connection.close();
    }
}

run();
