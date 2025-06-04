const db = require('../config/db_connector');
const User = require('../models/user');
const bcrypt = require('bcryptjs');

const addUser = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    });

    req.session.user = { id: newUser.id, username, email };
    return res.json({ redirect: '/kirana' });

  } catch (error) {
    console.error("Signup Error:", error); // 👈 This helps you debug
    return res.status(500).json({ message: 'Unable to register user', error: error.message });
  }
};


// const loginUser = async (req, res) => {
//   const { email, password } = req.body;

//   if (!email || !password) {
//     return res.status(400).json({ message: 'Email and password are required' });
//   }

//   try {
//     // Find user by email
//     const newUser = await User.findOne({ where: { email } });

//     if (!newUser) {
//       return res.status(400).json({ message: 'User not found' });
//     }

//     // Compare hashed password
//     const isValid = await bcrypt.compare(password, newUser.password);

//     if (!isValid) {
//       return res.status(400).json({ message: 'Invalid credentials' });
//     }

//     // Set session
//     req.session.newUser = { id: newUser.id, username: newUser.username, email: newUser.email };

//     // Send success response
//     return res.json({ redirect: '/kirana' });

//   } catch (error) {
//     console.error("Login Error:", error);
//     return res.status(500).json({ message: 'Internal server error', error: error.message });
//   }
// };

// module.exports = {
//     addUser,
//     loginUser
// }
// Adjust path to your User model

// Login controller function
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (isValid) {
    req.session.user = { id: user.id, username: user.username, email: user.email, role: user.role };
    return res.json({ redirect: '/kirana' });
    }

    if (!isValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    req.session.user = { id: user.id, username: user.username, email };
    return res.json({ redirect: '/kirana' });

  } catch (error) {
    console.error("Login Error:", error.message);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

getLoggedInUser = (req, res) => {
    if (req.session.user && req.session.user.id) {
        // Return only the ID for security, or other non-sensitive info
        return res.status(200).json({ userId: req.session.user.id, username: req.session.user.username });
    } else {
        return res.status(401).json({ message: 'No user logged in.' });
    }
};
module.exports = { addUser, loginUser, getLoggedInUser }; // Make sure both are exported