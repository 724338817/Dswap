<template>
  <div class="dialog-content">
    <div class="arrow"></div>
    <div slot="title" class="dialog-title">Switch Chain</div>
    <div class="switch-content">
      <div class="switch-content-item" v-if="$store.state.chainType != 'Ethereum'" @click="changeChain('Ethereum')">
        <span>Ethereum</span>
        <!-- <span class="soon">Soon</span> -->
        <img :src="ethImg" alt="" />
      </div>

      <div class="switch-content-item" v-if="$store.state.chainType != 'Mumbai'" @click="changeChain('Mumbai')">
        <span>Mumbai</span>
        <img :src="polygonImg" alt="" />
      </div>

      <div class="switch-content-item" v-if="$store.state.chainType != 'Goerli'" @click="changeChain('Goerli')">
        <span>Goerli</span>
        <img :src="polygonImg" alt="" />
      </div>
    </div>
    <div class="switch-info">
      You are currently connected to the
      <span class="strong">{{ $store.state.chainType }}</span> network
    </div>
  </div>
</template>

<script>
import opImg from '@/assets/image/op.png'
import ethImg from '@/assets/image/eth12.svg'
import arbitrumImg from '@/assets/image/arbitrum.svg'
import polygonImg from '@/assets/image/polygon.svg'
import TronPng from '@/assets/image/icon/tron.png'
import wallet from '../utils/wallet'

export default {
  name: 'switchChain',
  props: ['show'],
  data() {
    return {
      TronPng,
      opImg,
      ethImg,
      polygonImg,
      arbitrumImg,
      dialogVisible: this.show
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    changeChain(value) {
      wallet.changeChain(value, true)
    }
  }
}
</script>

<style lang="less" scoped>
.dialog-content {
  padding: 10px 0;
  border-radius: 10px;
}

.dialog-title {
  text-align: center;
  font-size: 16px;
  font-family: Chivo-Bold, Chivo;
  padding: 0;
}

.arrow {
  height: 0px;
  width: 0px;
  border-style: solid;
  border-width: 10px;
  border-color: transparent transparent #2e3251 transparent;
  /*transparent代表默认颜色*/
  font-size: 0;
  /*兼容性处理*/
  line-height: 0;
  position: absolute;
  top: -19px;
  left: 44%;
}

.switch-content {
  padding: 20px;
  box-sizing: border-box;

  .switch-content-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 36px;
    padding: 0 15px;
    margin-bottom: 10px;
    background: #f3f3f5;
    border-radius: 6px;
    font-size: 12px;
    font-weight: bold;
    color: #333;
    box-sizing: border-box;
    cursor: pointer;

    img {
      width: 16px;
    }

    .soon {
      width: 40px;
      height: 18px;
      text-align: center;
      border-radius: 10px;
      border: 1px solid #f86868;
      font-weight: normal;
      font-size: 12px;
      color: #f86868;
    }
  }
}

.switch-info {
  font-size: 12px;
  padding: 0 20px;
  font-family: Chivo-Regular, Chivo;
  font-weight: 400;
  color: #b3b3b3;
  line-height: 18px;

  .strong {
    color: #3c82ff !important;
    font-weight: bold !important;
  }
}
</style>
