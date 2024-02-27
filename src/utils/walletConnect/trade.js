export const NftOrderType = {
    BUY: 0, //卖方挂单,买方BUY
    ACCEPT: 1, //买方make offer,卖方Accept
    SELL: 2, //卖方挂单
    OFFER: 3, //买方make offer
};

export const nftChainId = (chainName) => {
    if (chainName === 'ethereum') {
        return 1
    } else if (chainName === 'mumbai') {
        return 80001
    } else if (chainName === 'goerli') {
        return 5
    } else {
        return 1
    }
}
