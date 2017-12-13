<template>
  <div id="app">
    <div class="main view" v-if="showMainPage" :class="slideToggle">
      <VHeader></VHeader>
      <transition :name="transitionName">
        <router-view class="view"></router-view>
      </transition>

      <TabBar></TabBar>
    </div>
    <transition-group tag="div" name="slide" v-else>
      <Login class="view" :key="1"></Login>
      <Register class="view" :key="2"></Register>
    </transition-group>

    <Chat class="view"></Chat>
    <Search class="view"></Search>

    <Loading></Loading>
    <Notice></Notice>

  </div>
</template>

<script>
  import VHeader from './components/Header/Header.vue'
  import TabBar from './components/TabBar/TabBar.vue'
  import Login from './components/Login/Login.vue'
  import Register from './components/Register/Register.vue'
  import Loading from './components/Loading/Loading.vue'
  import Notice from './components/Notice/Notice.vue'
  import Chat from './components/Chat/Chat.vue'
  import Search from './components/Search/Search.vue'

  import io from 'socket.io-client'
  import {mapGetters} from 'vuex'


  export default {
    name: 'app',
    components:{
      VHeader,
      TabBar,
      Login,
      Register,
      Loading,
      Notice,
      Chat,
      Search
    },
    data(){
      return {
        winHeight :  window.innerHeight-100+'px',
        transitionName: 'slide-left',
        test:''
      }
    },
    methods:{

    },
    beforeCreate() {
      this.$store.dispatch('tabIndex',this.$route.name);
      //填写自己服务器的IP地址
      this.$store.commit('socket',io.connect('http://localhost:9090/'))

      if(sessionStorage.usermeta!=null){
        var usermeta = sessionStorage.usermeta.split(',')
        this.$store.commit('setUsername',usermeta[1])
        this.$store.commit('setUserAvatar','http://q1.qlogo.cn/g?b=qq&nk='+usermeta[2]+'&s=100')
        this.$store.commit('setUserQQnumber',usermeta[2])
        this.$store.commit('setUserEmail',usermeta[0])
        this.$store.dispatch('verifyToken',{
          email:usermeta[0],
          token:usermeta[3]
        })
      }
    },
    created(){
//      var ws = new WebSocket("ws://127.0.0.1:3000")
//
//      ws.onopen = function(){
//        console.log("连接状态", ws);
//        console.log("open");
//      }
//      ws.onmessage = function(evt){
//        console.log(evt)
//        console.log(evt.data)
//      }
//      ws.onclose = function(evt){
//        console.log(evt)
//      }
//      setTimeout(()=>{
//        ws.send('哈喽')
//      },500)
    },
    mounted(){
      this.getSocket.emit('setName',this.getUser.email)
    },
    computed:{
      showMainPage(){
        return this.$store.state.showMainPage
      },
      slideToggle(){
        return this.$store.state.homeSlideToggle?'slide-left-leave-active':''
      },
      ...mapGetters([
        'getSocket',
        'getUser'
      ])
    },
    watch:{
      '$route'(to,from){
        this.transitionName = to.name < from.name ? 'slide-right' : 'slide-left'
      }
    }
  }
</script>

<style lang="scss">
  @import './common/scss/slide-animation.scss';

  body{
    margin:0;
    overflow:hidden;
  }
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100%;

  .view {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    transition: all .5s cubic-bezier(.55,0,.1,1);
  }

  }
</style>
