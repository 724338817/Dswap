<template>
  <div class="foot">
    <!-- <img class="logo" src="~Assets/images/logo.png" alt="" /> -->
    <div class="logo">BAC Swap</div>
  </div>
</template>
<script>
export default {
  name: 'BottomFooter',
  data() {
    return {}
  },
  props: {},

  methods: {},
  watch: {}
}
</script>
<style lang="less" scoped>
.foot {
  text-align: center;
  font-size: 14px;
  // color: #787b84;
  border-top: 1px solid #282b4c57;
  height: 60px;
  padding-top: 15px;
  img {
    width: 120px;
  }
  .logo {
    display: inline-block;
    vertical-align: middle;
    font-size: 22px;
    font-family: math;
  }
}
</style>
