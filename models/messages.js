const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');


const messageSchema = new mongoose.Schema(
  {
    content: {
      type: String
    },
    time:{
       type: String,
      default:() => moment().format("hh:m a")

        },
    author:{
        type: Schema.Types.ObjectId,
        ref: "User",
        //  required:true
    },
    dpName:{
        type: String
      }


  }
    
);

module.exports = mongoose.model("Message",messageSchema);