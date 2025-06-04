const express = require('express');
const router = express.Router();
const productController = require('../Controller/productController');


router.post('/', productController.addProduct);

router.put('/:id', productController.updateProduct); // This is the crucial route for updating
router.get('/', productController.getAllproducts); 
router.put('/:id/buy',productController.BuyProduct);
console.log('Defining DELETE /:id route for products');
router.delete('/:id', productController.deleteProduct); 
module.exports = router;