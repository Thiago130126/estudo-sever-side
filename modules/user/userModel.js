const sequelize = require("../../config/database");
const {Model, DataTypes } = require('sequelize');

class Users extends Model {}

Users.init({
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    first_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    last_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    ativo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    adm: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
},
{
    sequelize,
    modelName: 'Users',
    timestamps: true,
    underscored: true   
});

module.exports = Users;