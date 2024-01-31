const { Sequelize, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Employees = sequelize.define('Employees', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    uuid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    lab: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    trackStr: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    birthday: {
      type: DataTypes.DATEONLY,
    }
  });

  return Employees;
};
