<template>
  <el-dialog width="500px" :visible.sync="dialogVisible" :before-close="Close" :close-on-click-modal="false">
    <span class="title">Transfer</span>
    <div class="nft_data">
      <img :src="transferData.imageUrl" />
    </div>
    <div class="Addrs">Addess</div>
    <div class="toAddr">
      <el-form :model="transferAddr" ref="sellValidateForm" :rules="rules">
        <el-form-item prop="toAddress">
          <el-input class="addr" v-model="transferAddr.toAddress" @change="verifyAddr('sellValidateForm')"
            placeholder="e.g. 0xled3... or destination.eth, destination.lens"></el-input>
        </el-form-item>
      </el-form>
    </div>
    <div class="tip">1 item will be transferred to {{addr}}</div>
    <span slot="footer" class="dialog-footer">
      <!-- <el-button class="list" type="" @click="submit('sellValidateForm')">List for sale</el-button> -->
      <el-button class="makeOffer" type="primary" @click="submit('sellValidateForm')">Transfer</el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  props: {
    transferData: {
      type: Object,
    },
  },
  data() {
    return {
      dialogVisible: true,
      transferAddr: {
        toAddress: "",
      },
      addr:'...',
      rules: {
        toAddress: [
          { required: true, message: "Please fill in the address", trigger: "blur" },
          {
            pattern:
              /^0x[0-9a-fA-F]{40}$/,
            message: "Incorrect address format",
            trigger: "blur",
          },
        ],
      },
    };
  },
  computed: {},
  created() { },
  mounted() { },
  methods: {
    Close() {
      this.$emit("close");
    },
    submit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.$emit("success", this.transferAddr.toAddress);
        } else {
          return false;
        }
      });
    },
    verifyAddr(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.addr = this.transferAddr.toAddress
        } else {
          return false;
        }
      });
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
  text-align: center;

  img {
    width: 160px;
    height: 160px;
    box-shadow: 0px 2px 30px 0px #e5e5e5;
    border-radius: 8px;
  }
}

.Addrs {
  font-size: 20px;
  font-family: SanFranciscoText-Bold, SanFranciscoText;
  font-weight: bold;
  color: #333333;
  line-height: 24px;
  margin-top: 20px;
}

.toAddr {
  width: 100%;
  padding: 20px 0 10px 0;
  // display: flex;
  // justify-content: space-between;
  font-size: 18px;
  font-family: SanFranciscoText-Bold, SanFranciscoText;
  font-weight: bold;
  color: #333333;
  line-height: 18px;
  // text-align: center;

  /deep/ .el-input__inner {
    height: 48px;
    border-radius: 6px;
    border: 2px solid #e0e0e0;
    // margin-left: 12px;
  }
}

.tip {
  text-align: center;
  margin: 10px 0 0 0;
  font-size: 14px;
  font-family: SanFranciscoText-Regular, SanFranciscoText;
  font-weight: 400;
  color: #666666;
  line-height: 16px;
  height: 36px;
}

div /deep/ .el-dialog__footer {
  padding: 20px 40px 30px;
  text-align: center;

  .makeOffer {
    width: 100%;
    height: 48px;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
    font-size: 18px;
    font-family: SanFranciscoText-Bold, SanFranciscoText;
    font-weight: bold;
    color: #ffffff;
    line-height: 20px;
  }

  .list {
    width: 203px;
    height: 48px;
    border-radius: 6px;
    border: 1px solid #e0e0e0;
    font-size: 18px;
    font-family: SanFranciscoText-Bold, SanFranciscoText;
    font-weight: bold;
    color: #2087ec;
    line-height: 20px;
  }
}
</style>
