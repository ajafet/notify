debug = false          

const { Queue, Users } = require('./models');

const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');
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

//////////////////////////////////////////////////////////////////

app.get('/', (request, response) => {
  response.render("user/start");
});

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
    request.session.queue = queue;
    response.redirect("/english/waiting");
  });

});

app.get('/english/waiting', (request, response) => {

  Users.findOne({
    where: { id : 1}
  }).then(user => {

    if (request.session.queue) {
      response.render("user/english_waiting", {id: request.session.queue.id, companyName: user.company_name});
    } else {
      response.redirect("/");
    }

  });

});

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
    request.session.queue = queue;
    response.redirect("/spanish/esperando");
  });

});

app.get('/spanish/esperando', (request, response) => {

  Users.findOne({
    where: { id : 1}
  }).then(user => {

    if (request.session.queue) {
      response.render("user/spanish_esperando", {id: request.session.queue.id, companyName: user.company_name});
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
  }).then( queue => {

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

//////////////////////////////////////////////////////////////////

io.on('connection', (socket) => {

  socket.on("userWaiting", (id) => {

    Queue.findAll({
      where: {
        status: 0,
      }
    }).then(queue => {

      line = 1

      queue.forEach(customer => {
        io.emit(customer.id, line);
        line++
      });

    });

    io.emit("addNewCut");

  });

  socket.on('userCutting', (ID) => {

    Queue.update({
      status: 1,
    }, {
      where: { id: ID }
    }).then( queue => {

      io.emit(ID, "cutting");

    });

    Queue.findAll({
      where: {
        status: 0,
      }
    }).then(queue => {

      line = 1

      queue.forEach(customer => {

        io.emit(customer.id, line);
        line++

      });

    });

  });

  socket.on('userDoneCutting', (id) => {

    Queue.destroy({
      where: {
        id: id,
      }
    });

  });

  socket.on('disconnect', () => {

    if (socket.handshake.session.queue) {

      Queue.findOne({
        where: { id : socket.handshake.session.queue.id }
      }).then(queue => {

        if (queue.status == 0) {

          io.emit("addNewCut");

          queue.destroy();

        }

        delete socket.handshake.session.queue;
        socket.handshake.session.save();

      });

    }

  });

});

//////////////////////////////////////////////////////////////////

http.listen(app.get('port'), () => {
  console.log('listening on ' + app.get('port'));
});
