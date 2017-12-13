var ChatMsg = require('../models/chatmsg')
var ChatRoom = require('../models/chatroom')

var globaluser = new Array()

module.exports = function(server){
  //var server = app.listen(port)
  //var server = require('http').createServer()
  var io = require('socket.io')(server)

  io.on('connection',(socket)=>{
    socket.on('setName',function(email){
      globaluser[email] = socket.id
      console.log('设置socketId：['+email+']'+socket.id)
    })
    socket.on('message',function(chat){
      console.log('chat',chat)
      //发送给除自己以外的客户端
      //socket.broadcast.emit('message','this is a test')
      //发送给所有客户端
      if(chat){
        var msg = {
          roomid:chat.roomid,
          roomname:chat.roomname,
          email:chat.email,
          username:chat.username,
          receiver:chat.receiver,
          qqnumber:chat.qqnumber,
          avatar:chat.avatar,
          msg:chat.msg,
          time:chat.time,
          type:chat.type,
          lastChatAt:chat.lastChatAt
        }
        if(msg.type=='single'){
          //检查对方是否有此房间
          ChatRoom.findOne({email:msg.receiver,receiver:msg.email}).exec((err,chatroom)=>{
            if(!chatroom){
              console.log('['+msg.email+'对'+msg.receiver+']对方没有此房间')
              var ChatRoomInsert = new ChatRoom({
                roomname:msg.username,
                email:msg.receiver,
                receiver:msg.email,
                imgsrc:'http://q1.qlogo.cn/g?b=qq&nk='+msg.qqnumber+'&s=100',
                lastChatAt:new Date(),
                lastReadAt:new Date(),
                type:msg.type
              })
              ChatRoomInsert.save((err,chatroom)=>{
                if(err){
                  console.log(err)
                }else{
                  console.log('为对方添加房间成功',chatroom)
                  io.to(globaluser[msg.receiver]).emit('addroom',chatroom)
                  io.to(globaluser[msg.receiver]).emit('message',msg)
                  io.to(globaluser[msg.email]).emit('message',msg)
                  saveMsg(msg)
                }
              })
            }else{
              console.log('['+msg.email+'对'+msg.receiver+']对方已有此房间')
              io.sockets.in(msg.roomid).emit('message',msg)
              saveMsg(msg)
            }
          })
        }else{
          io.sockets.in(msg.roomid).emit('message',msg)
          saveMsg(msg)
        }

        var saveMsg = (msg)=>{
          console.log('房间：'+msg.roomname+' 发言人：'+msg.email+' 说：'+msg.msg+'['+msg.roomid+']')
          var ChatMsgInsert = new ChatMsg(msg)
          ChatMsgInsert.save((err,res)=>{
            if(err){
              console.log(err)
            }
            console.log('保存发言信息',res)
          })

          var updateSearch = {
            roomid:msg.roomid
          }
          ChatRoom.update(updateSearch,{lastChatAt:msg.lastChatAt},{multi:true},(err,res)=>{
            if(err){
              console.log(err)
            }
            console.log('更新房间最后发言时间',res)
          })
        }
      }
    })
    socket.on('join',(obj)=>{
      console.log('加入房间',obj)
      for(let i = 0;i<obj.chatroom.length;i++){
        socket.join(obj.chatroom[i].roomid)

        console.log(obj.username+'加入'+obj.chatroom[i].roomname+'['+obj.chatroom[i].type+']')
      }
    })
    socket.on('disconnect',()=>{
      console.log('断开连接')
    })
  })

}
