const express = require('express');
const mongoose = require("mongoose")
const passport = require('passport');

const session = require('express-session');
const moment = require('moment-timezone');
const googleRouter = require('./controllers/google-auth');
const app = express();
const server = require('http').createServer(app);
const User = require('./models/users');
//loading socket.io
var io = require('socket.io')(server);

const botName = "ChatBot";
const Message = require('./models/messages');

require('dotenv').config();

//const dbURL = "mongodb://127.0.0.1:27017/rtapp";
const dbURL = process.env.dbURL;
const connectDatabase = async () => {
  try {

    console.log(dbURL);
    await mongoose.connect(dbURL);

    console.log("connected to database");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

connectDatabase();



app.use(express.static(__dirname + '/public'));



app.set('view engine', 'ejs');
app.use(
  session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, cb) {
  cb(null, user);
});
passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});


const userON = {};
let messageON = {};
io.on('connection', async (socket) => {

  console.log('a user connected');

  socket.on('login', async () => {

    console.log(' user ' + socket.user.id + ' connected');
    // saving userId to object with socket ID
    const user1 = await User.findOne({ GId: socket.user.id });

    console.log(user1.name);
    userON[socket.id] = user1.name;
    console.log(userON);
    for (var key in userON) {
      var value = userON[key];
      console.log(value);
    }
    io.emit('checkonline1', { userON });

  });

  socket.on('disconnect', () => {
    console.log('user ' + userON[socket.id] + ' disconnected');
    // remove saved socket from users object
    console.log(`delete` + userON);
    delete userON[socket.id];
    io.emit('checkonline2', { userON });
  });

  socket.on('chatmessage', async ({ mess, time }) => {
    d = new Date();
    // console.log('new date '+ d);
    // let  datetext = d.toTimeString();
    // datetext = datetext.split(' ')[0].slice(0,6);
    
    const format1 = "YYYY-MM-DD HH:mm:ss"
    const format2 = "YYYY-MM-DD"
    var date1 = new Date("2020-06-24 22:57:36");
    var date2 = new Date();
    let date3 = date2.toUTCString();
    
    let a = moment.tz(date2, 'Asia/Rangoon').format('h:mm a');
    console.log('a = '+ a);

    date3 = date3.slice(0,6);
    console.log(`test` +date3);
    dateTime1 = moment(date1).format(format1);
    dateTime2 = moment().format(format2);

    console.log(dateTime1 +" va " + dateTime2);

    let truetime = moment(date2).format('hh:m a ');
    console.log(truetime);
    const user1 = await User.findOne({ GId: socket.user.id });

    auth = user1.name;


    const mes = new Message({
      content: mess,
      author: user1._id,
      time: a,
      dpName: user1.name
    });
    await mes.save();

    console.log(mes.time);
    io.to(socket.id).emit('message', { mes, user1 });
    socket.broadcast.emit('friend', { mes, user1 });
  }
  )





})
  ;

app.use(async (req, res, next) => {

  res.locals.currentUser = req.user;

  next();
})

app.use((req, res, next) => {
  io.on('connection', (socket) => {
    socket.user = req.user;
  });
  next();
});

app.get('/', (req, res) => {
  res.render("view");
})

app.get('/chat', (req, res) => {
  res.render("app");
})

app.use('/auth/google', googleRouter);


server.listen(3001, () => {
  console.log(`App listening on port 3001`)
})
