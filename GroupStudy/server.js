// import the models
const { User, Session, Attendance } = require('./models');

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
app.set('port', 3002);

app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: __dirname + '/views/layouts/',
  partialsDir: __dirname + '/views/partials/'
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
app.get('/landingPage', (req, res) => {
  if (req.session.user) {
    res.render('landingPage', { user: req.session.user, hasaccount: true });
  } else {
    res.render('landingPage');
  }
});

//////////////////////////////////////////////////////////////////
app.get('/register', (req, res) => {
  res.render('registerPage');
});

//////////////////////////////////////////////////////////////////
app.get('/mySessions', (req, res) => {
  if (req.session.user) {
    Session.findAll({ //Finds all where the user_id is contained in the sessions user id.
      where: {
        user_id: req.session.user.id
      }
    }).then(sessions => {
      res.render('mySessionsPage', { user: req.session.user, hasaccount: true, sessions: sessions, sessCounter: sessions.length, userAttending: req.session.user.attending });
    });
  } else {
    res.render('loginPage');
  }
});

//////////////////////////////////////////////////////////////////
app.get('/allSessions', (req, res) => {

  if (req.session.user) {
    //Creates a variable to determine whether the user is attending or not
    var attending = req.session.user.attending;
    if (attending == null) attending = "";

    if (req.session.user) {
      Session.findAll().then(sessions => {  //Find All Sessions
        res.render('allSessionsPage', { user: req.session.user, hasaccount: true, sessions: sessions, sessCounter: sessions.length, userAttending: attending });
      });
    } else {
      res.render('allSessionsPage');
    }
  }
  else {
    res.render("loginPage")
  }
});


//////////////////////////////////////////////////////////////////
app.get('/joinSess', (req, res) => {

  if(req.session.user){
  my_joined_sessions = [];
  //Creates a variable to determine whether the user is attending or not
  var attending = req.session.user.attending;
  if (attending == null) attending = "";

  if (req.session.user) {

    Attendance.findAll({
      where: {
        user_id: req.session.user.id
      }
    }).then(sessions => {
      sessions.forEach(
        (session) => {
          my_joined_sessions.push(session.session_id);
        }
      );
    }).then(() => {

      Session.findAll({
        where: {
          id: my_joined_sessions
        }
      }).then(sessions => {
        res.render('joinedSessionsPage', { user: req.session.user, hasaccount: true, sessions: sessions, sessCounter: sessions.length, userAttending: attending });
      });

    });

  } else {
    res.render('joinedSessionsPage');
  }
}
else{
  res.render('loginPage')
}
});



//////////////////////////////////////////////////////////////////
app.get('/joinedSessions', (req, res) => {

  my_joined_sessions = 1;

  if (req.session.user) {
    Session.findAll().then(sessions => {  //Find All Sessions
      res.render('joinedSessionsPage', { user: req.session.user, hasaccount: true, sessions: sessions, sessCounter: sessions.length, userAttending: attending });
    });
  } else {
    res.render('loginPage');
  }

});

//////////////////////////////////////////////////////////////////

//Get request to show create session page.
app.get('/createSession', (req, res) => {
  if (req.session.user) {
    res.render('createSessionPage', { user: req.session.user, hasaccount: true });
  } else {
    res.render('loginPage');
  }
});

//////////////////////////////////////////////////////////////////
app.post('/searchSessions', (req, res) => {

  var searchInput = req.body.search;
  var attending = req.session.user.attending;
  if (attending == null) attending = "";

  Session.findAll({
    where: {
      //[Op.or]: [{course: searchInput}, {location: searchInput}, {date: searchInput}]
      [Op.or]: [
        { course: { [Op.like]: ['%' + searchInput + '%'] } },
        { location: { [Op.like]: ['%' + searchInput + '%'] } },
        { location: { [Op.like]: ['%' + searchInput + '%'] } },
        { description: { [Op.like]: ['%' + searchInput + '%'] } }
      ]
    }
  }).then(sessions => {
    res.render('searchSessionsPage', { user: req.session.user, hasaccount: true, sessions: sessions, sessCounter: sessions.length, userAttending: attending });
  });
});

//////////////////////////////////////////////////////////////////
app.post('/generateSession', (req, res) => {

  // Array of Errors
  var errors = [];

  // Get values from POST Request
  course = req.body.course;
  location = req.body.location;
  date = req.body.date.toString();
  time = req.body.time.toString();
  description = req.body.description;
  heldBy = req.body.heldBy;

  // Check for Empty Course
  if (course.trim().length == 0) {
    errors.push({ msg: "Course cannot be blank" });
    res.render("createSessionPage", { user: req.session.user, hasaccount: true, errors: errors });
    return;
  }

  // Check for Location Location
  if (location.trim().length == 0) {
    errors.push({ msg: "Location cannot be blank" });
    res.render("createSessionPage", { user: req.session.user, hasaccount: true, errors: errors, course: course });
    return;
  }

  // Check for Empty Date
  if (date.trim().length == 0) {
    errors.push({ msg: "Date cannot be blank" });
    res.render("createSessionPage", { user: req.session.user, hasaccount: true, errors: errors, course: course, location: location });
    return;
  }

  // Check for Empty Time
  if (time.trim().length == 0) {
    errors.push({ msg: "Time cannot be blank" });
    res.render("createSessionPage", { user: req.session.user, hasaccount: true, errors: errors, course: course, location: location, date: date });
    return;
  }

  // Check for Empty Description
  if (description.trim().length == 0) {
    errors.push({ msg: "Description cannot be blank" });
    res.render("createSessionPage", { user: req.session.user, hasaccount: true, errors: errors, course: course, location: location, date: date, time: time });
    return;
  }

  // Check for Long Description
  if (description.trim().length > 75) {
    errors.push({ msg: "Description must be less than 75 characters" });
    res.render("createSessionPage", { user: req.session.user, hasaccount: true, errors: errors, course: course, location: location, date: date, time: time, description: description });
    return;
  }

  // Check for Empty HeldBy
  if (heldBy == undefined) {
    errors.push({ msg: "Select Held By" });
    res.render("createSessionPage", { user: req.session.user, hasaccount: true, errors: errors, course: course, location: location, date: date, time: time, description: description });
    return;
  }

  // Create Study Session
  Session.create({
    user_id: req.session.user.id,
    course: course,
    description: description,
    location: location,
    date: date,
    time: time,
    heldby: heldBy,
    going: 1
  }).then(session => {
    res.redirect('/mySessions');
  });

});

//////////////////////////////////////////////////////////////////
app.post('/action', (req, res) => {

  // set username and password
  uname = req.body.username;
  email = req.body.email;
  pw = req.body.password;

  // array of errors
  var errors = [];

  // route to send user
  var route = "";
  if (req.body.login != undefined) route = "loginPage";
  else route = "registerPage";

  // blank username and password error
  if (uname.trim().length == 0 && pw.trim().length == 0) {
    errors.push({ msg: "Username and Password cannot be blank" });
    res.render(route, { errors: errors, username: uname });
    return;
  }
  // blank username only error
  if (uname.trim().length == 0) {
    errors.push({ msg: "Username cannot be blank" });
    res.render(route, { errors: errors, username: uname });
    return;
  }
  // blank password only error
  if (pw.trim().length == 0) {
    errors.push({ msg: "Password cannot be blank" });
    res.render(route, { errors: errors, username: uname });
    return;
  }

  // user pressed login button
  if (typeof req.body.login !== 'undefined') {

    // attempt to login user

    // get user by username
    User.findOne({
      where: { username: uname }
    }).then(user => {
      //check Password
      if (user) {
        bcrypt.compare(pw, user.password_hash, (err, match) => {
          if (match) {
            // add user to session, redirect to home page and check if normal or admin
            if (user) {
              account = true;
            }
            req.session.user = user;
            //res.render('allSessionsPage', {user: user, hasaccount: account});
            res.redirect('/allSessions');
          }
          else {
            // credentials don't match error
            errors.push({ msg: "Password or username is wrong" });
            res.render("loginPage", { errors: errors });
          }
        });
      }
      else {
        // unhandled error
        errors.push({ msg: "Password or username is wrong" });
        res.render("loginPage", { errors: errors });
      }
    });

  } else {
    // attempt to register user

    // password less than 4 character error
    if (pw.trim().length <= 4) {
      errors.push({ msg: "Password must be more than 4 characters." });
      res.render("registerPage", { errors: errors, username: uname, email: email });
      return;
    }
    // blank email only error
    if (email.trim().length == 0) {
      errors.push({ msg: "Email cannot be blank" });
      res.render("registerPage", { errors: errors, username: uname, email: email });
      return;
    }

    // valid email only error
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!re.test(email.trim())) {
      errors.push({ msg: "Email must be valid" });
      res.render("registerPage", { errors: errors, username: uname });
      return;
    }

    // Look up username
    User.findOne({
      where: { username: uname }
    }).then(user => {
      //check if user already exists in database
      if (user) {
        errors.push({ msg: "Username already exists!" });
        res.render("registerPage", { errors: errors, username: uname, email: email });
      }
      else {
        // if no user exists, then create user
        User.create({
          username: uname,
          email: email,
          password_hash: bcrypt.hashSync(pw, 10)
        }).then(user => {
          //add new user to session and check if account is normal or admin
          if (user) {
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
app.post('/joinSession', (req, res) => {

  var sessionId = req.body.id;
  var sessionUser = req.session.user;
  var currentAttn = sessionUser.attending;

  if (currentAttn == null) {
    sessionUser.attending = "-" + sessionId.toString();
  }
  else {
    sessionUser.attending = currentAttn + "-" + sessionId;
  }

  Attendance.create({
    user_id: req.session.user.id,
    session_id: sessionId
  })

  User.update(
    { attending: sessionUser.attending },
    { where: { id: req.session.user.id } },
  );

  Session.findOne({
    where: {
      id: sessionId
    }
  }).then(session => {
    session.increment('going');
  });

  // if(req.session.user){
  //   Session.findAll().then(sessions => {  //Find All Sessions
  //     res.redirect('allSessionsPage',{user:req.session.user, hasaccount: true, sessions: sessions, sessCounter: sessions.length, userAttending: attending});
  // });
  // }else{
  // res.render('allSessionsPage');
  // }

  res.redirect('/allSessions');

});

//////////////////////////////////////////////////////////////////
app.post('/leaveSesssion', (req, res) => {

  //Created sessionId, sessionUser, and currentAttn in order to figure out
  //which session to leave from.

  var sessionId = req.body.id;
  var sessionUser = req.session.user;
  var currentAttn = sessionUser.attending;

  sessionUser.attending = currentAttn.replace("-" + sessionId, "");

  //Destroys the session
  Attendance.destroy({
    where: {
      user_id: sessionUser.id,
      session_id: sessionId
    }
  }).then(session => {
    res.redirect('/joinedSessionsPage');
  });

  User.update(
    { attending: sessionUser.attending },
    { where: { id: req.session.user.id } },
  );

  Session.findOne({
    where: {
      id: sessionId
    }
  }).then(session => {
    session.decrement('going');
  });

  res.redirect();

});

//////////////////////////////////////////////////////////////////
app.post('/removeSession', (req, res) => {

  //Grabs id of the card in order to delete it.
  var sessionId = req.body.id;


  //Destroys the session
  Session.destroy({
    where: {
      id: sessionId
    }
  }).then(session => {
    res.redirect('/mySessions');
  });

});

//////////////////////////////////////////////////////////////////
app.get('/logout', (req, res) => {
  // remove user from session
  delete req.session.user;
  res.redirect('/loginPage');
});

//////////////////////////////////////////////////////////////////
// sends all other routes not defined to the landingPage
app.get('*', function (req, res) {
  if (req.session.user) {
    res.render('landingPage', { user: req.session.user, hasaccount: true });
  } else {
    res.render('loginPage');
  }
});

//////////////////////////////////////////////////////////////////
var server = app.listen(app.get('port'), function () {
  console.log("Server started...")
});
