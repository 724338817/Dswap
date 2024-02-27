<template>
  <div>
    <HeaderTop></HeaderTop>
    <router-view v-slot="{ Component }">
      <transition name="fade-transform" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <bottomFooter></bottomFooter>
  </div>
</template>

<script>
import HeaderTop from './headerTop'
import bottomFooter from './bottomFooter'
export default {
  components: {
    HeaderTop,
    bottomFooter
  },
  data () {
    return {
      isCollapse: false
    }
  },
  created () {},
  computed: {
  },
  methods: {
  }
}
</script>
<style lang="less" scoped>
.layout-contaioner {
  height: 100%;
  .main-container {
    height: 100%;
    overflow: auto;
  }
  .elmain {
    height: 100%;
    padding: 30px 20px;
  }
  .el-menu {
    border-right: none;
  }
  .el-header {
    padding: 0;
  }
}
</style>
