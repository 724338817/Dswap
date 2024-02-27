import http from '../utils/http'

// 获取应用列表
const getAppList = (params) => http.get('/wbbc-explorer/app/appList', params)
// 获取应用详情
const getAppInfo = (params) => http.get(`/wbbc-explorer/app/appInfo/${params.appId}`, params)
// 获取应用合约列表
const getContractListByAppId = (params) => http.get(`/wbbc-explorer/app/contractList/${params.appId}/${params.pageNumber}/${params.pageSize}`, params)
// 获取应用合约交易列表
const getContractTransListByAppId = (params) => http.get(`/wbbc-explorer/app/contractTransList/${params.appId}/${params.pageNumber}/${params.pageSize}`, { contractAddress: params.contractAddress })

export default { getAppList, getAppInfo, getContractListByAppId, getContractTransListByAppId }
