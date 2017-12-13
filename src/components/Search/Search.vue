<template>
  <div class="search" :class="homeSlideToggle" :style="{zIndex:zIndex}">
    <div class="header">
      <div class="return" @click="toChatList">
        <i class="fa fa-chevron-left"></i>
      </div>
      <div class="searchbar">
        <i class="fa fa-search"></i>
        <input type="text" placeholder="请输入要查询的QQ号" v-model="searchtext">
      </div>
    </div>
    <div class="main" v-if="this.getSearchNotice.success">
      <div class="cards">
        <div class="card" v-for="user in this.getSearchNotice.users">
          <div class="content">
            <div class="avatar">
              <img v-lazy="user.imgsrc" alt="avatar">
            </div>
            <div class="text">
              <div class="username">{{user.username}}</div>
              <div class="email">{{user.email}}</div>
            </div>
          </div>
          <div class="sendMsg" @click="addChatRoom(user)">添加聊天</div>
        </div>
      </div>
    </div>
    <div class="notice" v-else>{{this.getSearchNotice.text}}</div>
  </div>
</template>

<script>
  import _ from 'lodash'
  import {mapGetters} from 'vuex'

  export default {
    data(){
      return {
        searchtext:'',
        isCalculating:false
      }
    },
    methods:{
      toChatList(){
        setTimeout(()=>{
          this.$store.commit('changeSearchSlideToggle',false)
        },500)
        this.$store.commit('changeHomeSlideToggle',false)
      },
      addChatRoom(user){
        this.$store.dispatch('addChatRoom',{
          roomname:user.username,
          email:this.getUser.email,
          receiver:user.email,
          imgsrc:user.imgsrc,
          type:'single'
        })
        this.toChatList()
      },
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
    },
    watch:{
      searchtext(){
        this.searching()
      }
    },
    computed:{
      homeSlideToggle(){
        return this.$store.state.homeSlideToggle?'':'slide-right-leave-active'
      },
      zIndex(){
        return this.$store.state.searchSlideToggle?399:0
      },
      imgsrc(){
        return 'http://q1.qlogo.cn/g?b=qq&nk='+this.getSearchNotice.user.qqnumber+'&s=100'
      },
      ...mapGetters([
        'getSearchNotice',
        'getUser'
      ])
    }
  }
</script>

<style lang="scss" scoped>
  .search{
    background:#f6f6f6;
    color:#999;

    .header{
      padding:0 10px;
      height:50px;
      border-bottom:1px solid #ccc;
      background:#fff;
      display:flex;
      align-items:center;

      .return{
        margin-right:15px;
      }
      .searchbar{
        width:100%;
        padding:5px 8px;
        border:none;
        border-radius:30px;
        background:#eee;
        display:flex;

        input{
          width:100%;
          border:none;
          background:#eee;
          margin-left:10px;
        }
        input:focus{
          outline:none;
        }
      }

    }

    .main{
      width:100%;
      height:auto;

      .cards{
        font-size:14px;
        color:#333;

        .card{
          width:100%;
          height:60px;
          background:#fff;
          border-bottom:1px solid #ddd;
          display:flex;
          justify-content:space-between;
          align-items:center;

          .content{
            display:flex;
            align-items:center;
            overflow:hidden;

            .avatar{
              width:50px;
              height:50px;
              padding:5px 10px;

              img{
                width:50px;
                border-radius:25px;
              }
            }
            .text{
              text-align:left;

              .username{
                height:22px;
              }
              .email{
                color:#999;
              }
            }
          }

          .sendMsg{
            height:35px;
            line-height: 35px;
            flex:0 0 80px;
            background:#2bafff;
            color:#fff;
            margin:0 10px;
          }
          .sendMsg:active{
            opacity:0.7;
          }
        }
      }
    }

    .notice{
      margin-top:10px;
    }
  }
</style>
