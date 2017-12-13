
import Vue from 'vue'
import App from './App'
import router from './router'
import VueAwesomeSwiper from 'vue-awesome-swiper'
import axios from 'axios'
import Vuex from 'vuex'
import VueLazyLoad from 'vue-lazyload'
import moment from 'moment-timezone'

Vue.config.productionTip = true

Vue.use(VueAwesomeSwiper)
Vue.use(Vuex)
Vue.use(VueLazyLoad,{
  preLoad:1.3,
  error: require('./common/images/loading.gif'),
  loading:require('./common/images/loading.gif'),
  attempt: 1
})

Vue.prototype.$moment = moment
Vue.prototype.$validate = {
  username:(str)=>{
    let reg = /^[A-Za-z0-9_\-\u4e00-\u9fa5]+$/
    return reg.test(str)
  },
  email:(str)=>{
    let reg = /^\w[-\w.+]*@([A-Za-z0-9][-A-Za-z0-9]+\.)+[A-Za-z]{2,14}$/
    return reg.test(str)
  },
  qqnumber:(str)=>{
    let reg = /^[1-9]([0-9]{5,11})$/
    return reg.test(str)
  },
  password:(str)=>{
    let reg = /^[\w]{8,16}$/
    return reg.test(str)
  },
  isEnqual:(str,str2)=>{
    return str==str2
  },
  isNotEmpty:(str)=>{
    return str!=''&&str!=null
  }
}

const store = new Vuex.Store({
  state:{
    user:{
      username:'',
      avatar:'',
      qqnumber:'',
      email:''
    },
    chatroom:[],
    inroom:{ //进入的房间
      roomid:'',
      roomname:'',
      type:'',
      receiver:'',
      chatMsgList:[],
      lastReadAt:''
    },
    tabIndex:1,
    showMainPage:false, //切换主页和登录页
    loginSlideToggle:false, //注册登录页切换
    homeSlideToggle:false, //主页与其他页切换
    chatSlideToggle:false, //聊天页触发切换
    searchSlideToggle:false, //搜索页触发切换
    sendEmailStatus:true, //是否可发邮件
    showLoading:false,
    showRegistered:false, //显示已注册信息
    noticeShow:false,
    noticeText:'',
    searchNotice:'',
    socket:''
  },
  getters:{
    getSocket:state => state.socket,
    getUser:state=> state.user,
    getTabIndex:state=> state.tabIndex,
    getChatRoom:state=> state.chatroom,
    getInroom:state=> state.inroom,
    getSearchNotice:state=> state.searchNotice
  },
  mutations:{
    changeTabIndex(state,index){
      state.tabIndex = index;
    },
    changeMainPageShow(state,boolean){
      state.showMainPage = boolean;
    },
    changeLoginSlideToggle(state,boolean){
      state.loginSlideToggle = boolean;
    },
    changeHomeSlideToggle(state,boolean){
      state.homeSlideToggle = boolean;
    },
    changeChatSlideToggle(state,boolean){
      state.chatSlideToggle = boolean;
    },
    changeSearchSlideToggle(state,boolean){
      state.searchSlideToggle = boolean;
    },
    changeLoadingToggle(state,boolean){
      state.showLoading = boolean;
    },
    changeRegisteredToggle(state,boolean){
      state.showRegistered = boolean;
    },
    setUsername(state,string){
      state.user.username = string;
    },
    setUserAvatar(state,url){
      state.user.avatar = url;
    },
    setUserQQnumber(state,String){
      state.user.qqnumber = String;
    },
    setUserEmail(state,String){
      state.user.email = String;
    },
    setChatRoom(state,obj){
      state.chatroom = obj;
    },
    addChatRoom(state,obj){
      Vue.set(state.chatroom,state.chatroom.length,obj);
    },
    changeInroom(state,obj){
      state.inroom = obj;
    },
    changeLastReadTime(state,data){
      state.chatroom[data.index].lastReadAt = data.time
    },
    addChatMsgList(state,obj){
      state.chatMsgList.push(obj);
    },
    noticeShow(state,boolean){
      state.noticeShow = boolean;
    },
    noticeText(state,string){
      state.noticeText = string;
    },
    changeSearchNotice(state,string){
      state.searchNotice = string;
    },
    socket(state,socket){
      state.socket = socket;
    }
  },
  actions:{
    tabIndex({commit},index){
      commit('changeTabIndex',index)
    },
    //邮件发送
    sendVerificationCode({dispatch},data){
      axios.post('/send_email',data).then((res)=>{
        if(res.data.success){
          //发送出去后
          if(res.data.result==="success"){
            dispatch('noticeShowCD',{
              state:true,
              sec:3000,
              text:"邮件发送成功。"
            })
          }else{
            dispatch('noticeShowCD',{
              state:true,
              sec:3000,
              text:"邮件发送失败，请稍后重试。"
            })
          }
        }else{
          dispatch('noticeShowCD',{
            state:true,
            sec:3000,
            text:res.data.notice
          })
        }

      })
    },
    registerSubmit({commit,dispatch},data){
      axios.post('/register',data).then((res)=>{
        commit('changeLoadingToggle',false)
        if(res.data.success){
          commit('changeRegisteredToggle',true)
        }else{
          dispatch('noticeShowCD',{
            state:true,
            sec:3000,
            text:res.data.notice
          })
        }
      })
    },
    loginSubmit({commit,dispatch},data){
      axios.post('/login',data).then((res)=>{
        commit('changeLoadingToggle',false)
        if(res.data.success){
          dispatch('getChatRoom',res.data.email)
          sessionStorage.usermeta = [res.data.email,res.data.username,res.data.qqnumber,res.data.token]
          commit('changeMainPageShow',true)
          commit('setUsername',res.data.username)
          commit('setUserEmail',res.data.email)
          commit('setUserQQnumber',res.data.qqnumber)
          commit('setUsername',res.data.username)
          commit('setUserAvatar','http://q1.qlogo.cn/g?b=qq&nk='+res.data.qqnumber+'&s=100')

        }else{

          dispatch('noticeShowCD',{
            state:true,
            sec:3000,
            text:res.data.notice
          })
        }

      })
    },
    //添加房间
    addChatRoom({state,commit,dispatch},data){
      axios.post('/chatroom',data).then((res)=>{
        if(res.data.success){
          var chatroom = res.data.chatroom
          //添加到聊天列表
          commit('addChatRoom',{
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
          state.socket.emit('join',{
            username:state.user.username,
            chatroom:[chatroom]
          })
        }else{
          dispatch('noticeShowCD',{
            state:true,
            sec:3000,
            text:res.data.notice
          })
        }
      })
    },
    //获取房间
    getChatRoom({state,commit,dispatch},email){
      axios.get('/chatroom',{params:{email:email}}).then((res)=>{
        var chatroom = res.data.chatroom
        if(chatroom.length==0){
          chatroom[0].chatMsgList = []
        }
        for(let i =0;i<chatroom.length;i++){
          if(chatroom[i].type=='single'&&chatroom[i].receiver==state.user.email){
            //删除后数组位置发生变化
            chatroom.splice(i,1)
            i--
          }else{
            chatroom[i].chatMsgList = []
            chatroom[i].unread = chatroom[i].chatMsgList.length
          }
        }
        commit('setChatRoom',chatroom)
        dispatch('getChatMsg',{
          email:state.user.email
        })

        //加入房间
        state.socket.emit('join',{
          username:state.user.username,
          chatroom:state.chatroom
        })
      })
    },
    //更新最后阅读时间
    updateLastReadTime({commit},data){
      axios.post('/chatroom/lastreadtime',data)
    },
    //获取聊天记录
    getChatMsg({commit,state},data){
      axios.get('/chatmsg',{params:data}).then((res)=>{
        var chatmsg = res.data.chatmsg
        for(let i = 0;i<chatmsg.length;i++){
          if(chatmsg[i].qqnumber==state.user.qqnumber){
            chatmsg[i].isMe = true
          }
          for(let m = 0;m<state.chatroom.length;m++){
            if(chatmsg[i].roomid==state.chatroom[m].roomid){
              state.chatroom[m].chatMsgList.push(chatmsg[i])
            }
          }
        }
      })
    },
    //token验证
    verifyToken({commit,dispatch},data){
      axios.get('/verifyToken',{params:data}).then((res)=>{
        if(res.data.success){
          dispatch('getChatRoom',res.data.email)
          commit('changeMainPageShow',true)
        }else{
          if(res.data.destroy!=null){
            sessionStorage.removeItem('usermeta')
          }
          commit('changeMainPageShow',false)
          dispatch('noticeShowCD',{
            state:true,
            sec:3000,
            text:res.data.notice
          })
        }
      })
    },
    //通知栏
    noticeShowCD({commit},data){
      commit('noticeText',data.text)
      commit('noticeShow',data.state)
      setTimeout(()=>{
        commit('noticeShow',false)
      },data.sec)
    },

    searchUser({commit},data){
      axios.get('/search/user',{params:data}).then((res)=>{
        if(res.data.success){
          commit('changeSearchNotice',{
            success:true,
            users:res.data.users
          })
        }else{
          commit('changeSearchNotice',{
            success:false,
            text:'未找到您所查询的用户'
          })
        }
      })
    }
  }
})

new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
