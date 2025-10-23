const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  A1: { type: Object, default: {} },
  A2: { type: Object, default: {} },
  B1: { type: Object, default: {} },
  B2: { type: Object, default: {} },
  C1: { type: Object, default: {} },
}, { _id: false }); // Evita que cree _id anidados

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    default: '',
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user',
  },
  level: {
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1'],
    required: function () {
      return this.role === 'user';
    },
  },
  progress: {
    type: progressSchema,
    default: () => ({}),
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', userSchema);

