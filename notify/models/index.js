// this file makes the database connection, collects all the models and sets the associations
// other files can use this for database access by requiring it and assigning the exports

'use strict';

// database connection
const Sequelize = require('sequelize');
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'data.sqlite'
});

// import models
const Queue = sequelize.import("./queue.js");
const Users = sequelize.import("./users.js");

module.exports = {
  Queue,
  Users, 
};