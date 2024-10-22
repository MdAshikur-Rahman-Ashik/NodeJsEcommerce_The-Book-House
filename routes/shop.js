const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
  const productsFilePath = path.join(__dirname, '../data/products.json');
  fs.readFile(productsFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading products file:', err);
      res.render('shop', { products: [] });
    } else {
      const products = JSON.parse(data);
      res.render('shop', { products: products });
    }
  });
});



module.exports = router;
