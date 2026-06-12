const express = require('express');
const Quote = require('../models/Quote');
const { verifyAdmin, verifyGuest } = require('../middleware/auth');

const router = express.Router();

// GET all quotes (guest+)
router.get('/', verifyGuest, async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ createdAt: -1 });
    res.json(quotes);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST new quote (admin only)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const { text, author } = req.body;
    if (!text) return res.status(400).json({ message: 'Quote text is required' });
    const quote = await Quote.create({ text, author });
    res.status(201).json(quote);
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE quote (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    await Quote.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
