const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { ensureAuthenticated } = require('./middleware/authMiddleware');

router.get('/user-profile', ensureAuthenticated, async (req, res) => {
    try {
        const user = await User.findById(req.session.passport.user);
        if (!user) {
            console.log('User not found');
            return res.status(404).send('User not found');
        }
        console.log('Rendering user profile for:', user.username);
        res.render('userProfile', { user });
    } catch (error) {
        console.error('Error fetching user profile:', error.message, error.stack);
        res.status(500).send('Internal server error');
    }
});

module.exports = router;