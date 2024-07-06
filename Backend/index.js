const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

require('dotenv').config();
const app = express();

const corsOptions = {
  origin: process.env.BASE_URL,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Route for scraping a single product
app.post('/scrape', async (req, res) => {
  const { url } = req.body;
  // console.log(`Received URL: ${url}`);
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    const title = $('#productTitle').text().trim();
    const price = $('.a-price-whole').first().text().trim();
    const description = $('#feature-bullets').text().trim();
    const image = $('#imgTagWrapperId img').attr('src');

    res.json({ title, price, description, image });
  } catch (error) {
    console.error('Error occurred while scraping:', error.message);
    res.status(500).json({ error: 'Failed to scrape product data' });
  }
});

// Route for comparing two products
app.post('/compare', async (req, res) => {
  const { urls } = req.body;
  // console.log(`Received URLs: ${urls}`);
  try {
    const productData = await Promise.all(
      urls.map(async (url) => {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const title = $('#productTitle').text().trim();
        const price = $('.a-price-whole').first().text().trim();
        const description = $('#feature-bullets').text().trim();
        const image = $('#imgTagWrapperId img').attr('src');

        return { title, price, description, image };
      })
    );

    res.json(productData);
  } catch (error) {
    console.error('Error occurred while comparing products:', error.message);
    res.status(500).json({ error: 'Failed to compare product data' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
