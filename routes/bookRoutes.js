const express = require('express');
const router = express.Router();
const axios = require('axios');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { ensureAuthenticated } = require('./middleware/authMiddleware');
const BookProject = require('../models/BookProject'); // {Ensure this path is correct and the model exists}
const { fetchOpenAiResponse } = require('../utilities/apiHelpers');

// Route to render the genre selection page
router.get('/genre-selection', ensureAuthenticated, (req, res) => {
  console.log("Rendering the genre selection page.");
  res.render('genreSelection');
});

// Route to handle the genre selection form submission
router.post('/select-genre', ensureAuthenticated, (req, res) => {
  const genre = req.body.genre;
  if (!genre) {
    console.error("No genre selected.");
    return res.status(400).send("Please select a genre.");
  }
  console.log(`Genre selected: ${genre}`);
  req.session.selectedGenre = genre;
  res.redirect('/plot-input');
});

// New route to render the plot input page
router.get('/plot-input', ensureAuthenticated, (req, res) => {
  console.log("Rendering the plot input page.");
  res.render('plotInput');
});

// Updated '/process-plot' POST route
router.post('/process-plot', ensureAuthenticated, async (req, res) => {
  if (!req.body.plot) {
    console.error("Plot input is missing.");
    return res.status(400).send("Plot input is required.");
  }
  console.log('Processing plot input:', req.body.plot);
  req.session.plotInput = req.body.plot;

  // Check if a book project exists for the current session, if not create one
  try {
    let bookProject = await BookProject.findOne({ userId: req.session.passport.user });
    if (!bookProject) {
      bookProject = await BookProject.create({ userId: req.session.passport.user, genre: req.session.selectedGenre, plotInput: req.body.plot });
    }
    req.session.bookProjectId = bookProject._id.toString();
    console.log("Book project ID set in session:", req.session.bookProjectId);
  } catch (error) {
    console.error('Error creating or retrieving book project:', error.message, error.stack);
    return res.status(500).send("Failed to create or retrieve book project.");
  }

  console.log("Redirecting to the AI writing assistant interface.");
  res.redirect('/writing-assistant');
});

// Route to render the AI writing assistant interface
router.get('/writing-assistant', ensureAuthenticated, async (req, res) => {
  const genre = req.session.selectedGenre;
  const plotInput = req.session.plotInput;
  if (!genre || !plotInput) {
    console.error("Genre or plot input missing in session.");
    return res.status(400).send("Missing genre or plot input. Please start over.");
  }
  // Retrieve the current book project ID from the session
  const bookProjectId = req.session.bookProjectId; // Assuming bookProjectId is stored in session after creating or selecting a book project
  if (!bookProjectId) {
    console.error("Book project ID missing in session.");
    return res.status(400).send("Missing book project ID. Please start over.");
  }
  console.log("Rendering the AI writing assistant interface with book project ID:", bookProjectId);
  res.render('writingAssistant', { genre, plotInput, aiResponse: '', bookProjectId });
});

// Route to handle AI interaction
router.post('/ai-interaction', ensureAuthenticated, async (req, res) => {
  const { aiQuestion } = req.body;
  const genre = req.session.selectedGenre;
  const plotInput = req.session.plotInput;

  if (!genre || !plotInput) {
    console.error("Genre or plot input missing in session.");
    return res.status(400).send("Missing genre or plot input. Please start over.");
  }

  try {
    const aiResponse = await fetchOpenAiResponse(`Genre: ${genre}\nPlot: ${plotInput}\nQuestion: ${aiQuestion}`);
    const bookProjectId = req.session.bookProjectId;
    console.log("AI response received.");
    res.render('writingAssistant', { genre, plotInput, aiResponse, bookProjectId });
  } catch (error) {
    console.error('Error interacting with AI:', error.message, error.stack);
    const bookProjectId = req.session.bookProjectId;
    res.render('writingAssistant', { genre, plotInput, error: 'Failed to get response from AI. Please try again.', aiResponse: '', bookProjectId });
  }
});

// Auto-save route
router.post('/auto-save', ensureAuthenticated, async (req, res) => {
  try {
    await BookProject.findOneAndUpdate(
      { userId: req.session.passport.user, genre: req.session.selectedGenre },
      { $set: { aiQuestion: req.body.aiQuestion } },
      { upsert: true, new: true }
    );
    console.log("Auto-saved successfully");
    res.json({ message: 'Auto-saved successfully' });
  } catch (error) {
    console.error('Auto-save error:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to auto-save' });
  }
});

// Manual save route
router.post('/manual-save', ensureAuthenticated, async (req, res) => {
  try {
    await BookProject.findOneAndUpdate(
      { userId: req.session.passport.user, genre: req.session.selectedGenre },
      { $set: { aiQuestion: req.body.aiQuestion } },
      { upsert: true, new: true }
    );
    console.log("Manually saved successfully");
    res.json({ message: 'Manually saved successfully' });
  } catch (error) {
    console.error('Manual save error:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to manually save' });
  }
});

// Route to generate and export the book as a PDF
router.post('/export-book', ensureAuthenticated, async (req, res) => {
  const { selectedGenre, plotInput } = req.session;
  const docTitle = `Book_${Date.now()}.pdf`;
  const docPath = path.join(__dirname, '../tmp', docTitle);

  try {
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(docPath));
    doc.fontSize(25).text('Your Book', { align: 'center' });
    doc.fontSize(16).text(`Genre: ${selectedGenre}`, { align: 'left' });
    doc.fontSize(12).moveDown().text(plotInput);
    doc.end();

    doc.on('finish', function () {
      if (req.body.email) {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: req.body.email,
          subject: 'Your Book Export from MarLoop',
          text: 'Find attached your book.',
          attachments: [
            {
              filename: docTitle,
              path: docPath,
            },
          ],
        };

        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
            res.send('Error sending email');
          } else {
            console.log('Email sent: ' + info.response);
            res.send('Book exported and emailed successfully');
          }
          fs.unlinkSync(docPath);
        });
      } else {
        res.download(docPath, docTitle, function (err) {
          if (err) {
            console.error('Error downloading the book:', err);
            res.status(500).send('Failed to download the book. Please try again.');
          }
          fs.unlinkSync(docPath);
        });
      }
    });
  } catch (error) {
    console.error('Error generating or sending the book:', error.message, error.stack);
    res.status(500).send('Failed to export the book. Please try again.');
    if (fs.existsSync(docPath)) {
      fs.unlinkSync(docPath);
    }
  }
});

// Endpoint to save a version of the book project
router.post('/save-version/:bookProjectId', ensureAuthenticated, async (req, res) => {
  const { bookProjectId } = req.params;
  const { plotBranchId } = req.body;

  try {
    const bookProject = await BookProject.findById(bookProjectId);
    const versionNumber = bookProject.versionHistory.length + 1;
    bookProject.versionHistory.push({ versionNumber, plotBranchId });
    await bookProject.save();
    console.log("Version saved successfully");
    res.json({ message: 'Version saved successfully', versionNumber });
  } catch (error) {
    console.error('Error saving version:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to save version' });
  }
});

// Endpoint to revert to a specific version of the book project
router.post('/revert-version/:bookProjectId/:versionNumber', ensureAuthenticated, async (req, res) => {
  const { bookProjectId, versionNumber } = req.params;

  try {
    const bookProject = await BookProject.findById(bookProjectId);
    const versionToRevert = bookProject.versionHistory.find(v => v.versionNumber === parseInt(versionNumber));

    if (!versionToRevert) {
      return res.status(404).json({ message: 'Version not found' });
    }

    console.log("Project reverted to version " + versionNumber);
    res.json({ message: 'Project reverted to version ' + versionNumber });
  } catch (error) {
    console.error('Error reverting version:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to revert to version' });
  }
});

// Route to render the dashboard page with the most recent book project ID
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  try {
    const bookProject = await BookProject.findOne({ userId: req.session.passport.user }).sort({ createdAt: -1 });
    const bookProjectId = bookProject ? bookProject._id.toString() : null;
    console.log("Rendering the dashboard with the most recent book project ID:", bookProjectId);
    res.render('dashboard', { bookProjectId });
  } catch (error) {
    console.error('Error fetching the most recent book project:', error.message, error.stack);
    res.status(500).send('Failed to fetch the most recent book project. Please try again.');
  }
});

// Route to render the book projects page
router.get('/book-projects', ensureAuthenticated, async (req, res) => {
  try {
    const bookProjects = await BookProject.find({ userId: req.session.passport.user }).sort({ createdAt: -1 });
    console.log("Rendering the book projects page.");
    res.render('bookProjects', { bookProjects });
  } catch (error) {
    console.error('Error fetching book projects:', error.message, error.stack);
    res.status(500).send('Failed to fetch book projects. Please try again.');
  }
});

// New route to render the book project details page
router.get('/book-project/:id', ensureAuthenticated, async (req, res) => {
  try {
    const bookProject = await BookProject.findById(req.params.id);
    if (!bookProject) {
      console.log(`Book project with ID ${req.params.id} not found.`);
      return res.status(404).send("Book project not found.");
    }
    console.log(`Rendering details for book project with ID ${req.params.id}.`);
    res.render('bookProjectDetails', { bookProject });
  } catch (error) {
    console.error('Error fetching book project details:', error.message, error.stack);
    res.status(500).send('Failed to fetch book project details. Please try again.');
  }
});

module.exports = router;