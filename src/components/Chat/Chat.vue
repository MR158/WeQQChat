<template>
  <div class="chat" :class="slideToggle" :style="{zIndex:zIndex}">
    <div class="topbar">
      <div class="return" @click="toChatList">
        <i class="fa fa-chevron-left"></i>
      </div>
      <div class="title">
        <div class="username">{{this.getInroom.roomname}}</div>
      </div>
      <div class="toolbar">
        <i class="fa fa-id-card"></i>
      </div>
    </div>
    <div class="chatpanel" ref="chatpanel" id="chatpanel">
      <swiper :options="chatmsgSwiper" ref="mySwiper">
        <swiper-slide>
          <div class="chat" v-for="chatMsg in this.getInroom.chatMsgList" :key='chatMsg.id' :class="{selfChat:chatMsg.isMe}">
            <div class="time">{{localTime(chatMsg.time)}}</div>
            <div class="content">
              <div class="avatar">
                <img v-lazy="chatMsg.avatar" alt="avatar">
              </div>
              <div class="msg">
                <div class="sendername">{{chatMsg.username}}</div>
                <div class="message">{{chatMsg.msg}}</div>
              </div>
              <div class="none"></div>
            </div>
          </div>
        </swiper-slide>
        <div class="swiper-scrollbar" slot="scrollbar">
          <div class="swiper-scrollbar-drag"></div>
        </div>
      </swiper>
    </div>
    <div class="inputbar">
      <input type="text" v-model="inputtext">
      <div class="sendbtn" :class="inputstyle" @click="sendMsg">发送</div>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import bus from '../../assets/eventBus'

export default{
  data(){
    return {
      inputtext:'',
      chatmsgSwiper:{
        notNextTick:true,
        scrollbar:'.swiper-scrollbar',
        direction: 'vertical',
        height:window.innerHeight-102,
        freeMode:true,
        mousewheelControl: true,
        slidesPerView :'auto',
        dragSize:10
      }
    }
  },
  created(){
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


  //      this.$store.commit('addChatMsgList',chatMsg)
//      this.chatMsgList.push(chatMsg)
    })
  },
  methods:{
    //返回聊天列表
    toChatList(){
      //更新最后阅读时间
      var that = this
      for(let i = 0;i<this.getChatRoom.length;i++){
        if(this.getInroom.roomid==this.getChatRoom[i].roomid){
          this.$store.commit('changeLastReadTime',{
            index:i,
            time:new Date()
          })
          this.$store.dispatch('updateLastReadTime',{
            roomid:this.getInroom.roomid,
            email:that.getUser.email,
            receiver:this.getInroom.receiver,
            type:this.getInroom.type,
            lastReadAt:new Date()
          })
        }
      }
      setTimeout(()=>{
        this.$store.commit('changeChatSlideToggle',false)
      },500)
      this.$store.commit('changeHomeSlideToggle',false)
    },
    sendMsg(){
      var chat = {
        roomid:this.getInroom.roomid,
        roomname:this.getInroom.roomname,
        email:this.getUser.email,
        username:this.getUser.username,
        receiver:this.getInroom.receiver,
        qqnumber:this.getUser.qqnumber,
        avatar:this.getUser.avatar,
        msg:this.inputtext,
        time:new Date(),
        lastChatAt:new Date(),
        type:this.getInroom.type
      }
      this.inputtext = ''
      this.getSocket.emit('message',chat)
    },
    localTime(time){
      return this.$moment.tz(time,'Asia/Shanghai').format('YY-MM-D H:mm:ss')
    },
//    positionInitial(){
//      var chatpanelHeight = this.$refs.chatpanel.offsetHeight
//      var swiperHeight = this.$refs.mySwiper.swiper.height
//      var translate = parseInt(chatpanelHeight-swiperHeight)*-1
//      console.log(chatpanelHeight)
//      this.swiper.setWrapperTranslate(translate)
//    }
  },
  computed:{
    ...mapGetters([
      'getSocket',
      'getUser',
      'getInroom',
      'getChatRoom',
      'getPositionInitial'
    ]),
    slideToggle(){
      return this.$store.state  .homeSlideToggle?'':'slide-right-leave-active'
    },
    inputstyle(){
      return this.inputtext?'sendbtnActive':''
    },
    swiper(){
      return this.$refs.mySwiper.swiper
    },
    zIndex(){
      return this.$store.state.chatSlideToggle?399:0
    }
  },
//  mounted(){
//    var that = this
//    bus.$on('positionInitial',function(msg){
//      if(msg){
//        that.positionInitial()
//      }
//    })
//  },
  updated(){
    //位置初始化
    this.swiper.setWrapperTranslate(parseInt(this.$refs.chatpanel.offsetHeight-this.$refs.mySwiper.swiper.height)*-1)
  }
}
</script>

<style lang="scss" scoped>
  .chat{
    background:#eee;
    color:white;
    z-index:299;

    .topbar{
      width:100%;
      height:50px;
      background:#2bafff;
      display:flex;
      justify-content:space-between;
      align-items:center;
      position:fixed;
      z-index:99;

      .return{
        margin-left:20px;
      }
      .toolbar{
        margin-right:20px;
        i{
          font-size:20px;
        }
      }
    }
    .chatpanel{
      width:100%;
      height:auto;
      margin-bottom:50px;
      margin-top:50px;
      position:absolute;
      /*bottom:0;*/

      .chat{
        padding:0 10px;
        height:auto;
        display:flex;
        flex-wrap:wrap;
        justify-content:flex-start;

        .time{
          width:100%;
          margin:15px 0;
          color:#999;
          font-size:12px;
        }
        .content{
          width:100%;
          display:flex;
          flex-direction:row;

          .avatar{
            flex:1;
            margin-right:10px;

            img{
              width:32px;
              border-radius:16px;
            }
          }
          .msg{
            width:100%;
            display:flex;
            flex-direction:column;

            .sendername{
              color:#999;
              text-align: left;
              margin-left:10px;
              margin-bottom:3px;
              font-size:14px;
              white-space: nowrap;
            }
            .message{
              padding:10px 15px;
              background:#fff;
              color:#333;
              border-radius:20px;
              font-size:14px;
              text-align: left;
              align-self:flex-start;
              word-wrap:break-word;
            }
          }
          .none{
            flex:0 0 50px;
          }
        }

      }
      .selfChat{
        justify-content:flex-end;

        .content{
          flex-direction:row-reverse;

          .avatar{
            margin-left:10px;
            margin-right:0;
          }
          .msg{

            .sendername{
              text-align: right;
              margin-right:10px;
              margin-left:0;
            }
            .message{
              align-self:flex-end;
            }
          }
        }
      }
    }
    .inputbar{
      width:100%;
      height:40px;
      position:absolute;
      background:#eee;
      bottom:0px;
      display:flex;
      border-top:1px solid #eee;

      input{
        width:100%;
        height:20px;
        background:#fff;
        border:none;
        padding:5px 3px;
        border-radius:3px;
        flex:1;
        margin-left:10px;
        font-size:14px;
        line-height: 30px;
      }
      input:focus{
        outline:none;
      }
      .sendbtn{
        width:50px;
        height:30px;
        background:#aaa;
        color:#ccc;
        flex:0 0 50px;
        margin-left:5px;
        margin-right:10px;
        font-size:14px;
        line-height: 30px;
        border-radius:3px;
      }
      .sendbtnActive{
        background:#2bafff;
        color:#fff;
      }
    }
  }
  .swiper-scrollbar{
    width:5px;
    height:100%;
    position:fixed;
    top:0;
    right:0px;
  }

  .swiper-scrollbar-drag{
    background:#ccc;
    border-radius:2.5px;
  }
</style>
