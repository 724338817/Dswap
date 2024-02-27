import {
  SET_AUTHORIZATION,
  SET_PERMISSION,
  SET_USERINFO
} from './mutation-types'
import { setStore } from 'Utils/localstore'
// 必须是同步代码
const mutation = {
  [SET_AUTHORIZATION](state, authorization) {
    state.authorization = authorization
    setStore('authorization', authorization)
  },
  [SET_PERMISSION](state, permission) {
    state.permission = permission
    setStore('permission', permission)
  },
  [SET_USERINFO](state, userinfo) {
    state.userinfo = userinfo
    setStore('userinfo', userinfo)
  },
  setChainType(state, data) {
    setStore('chainType', data)
    state.chainType = data;
  },
  setChainId(state, data) {
    setStore('chainId', data)
    state.chainId = data;
  },
  autoConnect(state, data) {
    setStore('autoConnect', data)
    state.autoConnect = data;
  },
  setWalletAddress(state, data) {
    setStore('walletAddress', data)
    state.walletAddress = data;
  },
  setBuyProcessShow(state, data) {
    setStore('buyProcessShow', data)
    state.buyProcessShow = data;
  },
  setBuyApproveShow(state, data) {
    setStore('buyApproveShow', data)
    state.buyApproveShow = data;
  },
  setSellApproveShow(state, data) {
    setStore('sellApproveShow', data)
    state.sellApproveShow = data;
  },
  setSellSuccessShow(state, data) {
    setStore('sellSuccessShow', data)
    state.sellSuccessShow = data;
  },
  setBuySuccessShow(state, data) {
    setStore('buySuccessShow', data)
    state.buySuccessShow = data;
  },
  setMakeOfferApproveShow(state, data) {
    setStore('makeOfferApproveShow', data)
    state.makeOfferApproveShow = data;
  },
  setAcceptApproveShow(state, data) {
    setStore('acceptApproveShow', data)
    state.acceptApproveShow = data;
  },
  setAcceptProcessShow(state, data) {
    setStore('acceptProcessShow', data)
    state.acceptProcessShow = data;
  },
  setAcceptSuccessShow(state, data) {
    setStore('acceptSuccessShow', data)
    state.acceptSuccessShow = data;
  },
  setTransferProcessShow(state, data) {
    setStore('transferProcessShow', data)
    state.transferProcessShow = data;
  },
}
export default mutation
