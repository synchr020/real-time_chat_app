const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const express = require('express');
const User = require('../models/users');
const router = express.Router();
require('dotenv').config();

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.clientID,
      clientSecret: process.env.clientSecret,
      callbackURL:  "http://localhost:3001/auth/facebook/callback"
      //callbackURL:  "http://localhost:3001/auth/facebook/callback"
    },
    async function (accessToken, refreshToken, profile, cb) {
      const user = await User.findOne({
        FBId: profile.id,
        provider: 'facebook',
      });
      if (!user) {
        console.log('Adding new facebook user to DB..');
        const user = new User({
          FBId: profile.id,
          name: profile.displayName,
          provider: profile.provider
        });
        await user.save();
        console.log(user.id);
        return cb(null, profile);
      } else {
        console.log('Facebook User already exist in DB..');
        // console.log(profile);
        return cb(null, profile);
      }
    }
  )
);

router.get('/', passport.authenticate('facebook', { scope: 'email' }));

router.get(
  '/callback',
  passport.authenticate('facebook', {
    failureRedirect: '/auth/facebook/error',
  }),
  function (req, res) {
    // Successful authentication, redirect to success screen.
    res.redirect('/auth/facebook/chat');
  }
);

router.get('/chat', async (req, res) => {
  const userInfo = {
    
    id: req.user.id,
    displayName: req.user.displayName,
    provider: req.user.provider,
  };

  
  res.render('app', { user: userInfo });
});

router.get('/error', (req, res) => res.send('Error logging in via Facebook..'));

router.get('/signout', (req, res) => {
  try {
    req.session.destroy(function (err) {
      console.log('session destroyed.');
    });
    res.render('view');
  } catch (err) {
    res.status(400).send({ message: 'Failed to sign out fb user' });
  }
});

router.get("/check",(req,res)=>{
  res.send(req.user.id);
  console.log(req);
})


module.exports = router;