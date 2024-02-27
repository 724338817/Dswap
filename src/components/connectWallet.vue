<template>
  <div class="wallet">
    <el-dialog class="walletDialog" center :visible.sync="dialogVisible" :width="modalWith" :before-close="handleClose">
      <div slot="title" class="dialog-title">Connect Wallet</div>
      <div class="wallet-content">
        <div class="wallet-content-item" @click="onWalletClick('Metamask')">
          <img :src="metamaskImg" alt="" />
          <span>Metamask</span>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import metamaskImg from '@/assets/images/metamask.svg'
import wallet from '../utils/wallet'
export default {
  name: 'connectWallet',
  props: [],
  data() {
    return {
      dialogVisible: true,
      metamaskImg,
      clientWidth: 1920,
      modalWith: '600px'
    }
  },
  mounted() {
    // this.initWith()
  },
  methods: {
    initWith() {
      this.clientWidth = document.documentElement.clientWidth
      if (this.clientWidth > 1000) {
        this.modalWith = '600px'
      } else if (this.clientWidth > 500) {
        this.modalWith = '400px'
      } else {
        this.modalWith = '350px'
      }
    },
    handleClose() {
      this.$emit('close')
    },
    async onWalletClick(param) {
      // this.$emit('onWalletClick', index)
      const res = await wallet.doWalletConnect(true)
      console.log(res)
      if (res === 'connectSuccess') {
        this.$emit('close', true)
      }
    },
    changeChain(value) {
      wallet.changeChain(value, true)
      this.$emit('close')
    }
  }
}
</script>

<style lang="less" scoped>
@keyframes _9pm4ki1 {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}
@keyframes _9pm4ki0 {
  0% {
    transform: translateY(100%);
  }

  100% {
    transform: translateY(0);
  }
}
.wallet {
  animation: _9pm4ki1 0.15s ease;
  bottom: -200px;
  left: -200px;
  padding: 200px;
  right: -200px;
  top: -200px;
  position: absolute;
  transform: translateZ(0);
  z-index: 2147483646;
  background: rgba(0, 0, 0, 0.5);
  .walletDialog {
    animation: _9pm4ki0 0.35s cubic-bezier(0.15, 1.15, 0.6, 1), _9pm4ki1 0.15s ease;
    position: relative;
    /deep/ .el-dialog {
      background-color: rgb(22, 24, 46);
      color: rgb(255, 255, 255);
      width: 368px !important;
      font-weight: 800;
      font-size: 18px;
      line-height: 24px;
      margin-top: 20vh !important;
    }
    .wallet-content {
      box-sizing: border-box;
      flex-direction: column;
      display: flex;
      gap: 4px;
      .wallet-content-item {
        border-color: #0000;
        width: 100%;
        transition: 0.125s ease;
        padding: 5px;
        border-width: 1px;
        background: none;
        cursor: pointer;
        text-align: left;
        display: flex;
        gap: 12px;
        img {
          height: 100%;
          border-radius: 5px;
        }
        span {
          color: rgb(255, 255, 255);
          font-family: Relative, sans-serif;
          letter-spacing: 0.05rem;
          font-size: 16px;
        }
      }
      .wallet-content-item:hover {
        background: #808aff14;
        border-radius: 5px;
      }
    }
  }
}
</style>
