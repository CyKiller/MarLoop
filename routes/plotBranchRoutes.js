const express = require('express');
const router = express.Router();
const PlotBranch = require('../models/plotBranchSchema');

// Create a new plot branch
router.post('/create-branch', async (req, res) => {
  try {
    const { userId, bookProjectId, branchTitle, parentBranchId, plotContent } = req.body;
    const newBranch = await PlotBranch.create({
      userId,
      bookProjectId,
      branchTitle,
      parentBranchId: parentBranchId || null,
      plotContent
    });
    console.log(`New plot branch created: ${newBranch.branchTitle}`);
    res.status(201).json(newBranch);
  } catch (error) {
    console.error(`Error creating new plot branch: ${error.message}`, error.stack);
    res.status(400).json({ error: error.message });
  }
});

// Update an existing plot branch
router.put('/update-branch/:branchId', async (req, res) => {
  try {
    const { branchId } = req.params;
    const updatedBranch = await PlotBranch.findByIdAndUpdate(branchId, req.body, { new: true });
    if (!updatedBranch) {
      console.log(`Plot branch not found with ID: ${branchId}`);
      return res.status(404).json({ error: 'Plot branch not found' });
    }
    console.log(`Plot branch updated: ${updatedBranch.branchTitle}`);
    res.status(200).json(updatedBranch);
  } catch (error) {
    console.error(`Error updating plot branch: ${error.message}`, error.stack);
    res.status(400).json({ error: error.message });
  }
});

// Delete a plot branch
router.delete('/delete-branch/:branchId', async (req, res) => {
  try {
    const { branchId } = req.params;
    const deletedBranch = await PlotBranch.findByIdAndDelete(branchId);
    if (!deletedBranch) {
      console.log(`Plot branch not found with ID: ${branchId}`);
      return res.status(404).json({ error: 'Plot branch not found' });
    }
    console.log(`Plot branch deleted: ${deletedBranch.branchTitle}`);
    res.status(204).send(); // No content to send back
  } catch (error) {
    console.error(`Error deleting plot branch: ${error.message}`, error.stack);
    res.status(400).json({ error: error.message });
  }
});

// Retrieve branches for a book project
router.get('/get-branches/:bookProjectId', async (req, res) => {
  try {
    const { bookProjectId } = req.params;
    const branches = await PlotBranch.find({ bookProjectId });
    if (branches.length === 0) {
      console.log(`No branches found for book project ID: ${bookProjectId}`);
      return res.status(404).json({ error: 'No branches found for this book project' });
    }
    console.log(`Retrieved ${branches.length} branches for book project ID: ${bookProjectId}`);
    res.status(200).json(branches);
  } catch (error) {
    console.error(`Error retrieving branches for book project: ${error.message}`, error.stack);
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;