const mongoose = require("mongoose");

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

module.exports = mongoose.model("User", userSchema);
