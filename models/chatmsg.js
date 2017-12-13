const mongoose = require('mongoose')
const Schema = mongoose.Schema

var ChatMsgSchema = new Schema({
  roomid:String,
  roomname:String,
  email:String,
  username:String,
  receiver:String,
  qqnumber:Number,
  avatar:String,
  msg:String,
  time:{
    type:Date,
    default:Date.now()
  },
  type:String
},{collection:'ChatMsg'})

var ChatMsg = mongoose.model('ChatMsg',ChatMsgSchema)

module.exports = ChatMsg
