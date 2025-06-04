const db = require('../config/db_connector');
const { Product } = require('../models/association');

addProduct = async (req, res) => {
    console.log("Received add product request with body:", req.body);
    const { name, description, price, quantity } = req.body;

    // Get the userId from the session of the logged-in user
    const userId = req.session.user ? req.session.user.id : null;

    if (!userId) {
        return res.status(401).json({ message: 'You must be logged in to add a product.' });
    }

    if (!name || !description || !price || !quantity) {
        console.log("Validation failed:", { name, description, price, quantity });
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const existingProduct = await Product.findOne({ where: { name: name } });

        if (existingProduct) {
            return res.status(409).json({ message: `Candy with name "${name}" already exist.` });
        }

        const newProduct = await Product.create({
            name,
            description,
            price,
            quantity,
            userId: userId // <--- ENSURE YOU ARE PROVIDING THE userId HERE
        });
        console.log("Product created successfully:", newProduct);
        return res.status(201).json(newProduct);
    } catch (err) {
        console.error("Error creating product:", err);
        return res.status(500).json({ message: 'Unable to create product', error: err.message });
    }
};


// updateProduct = async (req, res) => {
//     try {
//         const id = req.params.id; // Extract the product ID from the URL parameters
//         console.log(`Updating product with ID: ${id}`, req.body);
//         const { name, description, price, quantity } = req.body;
//         const product = await Product.findByPk(id);

//         if (!product) {
//             return res.status(404).send("Product not found");
//         }

//         product.name = name;
//         product.description = description;
//         product.price = price;
//         product.quantity = quantity;
//         await product.save();

//         res.status(200).json(product); // Send the updated product data with 200 status
//     } catch (error) {
//         console.error("Error updating product:", error);
//         res.status(500).send("Error updating product");
//     }
// };


updateProduct = async (req, res) => {
    try {
        const id = req.params.id; // Get the ID from the URL parameters
        console.log(`Updating product with ID: ${id}`, req.body);
        const { name, description, price, quantity } = req.body;
        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).send("Product not found");
        }

        product.name = name;
        product.description = description;
        product.price = price;
        product.quantity = quantity;
        await product.save();

        res.status(200).json(product); // Send the updated product data
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send("Error updating product");
    }
};


getAllproducts = async(req, res)=> {
    try{
        const product = await Product.findAll();
        res.status(200).json(product);
    } catch(error){
        console.error("Error fetching products:", error);
        res.status(500).json({message: "Failed to fetch products", error: error.message});
    }
};

BuyProduct = async(req, res) => {
    try {
        const id = req.params.id;
        // Log the incoming request body and ID
        console.log(`Backend: Received PUT request for product ID: ${id} with body:`, req.body);

        const { quantity } = req.body; // Expecting only quantity for buy action

        // Basic validation for quantity
        if (typeof quantity === 'undefined' || quantity === null || isNaN(quantity)) {
            console.log("Backend: Quantity is invalid or missing.");
            return res.status(400).send("Invalid quantity provided.");
        }

        const product = await Product.findByPk(id);

        if (!product) {
            console.log(`Backend: Product with ID ${id} not found.`);
            return res.status(404).send("Product not found");
        }

        // Log current and new quantity
        console.log(`Backend: Product ${product.name} (ID: ${id}) - Old quantity: ${product.quantity}, New quantity: ${quantity}`);

        product.quantity = quantity; // Update the quantity
        await product.save(); // Save changes to the database

        console.log(`Backend: Product ${product.name} (ID: ${id}) quantity updated successfully to ${product.quantity}.`);
        res.status(200).json(product); // Send the updated product
    } catch (error) {
        console.error("Backend: Error updating product quantity:", error);
        res.status(500).send("Error updating product quantity");
    }
};

deleteProduct = async(req, res) =>{
    try {
        const id = req.params.id; // Get the ID from the URL parameters
        console.log(`Attempting to delete product with ID: ${id}`);

        const product = await Product.findByPk(id);

        if (!product) {
            console.log(`Product with ID ${id} not found.`);
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Authorization check: Ensure the logged-in user owns this product
        const userId = req.session.user ? req.session.user.id : null;
        if (!userId || product.userId !== userId) {
            console.log(`User ${userId} attempted to delete product ${id} but is not the owner (owner: ${product.userId}).`);
            return res.status(403).json({ message: 'You are not authorized to delete this product.' });
        }

        await product.destroy(); // Delete the product from the database
        console.log(`Product with ID ${id} deleted successfully.`);
        return res.status(204).send(); // 204 No Content for successful deletion
    } catch (error) {
        console.error("Error deleting product:", error);
        return res.status(500).json({ message: 'Unable to delete product', error: error.message });
    }
};

module.exports = { 
    addProduct,
    updateProduct,
    getAllproducts,
    BuyProduct,
    deleteProduct
};