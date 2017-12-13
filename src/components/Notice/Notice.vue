<template>
  <transition name="slide">
    <div class="notice" :class="noticeShow" @click="noticeToggle">
      <i class="fa fa-info-circle"></i>
      <div>{{noticeInfo}}</div>
    </div>
  </transition>

</template>

<script>
  export default{
    computed:{
      noticeShow(){
        return this.$store.state.noticeShow?'':'notice-leave'
      },
      noticeInfo(){
        return this.$store.state.noticeText
      }
    },
    methods:{
      noticeToggle(){
        this.$store.commit('noticeShow',false)
      }
    }
  }
</script>

<style lang="scss" scoped>
.notice{
  width:100%;
  position:absolute;
  z-index:999;
  transform:translate(0,0);
  background:#fff;
  display:flex;
  flex-direction:row;
  align-items:center;
  padding:20px 0 10px 0;
  box-shadow:0 3px 2px rgba(80,80,80,0.3);
  transition: all .5s cubic-bezier(.55,0,.1,1);

  i{
    margin-left:20px;
    font-size:18px;
    color:#2bafff;
  }
  div{
    margin-left:6px;
    font-size:16px;
  }
}
.notice-leave{
  transform:translate(0,-150%);
}
</style>
