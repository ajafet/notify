/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('attendance', {
      record_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      session_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'sessions',
          key: 'id'
        }
      }
    }, {
      tableName: 'attendance',
      timestamps: false
    });
  };
  