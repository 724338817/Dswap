// 相当于store的计算属性
// Getter 也可以接受其他 getter 作为第二个参数：
const getters = {
  authorization (state) {
    return state.authorization
  },
  permission (state) {
    return state.permission
  },
  userinfo (state) {
    return state.userinfo
  },
  walletAddress(state){
    return state.walletAddress
  }
}
export default getters
