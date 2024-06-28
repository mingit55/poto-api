const express = require('express');
const bodyParser = require('body-parser');
const Twit = require('twit');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

const T = new Twit({
  consumer_key: process.env.TWIT_API_KEY,
  consumer_secret: process.env.TWIT_API_SECRET,
  access_token: process.env.TWIT_ACCESS_TOKEN,
  access_token_secret: process.env.TWIT_ACCESS_TOKEN_SECRET,
});

app.get('/fetch-tweets', async (req, res) => {
  try {
    const { data } = await T.get('statuses/user_timeline', { screen_name: '@potoreuka', count: 10 });
    const images = data.filter(tweet => tweet.entities.media && tweet.entities.media.length > 0)
                       .map(tweet => tweet.entities.media[0].media_url);

    // // 블로그로 전송하는 부분
    // await axios.post('https://potoreuka', { images });

    res.json({ success: true, images });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
