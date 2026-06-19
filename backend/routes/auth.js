const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

// Email regex pattern meeting the user specifications
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z][a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { full_name, email, password, confirm_password } = req.body;

  // Validation 1: Full Name required
  if (!full_name || !full_name.trim()) {
    return res.status(400).json({ error: 'Full Name is required.' });
  }

  // Validation 2: Email validation
  if (!email) {
    return res.status(400).json({ error: 'Email Address is required.' });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  // Validation 3: Password validation (Min 8 chars)
  if (!password || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters long.' });
  }

  // Validation 4: Confirm Password validation
  if (password !== confirm_password) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  const connection = await pool.getConnection();
  try {
    // Validation 5: Prevent duplicate email registration
    const [existingUsers] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'This email is already registered.' });
    }

    // Hash password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert user
    const [result] = await connection.query(
      'INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)',
      [full_name.trim(), email.trim().toLowerCase(), hashedPassword]
    );

    const userId = result.insertId;

    // Generate JWT token
    const token = jwt.sign(
      { id: userId, email: email.trim().toLowerCase() },
      process.env.JWT_SECRET || 'california_dashboard_super_secure_key_2026',
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'Registration successful!',
      token,
      user: {
        id: userId,
        full_name: full_name.trim(),
        email: email.trim().toLowerCase()
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'An error occurred during registration. Please try again.' });
  } finally {
    connection.release();
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Validation
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email Address is required.' });
  }
  if (!password) {
    return res.status(400).json({ error: 'Password is required.' });
  }

  const connection = await pool.getConnection();
  try {
    // Retrieve user
    const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email.trim().toLowerCase()]);
    if (users.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'california_dashboard_super_secure_key_2026',
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'An error occurred during login. Please try again.' });
  } finally {
    connection.release();
  }
});

// GET /api/auth/profile
router.get('/profile', authMiddleware, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const [users] = await connection.query('SELECT id, full_name, email, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }
    return res.json({ user: users[0] });
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ error: 'An error occurred retrieving user profile.' });
  } finally {
    connection.release();
  }
});

module.exports = router;
