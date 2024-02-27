import http from '../utils/http'

// 限价卖出TP
const sellOrderLimit = (params) => http.post('/SellOrder/limitSell', params)
// 市价卖出TP
const sellOrderMarket = (params) => http.post('/SellOrder/marketSell', params)
// 限价购买TP
const buyOrderLimit = (params) => http.post('/BuyOrder/limitBuy', params)
// 市价购买TP
const buyOrderMarket = (params) => http.post('/BuyOrder/marketBuy', params)
// 查询交易对的价格（卖家视角）
const getCurrentPriceSell = (params) => http.get('/SellOrder/getCurrentPrice', params)
// 查询交易对的价格（买家视角）
const getCurrentPriceBuy = (params) => http.get('/BuyOrder/getCurrentPrice', params)
// 查询有效卖单
const getValidSellOrder = (params) => http.get('/UserOrder/getValidSellOrder', params)
// 查询有效mai单
const getValidBuyOrder = (params) => http.get('/UserOrder/getValidBuyOrder', params)

export default { sellOrderLimit, sellOrderMarket, buyOrderLimit, buyOrderMarket, getCurrentPriceSell, getCurrentPriceBuy, getValidSellOrder, getValidBuyOrder }

