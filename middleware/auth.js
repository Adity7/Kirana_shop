// middleware/auth.js

const ensureAuthenticated = (req, res, next) => {
    // Check if the user is logged in (e.g., if session.user exists)
    if (req.session && req.session.user && req.session.user.id) {
        // If authenticated, proceed to the next middleware/route handler
        return next();
    } else {
        // If not authenticated, redirect to the login page
        // Ensure '/login' is the correct path to your login page
        // You might want to pass a message to display on the login page
        console.log('User not authenticated, redirecting to login.');
        return res.redirect('/login');
    }
};

module.exports = {
    ensureAuthenticated
};