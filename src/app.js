const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use('/media', require('./routes/mediaRoutes'));
app.use('/ratings', require('./routes/ratingRoutes'));
app.use('/auth', require('./routes/authRoutes'));
app.use('/user', require('./routes/userRoutes'));
app.use('/watchlist', require('./routes/watchlistRoutes'));

app.get('/', (req, res) => {
  res.send('API is running 🎬');
});

module.exports = app;
