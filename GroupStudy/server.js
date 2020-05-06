// import the models
const { Queue } = require('./models');

const express = require('express');
const path = require('path');
var hbs = require('express-handlebars');
const handlebars = require('handlebars');
var helpers = require('handlebars-helpers');
const session = require('express-session');
const bcrypt = require('bcrypt');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

app = express();
app.set('port', 8000);

app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: __dirname + '/views/layouts/',
}));

app.set('view engine', 'hbs');

// setup body parsing for form data
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// set up session (in-memory storage by default)
app.use(session({ secret: "This is a big long secret lama string." }));

// setup static file service
app.use(express.static(path.join(__dirname, 'static')));



handlebars.registerHelper('joined', function (sessionId, userAttending, options) {
  if (!userAttending.includes("-" + sessionId)) {
    return options.fn(this);
  }
  return options.inverse(this);
});

handlebars.registerHelper('users', function (userId, sessionId, options) {
  if (userId != sessionId) {
    return options.fn(this);
  }
  return options.inverse(this);
});

//////////////////////////////////////////////////////////////////

app.get('/', (request, response) => {
  response.render("user/start");
});

//////////////////////////////////////////////////////////////////

app.get('/admin', (request, response) => {
  response.render("admin/dashboard");
});

//////////////////////////////////////////////////////////////////

app.get('/admin/pending', (request, response) => {
  response.render("admin/dashboard");
});

//////////////////////////////////////////////////////////////////

app.get('/admin/waiting', (request, response) => {
  response.render("admin/dashboard");
});

//////////////////////////////////////////////////////////////////

app.get('/admin/cutting', (request, response) => {
  response.render("admin/dashboard");
});

//////////////////////////////////////////////////////////////////

app.get('/admin/account', (request, response) => {
  response.render("admin/dashboard");
});

//////////////////////////////////////////////////////////////////

app.get('/login', (request, response) => {
  response.render("admin/login");
});

//////////////////////////////////////////////////////////////////
var server = app.listen(app.get('port'), function () {
  console.log("Server started...")
});
