const User = require("../../models/users");

const googleAuth = {
  registerWithGoogle: async (oauthUser) => {
    const isUserExists = await User.findOne({
      GId: oauthUser.id,
      provider: oauthUser.provider,
    });
    if (isUserExists) {
      const failure = {
        message: 'User already Registered.',
      };
      return { failure };
    }

    const user = new User({
      GId: oauthUser.id,
      name: oauthUser.displayName,
      provider: oauthUser.provider,
      email: oauthUser.emails[0].value, //optional - storing it as extra info
     
    });
    await user.save();
    const success = {
      message: 'User Registered.',
    };
    return { success };
  },


};

module.exports = googleAuth;