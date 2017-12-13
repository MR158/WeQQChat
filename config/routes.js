const jwt = require('jsonwebtoken');
const charset = require('superagent-charset');
const superagent = require('superagent');
const Sendcloud = require('sendcloud');

charset(superagent)
require('superagent-proxy')(superagent)

var User = require('../models/user');
var ChatRoom = require('../models/chatroom');
var ChatMsg = require('../models/chatmsg');

var receiveEmail=''
var verificationCode=''
var sendEmailTime = ''

//设置大陆代理(如果服务器为大陆外)
var proxy = 'http://113.68.11.93:9999'

//var WebSocketServer = require('ws').Server,
//  wss = new WebSocketServer({
//    port:3000,
//    verifyClient:socketVerify
//  })
//
//function socketVerify(info){
//  //console.log('info:',info)
//  console.log('origin:',info.origin)
//  console.log('req',info.req.url)
//  console.log('secure',info.secure)
//  return true
//}
//
//wss.broadcast = function broadcast(data){
//  wss.clients.forEach(function each(client){
//    console.log('广播：'+data)
//    client.send(data)
//  })
//}
//
//wss.on('connection',function connection(ws){
//    var count = 0
//  console.log(wss.clients)
//    wss.clients.forEach(function each(client){
//      count += 1
//    })
//    console.log('11你是第'+count+'位')
//    ws.send('你是第'+count+'位')
//
//
//  ws.on('message',function incoming(data){
//    wss.broadcast(data)
//  })
//  ws.on('close',function(close){
//    try{
//      wss.broadcast(this.user.name)
//    }catch(e){
//      console.log('刷新页面了')
//    }
//  })
//})

module.exports = function(app){
  app.use(function(req,res,next){
    if(!req.session.sendCount){
      req.session.sendCount = 0
    }
    next()
  })

  app.post('/chatroom',function(req,res){
    var data = {
      roomname:req.body.roomname,
      email:req.body.email,
      receiver:req.body.receiver,
      imgsrc:req.body.imgsrc,
      lastChatAt:new Date(),
      lastReadAt:new Date(),
      type:req.body.type
    }

    ChatRoom.findOne({email:data.email,receiver:data.receiver}).exec((err,mychat)=>{
      if(err){
        console.log(err)
      }
      if(mychat){
        console.log('['+data.email+'对'+data.receiver+']该房间已存在。')
        res.json({
          success:false,
          notice:'您已添加该房间。'
        })
      }else{
        console.log('添加房间信息',data);

        var ChatRoomInsert = new ChatRoom(data)
        ChatRoomInsert.save((err,chatroom)=>{
          if(err){
            console.log(err)
          }else{
            res.json({
              success:true,
              chatroom:chatroom
            })
          }
        })
      }
    })


  })

  app.get('/chatroom',function(req,res){
    var email = req.query.email
    var findCondition = {"$or":[{email:email},{receiver:email}]}
    ChatRoom.find(findCondition).sort({"lastChatAt":-1}).exec((err,chatroom)=>{
      if(err){
        console.log(err)
      }else{
        //console.log('获取房间信息',chatroom)
        res.json({
          success:true,
          chatroom:chatroom
        })
      }
    })
  })

  app.post('/chatroom/lastreadtime',function(req,res){
    var roomid = req.body.roomid
    var email = req.body.email
    var receiver = req.body.receiver
    var type = req.body.type
    var lastReadAt = req.body.lastReadAt
    if(type=='single'){
      var find = {email:email,receiver:receiver}
    }else{
      var find = {receiver:email,roomid:roomid}
    }
    ChatRoom.update(find,{lastReadAt:lastReadAt},(err,doc)=>{
      if(err){
        console.log(err)
      }
      console.log("房间最后阅读时间更新完成")
    })
  })

  app.get('/chatmsg',function(req,res){
    var email = req.query.email
    ChatMsg.find({'$or':[{email:email},{receiver:email}]}).sort({'time':1}).exec((err,chatmsg)=>{
      if(err){
        console.log(err)
      }else{
        //console.log('获取聊天信息',chatmsg)
        res.json({
          success:true,
          chatmsg:chatmsg
        })
      }
    })
  })

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


  //使用sendcloud
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

      var apiuser = YOUR_APIUSER
      var apikey = YOUR_APIKEY
      var from = 'mail@weqq.link'
      var from_name = 'WeQQ'

      var subject = '欢迎使用WeQQ'
      var html = '<p>您本次操作的验证码为：'+verificationCode+'</p><p>10分钟内有效。</p>'

      var sc = new Sendcloud(apiuser,apikey,from,from_name)

      var response = res

      sc.send(receiveEmail,subject,html).then(function(info){
        console.log('sendcloud邮件发送',info)
        response.json({
          success: true,
          result: info.message
        })
      })
    }
  })

  app.post('/register',function(req,res){
    var submitData = req.body.submitData
    var userInputVerificationCode = req.body.verificationCode
    console.log("-----注册用信息-----")
    console.log(submitData)

    var usernameFlag = checkData.username(submitData.username)
    var qqnumberFlag = checkData.qqnumber(submitData.qqnumber)
    var emailFlag = checkData.email(submitData.email)
    var passwordFlag = checkData.password(submitData.password)
    var isEnqualFalg = checkData.isEnqual(submitData.password,req.body.repeatPassword)&&checkData.isEnqual(receiveEmail,submitData.email)
    var notEmptyFlag = checkData.isNotEmpty(userInputVerificationCode)

    var registerTime = new Date().getTime()/1000

    if(userInputVerificationCode!=verificationCode){
      res.json({
        success:false,
        notice:"您输入的验证码有误"
      })
    }else if(registerTime - sendEmailTime>600){
      res.json({
        success:false,
        notice:"验证码已过期"
      })
    }else if(!usernameFlag||!qqnumberFlag||!emailFlag||!passwordFlag||!isEnqualFalg||!notEmptyFlag){
      res.json({
        success:false,
        notice:"您提交的信息有误"
      })
    }else{
      User.findOne({email:submitData.email}).exec((err,user)=>{
        if(err){
          console.log(err)
        }
        if(user){
          console.log(user);
          res.json({
            success:false,
            notice:"该邮箱已存在"
          })
        }else{

          submitData.imgsrc = imgsrcFun(submitData.qqnumber)

          var UserInsert = new User(submitData)
          UserInsert.save((err)=>{
            if(err){
              console.log(err)
            }
            console.log("成功插入数据")
            res.json({
              success:true,
              email:submitData.email
            })
          })

          //获取QQ昵称
          //superagent
          //  .get('http://r.pengyou.com/fcg-bin/cgi_get_portrait.fcg?uins='+submitData.qqnumber)
          //  .charset('gbk')
          //  .proxy(proxy)
          //  .end((err,response)=>{
          //    if(err){
          //      console.log(err)
          //    }
          //
          //    if(response){
          //      var data = response.text;
          //      var dataFilter1 = data.indexOf('{')
          //      var dataFilter2 = data.indexOf('}')
          //      var fileterData = data.substr(data.indexOf('{'),dataFilter2-dataFilter1+1)
          //
          //      var qqusername = JSON.parse(fileterData)[qqnumber][6]
          //
          //      submitData.username = qqusername
          //      submitData.imgsrc = imgsrcFun(submitData.qqnumber)
          //
          //      var UserInsert = new User(submitData)
          //      UserInsert.save((err)=>{
          //        if(err){
          //          console.log(err)
          //        }
          //        console.log("成功插入数据")
          //        res.json({
          //          success:true,
          //          email:submitData.email
          //        })
          //      })
          //    }else{
          //      res.json({
          //        success:false,
          //        notice:'响应时间过长。'
          //      })
          //    }
          //  })


        }
      })
    }
  })

  app.post('/login',function(req,res){

    var email = req.body.email
    var password = req.body.password

    User.findOne({email:email}).exec((err,user)=>{
      console.log('find user信息:%s',user)

      if(err){
        console.log(err)
      }
      if(user){
        console.log('JSON解析后的find user信息:%s',user)

        user.comparePassword(password,(err,match)=>{
          if(err){
            console.log(err)
          }
          if(match){
            console.log('密码验证成功')
            if(user.secretKey){
              console.log('登录验证成功，开始签发token')
              console.log(user.secretKey)
                var payload = {
                "iss":"mr158",
                "sub":email,
                "email":email,
                "admin":false
              }
              var privateKey = user.secretKey;
              var token = jwt.sign(payload,privateKey,{
                expiresIn:60*60
              })

              console.log('token:'+token)
              console.log('登陆成功。')
              console.log('QQ账号',user.qqnumber)

              res.json({
                success:true,
                email:email,
                qqnumber:user.qqnumber,
                username:user.username,
                token:token
              })

              //获取QQ昵称
              //superagent
              //  .get('http://r.pengyou.com/fcg-bin/cgi_get_portrait.fcg?uins='+user.qqnumber)
              //  .charset('gbk')
              //  .proxy(proxy)
              //  .end((err,response)=>{
              //    if(err){
              //      console.log(err)
              //    }
              //
              //    if(response){
              //      var data = response.text;
              //      var dataFilter1 = data.indexOf('{')
              //      var dataFilter2 = data.indexOf('}')
              //      var fileterData = data.substr(data.indexOf('{'),dataFilter2-dataFilter1+1)
              //
              //      var qqusername = JSON.parse(fileterData)[user.qqnumber][6]
              //
              //      var imgsrc = imgsrcFun(user.qqnumber)
              //
              //      //更新登陆人用户名
              //      User.update({email:email},{username:qqusername,imgsrc:imgsrc},(err,doc)=>{
              //        if(err){
              //          console.log(err)
              //        }else{
              //          res.json({
              //            success:true,
              //            email:email,
              //            qqnumber:user.qqnumber,
              //            username:qqusername,
              //            token:token
              //          })
              //        }
              //      })
              //    }else{
              //        res.json({
              //          success:false,
              //          notice:'响应时间过长。'
              //        })
              //    }
              //
              //
              //  })

            }else{
              res.json({
                success:false,
                notice:'未找到私钥，请联系管理员。'
              })
            }
          }else{
            console.log('密码匹配错误')
            res.json({
              success:false,
              notice:'您输入的账号或密码有误。'
            })
          }
        })

      }else{
        console.log('未找到邮箱。')
        res.json({
          success:false,
          notice:'您输入的账号或密码有误。'
        })
      }
    })


  })

  //搜索用户
  app.get('/search/user',function(req,res){
    var condition = req.query.condition
    if(checkData.isNotEmpty(condition)&&checkData.qqnumber(condition)){
      User.find({qqnumber:condition},{_id:0,password:0,secretKey:0,meta:0}).exec((err,users)=>{
        if(err) console.log(err)
        if(users.length){
          res.json({
            success:true,
            users:users
          })
        }else{
          res.json({
            success:false,
            notice:'未找到您所查找的用户'
          })
        }
      })
    }
  })


}


var imgsrcFun = (qqnumber)=>{
  return 'http://q1.qlogo.cn/g?b=qq&nk='+qqnumber+'&s=100'
}

//表单信息检查
var checkData = {
  username:(str)=>{
    let reg = /^[A-Za-z0-9_\-\u4e00-\u9fa5]+$/
    return reg.test(str)
  },
  email:(str)=>{
    let reg = /^\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}$/
    return reg.test(str);
  },
  qqnumber:(str)=>{
    let reg = /^[1-9]([0-9]{5,11})$/
    return reg.test(str);
  },
  password:(str)=>{
    let reg = /^[\w]{8,16}$/
    return reg.test(str);
  },
  isEnqual:(str,str2)=>{
    return str==str2;
  },
  isNotEmpty:(str)=>{
    return str!=''&&str!=null
  }
}
