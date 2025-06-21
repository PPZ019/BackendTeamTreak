/*****************************
 * models/userModel.js
 *****************************/
const mongoose  = require('mongoose');
const validator = require('validator');
const bcrypt    = require('bcrypt');

const SALT_FACTOR = parseInt(process.env.BCRYPT_SALT_FACTOR || '10', 10);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      minlength: 4,
      maxlength: 25,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Invalid email'],
    },

    username: {
      type: String,
      required: true,
      unique: true,
      minlength: 4,
      maxlength: 15,
      lowercase: true,
      trim: true,
    },

    mobile: {
      type: String,
      required: true,
      validate: {
        validator: (v) => /^\d{10,13}$/.test(v),
        message: 'Mobile must be 10–13 digits',
      },
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
    },

    type: {
      type: String,
      enum: ['Admin', 'Employee', 'Leader'],
      default: 'Employee',
    },

    status: {
      type: String,
      enum: ['active', 'banned'],
      default: 'active',
    },

    image: {
      type: String,
      default: null,          // Cloudinary URL or null
    },

    address: {
      type: String,
      default: 'No Address Specified',
      maxlength: 100,
      trim: true,
    },
  },
  { timestamps: true }
);

/* ───────── Password Hash on Create ───────── */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, SALT_FACTOR);
  next();
});

/* ───────── Password Hash on Update ───────── */
const hashOnUpdate = async function (next) {
  const update = this.getUpdate();
  if (update?.password) {
    update.password = await bcrypt.hash(update.password, SALT_FACTOR);
    this.setUpdate(update);
  }
  next();
};

userSchema.pre('updateOne',        hashOnUpdate);
userSchema.pre('findOneAndUpdate', hashOnUpdate);

/* ───────── Export Model ───────── */
module.exports =
  mongoose.models.User || mongoose.model('User', userSchema, 'users');
