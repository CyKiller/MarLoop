// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const passport = require('passport');
const flash = require('connect-flash');
const http = require('http');
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes"); // Added import for bookRoutes
const plotBranchRoutes = require('./routes/plotBranchRoutes'); // Import plotBranchRoutes
const userRoutes = require('./routes/userRoutes'); // Import userRoutes
const cleanupJobs = require('./utilities/cleanupJobs'); // Import cleanup jobs
const { ensureAuthenticated } = require('./routes/middleware/authMiddleware'); // Import ensureAuthenticated middleware
const initSocketServer = require('./utilities/socketServer'); // Import WebSocket server initializer

// Passport Config
require('./config/passportConfig')(passport); // Ensure this file is created as per instructions

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
  console.error("Error: config environment variables not set. Please create/edit .env configuration file.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setting the templating engine to EJS
app.set("view engine", "ejs");

// Serve static files
app.use(express.static("public"));

// Database connection
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error(`Database connection error: ${err.message}`);
    console.error(err.stack);
    process.exit(1);
  });

// Session configuration with connect-mongo
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
  }),
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash for flash messages
app.use(flash());

// Global variables for flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`);
  console.error(error.stack);
});

// Logging session creation and destruction
app.use((req, res, next) => {
  const sess = req.session;
  // Make session available to all views
  res.locals.session = sess;
  if (!sess.views) {
    sess.views = 1;
    console.log("Session created at: ", new Date().toISOString());
  } else {
    sess.views++;
    console.log(
      `Session accessed again at: ${new Date().toISOString()}, Views: ${sess.views}, User ID: ${sess.userId || '(unauthenticated)'}`,
    );
  }
  next();
});

// Authentication Routes
app.use(authRoutes);

// Book Routes
app.use(bookRoutes); // Using bookRoutes in the application

// Plot Branch Routes
app.use(plotBranchRoutes); // Using plotBranchRoutes in the application

// User Routes
app.use(userRoutes); // Using userRoutes in the application

// Root path response
app.get("/", (req, res) => {
  if (req.isAuthenticated()) {
    res.redirect("/dashboard");
  } else {
    res.render("index");
  }
});

// Dashboard route for authenticated users
app.get("/dashboard", ensureAuthenticated, (req, res) => {
  res.render("dashboard"); // Assuming 'dashboard.ejs' exists and is properly set up
});

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`);
  console.error(err.stack);
  res.status(500).send("There was an error serving your request.");
});

// Replace app.listen with server.listen to integrate Socket.IO
const server = http.createServer(app);
initSocketServer(server);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});