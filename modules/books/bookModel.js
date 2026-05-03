const sequelize = require("../../config/database");
const { Model, DataTypes } = require('sequelize');

class Books extends Model {}

Books.init({
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    paginas: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    }
},
{
    sequelize,
    modelName: 'Books',
    timestamps: true,
    underscored: true
});

module.exports = Books;