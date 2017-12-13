<template>
  <div class="register" :class="slideToggle">
    <div class="process-bar">
      <div class="line" :class="{lineHundred:registered}"></div>
    </div>
    <div class="return" @click="toLogin">
      <i class="fa fa-chevron-left"></i>
      <span>返回</span>
    </div>
    <div class="registered" v-if="registered">
      <i class="fa fa-check"></i>
      <h4>注册成功</h4>
      <p>请返回登录</p>
    </div>
    <div class="main" v-else>
      <div class="title">
        <h2>请填写您的信息</h2>
        <p>QQ号码用于获取QQ头像，设置的密码仅用于登录本示例应用。</p>
        <p><i class="fa fa-exclamation-circle"></i> 未收到邮件，可以试着查看邮件垃圾箱。</p>
        </div>
        <div class="form">
          <div class="nickname">
            <label for="nickname">用户昵称</label>
            <input id="nickname" type="text" v-model="nickname">
            <i v-show="nickname" class="fa fa-remove" @click="removeInput('nickname')"></i>
          </div>
          <div class="qq-number">
            <label for="qq-number">QQ号码</label>
            <input id="qq-number" type="number" v-model="qqnumber">
            <i v-show="qqnumber" class="fa fa-remove" @click="removeInput('qqnumber')"></i>
          </div>
          <div class="pass">
            <label for="pass">设置密码</label>
            <input id="pass" type="password" v-model="pass">
          <i v-show="pass" class="fa fa-remove" @click="removeInput('pass')"></i>
        </div>
        <div class="repeat-pass">
          <label for="repeat-pass">重复密码</label>
          <input id="repeat-pass" type="password" v-model="repeatPass">
          <i v-show="repeatPass" class="fa fa-remove" @click="removeInput('repeatPass')"></i>
        </div>
        <div class="email">
          <label for="email">电子邮箱</label>
          <input id="email" type="email" v-model="email">
          <i v-show="email" class="fa fa-remove" @click="removeInput('email')"></i>
        </div>
        <div class="verificationCode">
          <label for="verificationCode">验证码</label>
          <input id="verificationCode" type="text" v-model="verificationCode">
          <div class="receive" :class="{sendActive:sendBtnStatus}" @click="sendVerificationCode">{{sendStatusText+emailInterval}}</div>
        </div>
        <div class="submit" :class="{submitActive:submitStatus}" @click="submitRegister">提交</div>
      </div>

    </div>
  </div>
</template>

<script>
  export default{
    data(){
      return {
        nickname:'',
        qqnumber:'',
        pass:'',
        repeatPass:'',
        email:'',
        verificationCode:'',
        submitActive:false, //是否可提交
        sendStatusText:'发送',
        emailInterval:'',
        timer:null,
      }
    },
    computed:{
      slideToggle(){
        return this.$store.state.loginSlideToggle?'':'slide-right-leave-active'
      },
      sendBtnStatus(){
        return this.$validate.email(this.email)&&this.$store.state.sendEmailStatus
      },
      submitStatus(){
        return this.submitActive
          = this.$validate.username(this.nickname)
          &&this.$validate.email(this.email)&&
        this.$validate.password(this.pass)&&
        this.$validate.qqnumber(this.qqnumber)&&
        this.$validate.isEnqual(this.pass,this.repeatPass)&&
        this.$validate.isNotEmpty(this.verificationCode)
      },
      registered(){
        return this.$store.state.showRegistered;
      }
    },
    methods:{
      toLogin(){
        this.$store.commit('changeLoginSlideToggle',false);
      },
      sendVerificationCode(){
        if(this.$validate.email(this.email)){
          if(sessionStorage.countdown==null||sessionStorage.countdown<=0){
            this.sendStatusText = '重新获取'
            sessionStorage.countdown = 30
            this.$store.state.sendEmailStatus = false
            this.$store.dispatch('sendVerificationCode',{email:this.email})
            this.countdown()
          }
        }
      },
      countdown(){
        this.timer = setInterval(()=>{
          sessionStorage.countdown -= 1
          this.emailInterval = "("+sessionStorage.countdown+")"
          if(sessionStorage.countdown<=0){
            this.emailInterval=''
            this.$store.state.sendEmailStatus = true
            clearInterval(this.timer)
          }
        },1000)
      },
      submitRegister(){
        if(this.submitActive){
          this.$store.commit('changeLoadingToggle',true)
          var data = {
            submitData:{
              username:this.nickname,
              qqnumber:this.qqnumber,
              password:this.pass,
              email:this.email
            },
            repeatPassword:this.repeatPass,
            verificationCode:this.verificationCode
          }
          this.$store.dispatch('registerSubmit',data)
        }
      },
      removeInput(obj){
        switch(obj){
          case 'nickname':
            this.nickname = ''
          case 'qqnumber':
             this.qqnumber = ''
          case 'pass':
             this.pass = ''
          case 'repeatPass':
             this.repeatPass = ''
          default:
             this.email = ''
        }
      }
    },
    mounted(){
      if(sessionStorage.countdown&&sessionStorage.countdown>0){
        this.sendStatusText = '重新获取'
        this.emailInterval = "("+sessionStorage.countdown+")";
        this.$store.state.sendEmailStatus = false
        this.countdown()
      }
    }
  }
</script>

<style lang="scss" scoped>
  $mainColor:#2bafff;

  .register{
    background:#fff;
    z-index:49;

    .process-bar{
      width:100%;
      height:5px;
      background:#f0f0f0;

      .line{
        width:50%;
        height:100%;
        background:$mainColor;
        transition:width 0.5s;
      }
      .lineHundred{
        width:100%;
      }
    }

    .return{
      display:flex;
      justify-content:flex-start;
      align-items: center;
      margin:10px;

      i{
        font-size:16px;
        margin-right:5px;
      }
    }

    .registered{
      display:flex;
      justify-content:center;
      flex-direction:column;
      margin-top:40px;

      i{
        font-size:48px;
        color:#2bafff;
      }
      h4{
        margin:10px;
      }
      p{
        font-size:14px;
        margin:0;
      }
    }

    .main{
      display:flex;
      justify-content:flex-start;
      flex-direction:column;
      padding:0 20px;

      .title{
        justify-content:flex-start;
        flex-direction:column;
        margin-top:10px;
        text-align:left;

        h2{
          font-size:32px;
          font-weight:normal;
          margin:0;
        }
        p{
          font-size:12px;
          margin-top:5px;
          color:#666;
        }
      }

      .form{
        width:100%;

        .nickname,.qq-number,.pass,.repeat-pass,.email,.verificationCode{
          width:100%;
          height:30px;
          padding:10px 0;
          border-bottom:1px solid #ddd;
          display:flex;
          flex-direction:row;
          justify-content:space-between;
          align-items:center;
          flex:1;

          label{
            text-align:right;
            flex:0 0 64px;
            height:24px;
            color:#666;
          }
          i{
            flex:0 0 18px;
            color:#ddd;
          }
          input{
            width:100%;
            margin:0 10px;
            border:none;
            font-size:18px;
            flex:1;

            &:focus{
               outline:none;
            }
          }

        }
        .verificationCode{
          .receive{
            color:#ccc;
            flex:0 0 100px;
            border-left:1px solid #ddd;
          }
          .sendActive{
            color:#666;
          }
        }

        .submit{
          width:100%;
          height:40px;
          line-height:40px;
          border-radius:3px;
          margin-top:20px;
          color:#aaa;
          background:#ddd;
        }
        .submitActive{
          color:#fff;
          background:#2bafff;
        }
      }
    }
  }
</style>
