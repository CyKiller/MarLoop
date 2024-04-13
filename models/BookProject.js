const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  versionNumber: Number,
  createdAt: { type: Date, default: Date.now },
  plotBranchId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlotBranch', required: true }
}, { _id: false });

const bookProjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  genre: { type: String, required: true },
  aiQuestion: { type: String, required: false },
  versionHistory: [versionSchema], // Adding version control
  currentState: {
    plotBranchId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlotBranch', required: false },
    plotContent: { type: String, required: false },
    genre: { type: String, required: false },
    aiQuestion: { type: String, required: false }
  }, // Adding field to store the current state of the user's work
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Added collaborators field
  updatedAt: { type: Date, default: Date.now } // Added updatedAt field for tracking last update time
});

bookProjectSchema.pre('save', function(next) {
  console.log(`Saving project for user ${this.userId} in genre ${this.genre}`);
  this.updatedAt = new Date(); // Update the updatedAt field to current date/time before saving
  if (!this.userId) {
    console.error('Error: userId is required for saving a BookProject.');
    next(new Error('userId is required for saving a BookProject.'));
  } else {
    next();
  }
});

bookProjectSchema.post('save', function(doc) {
  console.log(`Project saved for user ${doc.userId} with ID ${doc._id}`);
});

bookProjectSchema.post('findOneAndUpdate', function(doc, next) {
  if (doc) {
    console.log(`Project updated for user ${doc.userId} with ID ${doc._id}`);
  } else {
    console.log("No document found with the provided criteria.");
  }
  next();
}, function(error, doc, next) {
  if (error) {
    console.error('Error during findOneAndUpdate operation:', error.message, error.stack);
  }
  next();
});

module.exports = mongoose.model('BookProject', bookProjectSchema);