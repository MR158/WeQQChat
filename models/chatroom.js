const mongoose = require('mongoose')
const Schema = mongoose.Schema
const crypto = require('crypto');

var ChatRoomSchema = new Schema({
  roomid:String,
  email:String,
  receiver:String,
  type:String,
  roomname:String,
  imgsrc:String,
  joinAt:{
    type:Date,
    default:Date.now()
  },
  lastChatAt:Date,
  lastReadAt:Date
},{collection:'ChatRoom'})

ChatRoomSchema.pre('save',function(next){
  //保存私聊房间ID
  if(this.type=='single'){
    var arr = []
    arr.push(this.md5Crypt(this.email),this.md5Crypt(this.receiver))
    this.roomid = arr.sort().join('')
  }else{
    this.roomid = this.md5Crypt(this.email)
  }
  next()
})

ChatRoomSchema.methods = {
  md5Crypt:function(obj){
    var md5 = crypto.createHash('md5')
    var result = md5.update(obj).digest('hex')
    return result
  }
}

var ChatRoom = mongoose.model('ChatRoom',ChatRoomSchema)

module.exports = ChatRoom
