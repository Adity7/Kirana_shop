// models/association.js
const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/db_connector'); // Your Sequelize instance

// Define the User model
const User = sequelize.define('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: { // Assuming email is also part of your User model
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: { // Hashed password
        type: DataTypes.STRING,
        allowNull: false
    }
});

// Define the Product model
const Product = sequelize.define('Product', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: { // Foreign key to link to the User table
        type: DataTypes.INTEGER,
        allowNull: false, // This is why you got the 'notNull Violation' error
        references: {
            model: 'Users', // This refers to the table name 'Users'
            key: 'id'
        },
        onUpdate: 'CASCADE', // What happens if the referenced User ID is updated
        onDelete: 'CASCADE'  // What happens if the referenced User is deleted
    }
});

// Set up the associations AFTER defining both models
// A User can have many Products
User.hasMany(Product, {
    foreignKey: 'userId', // The foreign key in the Product table
    as: 'products'        // Alias for accessing associated products (e.g., user.getProducts())
});

// A Product belongs to one User
Product.belongsTo(User, {
    foreignKey: 'userId', // The foreign key in the Product table
    as: 'creator'         // Alias for accessing the associated user (e.g., product.getCreator())
});

Product.belongsTo(User, {
    foreignKey: 'modifiedBy',
    as: 'modifier' // <--- FIXED: Using a unique alias
});

module.exports = { User, Product }; // Export both models