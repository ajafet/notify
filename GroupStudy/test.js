// import the models
const { Session, Attendance } = require('./models');

// Session.findAll().then(sessions => {
//   console.log("All the sessions: ", JSON.stringify(sessions, null, 4));
// })

// Session.findAll({
//       where: {
//         user_id: 1
//       }}).then(sessions => {
//       console.log("Sessions with id 1:  ", JSON.stringify(sessions, null, 4));
// })

my_joined_sessions = [];

Attendance.findAll({
    where: {
      user_id: 2
    }
  }).then(function(sessions){
    sessions.forEach( 
        (session) => { 
          my_joined_sessions.push(session.session_id);
        }
    );

    return my_joined_sessions
}).then( my_joined_sessions => {

    Session.findAll({
        where: {
          id: my_joined_sessions
        }
      }).then(sessions => {
        console.log("Sessions with id 1:  ", JSON.stringify(sessions, null, 4));
    })
});

 
