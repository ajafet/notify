/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('users', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true,
        autoIncrement: true
      },
      username: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      password_hash: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      admin: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: '0'
      }, 
      email: {
        type: DataTypes.TEXT,
        allowNull: false
      },
      attending: {
        type: DataTypes.TEXT, 
        allowNull: true
      }
    }, {
      tableName: 'users',
      timestamps: false
    });
  };
  