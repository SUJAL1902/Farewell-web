const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { passcode } = req.body;

  if (passcode === process.env.ADMIN_PASSCODE) {
    const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, role: 'admin' });
  }

  if (passcode === process.env.GUEST_PASSCODE) {
    const token = jwt.sign({ role: 'guest' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, role: 'guest' });
  }

  res.status(401).json({ message: 'Incorrect passcode. Try again.' });
});

module.exports = router;
