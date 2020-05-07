const { Queue } = require('./models');

const express = require('express');
const path = require('path');
const hbs = require('express-handlebars');
const session = require('express-session');
const bodyParser = require('body-parser');

app = express(); 
app.set('port', 3002);

app.engine('hbs', hbs({
  extname: 'hbs',
  defaultLayout: 'main',
  layoutsDir: __dirname + '/views/layouts/',
}));

app.set('view engine', 'hbs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({ 
  secret: "This is a big long secret lama string.", 
  resave: true,
  saveUninitialized: true, 
}));

app.use(express.static(path.join(__dirname, 'static')));


var http = require('http').createServer(app);
var io = require('socket.io').listen(http);


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

    request.session.id = queue.id;

    Queue.findOne({
      where: {id: request.session.id}
    }).then(queue => {
      console.log(queue); 
    }); 

    // response.redirect("/english/waiting?id=" + queue.id);

  });

});

app.get('/english/waiting', (request, response) => {
  response.render("user/english_waiting", {id: request.query.id}); 
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
    request.session.id = queue.id;
    response.redirect("/spanish/esperando?id=" + queue.id); 
  });

});

// socket stuff goes here 
app.get('/spanish/esperando', (request, response) => { 
  response.render("user/spanish_esperando", {id: request.query.id}); 
});


//////////////////////////////////////////////////////////////////

app.get('/admin', (request, response) => {
  response.render("admin/dashboard");
});

app.get('/admin/pending', (request, response) => {
  response.render("admin/dashboard");
});

app.get('/admin/waiting', (request, response) => {
  response.render("admin/dashboard");
});

app.get('/admin/cutting', (request, response) => {
  response.render("admin/dashboard");
});

app.get('/admin/account', (request, response) => {
  response.render("admin/dashboard");
});

app.get('/login', (request, response) => {
  response.render("admin/login");
});

//////////////////////////////////////////////////////////////////

io.on('connection', (socket) => {

  socket.on('newUserWaiting', (msg) => { 

    Queue.findAll({
      where: {
        status: 0, 
      }
    }).then(queue => {
      
      line = 1

      queue.forEach(customer => {        
        socket.emit(customer.id, line); 
        line++  
      });

    });

  });

  socket.on('userCutting', (id) => { 

    Queue.update(
      { status: 1 },
      { where: { id: id } },
    );

    Queue.findAll({
      where: {
        status: 0, 
      }
    }).then(queue => {
      
      line = 1

      queue.forEach(customer => {        
        socket.emit(customer.id, line); 
        line++  
      });

    });

  });

  socket.on('disconnect', () => {
    
    // var cookief =socket.handshake.headers.cookie; 
    // var cookies = cookie.parse(socket.handshake.headers.cookie);
    // console.log(cookies); 
    // Queue.destroy({
    //   where: {
    //     id: id,  
    //   }
    // }); 

    Queue.findAll({
      where: {
        status: 0, 
      }
    }).then(queue => {
      
      line = 1

      queue.forEach(customer => {        
        socket.emit(customer.id, line); 
        line++  
      });

    });

  });

}); 

http.listen(3002, () => {
  console.log('listening on *:8000');
});
