<template>
  <div class="header" :style="{backgroundColor: skinColor}">
    <div class="avatar">
      <img :src="this.getUser.avatar">
    </div>
    <div class="title">{{message}}</div>
    <div class="plusMenuBtn">
      <i class="fa fa-plus"></i>
      <div class="plusMenu" v-show="isShowPlusMenu"></div>
    </div>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  export default {
    name:'header',
    data(){
      return {
        message:'会话',
        skinColor:'#2bafff'
      }
    },
    methods:{
      isShowPlusMenu(){

      }
    },
    computed:{
      ...mapGetters([
        'getUser'
      ])
    }
  }
</script>

<style lang="scss" scoped>
  .header{
    display:flex;
    width:100%;
    height:50px;
    justify-content: space-between;
    align-items:center;
    color:white;
    position:fixed;
    top:0;
    z-index:10;

    .avatar{
      width:40px;
      height:40px;
      margin-left:10px;

      img{
        width:40px;
        border-radius:20px;
      }
    }
    .title{
      width:2em;
    }
    .plusMenuBtn{
      width:30px;
      margin-right:10px;

      i{
        font-size:20px;
        color:#f9f9f9;
      }
    }
  }
</style>
