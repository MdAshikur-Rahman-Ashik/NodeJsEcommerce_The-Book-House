const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

router.get('/', (req, res) => {
  const cartFilePath = path.join(__dirname, '../data/cart.json');
  fs.readFile(cartFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading cart data:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    const cartItems = JSON.parse(data) || [];
    const productsFilePath = path.join(__dirname, '../data/products.json');
    fs.readFile(productsFilePath, 'utf8', (err, productsData) => {
      if (err) {
        console.error('Error reading products data:', err);
        res.status(500).send('Internal Server Error');
        return;
      }

      const products = JSON.parse(productsData) || [];
      const cartItemsWithDetails = cartItems.map(cartItem => {
        const product = products.find(product => product.id === cartItem.productId);
        return {
          id: product.id,
          product_title: product.product_title,
          product_price: product.product_price,
          product_description: product.product_description,
          image_path: product.image_path,
          quantity: cartItem.quantity
        };
      });

      res.render('cart', { cartItems: cartItemsWithDetails });
    });
  });
});

router.post('/add', (req, res) => {
  const productId = req.body.productId;

  const cartFilePath = path.join(__dirname, '../data/cart.json');
  fs.readFile(cartFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading cart data:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    let cart = [];
    if (data) {
      cart = JSON.parse(data);
    }

    const existingProductIndex = cart.findIndex(item => item.productId === productId);

    if (existingProductIndex !== -1) {
      cart[existingProductIndex].quantity++;
    } else {
      cart.push({ productId: productId, quantity: 1 });
    }

    fs.writeFile(cartFilePath, JSON.stringify(cart, null, 2), 'utf8', (err) => {
      if (err) {
        console.error('Error writing cart data:', err);
        res.status(500).send('Internal Server Error');
        return;
      }
      console.log('Product added to cart:', productId);
      res.redirect('/');
    });
  });
});

router.post('/increment', (req, res) => {
  const productId = req.body.productId;
  const cartFilePath = path.join(__dirname, '../data/cart.json');

  fs.readFile(cartFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading cart data:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    let cart = [];
    if (data) {
      cart = JSON.parse(data);
    }

    const itemIndex = cart.findIndex(item => item.productId === productId);
    if (itemIndex !== -1) {
      cart[itemIndex].quantity++;
      fs.writeFile(cartFilePath, JSON.stringify(cart), 'utf8', (err) => {
        if (err) {
          console.error('Error writing cart data:', err);
          res.status(500).send('Internal Server Error');
          return;
        }
        res.sendStatus(200);
      });
    } else {
      res.status(404).send('Product not found in cart');
    }
  });
});


router.post('/decrement', (req, res) => {
  const productId = req.body.productId;
  const cartFilePath = path.join(__dirname, '../data/cart.json');

  fs.readFile(cartFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading cart data:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    let cart = [];
    if (data) {
      cart = JSON.parse(data);
    }

    const itemIndex = cart.findIndex(item => item.productId === productId);
    if (itemIndex !== -1) {
      if (cart[itemIndex].quantity > 1) {
        cart[itemIndex].quantity--;
        fs.writeFile(cartFilePath, JSON.stringify(cart), 'utf8', (err) => {
          if (err) {
            console.error('Error writing cart data:', err);
            res.status(500).send('Internal Server Error');
            return;
          }
          res.sendStatus(200);
        });
      } else {

        cart.splice(itemIndex, 1);
        fs.writeFile(cartFilePath, JSON.stringify(cart), 'utf8', (err) => {
          if (err) {
            console.error('Error writing cart data:', err);
            res.status(500).send('Internal Server Error');
            return;
          }
          res.sendStatus(200);
        });
      }
    } else {
      res.status(404).send('Product not found in cart');
    }
  });
});

router.post('/delete', (req, res) => {
  const productId = req.body.productId;

  const cartFilePath = path.join(__dirname, '../data/cart.json');
  fs.readFile(cartFilePath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading cart data:', err);
      res.status(500).send('Internal Server Error');
      return;
    }

    let cart = [];
    if (data) {
      cart = JSON.parse(data);
    }

    const index = cart.findIndex(item => item.productId === productId);
    if (index !== -1) {
      cart.splice(index, 1);

      fs.writeFile(cartFilePath, JSON.stringify(cart, null, 2), 'utf8', (err) => {
        if (err) {
          console.error('Error writing cart data:', err);
          res.status(500).send('Internal Server Error');
          return;
        }
        console.log('Item deleted from cart:', productId);
        res.sendStatus(200);
      });
    } else {
      res.status(404).send('Item not found in cart');
    }
  });
});

module.exports = router;
