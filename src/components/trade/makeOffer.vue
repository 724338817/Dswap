<template>
  <el-dialog width="500px" :visible.sync="dialogVisible" :before-close="Close" :close-on-click-modal="false">
    <span class="title">Make an offer</span>
    <div class="nft_data">
      <img :src="makeOfferData.imageUrl" />
      <div class="nft_info">
        <p class="bold_Font">{{ makeOfferData.name }}</p>
        <!-- <p>{{ makeOfferData.collectionName }}</p> -->
        <p>{{ makeOfferData.collectionName }} #{{ makeOfferData.tokenId }}</p>
        <span>Owned by </span>
        <!-- <span>{{makeOfferData.contractDeployer.substring(0,20)}}</span> -->
        <span>{{ makeOfferData.owners }}</span>
        <!-- <p class="bold_Font">{{ sureData.price }} {{ unit }}</p> -->
      </div>
    </div>
    <div class="line"></div>
    <el-form :model="sureData" ref="sellValidateForm" :rules="rules">
      <el-form-item prop="price">
        <div class="price">
          <div class="price_title">
            <span>Price</span>
            <span class="price_scaler">Balance: {{ balance }} {{ unit }}</span>
          </div>
          <div class="input">
            <!-- <el-input placeholder="please enter price" v-model="sureData.price">
              <template slot="prepend">{{ unit }}</template>
            </el-input> -->
            <el-select v-model="payment">
              <el-option v-for="item in paymentList" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
            <el-input placeholder="please enter price" v-model="sureData.price"
              oninput="value=value.replace(/[^0-9.]/g,'')" maxlength="18">
            </el-input>
          </div>
        </div>
      </el-form-item>
      <el-form-item>
        <div class="duration">
          <div class="duration_title">
            <span>Duration</span>
          </div>
          <div class="input">
            <el-select v-model="value" @change="modifyTime($event)">
              <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value">
              </el-option>
            </el-select>
            <el-date-picker v-model="sureData.expirationTime" :clearable="false" type="datetime"
              :default-time="new Date()" format="yyyy-MM-dd HH:mm:ss" value-format="timestamp"
              :picker-options="pickerOptions">
            </el-date-picker>
          </div>
        </div>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button class="makeOffer" type="primary" @click="submit('sellValidateForm')">Make offer</el-button>
    </span>
  </el-dialog>
</template>

<script>
import walletUtil from "@/utils/wallet.js";
let BigNumber = require("bignumber.js");
import { timestampToTime } from "@/utils/utils.js";

export default {
  props: {
    makeOfferData: {
      type: Object,
    },
  },
  data() {
    var checkPrice = (rule, value, callback) => {
      const handlePrice = new BigNumber(value * this.wei).toString(10);
      const condition0 = value <= 0;
      const condition1 = this.queryBalance.length > handlePrice.length;
      const condition2 = this.queryBalance.length < handlePrice.length;
      const condition3 =
        Number(this.queryBalance.substr(0, 16)) >
        Number(handlePrice.substr(0, 16)) ||
        (Number(this.queryBalance.substr(0, 16)) ===
          Number(handlePrice.substr(0, 16)) &&
          Number(this.queryBalance.substr(16, this.queryBalance.length - 16)) >
          Number(handlePrice.substr(16, handlePrice.length - 16)));
      const condition4 =
        Number(this.queryBalance.substr(0, 16)) <
        Number(handlePrice.substr(0, 16)) ||
        (Number(this.queryBalance.substr(0, 16)) ===
          Number(handlePrice.substr(0, 16)) &&
          Number(this.queryBalance.substr(16, this.queryBalance.length - 16)) <
          Number(handlePrice.substr(16, handlePrice.length - 16)));
      if (condition0) {
        callback(new Error("(must be greater than 0)"));
      } else if (condition1) {
        callback();
      } else if (condition2) {
        callback(new Error("(Not sufficient funds)"));
      } else if (condition3) {
        callback();
      } else if (condition4) {
        callback(new Error("(Not sufficient funds)"));
      } else {
        callback();
      }
    };
    return {
      dialogVisible: this.makeOfferData.show,
      sureData: {
        price: "",
        expirationTime: new Date().getTime() + 7 * 24 * 60 * 60 * 1000,
      },
      rules: {
        price: [
          { required: true, message: "please enter price", trigger: "blur" },
          {
            pattern:
              /^(([1-9][0-9]*\.[0-9][0-9]*)|([0]\.[0-9][0-9]*)|([1-9][0-9]*))$/,
            message: "Amount must be a number greater than 0",
            trigger: "blur",
          },
          { validator: checkPrice, trigger: ["change", "blur"] },
        ],
      },
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7;
        },
        selectableRange: null,
      },
      queryBalance: "0",
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
  computed: {
    unit() {
      return this.$store.state.erc20Unit;
    },
    paymentList() {
      return this.$store.state.paymentList;
    },
    wei() {
      return 10 ** this.$store.state.decimals;
    },
  },
  watch: {
    "sureData.expirationTime": {
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
            if (this.sureData.expirationTime < new Date().getTime()) {
              this.sureData.expirationTime = new Date().getTime();
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
  async mounted() {
    const queryMakeOfferBalance = await walletUtil.queryMakeOfferBalance();
    this.queryBalance = queryMakeOfferBalance;
    console.log(queryMakeOfferBalance);
    this.balance = new BigNumber(queryMakeOfferBalance / this.wei).toString(10);
    console.log(this.balance);
  },
  methods: {
    Close() {
      this.$emit("close");
    },
    submit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          this.sureSell();
        } else {
          return false;
        }
      });
    },
    sureSell() {
      this.$emit("makeOfferSure", this.sureData);
    },
    modifyTime(val) {
      console.log(val);
      switch (val) {
        case "1":
          this.sureData.expirationTime =
            new Date().getTime() + 12 * 60 * 60 * 1000;
          break;
        case "2":
          this.sureData.expirationTime =
            new Date().getTime() + 24 * 60 * 60 * 1000;
          break;
        case "3":
          this.sureData.expirationTime =
            new Date().getTime() + 3 * 24 * 60 * 60 * 1000;
          break;
        case "4":
          this.sureData.expirationTime =
            new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
          break;
        case "5":
          this.sureData.expirationTime =
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
  width: 100px;
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
      margin-top: 20px;
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

    .price_scaler {
      position: absolute;
      right: 0;
      font-size: 14px;
      color: #666666;
      font-weight: normal;
      font-family: SanFranciscoText-Regular, SanFranciscoText;
    }
  }

  .input {
    margin-top: 16px;
    display: flex;

    .el-date-editor.el-input {
      width: 100%;
    }
  }
}

div /deep/ .el-dialog__footer {
  padding: 20px 40px;

  .makeOffer {
    width: 100%;
  }
}
</style>
