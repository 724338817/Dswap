<template>
  <el-dialog width="500px" :visible.sync="dialogVisible" :before-close="Close" :close-on-click-modal="false">
    <span class="title">Accept</span>
    <div class="nft_data">
      <img :src="acceptPriceData.imageUrl" />
      <div class="nft_info">
        <p class="bold_Font">{{ acceptPriceData.name }}</p>
        <!-- <p>{{ acceptPriceData.collectionName }}</p> -->
        <p>{{ acceptPriceData.collectionName }} #{{ acceptPriceData.tokenId }}</p>
        <span>Owned by </span>
        <!-- <span>{{acceptPriceData.contractDeployer.substring(0,20)}}</span> -->
        <span>{{ acceptPriceData.owners }}</span>
        <p class="bold_Font">{{ price }} {{ unit }}</p>
      </div>
    </div>
    <div class="line"></div>
    <div class="pay">
      <div class="pay_title">
        <span>You get</span>
      </div>
      <div class="pay_value">
        <span>{{ price }} {{ unit }}</span>
      </div>
    </div>
    <!-- <div class="pay_balance">
      <span>Balance {{ balance }} {{ unit }}</span>
    </div> -->
    <span slot="footer" class="dialog-footer">
      <el-button class="makeOffer" type="primary" @click="submit('sellValidateForm')">Accept</el-button>
    </span>
  </el-dialog>
</template>

<script>
let BigNumber = require("bignumber.js");

export default {
  props: {
    acceptPriceData: {
      type: Object,
    },
  },
  data() {
    return {
      dialogVisible: this.acceptPriceData.show,
      buyAllow: false,
      price: "",
      orderId: "",
    };
  },
  created() { },
  async mounted() {
    this.price = new BigNumber(this.acceptPriceData.price / this.wei).toString(
      10
    );
  },
  computed: {
    unit() {
      return this.$store.state.erc20Unit;
    },
    wei() {
      return 10 ** this.$store.state.decimals;
    },
  },
  methods: {
    Close() {
      this.$emit("close");
    },
    submit(formName) {
      this.$emit("acceptSure", this.acceptPriceData.orderId);
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
  margin-top: 20px;
  height: auto;
  display: flex;

  img {
    width: 100px;
    height: 100px;
  }

  .nft_info {
    margin-left: 16px;
    font-size: 14px;
    font-family: Helvetica;
    color: #999999;

    .bold_Font {
      font-size: 16px;
      font-family: Helvetica-Bold, Helvetica;
      font-weight: bold;
      color: #333333;
      line-height: 16px;
    }

    .bold_Font:nth-of-type(1) {
      margin-bottom: 10px;
    }

    .bold_Font:last-child {
      margin-top: 5px;
    }

    p:nth-of-type(2) {
      padding-bottom: 6px;
    }
  }
}

.line {
  width: 100%;
  height: 2px;
  background-color: #ebedf0;
  margin-top: 24px;
}

.pay {
  width: 100%;
  padding-top: 10px;
  display: flex;
  justify-content: space-between;
  font-size: 18px;
  font-family: SanFranciscoText-Bold, SanFranciscoText;
  font-weight: bold;
  color: #333333;
  line-height: 18px;
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
