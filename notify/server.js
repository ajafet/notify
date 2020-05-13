debug = false          

const { Queue, Users } = require('./models'); 

const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');
const helpers = require('handlebars');
const bodyParser = require('body-parser');

const session = require('express-session')({
  secret: "This is a big long secret lama string.",
  resave: true,
  saveUninitialized: true,
});
const sharedsession = require("express-socket.io-session");

const app = express();

if (debug) 
  app.set('port', 8000); 
else 
  app.set('port', process.env.PORT);

app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: __dirname + '/views/layouts/',
}));

app.set('view engine', 'hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'static')));

const http = require('http').createServer(app);
const io = require('socket.io').listen(http);

app.use(session);
io.use(sharedsession(session));

const telnyx = require('telnyx')(process.env.TELNYX_API);   

helpers.registerHelper("inc", function(value) {
  return value + 1;  
});

//////////////////////////////////////////////////////////////////

app.get('/', (request, response) => {

  Users.findOne({
    where: { id : 1}
  }).then(user => {

    response.render("user/start", {companyName: user.company_name});
  
  });

});

app.get('/english', (request, response) => {

  Users.findOne({
    where: { id : 1}
  }).then(user => {

    response.render("user/english_instructions", {companyName: user.company_name});
  
  });

});

app.get('/english/get_started', (request, response) => {
  response.render("user/english_get_started");
});

app.post('/english/get_started/submit', (request, response) => {

  const check_phone_regex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

  fullName = request.body.fullName
  phoneNumber = request.body.phoneNumber

  nameEmpty = false
  phoneEmpty = false
  phoneNotValid  = false

  if (fullName.trim().length == 0) {
    nameEmpty = true
  }

  if (phoneNumber.trim().length == 0) {
    phoneEmpty = true
  } else if (!check_phone_regex.test(phoneNumber)) { 
    phoneNotValid = true 
  }

  if (nameEmpty || phoneEmpty || phoneNotValid) {
    response.render("user/english_get_started", {errorName : nameEmpty, errorPhone: phoneEmpty, errorPhoneNotValid: phoneNotValid, fullName: fullName, phoneNumber: phoneNumber})
    return
  }

  Queue.create({
    name: fullName,
    phone_number: phoneNumber,
    status: 0,
    language: 0,
  }).then(queue => {
    request.session.queue = queue;
    io.emit("cutAdded");
    response.redirect("/english/waiting");
  });

});

app.get('/english/waiting', (request, response) => {

  Users.findOne({
    where: { id : 1}
  }).then(user => {

    if (request.session.queue) {
      delete request.session.queue;
      response.render("user/english_waiting", {companyName: user.company_name});
    } else {
      response.redirect("/");
    }

  });

});

app.get('/spanish', (request, response) => {

  Users.findOne({
    where: { id : 1}
  }).then(user => {

    response.render("user/spanish_instructions", {companyName: user.company_name});
  
  });

});

app.get('/spanish/empezar', (request, response) => {
  response.render("user/spanish_empezar");
});

app.post('/spanish/empezar/completar', (request, response) => {

  const check_phone_regex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;

  fullName = request.body.fullName
  phoneNumber = request.body.phoneNumber

  nameEmpty = false
  phoneEmpty = false
  phoneNotValid  = false

  if (fullName.trim().length == 0) {
    nameEmpty = true
  }

  if (phoneNumber.trim().length == 0) {
    phoneEmpty = true
  } else if (!check_phone_regex.test(phoneNumber)) {
    phoneNotValid = true 
  }

  if (nameEmpty || phoneEmpty || phoneNotValid) { 
    response.render("user/spanish_empezar", {errorName : nameEmpty, errorPhone: phoneEmpty, errorPhoneNotValid: phoneNotValid, fullName: fullName, phoneNumber: phoneNumber})
    return
  }

  Queue.create({
    name: fullName,
    phone_number: phoneNumber,
    status: 0,
    language: 1, 
  }).then(queue => {
    request.session.queue = queue;
    io.emit("cutAdded"); 
    response.redirect("/spanish/esperando");
  });

});

app.get('/spanish/esperando', (request, response) => {

  Users.findOne({
    where: { id : 1}
  }).then(user => {

    if (request.session.queue) {
      delete request.session.queue;
      response.render("user/spanish_esperando", {companyName: user.company_name}); 
    } else {
      response.redirect("/");
    }

  });

});

//////////////////////////////////////////////////////////////////

app.get('/admin', (request, response) => {

  if (request.session.admin) {
    response.redirect("/admin/waiting");
  } else {
    response.redirect("/login");
  }

});

app.get('/login', (request, response) => {
  response.render("admin/login");
});

app.post('/action', (request,response) => {

  password = request.body.password;

  Users.findOne({
    where: { id : 1}
  }).then(user => {

    if (user.password == password) {
      request.session.admin = user;
      response.redirect("/admin/waiting");
    } else {
      response.render("admin/login", {invalid: true, password: password});
    }

  });

});

app.get('/admin/waiting', (request, response) => {

  if (request.session.admin) {

    Queue.findAll({
      where: {
        status: 0,
      }
    }).then(queue => {
      response.render("admin/waiting", { queue: queue });
    });

  } else {
    response.redirect("/login");
  }

});

app.get('/admin/cutting', (request, response) => {

  if (request.session.admin) {

    Queue.findAll({
      where: {
        status: 1,
      }
    }).then(queue => {
      response.render("admin/cutting", { queue: queue });
    });

  } else {
    response.redirect("/login");
  }

});

app.post('/admin/update/waiting_to_cutting', (request, response) => {

  id = request.body.id 

  Queue.findOne({
    where: { id: id }
  }).then(queue => {

    if (queue) {

      queue.update({
        status: 1, 
      }).then(function () {

        message = ""; 

        if (queue.language == 0) {
          message = queue.name + " Your Next, Please Walk In"; 
        } else {
          message = queue.name + " Tu Sigues, Por Favor de Entrar"; 
        }

        telnyx.messages.create({ 
            'from': '+19563911918',
            'to': '+1' + queue.phone_number, 
            'text': message, 
          },
        );

        io.emit("cutUpdated");  

      }); 

    }

  });

}); 

app.post('/admin/update/cutting_to_delete', (request, response) => {

  id = request.body.id 
  
  Queue.destroy({
    where: { id: id }, 
  }).then( queue => {

    io.emit("cutRemoved");  

  }); 

}); 

app.get('/admin/account', (request, response) => {

  if (request.session.admin) {

    Users.findOne({
      where: { id: request.session.admin.id }
    }).then(user => {
      response.render("admin/account", { user: user });
    });

  } else {
    response.redirect("/login");
  }

});

app.post('/admin/account/update', (request, response) => {

  newPassword = request.body.newPassword
  companyName = request.body.companyName

  newPasswordError = false
  companyNameError = false

  if (newPassword.trim().length < 4) {
    newPasswordError = true
  }

  if (companyName.trim().length == 0) {
    companyNameError = true
  }

  if (newPasswordError || companyNameError) {
    response.render("admin/account", {newPasswordError : newPasswordError, companyNameError: companyNameError, newPassword: newPassword, companyName: companyName})
    return
  }

  Users.update({
    password: newPassword,
    company_name: companyName,
  }, {
    where: { id: 1 }
  }).then( user => {

    response.redirect("/admin/waiting");

  });

});

app.get('/admin/logoff', (request,response) => {

  if (request.session.admin) {
    delete request.session.admin;
  	response.redirect("/login");
  } else {
    response.redirect("/login");
  }

});

http.listen(app.get('port'), () => {
  console.log('listening on ' + app.get('port'));
});
