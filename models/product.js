const {Sequelize, DataTypes} = require('sequelize');
const sequelize = require('../config/db_connector');

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
    }


})

module.exports = Product;