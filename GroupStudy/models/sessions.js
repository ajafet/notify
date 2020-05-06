module.exports = function(sequelize, DataTypes) {
    return sequelize.define('sessions', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      course: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      location: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      date: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      time: {
        type: DataTypes.TEXT,
        allowNull: true
      }, 
      heldby: {
        type: DataTypes.TEXT, 
        allowNull: true
      }, 
      going: {
        type: DataTypes.INTEGER, 
        allowNull: true
      }
    }, {
      tableName: 'sessions',
      timestamps: false
    });
  };
