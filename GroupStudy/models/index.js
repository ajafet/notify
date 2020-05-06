// this file makes the database connection, collects all the models
// and sets the associations
// other files can use this for database access by requiring it and
// assigning the exports

'use strict';

// database connection
const Sequelize = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'users.sqlite'
});

// import models
const User = sequelize.import("./users.js");
const Session = sequelize.import("./sessions.js");
const Attendance = sequelize.import("./attendance.js");

// associations
User.hasMany(Session, {foreignKey: "user_id", as: "Sessions"});
Session.belongsTo(User, {foreignKey: "user_id"});

module.exports = {
  User, Session, Attendance
};