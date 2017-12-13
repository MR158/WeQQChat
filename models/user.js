const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs')
const crypto = require('crypto');

var UserSchema = new Schema({
  qqnumber:Number,
  username:String,
  password:String,
  email:{
    unique:true,
    type:String
  },
  imgsrc:String,
  secretKey:{
    unique:true,
    type:String
  },
  createAt:{
    type:Number,
    default:Date.now()
  },
  updateAt:{
    type:Date,
    default:Date.now()
  }
},{collection:'User'})

//用户注册
UserSchema.pre('save',function(next){
  //加密密码
  var user = this
  bcrypt.genSalt(10,function(err,salt){
    if(err) return next(err)
    bcrypt.hash(user.password,salt,function(err,hash){
      if(err) return next(err)
      user.password = hash

      //生成私钥
      var randomSalt = user.passwordMD5(Math.random().toString().slice(3,6))
      var saltSecretKey = user.email+':'+user.passwordMD5(user.password)+':'+randomSalt
      user.secretKey = user.passwordMD5((saltSecretKey))

      next()
    })
  })

})
UserSchema.methods = {
  //密码验证
  comparePassword:function(userInputPassword,cb){
    bcrypt.compare(userInputPassword,this.password,function(err,match){
      if(err){
        return cb(err)
      }
      cb(null,match)
    })
  },
  //MD5
  passwordMD5:function(password){
    var md5 = crypto.createHash('md5')
    var result = md5.update(password).digest('hex')
    return result
  }
}

UserSchema.statics = {
  fetch: function (cb) {
    return this
      .find({})
      .exec(cb)
  },
  findById: function (id, cb) {
    return this
      .findOne({_id: id})
      .exec(cb)
  }
}

var User = mongoose.model('User',UserSchema)

module.exports = User;
