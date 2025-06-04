const express = require('express');
const path = require('path');
const app = express();
const session = require('express-session');
const db = require('./config/db_connector');
const bcrypt = require('bcryptjs');
const userRoutes = require('./routes/userRouter');
const productRoutes = require('./routes/productRouter');
const { User, Product } = require('./models/association');
const cors = require('cors');

// Middleware
app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'adi0710',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24
    }
}));

// Authentication Middleware
function isAuthenticated(req, res, next) {
    if (req.session.user && req.session.user.id) {
        return next();
    }
    console.log('User not authenticated, redirecting to /login.');
    return res.redirect('/login');
}

// Serve Static Files
app.use(express.static(path.join(__dirname, 'views')));

// Public Routes (accessible without authentication)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.use('/api/users', userRoutes);

// Protected Routes (require authentication)
app.get('/kirana', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.use('/api/product', isAuthenticated, productRoutes);

// Logout Route
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            return res.status(500).send("Error logging out.");
        }
        res.clearCookie('connect.sid');
        res.redirect('/login');
    });
});

const PORT = 5000;

db.sync({ alter: false })
    .then(() => {
        console.log("✅ Database synced successfully.");
        require('./models/association');
        app.listen(PORT, () => {
            console.log(`✅ Server running on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ Database sync error:", err);
    });