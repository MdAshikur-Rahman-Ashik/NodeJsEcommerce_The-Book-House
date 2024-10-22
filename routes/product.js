const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/product/:id', (req, res) => {
    const productId = req.params.id;
    const productsFilePath = path.join(__dirname, '../data/products.json');
    fs.readFile(productsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading products file:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        try {
            const products = JSON.parse(data);
            const product = products.find(product => product.id === productId);
            if (product) {
                res.json(product);
            } else {
                res.status(404).json({ error: 'Product not found' });
            }
        } catch (error) {
            console.error('Error parsing products data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
});



module.exports = router;
