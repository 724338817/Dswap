<template>
  <el-dialog width="500px" :visible.sync="dialogVisible" :before-close="Close" :close-on-click-modal="false">
    <div v-if="ifContinue">
      <span class="title">Sell</span>
      <el-form :model="sellData" ref="sellValidateForm" :rules="rules">
        <el-form-item prop="price">
          <div class="price">
            <div class="price_title">
              <span>Set a price</span>
            </div>
            <div class="input">
              <el-select v-model="payment">
                <el-option v-for="item in paymentList" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
              <el-input placeholder="please enter price" v-model="sellData.price" oninput="value=value.replace(/[^0-9.]/g,'')" maxlength="18">
                <!-- <template slot="prepend">{{ unit }}</template> -->
              </el-input>
            </div>
          </div>
        </el-form-item>
        <el-form-item>
          <div class="duration">
            <div class="duration_title">
              <span>Set duration</span>
            </div>
            <div class="input">
              <!-- <el-date-picker v-model="sellData.expirationTime" type="date" :default-value="new Date()" value-format="timestamp" :picker-options="pickerOptions">
              </el-date-picker> -->
              <el-select v-model="value" @change="modifyTime($event)">
                <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
                </el-option>
              </el-select>
              <el-date-picker v-model="sellData.expirationTime" :clearable="false" type="datetime"
                :default-time="new Date()" format="yyyy-MM-dd HH:mm:ss" value-format="timestamp"
                :picker-options="pickerOptions">
              </el-date-picker>
            </div>
          </div>
        </el-form-item>
      </el-form>
      <div class="summary">
        <div class="summary_title">
          <span>Summary</span>
        </div>
        <div class="summary_fee">
          <span>Listing price</span>
          <span>{{ sellData.price }} {{ unit }}</span>
        </div>
        <div class="summary_fee">
          <span>Service Fee</span>
          <span>2.5%</span>
        </div>
        <div class="summary_fee">
          <span>Creator Fee</span>
          <span>0%</span>
        </div>
      </div>
      <div class="line"></div>
      <!-- <div class="pay">
        <div class="pay_title">
          <span>You pay</span>
        </div>
        <div class="pay_value">
          <span>{{ sellData.price }} {{ unit }}</span>
        </div>
      </div>
      <div class="pay_balance">
        <span>Balance {{ balance }} {{ unit }}</span>
      </div> -->
      <div class="footer">
        <el-button class="makeOffer" type="primary" @click="continueSell('sellValidateForm')">Sell</el-button>
      </div>
    </div>
    <div v-else>
      <span class="title">Approve collection</span>
      <div class="nft_data">
        <img :src="sellPriceData.imageUrl" />
        <div class="nft_info">
          <p>
           {{sellPriceData.collectionName}}  #{{ sellPriceData.tokenId }}
          </p>
        </div>
      </div>
      <div class="line"></div>
      <div class="tip">
        <div class="pay_title">
          <span>Go to your wallet</span>
        </div>
        <div class="pay_value">
          <span>You'll be asked to approve this collection from your wallet. You
            only need to approve each collection once.</span>
        </div>
      </div>
      <div class="footer">
        <el-button class="makeOffer" type="primary" @click="submit('sellValidateForm')">Continue</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import walletUtil from "@/utils/wallet.js";
let BigNumber = require("bignumber.js");

export default {
  props: {
    sellPriceData: {
      type: Object,
    },
  },
  data() {
    return {
      dialogVisible: this.sellPriceData.show,
      sellData: {
        price: "",
        expirationTime: new Date().getTime() + 7 * 24 * 60 * 60 * 1000,
      },
      rules: {
        price: [
          { required: true, message: "please enter price", trigger: "blur" },
          {
            pattern:
              /^(([1-9][0-9]*\.[0-9][0-9]*)|([0]\.[0-9][0-9]*)|([1-9][0-9]*)|([0]{1}))$/,
            message: "Amount must be a number",
            trigger: "blur",
          },
        ],
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now();
        },
      },
      ifContinue: true,
      options: [
        {
          value: "1",
          label: "12 hours",
        },
        {
          value: "2",
          label: "1 day",
        },
        {
          value: "3",
          label: "3 days",
        },
        {
          value: "4",
          label: "7 days",
        },
        {
          value: "5",
          label: "1 mouth",
        },
        {
          value: "6",
          label: "Custom date",
        },
      ],
      value: "4",
      balance: "",
      payment: "1",
    };
  },
  created() { },
  async mounted() {
    const balance = await walletUtil.queryMakeOfferBalance();
    this.balance = new BigNumber(balance / this.wei).toString(
      10
    );
  },
  computed: {
    unit() {
      return this.$store.state.erc20Unit;
    },
    paymentList() {
      return this.$store.state.paymentList;
    },
    wei() {
      return 10 ** this.$store.state.decimals;
    }
  },
  watch: {
    "sellData.expirationTime": {
      handler(newValue, oldValue) {
        if (newValue) {
          let dateTime = ""; //如果安装了moment.js,可以使用moment直接获取当前年月日时分秒
          const yy = new Date().getFullYear();
          const mm = new Date().getMonth() + 1;
          const dd =
            new Date().getDate() < 10
              ? "0" + new Date().getDate()
              : new Date().getDate();
          const hh = new Date().getHours();
          const mz = mm < 10 ? "0" + mm : mm;
          const mf =
            new Date().getMinutes() < 10
              ? "0" + new Date().getMinutes()
              : new Date().getMinutes();
          const ss =
            new Date().getSeconds() < 10
              ? "0" + new Date().getSeconds()
              : new Date().getSeconds();
          dateTime = yy + "-" + mz + "-" + dd + " " + hh + ":" + mf + ":" + ss;
          console.log(dateTime, "dateTime");
          console.log(newValue, "newValue");
          const dt = dateTime.split(" ");
          let st = "";
          console.log(timestampToTime(newValue), "newValue");

          if (timestampToTime(newValue).split(" ")[0] === dt[0]) {
            // 如果点击的是今天的日期,可选择的时间开始为 00：00:00 至 此刻的时分秒
            if (this.sellData.expirationTime < new Date().getTime()) {
              this.sellData.expirationTime = new Date().getTime();
            }
            st = dt[1];
          } else {
            // 点击今天之前的日期的话，时间选择为：00:00:00- 23:59:59
            st = "00:00:00";
          }
          console.log("st", st);
          this.pickerOptions.selectableRange = st + "- 23:59:59";
          console.log(this.pickerOptions.selectableRange, "startTimeRange");
          // 例如：如果今天此刻时间为10:41:40 则选择时间范围为：00:00:00 - 10:41:40
          // 否则为：00:00:00- 23:59:59
        }
      },
    },
  },
  methods: {
    Close() {
      this.$emit("close");
    },
    continueSell(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.ifContinue = false;
        } else {
          return false;
        }
      });
    },
    submit() {
      this.sureSell();
    },
    sureSell() {
      this.$emit("success", this.sellData);
    },
    modifyTime(val) {
      console.log(val);
      switch (val) {
        case "1":
          this.sellData.expirationTime =
            new Date().getTime() + 12 * 60 * 60 * 1000;
          break;
        case "2":
          this.sellData.expirationTime =
            new Date().getTime() + 24 * 60 * 60 * 1000;
          break;
        case "3":
          this.sellData.expirationTime =
            new Date().getTime() + 3 * 24 * 60 * 60 * 1000;
          break;
        case "4":
          this.sellData.expirationTime =
            new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
          break;
        case "5":
          this.sellData.expirationTime =
            new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
          break;
        case "6":
          break;
      }
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
  width: 102px;
}

div /deep/ .el-form-item {
  margin: 0;
}

div /deep/ .el-select .el-input--suffix .el-input__inner {
  border-right: none;
  border-radius: 4px 0 0 4px;
}

div /deep/.el-date-editor .el-input__inner {
  // border-left: none;
  border-radius: 0 4px 4px 0;
}

div /deep/.el-input .el-input__inner {
  // border-left: none;
  border-radius: 0 4px 4px 0;
}

.footer {
  padding: 30px 0 10px 0;

  /deep/ .makeOffer {
    width: 100%;
    font-size: 18px;
    font-family: SanFranciscoText-Bold, SanFranciscoText;
    font-weight: bold;
    color: #ffffff;
    line-height: 20px;
  }
}

.title {
  font-size: 20px;
  font-family: SanFranciscoText-Bold, SanFranciscoText;
  font-weight: bold;
  color: #333333;
  line-height: 24px;
}

.line {
  width: 100%;
  height: 2px;
  background-color: #ebedf0;
  margin-top: 24px;
}

.price,
.duration {
  margin-top: 25px;

  .price_title,
  .duration_title {
    position: relative;
    font-size: 16px;
    font-family: SanFranciscoText-Bold, SanFranciscoText;
    font-weight: bold;
    color: #333333;
  }

  .input {
    margin-top: 16px;
    display: flex;

    .el-date-editor.el-input {
      width: 100%;
    }
  }
}

.summary {
  width: 100%;
  padding: 24px 0 16px 0;

  .summary_title {
    font-size: 16px;
    font-family: SanFranciscoText-Bold, SanFranciscoText;
    font-weight: bold;
    color: #333333;
    line-height: 16px;
    padding-bottom: 5px;
  }

  .summary_fee {
    padding-top: 12px;
    width: 100%;
    font-size: 14px;
    font-family: Helvetica;
    color: #333333;
    line-height: 17px;
    display: flex;
    justify-content: space-between;
  }
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
    font-size: 16px;
    font-family: Helvetica-Bold, Helvetica;
    font-weight: bold;
    color: #333333;
    line-height: 90px;
  }
}

.tip {
  width: 100%;
  padding-top: 10px;
  // display: flex;
  // justify-content: space-between;
  font-size: 18px;
  font-family: SanFranciscoText-Bold, SanFranciscoText;
  font-weight: bold;
  color: #333333;
  line-height: 18px;

  .pay_value {
    font-size: 14px;
    font-weight: 400;
    color: #666666;
    line-height: 18px;
    margin-top: 6px;
  }
}
</style>
