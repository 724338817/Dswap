<template>
  <div class="index-container">
    <div class="Exchange-content">
      <div class="Exchange-left">
        <div class="ExchangeChart tv">
          <div class="ExchangeChart-header">
            <div class="ExchangeChart-info">
              <div class="ExchangeChart-top-inner">
                <div class="Synths-ChartTokenSelector">
                  <div id="headlessui-popover-button-215">
                    <button class="chart-token-selector">
                      <span class="chart-token-selector--current inline-items-center"
                        ><img class="Token-icon chart-token-current-icon" src="~Assets/images/icon_test.svg" alt="ARB" width="20" /> YD / TP</span
                      >
                    </button>
                  </div>
                  <div class="chart-token-menu"></div>
                </div>
                <div class="Chart-min-max-price">
                  <div class="ExchangeChart-main-price">$10</div>
                  <div class="ExchangeChart-info-label">$10</div>
                </div>
                <div class="Chart-24h-change">
                  <div class="ExchangeChart-info-label">24h Change</div>
                  <div class="positive">+0%</div>
                </div>
                <div class="ExchangeChart-additional-info">
                  <div class="ExchangeChart-info-label">24h High</div>
                  <div>10</div>
                </div>
                <div class="ExchangeChart-additional-info Chart-24h-low">
                  <div class="ExchangeChart-info-label">24h Low</div>
                  <div>10</div>
                </div>
              </div>
            </div>
            <div class="ExchangeChart-info VersionSwitch-wrapper">
              <div class="VersionSwitch">
                <!-- <div class="VersionSwitch-option v1">V1</div>
                <div class="VersionSwitch-option v2 active">V2</div> -->
              </div>
            </div>
          </div>
          <div class="ExchangeChart-bottom App-box App-box-border"></div>
        </div>
        <div class="Exchange-lists">
          <div class="Exchange-list-tab-container">Orders</div>
          <div class="Exchange-list Orders">
            <el-table style="width: 100%" empty-text="No open orders">
              <el-table-column prop="Type" label="Type" width=""> </el-table-column>
              <el-table-column prop="Order" label="Order" width=""> </el-table-column>
              <el-table-column prop="Price" label="Trigger Price"> </el-table-column>
              <el-table-column prop="Mark" label="Mark Price"> </el-table-column>
            </el-table>
          </div>
        </div>
      </div>
      <div class="Exchange-right">
        <div class="Exchange-swap-box">
          <div>
            <div class="App-box SwapBox">
              <div class="Tab block SwapBox-option-tabs">
                <!-- <div class="Tab-option muted"><img class="Tab-option-icon" src="~Assets/images/long.svg" alt="" />Long</div>
                <div class="Tab-option muted"><img class="Tab-option-icon" src="~Assets/images/short.svg" alt="" />Short</div> -->
                <!-- <div class="Tab-option muted active"><img class="Tab-option-icon" src="~Assets/images/swap.svg" alt="" />Swap</div> -->
              </div>
              <div class="Tab inline SwapBox-asset-options-tabs">
                <div :class="PriceMarket ? 'active Tab-option muted' : 'Tab-option muted'" @click="changeType">Market</div>
                <div :class="PriceMarket ? 'Tab-option muted' : 'active Tab-option muted'" @click="changeType">Limit</div>
              </div>
              <form>
                <div>
                  <div class="Exchange-swap-section buy-input">
                    <div class="buy-input-top-row">
                      <div data-label="left" class="text-gray">Pay</div>
                      <div data-label="right" class="align-right clickable"><span class="text-gray">Balance</span> {{ balance }}</div>
                    </div>
                    <div class="Exchange-swap-section-bottom">
                      <div class="Exchange-swap-input-container">
                        <el-input maxlength="15" type="text" @input="payPriceChange($event)" v-model="pay.price" placeholder="0.0" />
                      </div>
                      <div class="PositionEditor-token-symbol">
                        <div class="TokenSelector GlpSwap-from-token">
                          <div class="TokenSelector-box">
                            <span class="inline-items-center"
                              ><img class="Token-icon mr-xs" src="/static/media/ic_btc_24.f992927ad6d778bc91c8.svg" alt="" width="20" /><span class="Token-symbol-text">{{
                                pay.tokenName
                              }}</span></span
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="Exchange-swap-ball-container" @click="togglePayReceive">
                  <button type="button" class="Exchange-swap-ball">
                    <svg
                      stroke="currentColor"
                      fill="currentColor"
                      stroke-width="0"
                      viewBox="0 0 512 512"
                      class="Exchange-swap-ball-icon"
                      height="1em"
                      width="1em"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M131.3 231.1L32 330.6l99.3 99.4v-74.6h174.5v-49.7H131.3v-74.6zM480 181.4L380.7 82v74.6H206.2v49.7h174.5v74.6l99.3-99.5z"></path>
                    </svg>
                  </button>
                </div>
                <div>
                  <div class="Exchange-swap-section buy-input">
                    <div class="buy-input-top-row">
                      <div data-label="left" class="text-gray">Receive</div>
                      <!-- <div data-label="right" class="align-right"><span class="text-gray">Balance</span></div> -->
                    </div>
                    <div class="Exchange-swap-section-bottom">
                      <div class="Exchange-swap-input-container">
                        <el-input maxlength="15" type="text" @input="receivePriceChange" v-model="receive.price" placeholder="0.0" />
                      </div>
                      <div class="PositionEditor-token-symbol">
                        <div class="TokenSelector GlpSwap-from-token">
                          <div class="TokenSelector-box">
                            <span class="inline-items-center"
                              ><img class="Token-icon mr-xs" src="/static/media/ic_arb_24.f5365366c5358175f91b.svg" alt="" width="20" /><span class="Token-symbol-text">{{
                                receive.tokenName
                              }}</span></span
                            >
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="!PriceMarket" class="Exchange-swap-section buy-input">
                  <div class="buy-input-top-row">
                    <div data-label="left" class="text-gray">price</div>
                    <!-- <div data-label="right" class="align-right"><span class="text-gray">mark</span></div> -->
                  </div>
                  <div class="Exchange-swap-section-bottom">
                    <div class="Exchange-swap-input-container">
                      <el-input maxlength="15" type="text" @input="markChange" placeholder="0.0" v-model="mark.price" />
                    </div>
                    <div class="PositionEditor-token-symbol">
                      <div class="TokenSelector GlpSwap-from-token">
                        <div class="TokenSelector-box">
                          <span class="inline-items-center"
                            ><img class="Token-icon mr-xs" src="/static/media/ic_arb_24.f5365366c5358175f91b.svg" alt="" width="20" /><span class="Token-symbol-text"
                              >YD per TP</span
                            ></span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
              <div class="SwapBox-info-section"><div class="App-card-divider"></div></div>
              <div v-if="!walletAccount" class="Exchange-swap-button-container" @click="walletConnect">
                <button class="button primary-action w-full center">Connect Wallet</button>
              </div>
              <div v-else class="Exchange-swap-button-container">
                <el-button class="primary-action-trade" :disabled="btnDisable || enableOperate" @click="trade">{{ buttonText }}</el-button>
              </div>
            </div>
          </div>
          <div class="Exchange-swap-market-box App-box App-box-border">
            <div class="App-card-title">Swap</div>
            <div class="App-card-divider"></div>
            <div>
              <div class="Exchange-info-row">
                <div class="Exchange-info-label">{{ pay.tokenName }} Price</div>
                <div class="align-right">${{ pay.tokenPrice }}</div>
              </div>
              <div class="Exchange-info-row">
                <div class="Exchange-info-label">{{ receive.tokenName }} Price</div>
                <div class="align-right">${{ receive.tokenPrice }}</div>
              </div>
              <div class="Exchange-info-row">
                <div class="Exchange-info-label">Available Liquidity</div>
                <div class="align-right">
                  <span class="Tooltip"><span class="Tooltip-handle"></span></span>
                </div>
              </div>
              <div class="Exchange-info-row">
                <div class="Exchange-info-label">Price</div>
                <div class="align-right">{{ tradingPairPrice }} YD / TP</div>
              </div>
            </div>
          </div>
          <div class="Exchange-swap-info-group"></div>
          <div class="Confirmation-box"></div>
        </div>
      </div>
    </div>
    <connect-wallet v-if="connectWalletShow" @close="connectWalletClose($event)"></connect-wallet>
  </div>
</template>
<script>
import { tableHeightHandle } from 'Mixin/tableHeightHandle.js'
import BigNumber from 'bignumber.js'
import ConnectWallet from '@/components/connectWallet.vue'
import { tradeManageServer } from 'Api'
import wallet from '@/utils/wallet'
import { mapState } from 'vuex'

export default {
  name: 'groupManage',
  mixins: [tableHeightHandle],
  props: {},
  components: { ConnectWallet },
  data() {
    return {
      wallet,
      PriceMarket: true,
      pay: {
        token: '0x33aEab2f5e88669Ae21376322FBd62EC3F085013',
        tokenName: 'TP',
        tokenPrice: '10',
        price: ''
      },
      receive: {
        token: '0x0f6CCb89b189C510A23490623173437cb71dD17e',
        tokenName: 'YD',
        tokenPrice: '1',
        price: ''
      },
      mark: {
        price: ''
      },
      tradingPair: 'TP / YD',
      tradingPairPrice: '',
      connectWalletShow: false,
      buttonText: 'Enter an amount',
      btnDisable: true,
      payToken: true,
      balance: '',
      validSellOrder: [],
      validBuyOrder: []
    }
  },
  watch: {
    '$store.state.walletAddress': {
      handler(newVal, oldVal) {
        if (newVal) {
          this.queryBalance()
        }
      }
    },
    'pay.price'(newVal) {
      if (newVal && Number(newVal) !== 0) {
        ;(this.buttonText = 'Swap'), (this.btnDisable = false)
      } else {
        ;(this.buttonText = 'Enter an amount'), (this.btnDisable = true)
      }
    },
    'wallet.chainId'(newVal) {
      if (newVal === 80001) {
        this.queryBalance()
      }
    },
    'wallet.account': {
      handler(newVal, oldVal) {
        if (newVal) {
          this.updateOrderData()
        }
      },
      immediate: true
    },
    payToken: {
      handler(newVal, oldVal) {
        wallet.initPayToken(this.pay.token, this.receive.token)
        wallet.getDecimals(this.pay.token)
        this.queryBalance()
        if (newVal) {
          this.queryCurrentPricePay()
        } else {
          this.queryCurrentPriceReceive()
        }
      }
      // immediate: true
    }
  },
  computed: {
    ...mapState(['walletAddress', 'autoConnect']),
    walletAccount() {
      return this.walletAddress
    },
    enableOperate() {
      return this.$store.state.chainId !== wallet.chainId
    }
  },
  created() {
    // 初始化pay_token
    wallet.initPayToken(this.pay.token, this.receive.token)
  },
  mounted() {
    if (this.autoConnect) {
      this.connectWallet()
    }
    this.queryCurrentPriceReceive()
  },
  methods: {
    async queryCurrentPricePay() {
      const res = await tradeManageServer.getCurrentPriceSell({ tradingPair: 'TP/YD' })
      if (res && res.errcode === 0) {
        this.tradingPairPrice = res.data || 10
      }
    },
    async queryCurrentPriceReceive() {
      const res = await tradeManageServer.getCurrentPriceBuy({ tradingPair: 'TP/YD' })
      if (res && res.errcode === 0) {
        this.tradingPairPrice = res.data || 10
      }
    },
    connectWalletClose() {
      this.connectWalletShow = false
    },
    async connectWallet() {
      await wallet.doWalletConnect(true)
      wallet.initPayToken(this.pay.token, this.receive.token)
      wallet.getDecimals(this.pay.token)
      this.queryBalance()
    },
    async queryBalance() {
      console.log(this.walletAddress)
      if (this.walletAddress) this.balance = await wallet.queryUserBalance(this.walletAddress)
    },
    async getValidSellOrderData() {
      const res = await tradeManageServer.getValidSellOrder({ account: this.$store.state.walletAddress })
      if (res && res.errcode === 0) {
        this.validSellOrder = res.data || 10
      }
    },
    async getValidBuyOrderData() {
      const res = await tradeManageServer.getValidBuyOrder({ account: this.$store.state.walletAddress })
      if (res && res.errcode === 0) {
        this.validBuyOrder = res.data || 10
      }
    },
    walletConnect() {
      this.connectWalletShow = true
    },
    jumpPage(item) {
      const { chainId } = item
      this.$router.push({ path: 'chain', query: { chainId } })
    },
    async getTopList() {
      const res = await chainManageServer.getTopList()
      if (res && res.code === 0) {
        const { data = [] } = res
        this.topList = [...data]
      }
    },
    changeType() {
      this.PriceMarket = !this.PriceMarket
    },
    togglePayReceive() {
      ;[this.receive, this.pay] = [this.pay, this.receive]
      this.payToken = !this.payToken
    },
    async payPriceChange() {
      await this.formatAmount('pay')
      this.payToken ? (this.receive.price = this.pay.price * this.tradingPairPrice) : (this.receive.price = this.pay.price / this.tradingPairPrice)
    },
    formatAmount(variable) {
      console.log(variable)
      this[variable].price = this[variable].price.replace(/,/g, '.')
      if (this[variable].price === '.') {
        this[variable].price = '0.'
      }
      this[variable].price = this[variable].price.replace(/[^\d.]/g, '') // 清除“数字”和“.”以外的字符
      this[variable].price = this[variable].price.replace(/^\./g, '') // 验证第一个字符是数字而不是.
      this[variable].price = this[variable].price.replace(/\.{2,}/g, '.') // 只保留第一个. 清除多余的
      this[variable].price = this[variable].price.replace('.', '$#$').replace(/\./g, '').replace('$#$', '.')
    },
    receivePriceChange() {
      this.formatAmount('receive')
      this.payToken ? (this.pay.price = this.receive.price / this.tradingPairPrice) : (this.pay.price = this.receive.price * this.tradingPairPrice)
    },
    markChange() {
      this.formatAmount('mark')
    },
    async trade() {
      if (this.PriceMarket && this.payToken) {
        // 市价卖出TP
        const sellOrderData = {
          account: this.walletAccount,
          ...this.pay
        }
        const sellOrderFlowData = await wallet.sellOrderMarketFlow(sellOrderData)
        console.log(sellOrderFlowData)
        const res = await tradeManageServer.sellOrderMarket(sellOrderFlowData)
        if (res && res.errcode === 0) {
          this.$message({
            message: 'marketSell Success',
            type: 'success',
            time: 5000,
            explorerShow: false
          })
          this.updateOrderData()
        }
      } else if (!this.PriceMarket && this.payToken) {
        // 限价卖出TP
        const sellOrderData = {
          account: this.walletAccount,
          ...this.pay,
          ...this.price
        }
        console.log(sellOrderData)
        const sellOrderFlowData = await wallet.sellOrderLimitFlow(sellOrderData)
        console.log({ ...sellOrderFlowData, price: this.mark.price })
        const res = await tradeManageServer.sellOrderLimit({ ...sellOrderFlowData, price: Number(this.mark.price) || this.tradingPairPrice })
        if (res && res.errcode === 0) {
          this.$message({
            message: 'limitSell Success',
            type: 'success'
          })
          this.updateOrderData()
        }
      } else if (this.PriceMarket && !this.payToken) {
        // 市价购买TP
        const buyOrderData = {
          account: this.walletAccount,
          ...this.pay
        }
        console.log(1)
        const buyOrderFlowData = await wallet.buyOrderMarketFlow(buyOrderData)
        console.log(buyOrderFlowData)
        const res = await tradeManageServer.buyOrderMarket(buyOrderFlowData)
        if (res && res.errcode === 0) {
          this.$message({
            message: 'marketBuy Success',
            type: 'success'
          })
          this.updateOrderData()
        }
      } else {
        // 限价购买TP
        const buyOrderData = {
          account: this.walletAccount,
          ...this.pay,
          ...this.price
        }
        const buyOrderFlowData = await wallet.buyOrderLimitFlow(buyOrderData)
        console.log(buyOrderFlowData)
        const res = await tradeManageServer.buyOrderLimit({ ...buyOrderFlowData, price: Number(this.mark.price) || this.tradingPairPrice })
        if (res && res.errcode === 0) {
          this.$message({
            message: 'limitBuy Success',
            type: 'success',
            time: 5000,
            explorerShow: false
          })
          this.updateOrderData()
        }
      }
    },
    updateOrderData() {
      this.getValidSellOrderData()
      this.getValidBuyOrderData()
    }
  },
  beforeDestroy() {
    this.timer && clearInterval(this.timer)
  }
}
</script>
<style lang="less" scoped>
.index-container {
  display: flex;
  flex-direction: column;
  min-height: calc(100vh - 122px);
  // padding-bottom: 245px;
  padding-top: 45px;
  justify-content: space-between;
  margin: auto;
  max-width: 1550px;
  .Exchange-content {
    grid-gap: 15px;
    display: grid;
    grid-template-columns: 1fr auto;
    margin-top: -15px;
    padding: 0 30px 30px;
    .ExchangeChart {
      position: relative;
      height: 500px;
      .ExchangeChart-header {
        grid-column-gap: 10px;
        display: grid;
        grid-template-columns: auto 116.32px;
        .ExchangeChart-info {
          align-items: center;
          background: var(--dark-blue-bg);
          border-radius: 0.4rem;
          display: flex;
          font-size: var(--font-base);
          height: 68px;
          padding: 0.9rem 0.31rem;
          .ExchangeChart-top-inner {
            grid-column-gap: 46.5px;
            align-items: center;
            display: grid;
            grid-template-columns: auto auto auto auto auto;
            padding-left: 9px;
            .chart-token-selector {
              align-items: center;
              background: #0000;
              border: none;
              border-radius: var(--border-radius-sm);
              color: #fff;
              display: inline-flex;
              font-size: 2rem;
              padding: 0.5rem;
            }
            .ExchangeChart-main-price {
              font-size: 1.7rem;
            }

            .ExchangeChart-info-label {
              font-size: 1.25rem;
              opacity: 0.7;
            }
            .positive {
              color: var(--green);
            }
          }
        }
        .VersionSwitch-wrapper {
          padding: 15px;
          .VersionSwitch {
            background: linear-gradient(90deg, #1e223de6, #262b47e6);
            border-radius: 3px;
            display: inline-flex;
            .VersionSwitch-option {
              color: var(--text-gray);
              cursor: pointer;
              font-size: var(--font-sm);
              line-height: 1;
              padding: 1.2rem;
              text-decoration: none;
            }
            .v1 {
              border-bottom-left-radius: 3px;
              border-top-left-radius: 3px;
            }
            .v2 {
              border-bottom-right-radius: 3px;
              border-top-right-radius: 3px;
            }
            .active {
              background: var(--primary-btn-bg);
              color: #fff;
            }
          }
        }
        .Synths-ChartTokenSelector .chart-token-selector--current {
          color: #fff;
          font-weight: 700;
          margin-right: 10px;
          vertical-align: bottom;
        }
        .inline-items-center {
          align-items: center;
          display: inline-flex;
        }
        .Synths-ChartTokenSelector .chart-token-selector--current .chart-token-current-icon {
          margin-right: 7.5px;
        }
        .Token-icon {
          vertical-align: bottom;
        }
      }
      .ExchangeChart-bottom {
        bottom: 0;
        left: 0;
        position: absolute;
        right: 0;
        top: 82px;
        z-index: 1;
        background: var(--dark-blue-bg);
        border-radius: 0.4rem;
      }
    }
    .Exchange-lists {
      margin-top: 10px;
      font-size: 16px;
      .Exchange-list {
        margin-top: 10px;
        /deep/ .el-table th.el-table__cell {
          background-color: #16182e;
        }
        /deep/ .el-table__body-wrapper {
          background-color: #16182e;
        }
        /deep/ .el-table::before {
          height: 0;
        }
        /deep/ .el-table th.el-table__cell.is-leaf {
          border-bottom: 1px solid #2b2b2d;
        }
      }
    }
    .Exchange-right {
      display: grid;
      grid-template-rows: auto 1fr;
      .Exchange-swap-box {
        width: 418px;
        display: grid;
        position: relative;
        .App-box {
          background: #16182e;
          border-radius: 0.4rem;
          font-size: var(--font-base);
          position: relative;
          .Tab {
            margin-bottom: 1.05rem;
          }
          .block {
            background: linear-gradient(90deg, #1e223de6, #262b47e6);
            border-radius: 3px;
            box-shadow: inset 0 0 30px 5px #ffffff03;
            color: #ffffffb3;
            display: grid;
            font-size: var(--font-sm);
            grid-auto-flow: column;
            overflow: hidden;
            margin-bottom: 1.05rem;
            .Tab-option {
              cursor: pointer;
              padding: 1.05rem;
              text-align: center;
              .Tab-option-icon {
                margin-right: 0.8rem;
                margin-top: -0.155rem;
                transform: scale(0.75);
                vertical-align: middle;
                opacity: 0.7;
              }
            }
            .Tab-option:hover {
              background: #3a3f798f;
              color: #fff;
            }
            .active {
              background: var(--primary-btn-bg);
              color: #fff;
              opacity: 1;
              pointer-events: none;
            }
          }
          .inline {
            overflow-x: scroll;
            white-space: nowrap;
            margin: 1.5rem 0;
            .Tab-option {
              cursor: pointer;
              display: inline-block;
              font-size: var(--font-base);
              margin-right: 1.5rem;
              opacity: 0.7;
            }
            .active {
              opacity: 1;
              pointer-events: none;
            }
          }
          .Exchange-swap-section {
            background: linear-gradient(90deg, #1e223de6, #262b47e6);
            border-radius: 0.3rem;
            margin-bottom: 1.05rem;
            outline: 0.05rem solid #0000;
            outline-offset: -0.1rem;
            padding: 1.5rem;
          }
          .buy-input {
            .Exchange-swap-section-bottom {
              display: grid;
              grid-template-columns: 1fr auto;
              padding-bottom: 0.31rem;
              .Exchange-swap-input {
                font-size: var(--font-lg);
                max-width: 100%;
                padding: 0 2rem 0 0;
                width: 100%;
                background: none;
                border: none;
                color: #fff;
                font-size: 2rem;
                outline: none;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              .PositionEditor-token-symbol {
                font-size: 2.1rem;
                text-align: right;
                .TokenSelector-box {
                  align-items: center;
                  border-radius: 0.4rem;
                  color: #fff;
                  display: flex;
                  font-size: 2.1rem;
                  justify-content: flex-end;
                  line-height: 2.5rem;
                  min-width: 4.65rem;
                }
              }
            }
            .buy-input-top-row {
              display: inline-flex;
              justify-content: space-between;
              font-size: 1.4rem;
              .text-gray {
                color: #ffffffb3;
                color: var(--text-gray);
              }
            }
            .InputSection-static-input {
              font-size: var(--font-lg);
            }

            &.Exchange-swap-section {
              min-height: 9.2rem;
              display: flex;
              flex-direction: column;
              justify-content: space-between;

              .TokenSelector-box {
                display: flex;
                align-items: center;
                border-radius: 0.4rem;
                color: #ffffff;
                min-width: 4.65rem;
                font-size: 2.1rem;
                line-height: 2.5rem;
                justify-content: flex-end;

                &:hover {
                  color: #7885ff;
                }

                &-symbol {
                  margin-left: 0.8rem;
                }
              }

              .Exchange-swap-input-container {
                display: flex;
                align-items: center;
                justify-content: space-between;
                /deep/.el-input__inner {
                  border: none;
                  background-color: inherit;
                  padding: 0;
                  color: #fff;
                  font-size: 25px;
                }
              }

              .Exchange-swap-max {
                position: unset;
                color: white;
                font-size: var(--font-sm);
              }

              .TokenSelector-caret {
                margin: 0;
                margin-right: -0.5rem;
              }

              .PositionEditor-token-symbol {
                display: flex;
                align-items: center;
                margin-left: 1rem;
              }

              &-top {
                padding-bottom: 0;
              }

              .selected-token {
                display: flex;
                align-items: center;
              }
            }
          }
          .Exchange-swap-ball-container {
            position: relative;
            z-index: 1;
            .Exchange-swap-ball {
              position: absolute;
              width: 3.5rem;
              height: 3.5rem;
              left: 50%;
              margin-left: -1.7825rem;
              top: -2rem;
              border-radius: 3.1rem;
              cursor: pointer;
              user-select: none;
              background: var(--primary-btn-bg);
              display: flex;
              justify-content: center;
              align-items: center;
              border: none;
              color: white;
              .Exchange-swap-ball-icon {
                display: block;
                font-size: 2rem;
                opacity: 0.8;
                text-align: center;
                transform: rotate(90deg);
              }
            }
          }
          .Exchange-swap-ball-container:hover {
            opacity: 0.9;
            .Exchange-swap-ball {
              opacity: 1;
            }
          }
          .SwapBox-info-section {
            margin-bottom: 1.1rem;
            .App-card-divider {
              background: #23263b;
              height: 1px;
              margin: 1.05rem -1.5rem;
            }
          }
          .Exchange-swap-button-container {
            padding-top: 0.31rem;
            .primary-action {
              background: var(--primary-btn-bg);
              border-radius: 0.3rem;
              color: #fff;
              line-height: 1;
              padding: 1.65rem 1.6rem;
              width: 100%;
              justify-content: center;
              text-align: center;
              align-items: center;
              border: none;
              cursor: pointer;
              display: inline-flex;
              font-size: var(--font-sm);
              font-weight: 400;
              text-decoration: none;

              &:not([disabled]):hover {
                background: var(--primary-btn-hover);
                box-shadow: 0 0 0.4rem 0.5rem rgb(45 66 252 / 10%);
              }

              &:not([disabled]):active {
                background-color: var(--primary-btn-active);
                box-shadow: 0 0 0.4rem 0.6rem rgb(45 66 252 / 10%);
              }
            }
            .primary-action-trade {
              background: var(--primary-btn-bg);
              border-radius: 0.3rem;
              color: #fff;
              line-height: 1;
              padding: 1.65rem 1.6rem;
              width: 100%;
              justify-content: center;
              text-align: center;
              align-items: center;
              border: none;
              display: inline-flex;
              font-size: var(--font-sm);
              font-weight: 400;
              text-decoration: none;

              &:not([disabled]):hover {
                background: var(--primary-btn-hover);
                box-shadow: 0 0 0.4rem 0.5rem rgb(45 66 252 / 10%);
              }

              &:not([disabled]):active {
                background-color: var(--primary-btn-active);
                box-shadow: 0 0 0.4rem 0.6rem rgb(45 66 252 / 10%);
              }
            }
          }
        }
        .Exchange-swap-market-box {
          padding: 1.5rem;
          margin-top: 1.25rem;
          padding-bottom: 1.5rem;
          .App-card-title {
            font-size: var(--font-md);
            line-height: 2rem;
            font-weight: normal;
            letter-spacing: 0px;
            color: #ffffff;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .App-card-divider {
            height: 1px;
            background: #23263b;
            margin: 1.05rem -1.5rem;
          }
          .Exchange-info-row {
            display: grid;
            grid-template-columns: auto auto;
            font-size: var(--font-sm);
            margin-bottom: 0.465rem;
            align-items: baseline;
            .Exchange-info-label {
              color: var(--text-gray);
              margin-right: 0.8rem;
            }
            .align-right {
              text-align: right;
              display: flex;
              justify-content: flex-end;
            }
          }
        }
        .SwapBox {
          border-radius: 0.4rem;
          padding: 1.5rem;
        }
      }
    }
  }
}
</style>
