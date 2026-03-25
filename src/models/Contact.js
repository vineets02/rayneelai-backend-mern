const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: 2
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  company: {
    type: String,
    trim: true,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  service_interest: {
    type: String,
    required: [true, 'Service interest is required'],
    trim: true
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    minlength: 10
  },
  // Admin Lead Management Fields
  status: {
    type: String,
    enum: ['new', 'in_progress', 'contacted', 'qualified', 'closed'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  isContacted: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    default: 'website-contact-form'
  },
  tags: [{
    type: String,
    trim: true
  }],
  notes: [{
    text: { type: String, required: true },
    createdBy: { type: String, default: 'Admin' },
    createdAt: { type: Date, default: Date.now }
  }],
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Create compound indexes for better admin search performance
contactSchema.index({ status: 1, deletedAt: 1 });
contactSchema.index({ email: 1 });

module.exports = mongoose.model('Contact', contactSchema);
