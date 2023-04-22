const express = require('express');
const mongoose = require("mongoose")
const passport = require('passport');

const session = require('express-session');
const facebookRouter = require('./controllers/facebook-auth');
const app = express();
const server = require('http').createServer(app);
const User = require('./models/users');
//loading socket.io
var io = require('socket.io')(server);

const botName = "ChatBot";
const Message = require('./models/messages');

require('dotenv').config()
//const dbUrl = "mongodb://127.0.0.1:27017/rtapp";
const dbUrl = process.env.dbUrl;
mongoose.set('strictQuery', true);
mongoose.connect(dbUrl, {
    
})
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected.");
});




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




io.on('connection', (socket) => {

    Message.find().then(result => {
        socket.emit('output-messages', result)
    })

    console.log('a user connected');

    
    socket.on('disconnect', () => {
        
        console.log('user disconnected');
       
    });

    socket.on('chatmessage',

      async (message) => {
       
        const user1 = await User.findOne({FBId : socket.user.id});
        console.log(user1._id);
        const mes = new Message({
          content: message,
         author: user1._id
 });
         await mes.save();
         console.log(mes.time);
         io.emit('message', mes);
        
      }
    )





    })
;


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

app.use('/auth/facebook', facebookRouter);


server.listen(3001, () => {
  console.log(`App listening on port 3001`)
})
