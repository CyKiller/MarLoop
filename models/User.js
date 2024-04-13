const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  lastAccessed: { type: Date, default: Date.now } // Automatically set lastAccessed to the current date/time on creation
});

userSchema.pre('save', function(next) {
  const user = this;
  if (!user.isModified('password')) return next();
  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) {
      console.error('Error hashing password:', err);
      return next(err);
    }
    user.password = hash;
    next();
  });
});

// Update lastAccessed field on each save
userSchema.pre('save', function(next) {
  this.lastAccessed = new Date(); // Update lastAccessed to the current date/time on each save
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;