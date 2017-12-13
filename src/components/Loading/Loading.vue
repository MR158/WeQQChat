<template>
  <div class="loading" v-if="showLoading">
    <i class="fa fa-circle-o-notch"></i>
    <h4>请稍等...</h4>
  </div>
</template>

<script>
export default {
  data(){
    return{

    }
  },
  computed:{
    showLoading(){
      return this.$store.state.showLoading;
    }
  }
}
</script>

<style lang="scss" scoped>
.loading{
  width:100%;
  height:100%;
  background:rgba(0,0,0,0.3);
  position:absolute;
  z-index:99;
  display:flex;
  justify-content:center;
  align-items:center;
  flex-direction:column;
  color:#fff;
  text-shadow:0 0 5px #fff;

  h4{
    font-size:14px;
    margin:10px;
  }

  i{
    font-size:24px;
    animation:mymove 0.75s infinite linear;
  }
  @keyframes mymove{
    0% {transform:rotate(0deg);}
    50% {transform:rotate(180deg);}
    100% {transform:rotate(360deg);}
  }
}
</style>
