const express = require('express');

const router = express.Router();

/* Homepage */
router.get('/', (req, res) => {
  res.render('index', { title: 'Vidly App', message: 'Welcome to the homepage' });
});

module.exports = router;
