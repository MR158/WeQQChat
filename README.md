# WeQQChat
基于Vue全家桶的仿QQ即时聊天应用

尝试使用Vue做了一个较为完整的全栈项目，支持私聊、登录注册和根据QQ号搜索聊天。觉得不错就请点个star吧！

在线项目地址：[http://weqq.link](http://weqq.link) （chrome手机端浏览）

### 实现功能

- [x] 聊天功能
- [x] 登录功能
- [x] 注册功能
- [x] 搜索新建聊天
- [ ] 个人主页
- [ ] 联系人页面
- [ ] 空间动态页

### 技术栈

- Vue
- Vue-router
- Vuex
- axios
- Sass
- Swiper
- Express
- Webpack
- JsonWebToken
- Mongodb
- Socket.io

### 安装运行

运行前需要在相应文件下修改监听地址

dev-server.js下的mongodb地址，默认监听27017

```
mongoose.connect('mongodb://localhost:27017/test',{useMongoClient:true})
```

app.vue下的websocket地址，默认监听9090

```
this.$store.commit('socket',io.connect('http://localhost:9090/'))
```

当中使用到了sendcloud邮件功能，在routes.js下修改为你注册的信息

```
var apiuser = YOUR_APIUSER
var apikey = YOUR_APIKEY
```

安装依赖包

```
npm install  //建议使用国内源 cnpm install
```

运行开发环境

```
npm run dev  //运行
```

### 基本聊天功能的实现

前端，使用vuex做状态管理

```javascript
//连接服务端socket
this.$store.commit('socket',io.connect('http://localhost:8080/'))

//向服务端发送信息
this.getSocket.emit('message','Hello！') //mapGetters获取socket

//接收来自服务端的信息
this.getSocket.on('message',(msg)=>{
	console.log(msg)
})

//加入指定房间
this.getSocket.emit('join',roomid)
```

 后端

```javascript
//socket服务端的监听

var server = app.listen(port)
var io = require('socket.io')(server)

io.on('connection',(socket)=>{
	//接收和发送信息
	socket.on('message',(msg)=>{
		console.log(msg) //接收的信息
		//向指定房间发送信息
		io.sockets.in(roomid).emit('message','服务端收到你的消息了哦')
	})

	//加入指定房间
	socket.on('join',(roomid)=>{
		socket.join(roomid)
	})
	
	//断开连接
	socket.on('disconnect',()=>{
      console.log('断开连接')
    })
})
```

### 一些前端功能的代码

#### 进入聊天房

从列表页进入某聊天房。存储在store中后再在聊天页读取

```javascript
toChat(chatroom){
	  //inroom存储当前进入的聊天房的信息
      var inroom = {
        roomid:chatroom.roomid,
        roomname:chatroom.roomname,
        type:chatroom.type,
        receiver:chatroom.receiver,
        chatMsgList:chatroom.chatMsgList,
        lastReadAt:chatroom.lastReadAt
      }
      this.$store.commit('changeInroom',inroom)
    }
```

#### 接收到新消息

接收新消息后，更新本地聊天信息、显示时间、房间顺序

```javascript
this.getSocket.on('message',(msg)=>{
      var chatMsg = {
        isMe:msg.qqnumber==this.getUser.qqnumber,
        roomid:msg.roomid,
        username:msg.username,
        avatar:msg.avatar,
        msg:msg.msg,
        time:this.$moment.tz(msg.time,'Asia/Shanghai').format(),
        type:msg.type
      }

      for(let i = 0;i<this.getChatRoom.length;i++){
        if(this.getChatRoom[i].roomid==chatMsg.roomid){
          //更新本地聊天信息、显示时间、房间顺序
          this.$store.state.chatroom[i].chatMsgList.push(chatMsg)
          this.$store.state.chatroom[i].lastChatAt = msg.time
          var lastChatroom = this.$store.state.chatroom[i]
          this.$store.state.chatroom.splice(i,1)
          this.$store.state.chatroom.splice(0,0,lastChatroom)
        }
      }
    })
```

#### 未读信息数

计算未读信息的数量。因为mongodb存储的是零时区，所以用moment将时间本地化了

```javascript
	//本地化时间
	localTime(time){
		return this.$moment.tz(time,'Asia/Shanghai')
	},
	//未读信息数量
	unread(chatroom){
      var unreadMsg = []
      if(chatroom.chatMsgList.length>0){
        for(let i = 0;i<chatroom.chatMsgList.length;i++){
        //moment比较时间，对比此房间最后一条消息的更新时间 和 我阅读此房间消息的时间
        	 if(this.$moment(this.localTime(chatroom.chatMsgList[i].time)).isAfter(this.localTime(chatroom.lastReadAt))){
            unreadMsg.push(chatroom.chatMsgList[i])
          }
        }
        return unreadMsg.length
      }else{
        return chatroom.unread = 0
      }
    }
```

#### 接收来自陌生人的消息

使用连接socket时设置的socket.id来使陌生人之间通信，接收到消息后给自己本地添加对应的聊天房

```javascript
//来自对方添加房间的请求
    this.getSocket.on('addroom',(chatroom)=>{
	  //添加到聊天列表
      this.$store.commit('addChatRoom',{
        roomid:chatroom.roomid,
        roomname:chatroom.roomname,
        email:chatroom.email,
        receiver:chatroom.receiver,
        imgsrc:chatroom.imgsrc,
        lastChatAt:new Date(),
        lastReadAt:new Date()-1000*10,
        type:chatroom.type,
        chatMsgList:[]
      })
      //添加房间socket监听
      this.getSocket.emit('join',{
        username:this.getUser.username,
        chatroom:[chatroom]
      })
    })
```

#### 搜索功能

用debounce自动延迟调用搜索方法

```javascript
searching: _.debounce(function(){
        this.$store.commit('changeSearchNotice','搜索中...')
        this.isCalculating = true
        if(this.$validate.isNotEmpty(this.searchtext)&&this.$validate.qqnumber(this.searchtext)){
          this.$store.dispatch('searchUser',{
            condition:this.searchtext
          })
          setTimeout(function(){
            this.isCalculating = false
          }.bind(this),1000)
        }else{
          this.$store.commit('changeSearchNotice','未找到您所查询的用户')
        }

      },500)
```

### 一些后端功能的代码

#### 获取聊天信息

```javascript
app.get('/chatmsg',function(req,res){
    var email = req.query.email
    ChatMsg.find({'$or':[{email:email},{receiver:email}]}).sort({'time':1}).exec((err,chatmsg)=>{
      if(err){
        console.log(err)
      }else{
        res.json({
          success:true,
          chatmsg:chatmsg
        })
      }
    })
  })
```

#### 发送邮件验证码

使用的sendcloud邮件服务，对QQ的支持不错

```
app.post('/send_email',function(req,res){

    receiveEmail = req.body.email
    sendEmailTime = new Date().getTime()/1000

    //检查发送间隔
    req.session.sendCount += 1

    if(req.session.sendCount>1&&sendEmailTime-req.session.sendTime<30){
      res.json({
        success:false,
        notice:'发送过于频繁。'
      })
    }else{
      req.session.sendTime = sendEmailTime

      console.log('session:'+req.session.sendTime)

      //生成验证码
      var char = ['1','2','3','4','5','6','7','8','9','0','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']

      var random;
      verificationCode = ''

      for(let i=0;i<6;i++){
        do{
          random = Math.floor(Math.random()*100)
        }while(random>=char.length)
        verificationCode+=char[random];
      }
	  
	  //使用sendcloud发送邮件
	  
      var apiuser = YOUR_APIUSER
      var apikey = YOUR_APIKEY
      var from = 'mail@weqq.link'
      var from_name = 'WeQQ'

      var subject = '欢迎使用WeQQ'
      var html = '<p>您本次操作的验证码为：'+verificationCode+'</p><p>10分钟内有效。</p>'

      var sc = new Sendcloud(apiuser,apikey,from,from_name)

      var response = res

      sc.send(receiveEmail,subject,html).then(function(info){
        response.json({
          success: true,
          result: info.message
        })
      })
    }
  })
```

#### JWT的token验证

其实就是想实践一下JWT的方法，用传统的cookie验证一样没什么毛病的。

```javascript
app.get('/verifyToken',function(req,res){
    var email = req.query.email
    var token = req.query.token

    if(token&&email){
      User.findOne({email:email}).exec((err,user)=>{
        if(user){
          jwt.verify(token,user.secretKey,(err,decoded)=>{
            if(err){
              res.json({
                success:false,
                destroy:true,
                notice:'登录状态已失效。'
              })
            }else{
              console.log('token验证成功')
              console.log(decoded)
              res.json({
                success:true,
                notice:'token验证成功',
                email:user.email
              })
            }
          })
        }else{
          res.json({
            success:false,
            notice:'您还未注册!'
          })
        }
      })
    }else{
      res.json({
        success:false,
        notice:'未提供token!'
      })
    }
  })
```

#### Chatroom的Schema

```
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

```

### 一些运行画面

登录页面

![登录页面gif](http://7u2son.com1.z0.glb.clouddn.com//weqq/weqq_login.gif)

注册页面

![注册页面gif](http://7u2son.com1.z0.glb.clouddn.com//weqq/weqq_register.gif)

聊天页面

![聊天页面gif](http://7u2son.com1.z0.glb.clouddn.com//weqq/weqq_chat.gif)

搜索页面

![搜索页面gif](http://7u2son.com1.z0.glb.clouddn.com//weqq/weqq_search.gif)
