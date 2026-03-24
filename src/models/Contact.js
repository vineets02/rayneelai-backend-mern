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
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Contact', contactSchema);
