require("dotenv").config();
const http = require("http");
const app = require("./src/app");
const connectDB = require("./src/config/db");
require("./src/cron/subscription.cron");


// Connect Database & Start Server
connectDB().then(() => {
  const server = http.createServer(app);
  server.listen(process.env.PORT, () => {
    console.log(`✅ Server running on port ${process.env.PORT}`);
  });
}).catch(err => {
  console.error("❌ Failed to connect to DB, server not started:", err.message);
});
