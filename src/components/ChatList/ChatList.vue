<template>
    <swiper :options="swiperOption" class="chat" :style="{height:height}">
      <swiper-slide>
        <div @click="toSearch">
          <SearchBar></SearchBar>
        </div>
        <div class="chatItem" v-for="(chatroom,index) in this.getChatRoom" :key="chatroom.id" @click="toChat(chatroom)">
          <div class="avatar">
            <img v-lazy="chatroom.imgsrc">
          </div>
          <div class="content">
            <div class="header">
              <div class="title">{{chatroom.roomname}}</div>
              <div class="time">{{localTimeComputed[index]}}</div>
            </div>
            <div class="chatText">
              <div class="message">{{chatroom.chatMsgList.length-1>=0?chatroom.chatMsgList[chatroom.chatMsgList.length-1].msg:''}}</div>
              <div class="unread"　v-show="unread(chatroom)">{{unread(chatroom)}}</div>
            </div>
          </div>
        </div>
      </swiper-slide>
      <div class="swiper-scrollbar" slot="scrollbar">
        <div class="swiper-scrollbar-drag"></div>
      </div>

    </swiper>
</template>

<script>
  import {swiper,swiperSlide} from 'vue-awesome-swiper'
  import {mapGetters} from 'vuex'
  import SearchBar from '../SearchBar/SearchBar.vue'
  import bus from '../../assets/eventBus'

export default {
  name:'chat',
  components:{
    swiper,
    swiperSlide,
    SearchBar
  },
  data(){
    return {
      height: window.innerHeight-102+'px',
      swiperOption:{
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
  computed:{
    ...mapGetters([
      'getSocket',
      'getUser',
      'getChatRoom'
    ]),
    localTimeComputed(){
      var localtime = []
      for(let i = 0;i<this.getChatRoom.length;i++){
        localtime.push(this.localTime(this.getChatRoom[i].lastChatAt).format('YY-MM-D H:mm:ss'))
      }
      return localtime
    }
  },
  methods:{
    localTime(time){
//      this.$moment.duration()

      return this.$moment.tz(time,'Asia/Shanghai')
    },
    //未读信息数量
    unread(chatroom){
      var unreadMsg = []
      if(chatroom.chatMsgList.length>0){
        for(let i = 0;i<chatroom.chatMsgList.length;i++){
          if(this.$moment(this.localTime(chatroom.chatMsgList[i].time)).isAfter(this.localTime(chatroom.lastReadAt))){
            unreadMsg.push(chatroom.chatMsgList[i])
          }
        }
        return unreadMsg.length
      }else{
        return chatroom.unread = 0
      }
    },
    toChat(chatroom){
      var inroom = {
        roomid:chatroom.roomid,
        roomname:chatroom.roomname,
        type:chatroom.type,
        receiver:chatroom.receiver,
        chatMsgList:chatroom.chatMsgList,
        lastReadAt:chatroom.lastReadAt
      }
      //更新最后阅读时间
      var that = this
      for(let i = 0;i<this.getChatRoom.length;i++){
        if(inroom.roomid==this.getChatRoom[i].roomid){
          this.$store.commit('changeLastReadTime',{
            index:i,
            time:new Date()
          })
          this.$store.dispatch('updateLastReadTime',{
            roomid:inroom.roomid,
            email:that.getUser.email,
            receiver:inroom.receiver,
            type:inroom.type,
            lastReadAt:new Date()
          })
        }
      }
      this.$store.commit('changeInroom',inroom)
      this.$store.commit('changeChatSlideToggle',true)
      this.$store.commit('changeHomeSlideToggle',true)
//      bus.$emit('positionInitial',true)
    },
    toSearch(){
      this.$store.commit('changeSearchSlideToggle',true)
      this.$store.commit('changeHomeSlideToggle',true)
    }
  },
  mounted(){
//    this.getSocket.emit('setName',this.getUser.email)
  },
  created(){
    //来自对方添加房间的请求
    this.getSocket.on('addroom',(chatroom)=>{
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
      this.getSocket.emit('join',{
        username:this.getUser.username,
        chatroom:[chatroom]
      })
    })
  }
}
</script>

<style lang="scss" scoped>
@import '../../common/scss/base.scss';

.chat{
  @include topfix;

  .chatItem{
    width:100%;
    height:60px;
    border-bottom:1px solid #ddd;
    display:flex;
    background:#fff;

    .avatar{
      width:50px;
      height:50px;
      padding:5px 10px;
      float:left;
      flex:0;

      img{
        width:50px;
        border-radius:25px;
      }
    }

    .content{
      width:auto;
      height:44px;
      float:left;
      padding:8px 10px 8px 0px;
      flex:2;

      .header{
        width:100%;
        height:22px;
        line-height:22px;
        display:flex;
        justify-content:space-between;

        .title{
          width:auto;
          font-size:14px;
          color:#333;
        }
        .time{
          width:120px;
          font-size:12px;
          color:#777;
          text-align:right
        }
      }
      .chatText{
        width:100%;
        height:22px;
        line-height:22px;
        display:flex;
        justify-content:space-between;
        text-align:left;

        .message{
          font-size:12px;
          color:#555;
          overflow:hidden;
        }
        .unread{
          padding:1px 10px;
          background-color:#1a9fe0;
          color:#fff;
          font-size:12px;
          border-radius:15px;
          flex: 0 0 5px;
        }
      }
    }

  }

  .chatItem:active{
    background:#e6f6ff;
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
}
</style>
