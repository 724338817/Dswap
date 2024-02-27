<template>
  <el-dialog width="500px" :visible.sync="dialogVisible" :before-close="Close" :close-on-click-modal="false">
    <span class="title">Your purchase is processing…</span>
    <div class="nft_data">
      <img class="" src="../../assets/image/icon_load.png" />
      <div class="nft_info">
        <span>Your purchase of <span class="info_color">{{ buyProcessData.name }}</span> is processing. It should be confirmed on the blockchain shortly.</span>
        <!-- <span>{{sellPriceData.contractDeployer.substring(0,20)}}</span> -->
      </div>
    </div>
    <div class="line"></div>
    <div class="tip">
      <!-- <div class="pay_title">
        <span>Transaction ID</span>
        <span class="addr">{{buyProcessData.id}}</span>
      </div> -->
    </div>
  </el-dialog>
</template>

<script>
export default {
  props: {
    buyProcessData: {
      type: Object,
    },
  },
  data() {
    return {
      dialogVisible: true,
    };
  },
  created() {},
  mounted() {},
  methods: {
    Close() {
      this.$emit("close");
    },
    submit(formName) {
      this.$emit("buySure");
    },
  },
  components: {},
};
</script>

<style lang="less" scoped>
div /deep/ .el-dialog__body {
  padding: 20px 40px 40px 40px;
}
div /deep/ .el-dialog__close {
  font-size: 20px;
  display: none;
}
div /deep/ .el-dialog__header {
  padding: 10px;
}
div /deep/ .el-input-group__prepend {
  background-color: white;
  width: 160px;
}
div /deep/ .el-form-item {
  margin: 0;
}
.title {
  font-size: 20px;
  font-family: SanFranciscoText-Bold, SanFranciscoText;
  font-weight: bold;
  color: #333333;
  line-height: 24px;
}
@keyframes rotation {
  0% {
    transform: rotate(0);
  }

  100% {
    transform: rotate(360deg);
  }
}
.nft_data {
  width: 100%;
  margin-top: 20px;
  height: auto;
  display: flex;
  img {
    width: 38px;
    height: 38px;
    animation: rotation 1s linear infinite;
  }
  .nft_info {
    margin-left: 16px;
    font-size: 16px;
    font-family: SanFranciscoText-Regular, SanFranciscoText;
    font-weight: 400;
    color: #333333;
    line-height: 19px;
  }
  .info_color{
    color:#2087EC
  }
}
.line {
  width: 100%;
  height: 2px;
  background-color: #ebedf0;
  margin-top: 24px;
}
.tip {
  width: 100%;
  padding: 20px 0 10px 0;
  // display: flex;
  // justify-content: space-between;
  font-size: 18px;
  font-family: SanFranciscoText-Bold, SanFranciscoText;
  font-weight: bold;
  color: #333333;
  line-height: 18px;
  text-align: center;
  .addr {
    font-size: 16px;
    font-family: SanFranciscoText-Regular, SanFranciscoText;
    font-weight: 400;
    color: #2087ec;
    line-height: 18px;
    margin-left: 12px;
  }
}
.pay_balance {
  width: 100%;
  padding-top: 5px;
  font-size: 14px;
  font-family: SanFranciscoText-Regular, SanFranciscoText;
  font-weight: 400;
  color: #666666;
  line-height: 18px;
  display: inline-block;
  text-align: right;
}
div /deep/ .el-dialog__footer {
  padding: 30px 40px;
  .makeOffer {
    width: 100%;
    font-size: 18px;
    font-family: SanFranciscoText-Bold, SanFranciscoText;
    font-weight: bold;
    color: #ffffff;
    line-height: 20px;
  }
}
</style>
