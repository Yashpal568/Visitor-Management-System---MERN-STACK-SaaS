const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      index: true,
    },

    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,

    role: {
      type: String,
      enum: ["SuperAdmin", "Admin", "Staff", "Security"],
      required: true,
      index: true,
    },
    isFirstLogin: {
      type: Boolean,
      default: true,
    },

    department: String,
    designation: String,

    password: {
      type: String,
      required: function () {
        return !this.isFirstLogin;
      },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Pre-save hook to hash password
// Using async/await without `next` for modern Mongoose
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  console.log("HASHING PASSWORD for", this.email);
  this.password = await bcrypt.hash(this.password, 10);
  console.log("PASSWORD HASHED");
});

module.exports = mongoose.model("User", userSchema);
