<template>
  <div class="tabbar">
    <router-link tag="div" to="/Chatlist" class="tab" @click.native="changeTabIndex(1)">
      <i class="fa fa-commenting" :class="{active: getTabIndex==1}"></i>
      <span>会话</span>
    </router-link>
    <router-link tag="div" to="/Contacts" class="tab" @click.native="changeTabIndex(2)">
      <i class="fa fa-user-circle" :class="{active: getTabIndex==2}"></i>
      <span>联系人</span>
    </router-link>
    <router-link tag="div" to="/Timeline" class="tab" @click.native="changeTabIndex(3)">
      <i class="fa fa-star" :class="{active: getTabIndex==3}"></i>
      <span>动态</span>
    </router-link>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  export default {
    name:'tabbar',
    data(){
      return {

      }
    },
    computed:{
      ...mapGetters([
        'getTabIndex'
      ])
    },
    methods:{
      changeTabIndex(index){
        this.$store.commit('changeTabIndex',index);
      }
    }
  }
</script>

<style lang="scss" scoped>
.tabbar{
  width:100%;
  height:50px;
  border-top:1px solid #ddd;
  background-color:#fff;
  position:fixed;
  bottom:0;
  display:flex;
  justify-content:space-around;
  align-items:center;

  .tab{
    width:40px;
    display:flex;
    flex-wrap:wrap;
    justify-content:center;

    i{
      font-size:26px;
      color:#555;
    }
    .active{
      color:#2bafff;
    }
    span{
      font-size:12px;
      color:#333;
    }
  }
}
</style>
