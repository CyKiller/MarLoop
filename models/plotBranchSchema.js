const mongoose = require('mongoose');

const plotBranchSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bookProjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'BookProject', required: true },
  branchTitle: { type: String, required: true },
  parentBranchId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlotBranch', default: null },
  plotContent: { type: String, required: true }
}, { timestamps: true });

plotBranchSchema.pre('save', function(next) {
  console.log(`Saving plot branch: ${this.branchTitle}`);
  next();
});

plotBranchSchema.post('save', function(doc) {
  console.log(`Plot branch saved: ${doc.branchTitle} with ID ${doc._id}`);
});

plotBranchSchema.post('findOneAndUpdate', function(doc) {
  console.log(`Plot branch updated: ${doc.branchTitle} with ID ${doc._id}`);
}, function(error) {
  console.error('Error updating plot branch:', error.message, error.stack);
});

module.exports = mongoose.model('PlotBranch', plotBranchSchema);