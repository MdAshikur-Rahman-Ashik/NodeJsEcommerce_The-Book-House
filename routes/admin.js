const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const multer = require('multer');
const app = express();
app.use(express.json());
router.get('/', (req, res) => {
    const productsFilePath = path.join(__dirname, '../data/products.json');
    fs.readFile(productsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading products file:', err);
            res.render('admin/admin', { products: [] });
        } else {
            const products = JSON.parse(data);
            res.render('admin/admin', { products: products });
        }
    });
});

function generateProductId() {
    return 'PROD_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
}

function readProductData() {
    const filePath = path.join(__dirname, '../data/products.json');
    try {
        const jsonData = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(jsonData);
    } catch (error) {
        console.error('Error reading product data:', error);
        return [];
    }
}

function writeProductData(products) {
    const filePath = path.join(__dirname, '../data/products.json');
    try {
        const productsWithForwardSlashes = products.map(product => ({
            ...product,
            image_path: product.image_path.replace(/\\/g, '/')
        }));
        fs.writeFileSync(filePath, JSON.stringify(productsWithForwardSlashes, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing product data:', error);
    }
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        cb(null, `product-${timestamp}.jpg`);
    },
});

const upload = multer({ storage });

router.post('/product/upload', upload.single('image'), (req, res) => {
    const { product_name, product_price, product_description } = req.body;
    const imagePath = req.file.path;

    const newProduct = {
        id: generateProductId(),
        product_title: product_name,
        product_price: product_price,
        product_description: product_description,
        image_path: imagePath
    };


    let products = readProductData();

    products.push(newProduct);

    writeProductData(products);

    res.redirect('/admin');
});


router.post('/product/delete/:id', (req, res) => {
    const productId = req.params.id;

    let products = readProductData();

    const productIndex = products.findIndex(product => product.id === productId);

    if (productIndex !== -1) {

        const imagePath = products[productIndex].image_path;
        products.splice(productIndex, 1);

        writeProductData(products);

        if (imagePath) {
            const imagePathToDelete = path.join(__dirname, '..', imagePath);
            try {
                fs.unlinkSync(imagePathToDelete);
                console.log(`Deleted image file: ${imagePathToDelete}`);
            } catch (err) {
                console.error(`Error deleting image file: ${err}`);
            }
        }

        res.redirect('/admin');
    } else {
        res.status(404).send('Product not found');
    }
});



app.put('/admin/product/edit/:id', (req, res) => {
    const productId = req.params.id;
    const updatedProductData = req.body;

    const productsFilePath = path.join(__dirname, '../data/products.json');
    fs.readFile(productsFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading products file:', err);
            res.status(500).send('Internal Server Error');
            return;
        }

        try {
            let products = JSON.parse(data);
            const index = products.findIndex(product => product.id === productId);

            if (index === -1) {
                res.status(404).send('Product not found');
                return;
            }

            products[index] = {
                ...products[index],
                ...updatedProductData
            };

            fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), 'utf8', (err) => {
                if (err) {
                    console.error('Error writing products file:', err);
                    res.status(500).send('Internal Server Error');
                    return;
                }

                res.redirect('/admin');
            });
        } catch (error) {
            console.error('Error parsing products data:', error);
            res.status(500).send('Internal Server Error');
        }
    });
});

module.exports = router;
