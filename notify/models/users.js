module.exports = function(sequelize, DataTypes) {
    return sequelize.define('users', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true,
        autoIncrement: true
      },
      password: {
        type: DataTypes.STRING,
      },
      company_name: {
        type: DataTypes.STRING,
      },
    }, {
      tableName: 'users',
      timestamps: false
    });
  };
  