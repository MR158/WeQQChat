# WeQQChat
基于Vue全家桶的仿QQ即时聊天应用

尝试使用Vue做了一个较为完整的全栈项目，支持私聊、登录注册和根据QQ号搜索聊天

在线项目地址：[http://weqq.link](http://weqq.link) （建议调试模式手机端浏览）

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

### 一些运行画面

登录页面

![登录页面gif](http://7u2son.com1.z0.glb.clouddn.com//weqq/weqq_login.gif)

注册页面

![注册页面gif](http://7u2son.com1.z0.glb.clouddn.com//weqq/weqq_register.gif)

聊天页面

![聊天页面gif](http://7u2son.com1.z0.glb.clouddn.com//weqq/weqq_chat.gif)

搜索页面

![搜索页面gif](http://7u2son.com1.z0.glb.clouddn.com//weqq/weqq_search.gif)