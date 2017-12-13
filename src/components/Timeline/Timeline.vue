<template>
  <div class="timeline">
    <SearchBar></SearchBar>
    动态页面
  </div>
</template>

<script>
import SearchBar from '../SearchBar/SearchBar.vue'

export default {
  components:{
    SearchBar
  },
  data(){
    return {

    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../common/scss/base.scss';

  .timeline{
    @include topfix;
  }
</style>
