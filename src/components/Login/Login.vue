<template>
  <div class="login" :class="slideToggle">
    <div class="container" v-if="showLogin">
      <div class="title">
        <i class="fa fa-qq"></i>
        <h1>WeQQ</h1>
      </div>
      <transition name="fade">
        <div class="loginPanel" :style="{top:moveTop}">
          <div class="email">
            <input type="text" placeholder="邮箱" v-model="email">
            <i class="fa fa-remove" v-show="email" @click="removeInput('email')"></i>
          </div>
          <div class="password">
            <input type="password" placeholder="密码" ref="password" v-model="pass">
            <i class="fa fa-eye" v-if="showPass" @click="togglePassword" v-show="pass"></i>
            <i class="fa fa-eye-slash" v-else v-show="pass" @click="togglePassword"></i>
            <i class="fa fa-remove" v-show="pass" @click="removeInput('pass')"></i>
          </div>
          <div class="login-btn" @click="loginSubmit">登录</div>
          <div class="another">
            <div class="forget">忘记密码?</div>
            <div class="newUser" @click="toRegister">新用户注册</div>
          </div>
        </div>
      </transition>
    </div>
    <div v-else class="container">
      <div class="title">
        <i class="fa fa-qq"></i>
        <h1>WeQQ</h1>
      </div>
      <div class="subtitle">
        <h2>I'M WeQQ</h2>
        <h2>每一天</h2>
        <h2>乐在沟通</h2>
      </div>
      <div class="btns">
        <div class="login-btn" @click="toLogin">登录</div>
        <div class="register-btn" @click="toRegister">新用户</div>
      </div>
    </div>
    <div class="cover"></div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'

  export default{
    data(){
      return{
        showLogin:false,
        email:'',
        pass:'',
        showPass:false,
        moveTop:'20%'
      }
    },
    computed:{
      slideToggle(){
        return this.$store.state.loginSlideToggle?'slide-left-leave-active':''
      }
    },
    methods:{
      toRegister(){
        this.$store.commit('changeLoginSlideToggle',true);
      },
      toLogin(){
        this.showLogin = true,
        setTimeout(()=>{
          this.moveTop = '0px'
        },1)
      },
      togglePassword(){
        this.showPass = !this.showPass;
        if(this.showPass){
          this.$refs.password.setAttribute("type","text")
        }else{
          this.$refs.password.setAttribute("type","password")
        }
      },
      removeInput(obj){
        if(obj==='email'){
          this.email = ''
        }else{
          this.pass = ''
        }
      },
      loginSubmit(){
        if(this.email==''){
          this.$store.dispatch('noticeShowCD',{
            state:true,
            sec:3000,
            text:'请输入邮箱账号。'
          })
          return;
        }else if(this.pass==''){
          this.$store.dispatch('noticeShowCD',{
            state:true,
            sec:3000,
            text:'请输入密码。'
          })
          return;
        }

        if(this.$validate.email(this.email)&&this.$validate.password(this.pass)){
          this.$store.commit('changeLoadingToggle',true)
          var data = {
            email:this.email,
            password:this.pass
          }

          this.$store.dispatch('loginSubmit',data)
        }else{
          this.$store.dispatch('noticeShowCD',{
            state:true,
            sec:3000,
            text:'您输入的账号密码有误。'
          })
          return;
        }
      }
    }
  }
</script>

<style lang="scss" scoped>

  @mixin maincolor($property,$opacity){
    #{$property}:rgba(43,175,255,$opacity)
  }

  .login{
    background:url('../../common/images/login-bg.jpg') center;
    background-size:auto 100%;
    top:0;
    left:0;
    z-index:49;

    .cover{
      width:100%;
      height:100%;
      background:#000;
      opacity:0.4;
      position:absolute;
      z-index:99;
    }

    .container{
      width:100%;
      height:100%;
      position:absolute;
      z-index:149;
      display:flex;
      flex-direction:column;

      /*登录面板*/
      .loginPanel{
        padding:0 30px;
        position:relative;
        top:20%;
        transition:top 0.5s;

        .email,.password{
          width:100%;
          height:50px;
          line-height:50px;
          border-bottom:1px solid #ccc;
          display:flex;
          align-items:center;

          input{
            width:100%;
            font-size:18px;
            border:none;
            background:transparent;
            color:#fff;
          }
          input:focus{
            outline:none;
          }
          input::input-placeholder{
            color:#eee;
          }
          input::-webkit-input-placeholder{
            color:#eee;
          }
          input::-moz-input-placeholder{
            color:#eee;
          }
          input::-ms-input-placeholder{
            color:#eee;
          }
          i{
            flex:0 0 24px;
            color:#ddd;
          }
        }
        .login-btn{
          width:100%;
          height:40px;
          line-height:40px;
          color:#fff;
          margin-top:20px;
          border-radius:3px;
          letter-spacing:5px;
          text-align:center;
          @include maincolor(background,0.8);
        }
        .login-btn:active{
          @include maincolor(background,0.6);
        }
        .another{
          display:flex;
          justify-content:space-between;
          margin-top:10px;
          color:#2bafff;

          div{
            font-size:14px;
          }
          div:active{
            opacity:0.8;
          }
        }
      }

      /*登录注册首页*/
      .title,.subtitle{
        color:#f2f2f2;
      }

      .title{
        height:36px;
        display:flex;
        justify-content:center;
        line-height: 42px;
        margin:20% 0px;

        i{
          font-size:36px;
        }
        h1{
          font-weight:normal;
          font-size:36px;
          margin:0 10px;
        }
      }

      .subtitle{
        height:100%;
        font-size:28px;
        line-height:48px;
        margin:10px;
        display:flex;
        flex-direction:column;
        justify-content: flex-end;
        align-items:flex-start;

        h2{
          font-weight:normal;
          margin:0;
        }
      }

      .btns{
        width:100%;
        height:35px;
        display:flex;
        justify-content:space-around;
        align-items:flex-end;
        margin-top:40px;
        margin-bottom:50px;

        div{
          width:100%;
          height:35px;
          line-height: 35px;
          border-radius:5px;
          margin:0 10px;
          color:#f2f2f2;
        }

        .login-btn{
          background-color:rgba(220,220,220,0.8);
        }
        .register-btn{
          @include maincolor(background,0.8);
        }

        .login-btn:active{
          background-color:rgba(220,220,220,0.6);
        }
        .register-btn:active{
          @include maincolor(background,0.6);
        }
      }
    }
  }
</style>
