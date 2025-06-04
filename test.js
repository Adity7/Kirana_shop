const express = require('express');
const path = require('path');
const app = express();
// const session = require('express-session');
const db = require('./config/db_connector'); // Should export mysql pool
const bcrypt = require('bcryptjs');
// const userRoutes = require('./routes/userRouter');
const cors = require('cors');

// Middleware
// app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.use(session({
//     secret: 'adi0710',
//     resave: false,
//     saveUninitialized: false,
//     cookie: { maxAge: 1000 * 60 * 60 }
// }));

// API Routes - these should come BEFORE any catch-all routes
// app.use('/api/users', userRoutes);

// Static files
app.use(express.static(path.join(__dirname, 'views')));

function isAuthenticated(req, res, next){
    if (req.session.user) {
        return next();
    }
    res.redirect('/signup');
}

// Protected routes
app.get('/kirana', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Auth Pages
app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.get('/', (req, res) => {
    res.redirect('/signup');
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err){
            return res.redirect('/kirana');
        }
        res.clearCookie('connect.sid');
        res.redirect('/signup');
    });
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});