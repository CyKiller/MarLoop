// Load environment variables
require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const passport = require('passport');
const flash = require('connect-flash');
const http = require('http');
const cors = require('cors'); // Added for CORS support
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const plotBranchRoutes = require('./routes/plotBranchRoutes');
const userRoutes = require('./routes/userRoutes');
const cleanupJobs = require('./utilities/cleanupJobs');
const { ensureAuthenticated } = require('./routes/middleware/authMiddleware');
const initSocketServer = require('./utilities/socketServer');

// Passport Config
require('./config/passportConfig')(passport);

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
  console.error("Error: config environment variables not set. Please create/edit .env configuration file.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Enabling CORS for all requests
app.use(cors());

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
app.use(bookRoutes);

// Plot Branch Routes
app.use(plotBranchRoutes);

// User Routes
app.use(userRoutes);

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
  res.render("dashboard");
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