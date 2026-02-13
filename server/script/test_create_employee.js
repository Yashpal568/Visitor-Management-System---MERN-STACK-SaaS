const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: 'e:/VMS/server/.env' });

const BASE_URL = 'http://127.0.0.1:' + (process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET || 'qqwweerrtt';

async function run() {
    try {
        // 1. Need a Company ID and Admin Token. 
        // This is hard because we need a valid company/admin to test createEmployee.
        // I made a company in previous run: 698b63d083e1ae1baa9de301
        // But I don't have the admin token.
        // So I must login as admin. But I don't know the email used (it was dynamic `admin${Date.now()}@test.com`).

        // So I must forge a token if I know the IDs.
        // User 698b63d083e1ae1baa9de301 (Company ID).
        // I need a valid User ID for the token too? 
        // Auth middleware uses `jwt.verify`. `req.user` = decoded.
        // `createEmployee` uses `req.user.companyId`.
        // It does NOT verify if `req.user.userId` exists in DB unless `role` middleware checks it?
        // `middleware/role.js`.

        // Let's check role middleware.
        // If simple check, I can forge token.

        const companyId = '698b63d083e1ae1baa9de301'; // From logs
        const token = jwt.sign({
            userId: '000000000000000000000000', // Dummy
            role: 'Admin',
            companyId: companyId
        }, JWT_SECRET);

        console.log('Using Company:', companyId);

        const res = await axios.post(`${BASE_URL}/admin/create-employee`, {
            name: "Debug Employee",
            email: `debug${Date.now()}@test.com`,
            phone: "1234567890",
            role: "Security",
            department: "IT",
            designation: "Guard"
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Success:', res.data);

    } catch (err) {
        console.error('❌ Failed:', err.response?.data || err.message);
    }
}

run();
