const mongoose = require("mongoose");

const ITDeclarationSchema = new mongoose.Schema({
  empId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  licAmount: { type: Number, default: 0 },
  healthInsurance: { type: Number, default: 0 },
  hra: { type: Number, default: 0 },
  lta: { type: Number, default: 0 },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  remark: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("ITDeclaration", ITDeclarationSchema);
