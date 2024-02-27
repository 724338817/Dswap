<template>
  <div class="container">
    <div class="App-header large">
      <div class="App-header-container-left">
        <div class="logo">BAC Swap</div>
      </div>
      <div class="App-header-container-right">
        <div class="chainName" @click="swichChain" v-if="wallet.account">
          {{ enableOperate ? 'Switch Chain' : $store.state.chainType }}
          <switchChain class="switchChain" v-if="swichChainShow"></switchChain>
        </div>
        <div class="connect-wallet-btn" @click="handleCommand()" v-if="!wallet.account">
          <img class="btn-icon" src="~Assets/images/ic_wallet_24.svg" alt="Connect Wallet" />
          <span class="btn-label">Connect a Wallet</span>
        </div>
        <div class="connect-wallet-btn" v-else>
          <span class="btn-label">{{ handleAccount(wallet.account) }}</span>
        </div>
      </div>
    </div>
    <connect-wallet v-if="connectWalletShow" @close="connectWalletClose"></connect-wallet>
  </div>
</template>
<script>
import { SET_AUTHORIZATION, SET_PERMISSION } from 'Store/mutation-types.js'
import { mapMutations, mapGetters } from 'vuex'
import connectWallet from '@/components/connectWallet.vue'
import switchChain from '@/components/swichChain.vue'
import wallet from '@/utils/wallet'

export default {
  components: { connectWallet, switchChain },
  name: 'HeaderBar',
  data() {
    return {
      wallet,
      connectWalletShow: false,
      swichChainShow: false
    }
  },
  props: {},
  computed: {
    ...mapGetters(['userinfo']),
    enableOperate() {
      return this.$store.state.chainId !== wallet.chainId
    }
  },
  created() {},
  methods: {
    ...mapMutations([SET_AUTHORIZATION, SET_PERMISSION]),
    handleCommand() {
      this.connectWalletShow = true
    },
    connectWalletClose() {
      this.connectWalletShow = false
    },
    handleAccount(account) {
      const leng = account.length
      if (account) return account.substring(0, 6) + '...' + account.substring(leng - 4, leng)
    },
    swichChain() {
      this.swichChainShow = !this.swichChainShow
    }
  },
  watch: {}
}
</script>
<style lang="less" scoped>
.container {
  position: relative;
  width: 100%;
  min-width: 1200px;
  height: 62px;
  z-index: 999;
  .App-header.large::after {
    height: 13px;
    width: 100%;
    content: ' ';
    background: transparent linear-gradient(180deg, #00000030 0%, #00000000 100%) 0% 0% no-repeat padding-box;
    position: absolute;
    bottom: -13px;
    left: 0;
  }
  .App-header {
    backdrop-filter: blur(4px);
    background: #0000 0 0 no-repeat padding-box;
    border-bottom: 1px solid hsla(0, 0%, 100%, 0.063);
    display: flex;
    height: 62px;
    justify-content: space-between;
    padding-left: 32px;
    padding-right: 32px;
    position: relative;
  }
  .App-header-container-left {
    display: flex;
    align-items: center;
    .logo {
      display: inline-block;
      vertical-align: middle;
      font-size: 22px;
      font-family: math;
    }
  }
  .App-header-container-left .a,
  .App-header-container-left a {
    padding: 1.8rem 1.7rem;
    display: block;
    color: #a0a3c4;
    font-size: var(--font-base);
    line-height: 1.8rem;
    font-weight: normal;
  }

  .App-header-container-left .a.active,
  .App-header-container-left a.active {
    color: white;
  }

  div.App-header-container-right {
    display: flex;
    align-items: center;
    .menu {
      padding: 10px 16px;
    }
    .App-header-trade-link {
      margin-right: 2.4rem;
    }
    .default-btn {
      background: #2d42fc;
      border-radius: 4px;
      font-size: var(--font-sm);
      line-height: 2rem;
      font-weight: normal;
      letter-spacing: 0px;
      color: #ffffff !important;
      padding-left: 1.6rem;
      padding-right: 1.6rem;
      /* padding: 9px 16px!important; */
      text-decoration: none;
      box-sizing: border-box;
      position: relative;
      min-height: 3.6rem;
      display: inline-flex !important;
      align-items: center;
      text-align: center;
      cursor: pointer;
      border: none;
      appearance: none;
    }
    .default-btn:hover {
      background: #5264fc;
    }
    .connect-wallet-btn {
      background: transparent;
      padding: 0.85rem 1.4rem;
      display: inline-flex;
      align-items: center;
      border: none;
      color: #fff;
      font-size: var(--font-sm);
      cursor: pointer;
      border: 1px solid var(--dark-blue-border);
      border-radius: var(--border-radius-sm);

      .btn-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .btn-label {
        font-weight: 400;
        font-size: var(--font-sm);
        margin-left: 0.8rem;
        letter-spacing: 0;
      }
      &:hover {
        background: var(--dark-blue-hover);
      }
      &:active {
        background: var(--dark-blue-active);
      }
    }
    .chainName {
      padding: 0 15px;
      border: 1px solid #363747;
      margin-right: 15px;
      line-height: 38px;
      border-radius: 5px;
      background-color: #101124;
      color: #fff;
      cursor: pointer;
    }
    .switchChain {
      position: absolute;
      right: 106px;
      top: 62px;
      width: 205px;
      height: auto;
      z-index: 999;
      background: #2e3251;
    }
  }
}
</style>
