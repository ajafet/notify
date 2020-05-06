module.exports = function(sequelize, DataTypes) {
    return sequelize.define('queue', {
      id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING,
      },
      phone_number: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.INTEGER,
      },
    }, {
      getterMethods: {
        currentStatus() {
          if (this.status == 0) 
            return "PENDING"
          else if (this.status == 1) 
            return "WAITING"
          else if (this.status == 2)
            return "CUTTING"
        }
      },
      tableName: 'queue',
      timestamps: false
    });
  };
  