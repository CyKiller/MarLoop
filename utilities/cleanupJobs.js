const cron = require('node-cron');
const mongoose = require('mongoose');
const User = require('../models/User');
const session = require('express-session');
const MongoStore = require('connect-mongo');

// Connect to the MongoDB database
mongoose.connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB for cleanup task.'))
  .catch(err => console.error('MongoDB connection error for cleanup task:', err));

// Initialize session store
const mongoStore = MongoStore.create({
  mongoUrl: process.env.DATABASE_URL,
  collectionName: 'sessions'
});

// Scheduled job to run daily for cleaning up stale user accounts and sessions
cron.schedule('0 0 * * *', async () => {
    console.log('Running daily cleanup job at:', new Date());

    // Cleanup stale user accounts
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 30); // 30 days ago

    try {
        // Remove user accounts that have not been accessed in over 30 days
        const usersDeleted = await User.deleteMany({
            lastAccessed: { $lt: thresholdDate }
        });
        console.log(`Deleted ${usersDeleted.deletedCount} stale user accounts.`);

        // Cleanup stale sessions using the session store's API
        mongoStore.clearExpiredSessions((err) => {
            if (err) {
                console.error('Error clearing expired sessions:', err);
            } else {
                console.log('Expired sessions cleared successfully.');
            }
        });
    } catch (error) {
        console.error('Error during cleanup:', error);
    }
});

console.log('Scheduled daily cleanup job.');