const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['customer', 'restaurant', 'admin', 'driver'],
    default: 'customer'
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  profileImage: {
    type: String,
    default: ''
  },
  // Restaurant-specific details
  restaurantDetails: {
    restaurantName: String,
    description: String,
    logo: String,
    coverImage: String,
    cuisine: [String],
    address: {
      street: String,
      city: String,
      area: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    },
    phone: String,
    email: String,
    openingHours: [{
      day: String, // Monday, Tuesday, etc.
      open: String, // 09:00
      close: String, // 22:00
      isClosed: {
        type: Boolean,
        default: false
      }
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    isApproved: {
      type: Boolean,
      default: false
    },
    rating: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },
    commission: {
      type: Number,
      default: 15 // percentage
    },
    bankDetails: {
      accountName: String,
      accountNumber: String,
      bankName: String,
      branch: String
    }
  },
  addresses: [{
    label: String, // e.g., "Home", "Office"
    street: String,
    city: String,
    area: String,
    landmark: String,
    phone: String,
    coordinates: {
      lat: Number,
      lng: Number
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneNumber: {
    type: String,
    sparse: true
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  phoneOTP: String,
  phoneOTPExpires: Date,
  emailOTP: String,
  emailOTPExpires: Date,
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  // References to past orders for recommendation history
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  // Simple preferences (could be derived from orders, but storing explicit tags helps)
  preferences: [String]
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
