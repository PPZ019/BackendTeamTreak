const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: String,
  price: Number,
  quantity: Number,
});

const invoiceSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  client: {
    id: { type: String, required: true }, // if you have a Client model
    name: { type: String, required: true } // now required
  },
  date: Date,
  expiredDate: Date,
  taxRate: Number,
  discount: Number,
  currency: String,
  items: [itemSchema],
  subtotal: Number,
  tax: Number,
  discountAmount: Number,
  totalBeforeDiscount: Number,
  total: Number,
  credit: { type: Number, default: 0 },
  status: { type: String, enum: ['draft','pending','paid'], default: 'draft' },
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
