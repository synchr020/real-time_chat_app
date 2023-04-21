const mongoose = require('mongoose');


const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      lowercase: true,
      trim: true
    },
    //accountId can be google Id, facebook Id, github Id etc.
    FBId: {
      type: String
    },
    name: {
      type: String,
      trim: true
    },
    provider:{
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User",userSchema);