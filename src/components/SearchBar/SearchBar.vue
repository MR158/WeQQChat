<template>
  <div class="searchBar">
    <div class="wrapper">
      <i class="fa fa-search"></i>
      <span>搜索</span>
    </div>
  </div>
</template>

<script>
export default {
  name:'searchBar',
  data(){
    return {

    }
  }
}
</script>

<style lang="scss" scoped>
.searchBar{
  width:100%;
  height:auto;
  line-height: 30px;
  background-color:#fff;

  .wrapper{
    margin:5px 10px;
    background-color:#eee;
    font-size:14px;
    color:#999;
    border-radius:3px;
  }
}
</style>
