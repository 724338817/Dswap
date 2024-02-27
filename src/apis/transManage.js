import http from '../utils/http'

// 查询15天交易数据
const getTransDataHalfMonth = (params) => http.get('/wbbc-explorer/chain/trans15Days', params)
// 查询交易回执详情
const getTransactionReceipt = (params) => http.get(`/wbbc-explorer/chain/transactionReceipt/${params.transHash}`, params)
// 查询交易列表
const getTransList = (params) => http.get(`/wbbc-explorer/chain/transList/${params.pageNumber}/${params.pageSize}`, params)
// 查询区块列表
const getBlockList = (params) => http.get(`/wbbc-explorer/chain/blockList/${params.pageNumber}/${params.pageSize}`, params)
// 查询交易详情
const getTransInfo = (params) => http.get(`/wbbc-explorer/chain/transInfo/${params.transHash}`, params)
// 查询交易详情
const inputMethodAbi = (params) => http.get(`/wbbc-explorer/chain/methodAbi/${params.methodId}`, params)

export default { getTransDataHalfMonth, getTransactionReceipt, getTransList, getBlockList, getTransInfo, inputMethodAbi }
