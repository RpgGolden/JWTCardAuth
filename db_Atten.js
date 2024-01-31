const { Sequelize, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
    const Attendances = sequelize.define('Attendances', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        timeIn: {
            type: DataTypes.DATE,
        },
        timeOut: {
            type: DataTypes.DATE,
        }
    },
        {
            timestamps: false
        }
    );
    return Attendances;
};
