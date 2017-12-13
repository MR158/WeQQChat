<template>
    <swiper :options="swiperOption" class="contacts">
      <swiper-slide>
        <SearchBar></SearchBar>
        联系人页面
      </swiper-slide>
    </swiper>
</template>

<script>
  import SearchBar from '../SearchBar/SearchBar.vue'

export default{
  name:'contacts',
  components:{
    SearchBar,
  },
  data(){
    return {
      swiperOption:{
        direction:'vertical',
        freeMode:true,
        slidesPreView:'auto'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import '../../common/scss/base.scss';

  .contacts{
    @include topfix;
  }
</style>
