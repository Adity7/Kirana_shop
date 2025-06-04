const express = require('express');
const router = express.Router();
const userController = require('../Controller/userController');

router.post('/login', userController.loginUser); // 👈 Must be present
router.post('/signup', userController.addUser);
router.get('/me', userController.getLoggedInUser);

module.exports = router;