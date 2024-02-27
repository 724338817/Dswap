import { getStore } from 'Utils/localstore'
const state = {
  authorization: getStore('authorization') || '',
  permission: getStore('permission') || [],
  userinfo: getStore('userinfo') || '',
  walletAddress: getStore('walletAddress') || '',
  chainType: getStore('chainType') || '',
  chainId: getStore('chainId') || '',
  autoConnect: getStore('autoConnect') || '',
  buyProcessShow: getStore('buyProcessShow') || '',
  buyApproveShow: getStore('buyApproveShow') || '',
  sellApproveShow: getStore('sellApproveShow') || '',
  sellSuccessShow: getStore('sellSuccessShow') || '',
  buySuccessShow: getStore('buySuccessShow') || '',
  makeOfferApproveShow: getStore('makeOfferApproveShow') || '',
  acceptApproveShow: getStore('acceptApproveShow') || '',
  acceptProcessShow: getStore('acceptProcessShow') || '',
  acceptSuccessShow: getStore('acceptSuccessShow') || '',
  transferProcessShow: getStore('transferProcessShow') || ''
}
export default state
