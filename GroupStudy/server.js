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


//////////////////////////////////////////////////////////////////

app.get('/', (request, response) => {
  response.render("user/start");
});

//////////////////////////////////////////////////////////////////

app.get('/english', (request, response) => {
  response.render("user/english_instructions");
});

app.get('/english/get_started', (request, response) => {
  response.render("user/english_get_started");
});

app.post('/english/get_started/submit', (request, response) => {

  fullName = request.body.fullName
  phoneNumber = request.body.phoneNumber

  nameEmpty = false
  phoneEmpty = false

  if (fullName.trim().length == 0) {
    nameEmpty = true
  }

  if (phoneNumber.trim().length == 0) {
    phoneEmpty = true
  }

  if (nameEmpty || phoneEmpty) {
    response.render("user/english_get_started", {errorName : nameEmpty, errorPhone: phoneEmpty, fullName: fullName, phoneNumber: phoneNumber})
    return
  }

  Queue.create({
    name: fullName,
    phone_number: phoneNumber,
    status: 0,
  }).then(queue => {

    response.writeHeader(200, {"Content-Type": "text/html"});
    response.write("it has been posted");
    response.end();

  });

});


//////////////////////////////////////////////////////////////////

app.get('/spanish', (request, response) => {
  response.render("user/spanish_instructions");
});

app.get('/spanish/empezar', (request, response) => {
  response.render("user/spanish_empezar");
});

app.post('/spanish/empezar/completar', (request, response) => {

  fullName = request.body.fullName
  phoneNumber = request.body.phoneNumber

  nameEmpty = false
  phoneEmpty = false

  if (fullName.trim().length == 0) {
    nameEmpty = true
  }

  if (phoneNumber.trim().length == 0) {
    phoneEmpty = true
  }

  if (nameEmpty || phoneEmpty) {
    response.render("user/spanish_empezar", {errorName : nameEmpty, errorPhone: phoneEmpty, fullName: fullName, phoneNumber: phoneNumber})
    return
  }

  Queue.create({
    name: fullName,
    phone_number: phoneNumber,
    status: 0,
  }).then(queue => {

    response.writeHeader(200, {"Content-Type": "text/html"});
    response.write("it has been posted in spanish");
    response.end();

  });

});


// Start Socket


//////////////////////////////////////////////////////////////////

app.get('/admin', (request, response) => {
  response.render("admin/dashboard");
});


//////////////////////////////////////////////////////////////////

app.get('/admin/waiting', (request, response) => {

  Queue.findAll({
    where: {
      status: 0, 
    }
  }).then(queue => {
    response.render("admin/waiting", { queue: queue }); 
});
});


//////////////////////////////////////////////////////////////////

app.get('/admin/cutting', (request, response) => {

  Queue.findAll({
    where: {
      status: 1, 
    }
  }).then(queue => {
    response.render("admin/cutting", { queue: queue }); 
  });
});

//////////////////////////////////////////////////////////////////

app.get('/admin/account', (request, response) => {
  response.render("admin/account");
});

//////////////////////////////////////////////////////////////////

app.get('/login', (request, response) => {
  response.render("admin/login");
});

app.get('admin/logoff', (request,response) => {
	// remove user from session
	response.redirect("admin/login");
});

app.post('/action', (request,response) => {

  // set username and password
  password = request.body.password;

  // route to send user
  var route = "";
  if (req.body.login != undefined) route = "loginPage";
  else route = "registerPage";


// user pressed login button
if (typeof req.body.login !== 'undefined') {

    // attempt to login user

    // get user by username
    User.findOne({
      where:{username: uname}
    }).then(user => {
      //check Password
    if(user){
      bcrypt.compare(pw, user.password_hash, (err,match) => {
        if(match){
          // add user to session, redirect to home page and check if normal or admin
          if (user){
            account = true;
          }
          req.session.user = user;
          //res.render('allSessionsPage', {user: user, hasaccount: account});
          res.redirect('/allSessions');
        }
        else{
          res.render("/login");
        }
      });
    }

    });

} else {
    // attempt to register user


  // Look up username
  User.findOne({
    where:{username: uname}
  }).then(user => {
    //check if user already exists in database
    if(user){
      errors.push({msg: "Username already exists!"});
      res.render("registerPage", {errors: errors, username: uname, email: email});
    }
    else{
      // if no user exists, then create user
      User.create({
        username: uname,
        email: email,
        password_hash: bcrypt.hashSync(pw, 10)
      }).then(user => {
        //add new user to session and check if account is normal or admin
        if (user){
          account = true;
        }
        req.session.user = user;
        //res.render('allSessionsPage', {user: user, hasaccount: account});
        res.redirect('/allSessions');
      });

    }
  });

}

});

//////////////////////////////////////////////////////////////////
var server = app.listen(app.get('port'), function () {
  console.log("Server started...");
});
