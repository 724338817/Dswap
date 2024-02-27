<template>
  <el-dialog width="500px" :visible.sync="dialogVisible" :before-close="Close" :close-on-click-modal="false">
    <span class="title">Your item has been listed！</span>
    <div class="nft_data">
      <img :src="sellSuccessData.imageUrl" />
      <div class="nft_info">
        <span class="info_color">{{sellSuccessData.name}}</span> from the <span class="info_color">{{sellSuccessData.collectionName}}</span> <span>collection has been listed for sale.</span>
      </div>
    </div>
    <span slot="footer" class="dialog-footer">
      <el-button class="makeOffer" type="primary" @click="submit('sellValidateForm')">View listing</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  props: {
    sellSuccessData: {
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
      this.$emit("close");
    },
  },
  components: {},
};
</script>

<style lang="less" scoped>
div /deep/ .el-dialog__body {
  padding: 20px 40px;
}
div /deep/ .el-dialog__close {
  font-size: 20px;
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
.nft_data {
  width: 100%;
  height: auto;
  text-align: center;
  line-height: 19px;
    margin-top: 24px;
  img {
    width: 160px;
    height: 160px;
    box-shadow: 0px 2px 30px 0px #e5e5e5;
    border-radius: 8px;
  }
  span {
    margin-top: 24px;
    font-size: 16px;
    font-family: SanFranciscoText-Regular, SanFranciscoText;
    font-weight: 400;
    color: #333333;
    line-height: 16px;
    // display: inline-block;
  }
  .info_color{
    color:#2087EC
  }
  .nft_info{
    margin-top: 20px;
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
div /deep/ .el-dialog__footer {
  padding: 4px 40px 30px;
  .makeOffer {
    height: 48px;
    width: 100%;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
    font-size: 18px;
    font-family: SanFranciscoText-Bold, SanFranciscoText;
    font-weight: bold;
    color: #ffffff;
    line-height: 20px;
  }
}
</style>
