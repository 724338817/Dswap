import Vue from "vue";
import store from "@/store";
let Web3 = require("web3");
let BigNumber = require("bignumber.js");
import { structToSign, handledSignature } from "./walletConnect/util.js";
import { eip712Domain } from "./walletConnect/eip712.js";
// abi
import registerProxyAddressABI from "./ABI/registerProxyAddressABI";
import sellContractABI from "./ABI/sellContractABI";
import buyContractABI from "./ABI/buyContractABI";
import exchangeABI from "./ABI/buySendABI";
import erc20ABI from "./ABI/erc20ABI";

// import earnIndex from "./earnIndex.js"
import WalletConnectProvider from "@walletconnect/web3wallet";
// import { resolve } from 'core-js/fn/promise';

var ethers = require("ethers");
const AbiCoder = ethers.utils.AbiCoder;
// eslint-disable-next-line no-unused-vars
const ADDRESS_PREFIX = "41";

let lpBalance = 0;
let isConnected = false;
let isNetworkError = false;
let provider;
let signData;
let chainID = 80001;
const contractAddress = "";
let registryAddress = "0x09D7b2B857409991ed1b80B93e746868f48Abb22"; // WyvernExchange 注册合约
let exchangeAddress = "0xb2b0a659C3F92554AE1a923438734d3e78F14912"; // WyvernExchange 交易所合约
let staticTargetAddress = "0x9AA6B832F38b6578a57160291FffF9296BBdF397"; // staticMarket 静态验证合约地址
// TP token
let TP_token = '0x33aEab2f5e88669Ae21376322FBd62EC3F085013'
// YD token
let YD_token = '0x0f6CCb89b189C510A23490623173437cb71dD17e'
let erc721AddressToken = ''; //nft合约token
let proxyAddress; //代理地址
let sellToken; //sell代币数

export default {
  account: store.getters.walletAddress || '',
  isConnected,
  isNetworkError,
  lpBalance,
  gasPrice: 20,
  mark: '',
  pay_token: '',
  receive_token: '',
  payPrice: 0,
  contractAddress: contractAddress,
  chainId: 80001,
  decimals: 5, // payToken decimals
  signData,
  // eslint-disable-next-line no-unused-vars
  async init(chain) {
    try {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum);
        //监听账号切换
        ethereum.on('accountsChanged', (accounts) => {
          this.doWalletConnect()
        })
        //当所连接网络ID变化时触发
        ethereum.on('networkChanged', (networkIDstring) => {
          console.log(networkIDstring)
          this.checkChain()
        })
      } else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider);
        console.log("Web3(web3.currentProvider)");
      } else {
        console.log(
          "Non-Ethereum browser detected. You should consider trying MetaMask!"
        );
        isNetworkError = true;
      }
      // eslint-disable-next-line no-unused-vars
      window.web3.currentProvider.on("chainChanged", async (chainId) => {
        this.chainId = await window.web3.eth.net.getId();
        chainID = this.chainId;
        let chain;
        if (chainID === 1) {
          chain = "Ethereum";
        } else if (chainID === 80001) {
          chain = "Mumbai";
        } else if (chainID === 5) {
          chain = "Goerli";
        }
        store.commit("setChainType", chain);
      });
      this.chainId = await window.web3.eth.net.getId();
      // console.log('id=================>', this.chainId)
      if (this.chainId === 1 || this.chainId === 80001 || this.chainId === 5) {
        chainID = this.chainId;
        let chain;
        if (chainID === 1) {
          chain = "Ethereum";
        } else if (chainID === 80001) {
          chain = "Mumbai";
        } else if (chainID === 5) {
          chain = "Goerli";
        }
        store.commit("setChainType", chain);
      } else {
        // Vue.prototype.$toast.notify({
        //   message: 'Please link Ethereum, Polygon Mainnet.',
        //   type: 'warning'
        // })
      }
    } catch (error) {
      console.log(error);
    }
    if (!isNetworkError) {
      this.getGasPrice();
    }
  },
  // eslint-disable-next-line no-unused-vars
  initWalletConnect(chainType) {
    console.log("initWalletConnect", chainID);
    provider = new WalletConnectProvider({
      infuraId: "51c9ed427c4241f588997003b93f67e3",
      rpc: {
        42: "https://exchainrpc.okex.org",
        69: "https://kovan.optimism.io",
        80001: "https://matic-mumbai.chainstacklabs.com",
        421611: "https://rinkeby.arbitrum.io/rpc",
      },
      chainId: chainID,
      networkId: chainID,
      qrcode: true,
    });
    provider
      .enable()
      .then((res) => {
        console.log("walletconnect", res);
        window.web3 = new Web3(provider);
        this.initAccount(res);
        let that = this;
        provider.on("accountsChanged", (accounts) => {
          console.log("walletconnect accountsChanged", accounts);
          that.initAccount(accounts);
        });
        provider.on("disconnect", (code, reason) => {
          console.log("walletconnect disconnect", code, reason);
          that.disconnect();
        });
        provider.on("chainChanged", (chainId) => {
          console.log(chainId);
        });
      })
      .catch((err) => {
        console.log("walletconnect", err);
      });
  },
  addChain(chain) {
    let chainName = chain;
    let rpcUrls = ["https://polygon-rpc.com"];
    let blockExplorerUrls = ["https://polygonscan.com"];
    let symbol = "MATIC";

    if (chain == "Arbitrum") {
      rpcUrls = ["https://rinkeby.arbitrum.io/rpc"];
      blockExplorerUrls = ["https://testnet.arbiscan.io/"];
      symbol = "AETH";
    } else if (chain == "Optimism") {
      rpcUrls = ["https://goerli.optimism.io"];
      blockExplorerUrls = ["https://optimism.io"];
      symbol = "OETH";
    }

    window.ethereum &&
      window.ethereum
        .request({
          method: "wallet_addEthereumChain",
          params: [
            {
              // eslint-disable-next-line no-undef
              chainId: web3.utils.toHex(chainID),
              chainName: chainName,
              nativeCurrency: {
                name: symbol,
                symbol: symbol,
                decimals: 18,
              },
              rpcUrls: rpcUrls,
              blockExplorerUrls: blockExplorerUrls,
            },
          ],
        })
        .then(() => {
          console.log("add success");
        })
        .catch((e) => {
          console.log(e);
        });
  },
  switchChain(value) {
    let that = this;
    const web3 = window.web3;
    console.log("web3=================>", web3);
    window.ethereum &&
      window.ethereum
        .request({
          method: "wallet_switchEthereumChain",
          params: [
            {
              chainId: web3.utils.toHex(chainID),
            },
          ],
        })
        .then(() => {
          console.log("switchChain", chainID);
          store.commit("setChainType", value);
          // earnIndex.changeChain(value)
          that.isNetworkError = false;
          that.isConnected = false;
          // earnIndex.init()
          that.connect();
        })
        .catch((e) => {
          console.log(e);
          that.addChain(value);
        });
  },
  onWalletConnect(accountAddress) {
    this.account = accountAddress;
    store.commit('setWalletAddress', this.account)
    this.isConnected = true;
    return 'connectSuccess'
  },
  async changeChain(chain, isMetaMask) {
    // this.account = '';
    await this.init(chain);
    if (chain == "Ethereum") {
      chainID = 1;
    } else if (chain == "Mumbai") {
      chainID = 80001;
    } else if (chain == "Goerli") {
      chainID = 5;
    } else {
      chainID = 421611;
    }
    if (isMetaMask) {
      this.switchChain(chain);
    } else {
      store.commit("setChainType", chain);
      // earnIndex.changeChain(chain)
      // earnIndex.init()
    }
  },
  switchChainById(id, isMetaMask) {
    if (id == 42) {
      this.changeChain("Ethereum", isMetaMask);
      return true;
    } else if (id == 69) {
      this.changeChain("Optimism", isMetaMask);
      return true;
    } else if (id == 421611) {
      this.changeChain("Arbitrum", isMetaMask);
      return true;
    }
    return false;
  },
  openScan(address) {
    let chainType = store.state.chainType;
    if (chainType === "Ethereum") {
      window.open(`https://kovan.etherscan.io/address/${address}`);
    } else {
      window.open(`https://polygonscan.com/address/${address}`);
    }
    // else if (chainType === 'Arbitrum') {
    //   window.open(`https://testnet.arbiscan.io/address/${address}`)
    // } else if (chainType === 'Optimism') {
    //   window.open(`https://optimistic.etherscan.io/address/${address}`)
    // } else {
    //   window.open(`https://mumbai.polygonscan.com/address/${address}`)
    // }
  },
  openScanByHash(hash) {
    let chainType = store.state.chainType;
    if (chainType === "Ethereum") {
      window.open(`https://kovan.etherscan.io/tx/${hash}`);
    } else if (chainType === "Arbitrum") {
      window.open(`https://testnet.arbiscan.io/tx/${hash}`);
    } else if (chainType === "Optimism") {
      window.open(`https://optimistic.etherscan.io/tx/${hash}`);
    } else {
      window.open(`https://mumbai.polygonscan.com/tx/${hash}`);
    }
  },
  async checkChain(isAutoChangeChain) {
    const web3 = window.web3;
    const id = await web3.eth.net.getId();
    console.log(id);
    if (id != chainID) {
      console.log("Wrong Chain " + id);
      this.isNetworkError = true;
      if (isAutoChangeChain) {
        this.switchChain("Mumbai");
      } else {
        this.switchChainById(id, true);
      }
      return false;
    }
    return true;
  },
  approveDone() {
    console.log("isApprove true");
  },
  async disconnect() {
    this.isConnected = false;
    localStorage.setItem("autoConnect", false);
    if (provider != null) {
      provider.disconnect();
    }
    this.account = "";
    store.commit('setWalletAddress', '')
    store.commit('autoConnect', '')
    console.log(
      "disconnect autoConnect = " + localStorage.getItem("autoConnect")
    );
  },
  async doWalletConnect(isAutoChangeChain) {
    await this.init();
    const web3 = window.web3;
    const id = await web3.eth.net.getId();
    console.log(id)
    console.log(chainID)
    if (id != chainID) {
      console.log("Wrong Chain " + id);
      this.isNetworkError = true;
      if (isAutoChangeChain) {
        this.switchChain("Mumbai");
      } else {
        this.switchChainById(id, true);
      }
    } else {
      const ethereum = window.ethereum;
      try {
        let accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        console.log(accounts + 'ok')
        this.account = accounts[0];
        store.commit('autoConnect', true)
        store.commit('setWalletAddress', this.account)
        this.isConnected = true;
        return 'connectSuccess'
      } catch (error) {
        console.log(error);
      }
    }
  },
  async connect() {
    const ethereum = window.ethereum;
    try {
      let accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log(accounts)
      this.initAccount(accounts);
    } catch (error) {
      console.log(error);
    }
  },
  initAddress(nftAddress, token) {
    erc721Address = nftAddress;
    erc721AddressToken = token;
  },
  initErc20Addr(erc20Addr) {
    erc20Address = erc20Addr
  },
  initDecimals(decimals) {
    decimals = decimals
    this.decimals = decimals
  },
  initPayToken(pay_token, receive_token) {
    this.pay_token = pay_token
    this.receive_token = receive_token
  },
  async getDecimals(erc20) {
    if (this.chainId !== 80001) return
    const infuraUrl =
      "https://endpoints.omniatech.io/v1/matic/mumbai/public";
    const erc20web3 = new Web3(infuraUrl);
    const getDecimalsContract = new erc20web3.eth.Contract(erc20ABI, erc20);
    const queryDecimals = await getDecimalsContract.methods.decimals().call();
    console.log("queryDecimals:" + queryDecimals);
    this.decimals = queryDecimals
  },
  // 查询用户代币余额
  async queryUserBalance(account) {
    // await this.init()
    console.log(11111)
    console.log(this.pay_token)
    console.log(account)
    if (this.chainId !== 80001) return
    const queryUserBalanceAbi = buyContractABI;
    const queryBalanceContract = new web3.eth.Contract(
      queryUserBalanceAbi,
      this.pay_token
    );
    const queryBalance = await queryBalanceContract.methods
      .balanceOf(account)
      .call(); //
    console.log("queryUserBalance:" + queryBalance);
    return queryBalance;
  },
  // 根据decimals截断amount
  sliceAmount(amount) {
    if (amount.toString().indexOf('.') === 1 && amount.length - 2 > this.decimals) {
      return amount.slice(0, Number(this.decimals) + 2)
    } else {
      return amount
    }
  },
  // 限价卖出TP
  async sellOrderLimitFlow(sellOrderData) {
    store.commit("setBuyApproveShow", true);
    // 存放价格
    console.log(sellOrderData)
    console.log(window.web3)
    this.payPrice = this.sliceAmount(sellOrderData.price);
    this.account = sellOrderData.account
    this.pay_token = sellOrderData.token
    this.mark = sellOrderData.mark || 10
    //查询是否有代理地址
    const web3 = window.web3;
    const queryRegisterProxyAbi = registerProxyAddressABI;
    const registryContract = new web3.eth.Contract(
      queryRegisterProxyAbi,
      registryAddress
    );
    const queryProxyAddress = await registryContract.methods
      .proxies(this.account)
      .call();
    console.log("proxyAddr:" + queryProxyAddress);
    const nullAddr = "0x0000000000000000000000000000000000000000";
    //有代理地址
    if (queryProxyAddress !== nullAddr) {
      proxyAddress = queryProxyAddress;
    }
    //注册代理地址
    if (queryProxyAddress === nullAddr) {
      const createProxyAddress = await registryContract.methods
        .registerProxy()
        .send({
          from: this.account,
        });
      if (createProxyAddress.status === true) {
        proxyAddress = createProxyAddress.events[0].address;
      } else {
        this.notifyTransaction(
          "warning",
          3000,
          false,
          "createProxyAddress error"
        );
        store.commit("setBuyApproveShow", false);
        return;
      }
    }
    //查询代理地址（代币）是否授权 购买
    const queryAccreditAbi = buyContractABI;
    const queryAccreditAddress = new web3.eth.Contract(
      queryAccreditAbi,
      this.pay_token
    );
    const queryAccreditTokenAccount = await queryAccreditAddress.methods
      .allowance(this.account, proxyAddress)
      .call(); //用户地址，注册地址/代理
    console.log("queryAccreditTokenAccount:" + queryAccreditTokenAccount);
    //授权代理地址（代币） 购买
    if (
      !queryAccreditTokenAccount ||
      Number(queryAccreditTokenAccount) < new BigNumber(this.payPrice * 10 ** this.decimals).toString(10)
    ) {
      let accreditTokenAccount = await queryAccreditAddress.methods
        .approve(proxyAddress, new BigNumber(this.payPrice * 10 ** this.decimals).toString(10)) //代币数量根据卖家卖的数量
        .send({
          //注册地址(代理)，代币数量 //代币数字*18个0
          from: this.account,
        });
      console.log(accreditTokenAccount);
      if (accreditTokenAccount.status !== true) {
        this.notifyTransaction(
          "warning",
          3000,
          false,
          "accreditTokenAccount error"
        );
        store.commit("setBuyApproveShow", false);
        return;
      }
      // 购买NFT流程
      // this.signTypedData_v4(sellOrderData);
    } else {
      // 购买NFT流程
      // this.signTypedData_v4(sellOrderData);
    }
    // 1.签名
    // 购买NFT流程
    let templateData = {
      registry: registryAddress, //合约地址
      maker: "", //用户地址
      staticTarget: staticTargetAddress,
      staticSelector: "",
      staticExtradata: "",
      maximumFill: this.payPrice * 10 ** this.decimals,
      listingTime: 0,
      expirationTime: 0, //订单过期时间
      salt: Math.floor(Math.random() * 1000).toString(), //盐
      // salt: 604, //盐
    };
    templateData.maker = this.account;
    templateData.staticSelector = web3.eth.abi.encodeFunctionSignature(
      "anyERC20ForERC20Limit(bytes,address[7],uint8[2],uint256[6],bytes,bytes)"
    );
    templateData.staticExtradata = web3.eth.abi.encodeParameters(
      ["address[2]", "uint256[2]"],
      [
        [this.pay_token, this.receive_token],
        [1, this.mark],
      ]
      // [
      //     [erc20.address,erc721.address],
      //     [tokenId, sellingPrice],
      // ]
      //代币地址 nft地址
    );
    const handledData = structToSign(templateData, exchangeAddress);
    let datas = JSON.stringify({
      types: { Order: handledData.fields, EIP712Domain: eip712Domain.fields },
      primaryType: handledData.name,
      domain: handledData.domain,
      message: handledData.data,
    });
    console.log(handledData);
    console.log(datas);
    let that = this;
    return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync(
        {
          method: "eth_signTypedData_v4",
          params: [this.account, datas],
          from: this.account,
        },
        async function (err, result) {
          if (err) {
            console.log("err", err);
            that.notifyTransaction("warning", 3000, false, err.message);
            store.commit("setBuyApproveShow", false);
            return reject(false);
          }
          if (result.error) {
            console.error("ERROR", result);
            return reject(false);
          }
          console.log("BUY SIGNED:" + JSON.stringify(result.result));
          let signData = handledSignature(JSON.stringify(result.result));
          // that.callContract(handledData.data, result.result, sellOrderData);
          // 2.限价卖
          //整理限价卖接口数据
          const sellOrderData = {
            account: that.account, //用户地址
            amount: new BigNumber(that.payPrice * 10 ** that.decimals).toString(10), //金额
            signature: signData,
            tradingPair: "TP/YD",
            salt: templateData.salt, //盐
          };
          console.log(sellOrderData);
          resolve(sellOrderData);
        }
      );
    });
  },
  // 市价卖出TP
  async sellOrderMarketFlow(sellOrderData) {
    store.commit("setBuyApproveShow", true);
    // 存放价格
    console.log(sellOrderData)
    console.log(window.web3)
    this.payPrice = this.sliceAmount(sellOrderData.price);
    this.account = sellOrderData.account
    this.pay_token = sellOrderData.token
    //查询是否有代理地址
    const web3 = window.web3;
    const queryRegisterProxyAbi = registerProxyAddressABI;
    const registryContract = new web3.eth.Contract(
      queryRegisterProxyAbi,
      registryAddress
    );
    const queryProxyAddress = await registryContract.methods
      .proxies(this.account)
      .call();
    console.log("proxyAddr:" + queryProxyAddress);
    const nullAddr = "0x0000000000000000000000000000000000000000";
    //有代理地址
    if (queryProxyAddress !== nullAddr) {
      proxyAddress = queryProxyAddress;
    }
    //注册代理地址
    if (queryProxyAddress === nullAddr) {
      const createProxyAddress = await registryContract.methods
        .registerProxy()
        .send({
          from: this.account,
        });
      if (createProxyAddress.status === true) {
        proxyAddress = createProxyAddress.events[0].address;
      } else {
        this.notifyTransaction(
          "warning",
          3000,
          false,
          "createProxyAddress error"
        );
        store.commit("setBuyApproveShow", false);
        return;
      }
    }
    //查询代理地址（代币）是否授权 购买
    const queryAccreditAbi = buyContractABI;
    const queryAccreditAddress = new web3.eth.Contract(
      queryAccreditAbi,
      this.pay_token
    );
    const queryAccreditTokenAccount = await queryAccreditAddress.methods
      .allowance(this.account, proxyAddress)
      .call(); //用户地址，注册地址/代理
    console.log("queryAccreditTokenAccount:" + queryAccreditTokenAccount);
    //授权代理地址（代币） 购买
    if (
      !queryAccreditTokenAccount ||
      Number(queryAccreditTokenAccount) < new BigNumber(this.payPrice * 10 ** this.decimals).toString(10)
    ) {
      let accreditTokenAccount = await queryAccreditAddress.methods
        .approve(proxyAddress, new BigNumber(this.payPrice * 10 ** this.decimals).toString(10)) //代币数量根据卖家卖的数量
        .send({
          //注册地址(代理)，代币数量 //代币数字*18个0
          from: this.account,
        });
      console.log(accreditTokenAccount);
      if (accreditTokenAccount.status !== true) {
        this.notifyTransaction(
          "warning",
          3000,
          false,
          "accreditTokenAccount error"
        );
        store.commit("setBuyApproveShow", false);
        return;
      }
      // 购买NFT流程
      // this.signTypedData_v4(sellOrderData);
    } else {
      // 购买NFT流程
      // this.signTypedData_v4(sellOrderData);
    }
    // 1.签名
    // 购买NFT流程
    let templateData = {
      registry: registryAddress, //合约地址
      maker: "", //用户地址
      staticTarget: staticTargetAddress,
      staticSelector: "",
      staticExtradata: "",
      maximumFill: this.payPrice * 10 ** this.decimals,
      listingTime: 0,
      expirationTime: 0, //订单过期时间
      salt: Math.floor(Math.random() * 1000).toString(), //盐
    };
    templateData.maker = this.account;
    templateData.staticSelector = web3.eth.abi.encodeFunctionSignature(
      "anyERC20ForERC20Market(bytes,address[7],uint8[2],uint256[6],bytes,bytes)"
    );
    templateData.staticExtradata = web3.eth.abi.encodeParameters(
      ["address[2]", "uint256[2]"],
      [
        [this.pay_token, this.receive_token],
        [1, 0]
      ]
      // [
      //     [erc20.address,erc721.address],
      //     [tokenId, sellingPrice],
      // ]
      //代币地址 nft地址
    );
    const handledData = structToSign(templateData, exchangeAddress);
    let datas = JSON.stringify({
      types: { Order: handledData.fields, EIP712Domain: eip712Domain.fields },
      primaryType: handledData.name,
      domain: handledData.domain,
      message: handledData.data,
    });
    console.log(handledData);
    console.log(datas);
    let that = this;
    return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync(
        {
          method: "eth_signTypedData_v4",
          params: [this.account, datas],
          from: this.account,
        },
        async function (err, result) {
          if (err) {
            console.log("err", err);
            that.notifyTransaction("warning", 3000, false, err.message);
            store.commit("setBuyApproveShow", false);
            return reject(false);
          }
          if (result.error) {
            console.error("ERROR", result);
            return reject(false);
          }
          console.log("BUY SIGNED:" + JSON.stringify(result.result));
          let signData = handledSignature(JSON.stringify(result.result));
          // that.callContract(handledData.data, result.result, sellOrderData);
          // 2.市价卖
          //整理市价卖接口数据
          const sellOrderData = {
            account: that.account, //用户地址
            amount: new BigNumber(that.payPrice * 10 ** that.decimals).toString(10), //金额
            tradingPair: 'TP/YD',
            signature: signData,
            salt: templateData.salt, //盐
          };
          console.log(sellOrderData);
          resolve(sellOrderData);
        }
      );
    });
  },
  // 限价购买TP
  async buyOrderLimitFlow(buyOrderData) {
    store.commit("setBuyApproveShow", true);
    // 存放价格
    console.log(buyOrderData)
    console.log(window.web3)
    this.payPrice = this.sliceAmount(buyOrderData.price);
    this.account = buyOrderData.account
    this.pay_token = buyOrderData.token
    this.mark = buyOrderData.mark || 10
    //查询是否有代理地址
    const web3 = window.web3;
    const queryRegisterProxyAbi = registerProxyAddressABI;
    const registryContract = new web3.eth.Contract(
      queryRegisterProxyAbi,
      registryAddress
    );
    const queryProxyAddress = await registryContract.methods
      .proxies(this.account)
      .call();
    console.log("proxyAddr:" + queryProxyAddress);
    const nullAddr = "0x0000000000000000000000000000000000000000";
    //有代理地址
    if (queryProxyAddress !== nullAddr) {
      proxyAddress = queryProxyAddress;
    }
    //注册代理地址
    if (queryProxyAddress === nullAddr) {
      const createProxyAddress = await registryContract.methods
        .registerProxy()
        .send({
          from: this.account,
        });
      if (createProxyAddress.status === true) {
        proxyAddress = createProxyAddress.events[0].address;
      } else {
        this.notifyTransaction(
          "warning",
          3000,
          false,
          "createProxyAddress error"
        );
        store.commit("setBuyApproveShow", false);
        return;
      }
    }
    //查询代理地址（代币）是否授权 购买
    const queryAccreditAbi = buyContractABI;
    const queryAccreditAddress = new web3.eth.Contract(
      queryAccreditAbi,
      this.pay_token
    );
    const queryAccreditTokenAccount = await queryAccreditAddress.methods
      .allowance(this.account, proxyAddress)
      .call(); //用户地址，注册地址/代理
    console.log("queryAccreditTokenAccount:" + queryAccreditTokenAccount);
    //授权代理地址（代币） 购买
    if (
      !queryAccreditTokenAccount ||
      Number(queryAccreditTokenAccount) < new BigNumber(this.payPrice * 10 ** this.decimals).toString(10)
    ) {
      let accreditTokenAccount = await queryAccreditAddress.methods
        .approve(proxyAddress, new BigNumber(this.payPrice * 10 ** this.decimals).toString(10)) //代币数量根据卖家卖的数量
        .send({
          //注册地址(代理)，代币数量 //代币数字*18个0
          from: this.account,
        });
      console.log(accreditTokenAccount);
      if (accreditTokenAccount.status !== true) {
        this.notifyTransaction(
          "warning",
          3000,
          false,
          "accreditTokenAccount error"
        );
        store.commit("setBuyApproveShow", false);
        return;
      }
      // 购买NFT流程
      // this.signTypedData_v4(sellOrderData);
    } else {
      // 购买NFT流程
      // this.signTypedData_v4(sellOrderData);
    }
    // 1.签名
    // 购买NFT流程
    let templateData = {
      registry: registryAddress, //合约地址
      maker: "", //用户地址
      staticTarget: staticTargetAddress,
      staticSelector: "",
      staticExtradata: "",
      maximumFill: this.payPrice * 10 ** this.decimals,
      listingTime: 0,
      expirationTime: 0, //订单过期时间
      salt: Math.floor(Math.random() * 1000).toString(), //盐
    };
    templateData.maker = this.account;
    templateData.staticSelector = web3.eth.abi.encodeFunctionSignature(
      "anyERC20ForERC20Limit(bytes,address[7],uint8[2],uint256[6],bytes,bytes)"
    );
    templateData.staticExtradata = web3.eth.abi.encodeParameters(
      ["address[2]", "uint256[2]"],
      [
        [this.pay_token, this.receive_token],
        [0, this.mark],
      ]
      // [
      //     [erc20.address,erc721.address],
      //     [tokenId, sellingPrice],
      // ]
      //代币地址 nft地址
    );
    const handledData = structToSign(templateData, exchangeAddress);
    let datas = JSON.stringify({
      types: { Order: handledData.fields, EIP712Domain: eip712Domain.fields },
      primaryType: handledData.name,
      domain: handledData.domain,
      message: handledData.data,
    });
    console.log(handledData);
    console.log(datas);
    let that = this;
    return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync(
        {
          method: "eth_signTypedData_v4",
          params: [this.account, datas],
          from: this.account,
        },
        async function (err, result) {
          if (err) {
            console.log("err", err);
            that.notifyTransaction("warning", 3000, false, err.message);
            store.commit("setBuyApproveShow", false);
            return reject(false);
          }
          if (result.error) {
            console.error("ERROR", result);
            return reject(false);
          }
          console.log("BUY SIGNED:" + JSON.stringify(result.result));
          let signData = handledSignature(JSON.stringify(result.result));
          // that.callContract(handledData.data, result.result, sellOrderData);
          // 2.限价购买
          //整理限价购买接口数据
          const buyOrderData = {
            account: that.account, //用户地址
            amount: new BigNumber(that.payPrice * 10 ** that.decimals).toString(10), //金额
            signature: signData,
            tradingPair: "TP/YD",
            salt: templateData.salt, //盐
          };
          console.log(buyOrderData);
          resolve(buyOrderData);
        }
      );
    });
  },
  // 市价购买TP
  async buyOrderMarketFlow(buyOrderData) {
    store.commit("setBuyApproveShow", true);
    // 存放价格
    console.log(buyOrderData)
    console.log(window.web3)
    this.payPrice = this.sliceAmount(buyOrderData.price);
    this.account = buyOrderData.account
    this.pay_token = buyOrderData.token
    //查询是否有代理地址
    const web3 = window.web3;
    const queryRegisterProxyAbi = registerProxyAddressABI;
    const registryContract = new web3.eth.Contract(
      queryRegisterProxyAbi,
      registryAddress
    );
    const queryProxyAddress = await registryContract.methods
      .proxies(this.account)
      .call();
    console.log("proxyAddr:" + queryProxyAddress);
    const nullAddr = "0x0000000000000000000000000000000000000000";
    //有代理地址
    if (queryProxyAddress !== nullAddr) {
      proxyAddress = queryProxyAddress;
    }
    //注册代理地址
    if (queryProxyAddress === nullAddr) {
      const createProxyAddress = await registryContract.methods
        .registerProxy()
        .send({
          from: this.account,
        });
      if (createProxyAddress.status === true) {
        proxyAddress = createProxyAddress.events[0].address;
      } else {
        this.notifyTransaction(
          "warning",
          3000,
          false,
          "createProxyAddress error"
        );
        store.commit("setBuyApproveShow", false);
        return;
      }
    }
    //查询代理地址（代币）是否授权 购买
    const queryAccreditAbi = buyContractABI;
    const queryAccreditAddress = new web3.eth.Contract(
      queryAccreditAbi,
      this.pay_token
    );
    const queryAccreditTokenAccount = await queryAccreditAddress.methods
      .allowance(this.account, proxyAddress)
      .call(); //用户地址，注册地址/代理
    console.log("queryAccreditTokenAccount:" + queryAccreditTokenAccount);
    //授权代理地址（代币） 购买
    if (
      !queryAccreditTokenAccount ||
      Number(queryAccreditTokenAccount) < new BigNumber(this.payPrice * 10 ** this.decimals).toString(10)
    ) {
      let accreditTokenAccount = await queryAccreditAddress.methods
        .approve(proxyAddress, new BigNumber(this.payPrice * 10 ** this.decimals).toString(10)) //代币数量根据卖家卖的数量
        .send({
          //注册地址(代理)，代币数量 //代币数字*18个0
          from: this.account,
        });
      console.log(accreditTokenAccount);
      if (accreditTokenAccount.status !== true) {
        this.notifyTransaction(
          "warning",
          3000,
          false,
          "accreditTokenAccount error"
        );
        store.commit("setBuyApproveShow", false);
        return;
      }
      // 购买NFT流程
      // this.signTypedData_v4(sellOrderData);
    } else {
      // 购买NFT流程
      // this.signTypedData_v4(sellOrderData);
    }
    // 1.签名
    // 购买NFT流程
    let templateData = {
      registry: registryAddress, //合约地址
      maker: "", //用户地址
      staticTarget: staticTargetAddress,
      staticSelector: "",
      staticExtradata: "",
      maximumFill: this.payPrice * 10 ** this.decimals,
      listingTime: 0,
      expirationTime: 0, //订单过期时间
      salt: Math.floor(Math.random() * 1000).toString(), //盐
      // salt: 821
    };
    templateData.maker = this.account;
    templateData.staticSelector = web3.eth.abi.encodeFunctionSignature(
      "anyERC20ForERC20Market(bytes,address[7],uint8[2],uint256[6],bytes,bytes)"
    );
    console.log(templateData.staticSelector)
    templateData.staticExtradata = web3.eth.abi.encodeParameters(
      ["address[2]", "uint256[2]"],
      [
        [this.pay_token, this.receive_token],
        [0, 0],
      ]
      // [
      //     [erc20.address,erc721.address],
      //     [tokenId, sellingPrice],
      // ]
      //代币地址 nft地址
    );
    const handledData = structToSign(templateData, exchangeAddress);
    let datas = JSON.stringify({
      types: { Order: handledData.fields, EIP712Domain: eip712Domain.fields },
      primaryType: handledData.name,
      domain: handledData.domain,
      message: handledData.data,
    });
    console.log(handledData);
    console.log(datas);
    let that = this;
    return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync(
        {
          method: "eth_signTypedData_v4",
          params: [this.account, datas],
          from: this.account,
        },
        async function (err, result) {
          if (err) {
            console.log("err", err);
            that.notifyTransaction("warning", 3000, false, err.message);
            store.commit("setBuyApproveShow", false);
            return reject(false);
          }
          if (result.error) {
            console.error("ERROR", result);
            return reject(false);
          }
          console.log("BUY SIGNED:" + JSON.stringify(result.result));
          let signData = handledSignature(JSON.stringify(result.result));
          // that.callContract(handledData.data, result.result, sellOrderData);
          // 2.市价购买
          //整理市价购买接口数据
          const buyOrderData = {
            account: that.account, //用户地址
            amount: new BigNumber(that.payPrice * 10 ** that.decimals).toString(10), //金额
            tradingPair: 'TP/YD',
            signature: signData,
            salt: templateData.salt, //盐

          };
          console.log(buyOrderData);
          resolve(buyOrderData);
        }
      );
    });
  },
  //查询用户余额
  async queryMakeOfferBalance(sellOrderData) {
    const queryBalanceAbi = buyContractABI;
    const queryBalanceContract = new web3.eth.Contract(
      queryBalanceAbi,
      erc20Address
    );
    const queryBalance = await queryBalanceContract.methods
      .balanceOf(this.account)
      .call(); //用户地址，注册地址/代理
    console.log("queryMakeOfferBalance:" + queryBalance);
    return queryBalance;
  },
  //查询用户余额是否够buy
  async queryBalance(sellOrderData) {
    const sellTokenString = new BigNumber(sellOrderData.price).toString(10);
    const queryBalanceAbi = buyContractABI;
    const queryBalanceContract = new web3.eth.Contract(
      queryBalanceAbi,
      erc20Address
    );
    const queryBalance = await queryBalanceContract.methods
      .balanceOf(this.account)
      .call(); //用户地址，注册地址/代理
    console.log("queryBalance:" + queryBalance);
    const condition1 = queryBalance.length > sellTokenString.length;
    const condition2 = queryBalance.length < sellTokenString.length;
    const condition3 =
      Number(queryBalance.substr(0, 16)) >
      Number(sellTokenString.substr(0, 16)) ||
      (Number(queryBalance.substr(0, 16)) ===
        Number(sellTokenString.substr(0, 16)) &&
        Number(queryBalance.substr(16, queryBalance.length - 16)) >
        Number(sellTokenString.substr(16, sellTokenString.length - 16)));
    const condition4 =
      Number(queryBalance.substr(0, 16)) <
      Number(sellTokenString.substr(0, 16)) ||
      (Number(queryBalance.substr(0, 16)) ===
        Number(sellTokenString.substr(0, 16)) &&
        Number(queryBalance.substr(16, queryBalance.length - 16)) <
        Number(sellTokenString.substr(16, sellTokenString.length - 16)));
    let buyAllow;
    if (condition1) {
      buyAllow = true;
    } else if (condition2) {
      buyAllow = false;
    } else if (condition3) {
      buyAllow = true;
    } else if (condition4) {
      buyAllow = false;
    } else {
      buyAllow = true;
    }
    return buyAllow;
  },
  //购买buy流程
  async buyFlow(sellOrderData) {
    store.commit("setBuyApproveShow", true);
    // 存放价格
    sellToken = sellOrderData.price;
    //查询是否有代理地址
    const queryRegisterProxyAbi = registerProxyAddressABI;
    const web3 = window.web3;
    const registryContract = new web3.eth.Contract(
      queryRegisterProxyAbi,
      registryAddress
    );
    const queryProxyAddress = await registryContract.methods
      .proxies(this.account)
      .call();
    console.log("proxyAddr:" + queryProxyAddress);
    const nullAddr = "0x0000000000000000000000000000000000000000";
    //有代理地址
    if (queryProxyAddress !== nullAddr) {
      proxyAddress = queryProxyAddress;
    }
    //注册代理地址
    if (queryProxyAddress === nullAddr) {
      const createProxyAddress = await registryContract.methods
        .registerProxy()
        .send({
          from: this.account,
        });
      if (createProxyAddress.status === true) {
        proxyAddress = createProxyAddress.events[0].address;
      } else {
        this.notifyTransaction(
          "warning",
          3000,
          false,
          "createProxyAddress error"
        );
        store.commit("setBuyApproveShow", false);
        return;
      }
    }
    //查询代理地址（代币）是否授权 购买
    const queryAccreditAbi = buyContractABI;
    const queryAccreditAddress = new web3.eth.Contract(
      queryAccreditAbi,
      erc20Address
    );
    const queryAccreditTokenAccount = await queryAccreditAddress.methods
      .allowance(this.account, proxyAddress)
      .call(); //用户地址，注册地址/代理
    console.log("queryAccreditTokenAccount:" + queryAccreditTokenAccount);
    //授权代理地址（代币） 购买
    if (
      !queryAccreditTokenAccount ||
      Number(queryAccreditTokenAccount) < new BigNumber(sellToken).toString(10)
    ) {
      let accreditTokenAccount = await queryAccreditAddress.methods
        .approve(proxyAddress, new BigNumber(sellToken).toString(10)) //代币数量根据卖家卖的数量
        .send({
          //注册地址(代理)，代币数量 //代币数字*18个0
          from: this.account,
        });
      console.log(accreditTokenAccount);
      if (accreditTokenAccount.status !== true) {
        this.notifyTransaction(
          "warning",
          3000,
          false,
          "accreditTokenAccount error"
        );
        store.commit("setBuyApproveShow", false);
        return;
      }
      // 购买NFT流程
      // this.signTypedData_v4(sellOrderData);
    } else {
      // 购买NFT流程
      // this.signTypedData_v4(sellOrderData);
    }
    // 1.签名
    // 购买NFT流程
    let templateData = {
      registry: registryAddress, //合约地址
      maker: "", //用户地址
      staticTarget: staticTargetAddress,
      staticSelector: "",
      staticExtradata: "",
      maximumFill: 1,
      listingTime: Number(Date.parse(new Date()).toString().substring(0, 10)),
      expirationTime: 0, //订单过期时间
      salt: Math.floor(Math.random() * 1000).toString(), //盐
    };
    templateData.maker = this.account;
    templateData.staticSelector = web3.eth.abi.encodeFunctionSignature(
      "ERC20ForERC721(bytes,address[7],uint8[2],uint256[6],bytes,bytes)"
    );
    templateData.staticExtradata = web3.eth.abi.encodeParameters(
      ["address[2]", "uint256[2]"],
      [
        [erc20Address, erc721Address],
        [erc721AddressToken, new BigNumber(sellToken).toString(10)],
      ]
      // [
      //     [erc20.address,erc721.address],
      //     [tokenId, sellingPrice],
      // ]
      //代币地址 nft地址
    );
    const handledData = structToSign(templateData, exchangeAddress);
    let datas = JSON.stringify({
      types: { Order: handledData.fields, EIP712Domain: eip712Domain.fields },
      primaryType: handledData.name,
      domain: handledData.domain,
      message: handledData.data,
    });
    console.log(handledData);
    let that = this;
    return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync(
        {
          method: "eth_signTypedData_v4",
          params: [this.account, datas],
          from: this.account,
        },
        async function (err, result) {
          if (err) {
            console.log("err", err);
            that.notifyTransaction("warning", 3000, false, err.message);
            store.commit("setBuyApproveShow", false);
            return reject(false);
          }
          if (result.error) {
            console.error("ERROR", result);
            return reject(false);
          }
          console.log("BUY SIGNED:" + JSON.stringify(result.result));
          let signData = JSON.stringify(result.result);
          // that.callContract(handledData.data, result.result, sellOrderData);
          // 2.合约调用
          const unitsData = handledData.data;
          const signature = result.result;
          store.commit("setBuyApproveShow", false);
          store.commit("setBuyProcessShow", true);
          const web3 = window.web3;
          const sellABI = sellContractABI;
          const sellContract = new web3.eth.Contract(sellABI, erc721Address);
          const buyABI = buyContractABI;
          const buyContract = new web3.eth.Contract(buyABI, erc20Address);
          console.log(sellOrderData);
          const units = [
            registryAddress,
            sellOrderData.seller,
            staticTargetAddress,
            sellOrderData.maximumFill,
            sellOrderData.listingTime,
            sellOrderData.expirationTime,
            sellOrderData.salt,
            erc721Address,
            unitsData.registry,
            unitsData.maker,
            unitsData.staticTarget,
            unitsData.maximumFill,
            unitsData.listingTime,
            unitsData.expirationTime,
            unitsData.salt,
            erc20Address,
          ];
          const staticSelector = [
            web3.eth.abi.encodeFunctionSignature(
              "ERC721ForERC20(bytes,address[7],uint8[2],uint256[6],bytes,bytes)"
            ),
            web3.eth.abi.encodeFunctionSignature(
              "ERC20ForERC721(bytes,address[7],uint8[2],uint256[6],bytes,bytes)"
            ),
          ];
          const firstExtradata = web3.eth.abi.encodeParameters(
            ["address[2]", "uint256[2]"],
            [
              [erc721Address, erc20Address],
              [erc721AddressToken, new BigNumber(sellToken).toString(10)],
            ]
          );
          const firstCalldata = sellContract.methods
            .transferFrom(
              sellOrderData.seller,
              that.account,
              erc721AddressToken
            )
            .encodeABI();
          const secondExtradata = unitsData.staticExtradata;
          const secondCalldata = buyContract.methods
            .transferFrom(
              that.account,
              sellOrderData.seller,
              new BigNumber(sellToken).toString(10)
            )
            .encodeABI();
          const howToCalls = [0, 0];
          const metadata =
            "0x0000000000000000000000000000000000000000000000000000000000000000";
          const firstSignature = handledSignature(sellOrderData.orderSignature);
          const secondSignature = handledSignature(signature);
          console.log(
            units,
            staticSelector,
            firstExtradata,
            firstCalldata,
            secondExtradata,
            secondCalldata,
            howToCalls,
            metadata,
            firstSignature,
            secondSignature
          );
          const exchange_ABI = exchangeABI;
          const buySendContract = new web3.eth.Contract(
            exchange_ABI,
            exchangeAddress
          );
          let buyResult;
          //整理noticy接口数据
          let noticyData = {
            blockNum: "",
            transactionHash: "", //链ID
          };
          try {
            buyResult = await buySendContract.methods
              .atomicMatch_(
                units,
                staticSelector,
                firstExtradata,
                firstCalldata,
                secondExtradata,
                secondCalldata,
                howToCalls,
                metadata,
                firstSignature,
                secondSignature
              )
              .send(
                {
                  from: that.account,
                },
                function (error, transactionHash) {
                  console.log(transactionHash);
                }
              )
              .then(function (receipt) {
                // 当这个 receipt 对象来自于 "contract.deploy({...}).send()" 这么个调用时，它也可以是一个新合约实例
                console.log(receipt);
                noticyData.blockNum = receipt.blockNumber;
                noticyData.transactionHash = receipt.transactionHash;
              });
            console.log(buyResult);
          } catch (error) {
            console.log(error);
            store.commit("setBuyProcessShow", false);
            that.notifyTransaction("warning", 3000, false, error.message);
            return reject(error);
          }
          store.commit("setBuyProcessShow", false);
          resolve(noticyData);
        }
      );
    });
  },
  //sell流程
  async sellFlow(msg) {
    store.commit("setSellSuccessShow", false);
    store.commit("setSellApproveShow", true);
    const sellPrice = msg.price;
    const sellExpirationTime = Number(
      msg.expirationTime.toString().substring(0, 10)
    );
    //查询是否有代理地址
    const queryRegisterProxyAbi = registerProxyAddressABI;
    const web3 = window.web3;
    const registryContract = new web3.eth.Contract(
      queryRegisterProxyAbi,
      registryAddress
    );
    const queryProxyAddress = await registryContract.methods
      .proxies(this.account)
      .call();
    console.log("proxyAddr:" + queryProxyAddress);
    const nullAddr = "0x0000000000000000000000000000000000000000";
    //有代理地址
    if (queryProxyAddress !== nullAddr) {
      proxyAddress = queryProxyAddress;
    }
    //注册代理地址
    if (queryProxyAddress === nullAddr) {
      const createProxyAddress = await registryContract.methods
        .registerProxy()
        .send({
          from: this.account,
        });
      if (createProxyAddress.status === true) {
        proxyAddress = createProxyAddress.events[0].address;
      } else {
        this.notifyTransaction(
          "warning",
          3000,
          false,
          "createProxyAddress error"
        );
        store.commit("setSellApproveShow", false);
        return;
      }
    }
    //查询代理地址是否授权 挂单
    const queryAccreditAbi = sellContractABI;
    const accreditContract = new web3.eth.Contract(
      queryAccreditAbi,
      erc721Address
    );
    const queryAccreditAddress = await accreditContract.methods
      .getApproved(erc721AddressToken)
      .call(); //nft id
    console.log("accreditAddr:" + queryAccreditAddress);
    //判断返回地址和代理地址一致
    if (queryAccreditAddress !== proxyAddress) {
      const accreditAddress = await accreditContract.methods
        .approve(proxyAddress, erc721AddressToken) //地址要改成公共变量 查询出来的代理地址
        .send({
          from: this.account,
        });
      console.log(accreditAddress);
      if (accreditAddress.status !== true) {
        this.notifyTransaction(
          "warning",
          3000,
          false,
          "accreditProxyAddress error"
        );
        store.commit("setSellApproveShow", false);
        return;
      }
    }
    //出售
    //1.整理签名数据
    let templateData = {
      registry: registryAddress, //合约地址
      maker: "", //用户地址
      staticTarget: staticTargetAddress, //固定地址
      staticSelector: "",
      staticExtradata: "",
      maximumFill: 1,
      listingTime: Number(Date.parse(new Date()).toString().substring(0, 10)),
      expirationTime: sellExpirationTime, //订单过期时间
      salt: Math.floor(Math.random() * 1000).toString(), //盐
    };
    templateData.maker = this.account;
    templateData.staticSelector = web3.eth.abi.encodeFunctionSignature(
      "ERC721ForERC20(bytes,address[7],uint8[2],uint256[6],bytes,bytes)"
    );
    templateData.staticExtradata = web3.eth.abi.encodeParameters(
      ["address[2]", "uint256[2]"],
      [
        [erc721Address, erc20Address],
        [
          erc721AddressToken,
          new BigNumber(sellPrice * 10 ** this.decimals).toString(10),
        ],
      ]
      // [
      //     [erc721.address, erc20.address],
      //     [tokenId, sellingPrice],
      // ]
      //nft地址 代币地址
    );
    const handledData = structToSign(
      templateData,
      exchangeAddress //固定地址
    );
    console.log(handledData);
    let datas = JSON.stringify({
      types: { Order: handledData.fields, EIP712Domain: eip712Domain.fields },
      primaryType: handledData.name,
      domain: handledData.domain,
      message: handledData.data,
    });
    localStorage.setItem("sellMessage", JSON.stringify(handledData.data));
    return new Promise((resolve, reject) => {
      let that = this;
      let msgParams = datas;
      let from = this.account;
      let params = [from, msgParams];
      let method = "eth_signTypedData_v4";
      console.log("msgParams===============", JSON.parse(msgParams));
      web3.currentProvider.sendAsync(
        {
          method,
          params,
          from: from, // 地址
        },
        function (err, result) {
          if (err) {
            console.log("err", err);
            that.notifyTransaction("warning", 3000, false, err.message);
            store.commit("setSellApproveShow", false);
            reject(err);
          }
          if (result.error) return console.error("ERROR", result);
          store.commit("setSellApproveShow", false);
          console.log("signData:" + JSON.stringify(result.result));
          store.commit("setSellSuccessShow", true);
          let signData = result.result;
          localStorage.setItem("sellSignature", signData);
          //整理sell接口数据
          const sellData = {
            appId: "dex", //应用ID
            userId: "1", //用户ID
            seller: that.account, //卖家地址
            chainId: that.chainId, //链ID
            contractAddress: erc721Address, //合约地址
            tokenId: erc721AddressToken, //Token编号
            paymentToken: erc20Address, //支付TOKEN
            price: new BigNumber(sellPrice * 10 ** that.decimals).toString(10), //价格
            listingTime: templateData.listingTime, //挂单时间
            expirationTime: sellExpirationTime, //过期时间
            salt: templateData.salt, //盐
            orderSignature: signData, //订单签名
            timestamp: templateData.listingTime, //时间戳
            signature: "", //签名值
            orderType: 0,
            protocolType: 1,
            quantity: 1,
            maximumFill: 1,
          };
          resolve(sellData);
        }
      );
    });
  },
  // makeOffer流程
  async makeOfferFlow(offerData) {
    store.commit("setMakeOfferApproveShow", true);
    const offerPrice = offerData.price;
    const offerExpirationTime = Number(
      offerData.expirationTime.toString().substring(0, 10)
    );
    //查询是否有代理地址
    const queryRegisterProxyAbi = registerProxyAddressABI;
    const web3 = window.web3;
    const registryContract = new web3.eth.Contract(
      queryRegisterProxyAbi,
      registryAddress
    );
    const queryProxyAddress = await registryContract.methods
      .proxies(this.account)
      .call();
    console.log("proxyAddr:" + queryProxyAddress);
    const nullAddr = "0x0000000000000000000000000000000000000000";
    //有代理地址
    if (queryProxyAddress !== nullAddr) {
      console.log("queryProxyAddress !== nullAddr");
      proxyAddress = queryProxyAddress;
    }
    //注册代理地址
    if (queryProxyAddress === nullAddr) {
      const createProxyAddress = await registryContract.methods
        .registerProxy()
        .send({
          from: this.account,
        });
      console.log("registerProxy");
      if (createProxyAddress.status === true) {
        console.log("createProxyAddress：" + createProxyAddress);
        proxyAddress = createProxyAddress.events[0].address;
      } else {
        this.notifyTransaction(
          "warning",
          3000,
          false,
          "createProxyAddress error"
        );
        return;
      }
    }
    //查询代理地址（代币）是否授权 购买
    const queryAccreditAbi = buyContractABI;
    const queryAccreditAddress = new web3.eth.Contract(
      queryAccreditAbi,
      erc20Address
    );
    const queryAccreditTokenAccount = await queryAccreditAddress.methods
      .allowance(this.account, proxyAddress)
      .call(); //用户地址，注册地址/代理
    console.log("queryAccreditTokenAccount:" + queryAccreditTokenAccount);
    //授权代理地址（代币） 购买
    console.log("decimals:" + this.decimals);
    if (
      !queryAccreditTokenAccount ||
      Number(queryAccreditTokenAccount) <
      new BigNumber(offerPrice * 10 ** this.decimals).toString(10)
    ) {
      let accreditTokenAccount = await queryAccreditAddress.methods
        .approve(
          proxyAddress,
          new BigNumber(offerPrice * 10 ** this.decimals).toString(10)
        ) //代币数量根据卖家卖的数量
        .send({
          //注册地址(代理)，代币数量 //代币数字*18个0
          from: this.account,
        });
      console.log(accreditTokenAccount);
      if (accreditTokenAccount.status !== true) {
        this.notifyTransaction(
          "warning",
          3000,
          false,
          "accreditTokenAccount error"
        );
        store.commit("setBuyApproveShow", false);
        return;
      }
      // 购买NFT流程
      // this.signTypedData_v4(sellOrderData);
    } else {
      // 购买NFT流程
      // this.signTypedData_v4(sellOrderData);
    }
    //make offer
    //1.整理签名数据
    let templateData = {
      registry: registryAddress, //合约地址
      maker: "", //用户地址
      staticTarget: staticTargetAddress,
      staticSelector: "",
      staticExtradata: "",
      maximumFill: 1,
      listingTime: Number(Date.parse(new Date()).toString().substring(0, 10)),
      expirationTime: offerExpirationTime, //订单过期时间
      salt: Math.floor(Math.random() * 1000).toString(), //盐
    };
    templateData.maker = this.account;
    templateData.staticSelector = web3.eth.abi.encodeFunctionSignature(
      "ERC20ForERC721(bytes,address[7],uint8[2],uint256[6],bytes,bytes)"
    );
    templateData.staticExtradata = web3.eth.abi.encodeParameters(
      ["address[2]", "uint256[2]"],
      [
        [erc20Address, erc721Address],
        [
          erc721AddressToken,
          new BigNumber(offerPrice * 10 ** this.decimals).toString(10),
        ],
      ]
      // [
      //     [erc20.address,erc721.address],
      //     [tokenId, sellingPrice],
      // ]
      //代币地址 nft地址
    );
    const handledData = structToSign(templateData, exchangeAddress);
    let datas = JSON.stringify({
      types: { Order: handledData.fields, EIP712Domain: eip712Domain.fields },
      primaryType: handledData.name,
      domain: handledData.domain,
      message: handledData.data,
    });
    console.log(handledData);
    localStorage.setItem("makeOfferMessage", JSON.stringify(handledData.data));
    return new Promise((resolve, reject) => {
      let that = this;
      let msgParams = datas;
      let from = this.account;
      let params = [from, msgParams];
      let method = "eth_signTypedData_v4";
      console.log("msgParams===============", JSON.parse(msgParams));
      web3.currentProvider.sendAsync(
        {
          method,
          params,
          from: from, // 地址
        },
        function (err, result) {
          if (err) {
            console.log("err", err);
            store.commit("setMakeOfferApproveShow", false);
            that.notifyTransaction("warning", 3000, false, err.message);
            return reject(err);
          }
          if (result.error) return console.error("ERROR", result);
          console.log("signData:" + JSON.stringify(result.result));
          store.commit("setMakeOfferApproveShow", false);
          let signData = result.result;
          localStorage.setItem("sellSignature", signData);
          //整理makeOffer接口数据
          const offerData = {
            appId: "dex", //应用ID
            userId: "1", //用户ID
            buyer: that.account, //卖家地址
            chainId: that.chainId, //链ID
            contractAddress: erc721Address, //合约地址
            tokenId: erc721AddressToken, //Token编号
            paymentToken: erc20Address, //支付TOKEN
            price: new BigNumber(offerPrice * 10 ** that.decimals).toString(10), //价格
            listingTime: templateData.listingTime, //挂单时间
            expirationTime: templateData.expirationTime, //过期时间
            salt: templateData.salt, //盐
            orderSignature: signData, //订单签名
            timestamp: templateData.listingTime, //时间戳
            signature: "", //签名值
            orderType: 0,
            protocolType: 1,
            quantity: 1,
            maximumFill: 1,
          };
          resolve(offerData);
        }
      );
    });
  },
  //approveOrder流程
  async approveOfferFlow(offerData) {
    store.commit("setAcceptApproveShow", true);
    // 存放价格
    const sellPrice = offerData.price;
    //查询是否有代理地址
    const queryRegisterProxyAbi = registerProxyAddressABI;
    const web3 = window.web3;
    const registryContract = new web3.eth.Contract(
      queryRegisterProxyAbi,
      registryAddress
    );
    const queryProxyAddress = await registryContract.methods
      .proxies(this.account)
      .call();
    console.log("proxyAddr:" + queryProxyAddress);
    const nullAddr = "0x0000000000000000000000000000000000000000";
    //有代理地址
    if (queryProxyAddress !== nullAddr) {
      proxyAddress = queryProxyAddress;
    }
    //注册代理地址
    if (queryProxyAddress === nullAddr) {
      const createProxyAddress = await registryContract.methods
        .registerProxy()
        .send({
          from: this.account,
        });
      if (createProxyAddress.status === true) {
        proxyAddress = createProxyAddress.events[0].address;
      } else {
        store.commit("setAcceptApproveShow", false);
        this.notifyTransaction(
          "warning",
          3000,
          false,
          "createProxyAddress error"
        );
        return;
      }
    }
    //查询代理地址是否授权 挂单
    const queryAccreditAbi = sellContractABI;
    const accreditContract = new web3.eth.Contract(
      queryAccreditAbi,
      erc721Address
    );
    const queryAccreditAddress = await accreditContract.methods
      .getApproved(erc721AddressToken)
      .call(); //nft id
    console.log("accreditAddr:" + queryAccreditAddress);
    //判断返回地址和代理地址一致
    if (queryAccreditAddress !== proxyAddress) {
      const accreditAddress = await accreditContract.methods
        .approve(proxyAddress, erc721AddressToken) //地址要改成公共变量 查询出来的代理地址
        .send({
          from: this.account,
        });
      console.log(accreditAddress);
      if (accreditAddress.status !== true) {
        store.commit("setAcceptApproveShow", false);
        this.notifyTransaction(
          "warning",
          3000,
          false,
          "accreditProxyAddress error"
        );
        return;
      }
    }
    // 1.签名
    // approveNFT流程
    let templateData = {
      registry: registryAddress, //合约地址
      maker: "", //用户地址
      staticTarget: staticTargetAddress, //固定地址
      staticSelector: "",
      staticExtradata: "",
      maximumFill: 1,
      listingTime: Number(Date.parse(new Date()).toString().substring(0, 10)),
      expirationTime: 0, //订单过期时间
      salt: Math.floor(Math.random() * 1000).toString(), //盐
    };
    templateData.maker = this.account;
    templateData.staticSelector = web3.eth.abi.encodeFunctionSignature(
      "ERC721ForERC20(bytes,address[7],uint8[2],uint256[6],bytes,bytes)"
    );
    templateData.staticExtradata = web3.eth.abi.encodeParameters(
      ["address[2]", "uint256[2]"],
      [
        [erc721Address, erc20Address],
        [erc721AddressToken, new BigNumber(sellPrice).toString(10)],
      ]
      // [
      //     [erc721.address, erc20.address],
      //     [tokenId, sellingPrice],
      // ]
      //nft地址 代币地址
    );
    const handledData = structToSign(
      templateData,
      exchangeAddress //固定地址
    );
    console.log(handledData);
    let datas = JSON.stringify({
      types: { Order: handledData.fields, EIP712Domain: eip712Domain.fields },
      primaryType: handledData.name,
      domain: handledData.domain,
      message: handledData.data,
    });
    console.log(handledData);
    let that = this;
    return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync(
        {
          method: "eth_signTypedData_v4",
          params: [this.account, datas],
          from: this.account,
        },
        async function (err, result) {
          if (err) {
            console.log("err", err);
            that.notifyTransaction("warning", 3000, false, err.message);
            store.commit("setAcceptApproveShow", false);
            return reject(false);
          }
          if (result.error) {
            console.error("ERROR", result);
            return reject(false);
          }
          console.log("approve SIGNED:" + JSON.stringify(result.result));
          let signData = JSON.stringify(result.result);
          // that.callContract(handledData.data, result.result, sellOrderData);
          // 2.合约调用
          store.commit("setAcceptApproveShow", false);
          store.commit("setAcceptProcessShow", true);
          const unitsData = handledData.data;
          const signature = result.result;
          const web3 = window.web3;
          const sellABI = sellContractABI;
          const sellContract = new web3.eth.Contract(sellABI, erc721Address);
          const buyABI = buyContractABI;
          const buyContract = new web3.eth.Contract(buyABI, erc20Address);
          console.log(offerData);
          const units = [
            registryAddress,
            offerData.buyer,
            staticTargetAddress,
            offerData.maximumFill,
            offerData.listingTime,
            offerData.expirationTime,
            offerData.salt,
            erc20Address,
            unitsData.registry,
            unitsData.maker,
            unitsData.staticTarget,
            unitsData.maximumFill,
            unitsData.listingTime,
            unitsData.expirationTime,
            unitsData.salt,
            erc721Address,
          ];
          // const staticSelector = [
          //     web3.eth.abi.encodeFunctionSignature(
          //         'ERC721ForERC20(bytes,address[7],uint8[2],uint256[6],bytes,bytes)'
          //     ),
          //     web3.eth.abi.encodeFunctionSignature(
          //         'ERC20ForERC721(bytes,address[7],uint8[2],uint256[6],bytes,bytes)'
          //     ),
          // ];
          const staticSelector = [
            web3.eth.abi.encodeFunctionSignature(
              "ERC20ForERC721(bytes,address[7],uint8[2],uint256[6],bytes,bytes)"
            ),
            web3.eth.abi.encodeFunctionSignature(
              "ERC721ForERC20(bytes,address[7],uint8[2],uint256[6],bytes,bytes)"
            ),
          ];
          const firstExtradata = web3.eth.abi.encodeParameters(
            ["address[2]", "uint256[2]"],
            [
              [erc20Address, erc721Address],
              [erc721AddressToken, new BigNumber(sellPrice).toString(10)],
            ]
          );
          // const firstCalldata = sellContract.methods
          //     .transferFrom(offerData.buyer, that.account, erc721AddressToken)
          //     .encodeABI();
          const firstCalldata = buyContract.methods
            .transferFrom(
              offerData.buyer,
              that.account,
              new BigNumber(sellPrice).toString(10)
            )
            .encodeABI();
          const secondExtradata = unitsData.staticExtradata;
          // const secondCalldata = buyContract.methods
          //     .transferFrom(
          //         that.account,
          //         offerData.buyer,
          //         JSON.stringify(sellPrice * 10 ** this.decimals)
          //     )
          //     .encodeABI();
          const secondCalldata = sellContract.methods
            .transferFrom(that.account, offerData.buyer, erc721AddressToken)
            .encodeABI();
          const howToCalls = [0, 0];
          const metadata =
            "0x0000000000000000000000000000000000000000000000000000000000000000";
          const firstSignature = handledSignature(offerData.orderSignature);
          const secondSignature = handledSignature(signature);
          console.log(
            units,
            staticSelector,
            firstExtradata,
            firstCalldata,
            secondExtradata,
            secondCalldata,
            howToCalls,
            metadata,
            firstSignature,
            secondSignature
          );
          const exchange_ABI = exchangeABI;
          const buySendContract = new web3.eth.Contract(
            exchange_ABI,
            exchangeAddress
          );
          let buyResult;
          //整理noticy接口数据
          let noticyData = {
            blockNum: "",
            transactionHash: "", //链ID
          };
          try {
            buyResult = await buySendContract.methods
              .atomicMatch_(
                units,
                staticSelector,
                firstExtradata,
                firstCalldata,
                secondExtradata,
                secondCalldata,
                howToCalls,
                metadata,
                firstSignature,
                secondSignature
              )
              .send(
                {
                  from: that.account,
                },
                function (error, transactionHash) {
                  console.log(transactionHash);
                }
              )
              .then(function (receipt) {
                // 当这个 receipt 对象来自于 "contract.deploy({...}).send()" 这么个调用时，它也可以是一个新合约实例
                console.log(receipt);
                noticyData.blockNum = receipt.blockNumber;
                noticyData.transactionHash = receipt.transactionHash;
              });
            console.log(buyResult);
          } catch (error) {
            store.commit("setAcceptProcessShow", false);
            reject(error);
          }
          store.commit("setAcceptProcessShow", false);
          resolve(noticyData);
        }
      );
    });
  },
  //transfer流程
  async transferNftFlow(toAddress) {
    store.commit("setTransferProcessShow", true);
    const transferABI = sellContractABI;
    const transferContract = new web3.eth.Contract(transferABI, erc721Address);
    try {
      const transferRes = await transferContract.methods
        .transferFrom(this.account, toAddress, erc721AddressToken)
        .send({
          from: this.account,
        });
      console.log(transferRes);
      store.commit("setTransferProcessShow", false);
      return transferRes
    } catch (error) {
      console.log(error)
      store.commit("setTransferProcessShow", false);
      return
    }
  },
  //查询是否有代理地址
  async queryIfRegister() {
    let abi = registerProxyAddressABI;
    const web3 = window.web3;
    let Contract = new web3.eth.Contract(abi, registryAddress);
    let queryProxyAddress = await Contract.methods.proxies(this.account).call();
    console.log(queryProxyAddress);
    if (queryProxyAddress) {
      proxyAddress = queryProxyAddress;
    } else {
      this.register();
    }
  },
  async register() {
    let abi = registerProxyAddressABI;
    const web3 = window.web3;
    let Contract = new web3.eth.Contract(abi, registryAddress);
    let create = await Contract.methods.registerProxy().send({
      from: this.account,
    });
    console.log(create);
  },
  //查询代理地址是否授权 挂单
  async queryProxyAddress() {
    let abi = sellContractABI;
    const web3 = window.web3;
    let Contract = new web3.eth.Contract(abi, registryAddress);
    let approveAddress = await Contract.methods
      .getApproved(erc721AddressToken)
      .call(); //nft id
    console.log(approveAddress);
    //判断返回地址和代理地址一致
  },
  //挂单授权代理地址 挂单
  async approveProxyAddress() {
    let abi = sellContractABI;
    const web3 = window.web3;
    let Contract = new web3.eth.Contract(
      abi,
      "0xDC1308Dff2AB2Dd17B15F25149eB5B486eb42C22"
    );
    let approveAddress = await Contract.methods
      .approve("0xB5414DA16Fa083e373C1519100EF781034DB65f4", erc721AddressToken) //地址要改成公共变量 查询出来的代理地址
      .send({
        from: this.account,
      });
    console.log(approveAddress);
  },
  //查询代理地址（代币）是否授权 购买
  async queryTokenAddress() {
    let abi = buyContractABI;
    const web3 = window.web3;
    let Contract = new web3.eth.Contract(
      abi,
      "0xde62D2a2da8487e621293D80d4801e8da8cEeD72"
    );
    let approveAddress = await Contract.methods
      .allowance(this.account, "0x1361E46dd297a27e275DDc163e8222F78d4Af666")
      .call(); //用户地址，注册地址/代理
    console.log(approveAddress);
  },
  //授权代理地址（代币） 购买
  async approveTokenAddress() {
    let abi = buyContractABI;
    const web3 = window.web3;
    let Contract = new web3.eth.Contract(
      abi,
      "0xde62D2a2da8487e621293D80d4801e8da8cEeD72"
    );
    let approveAddress = await Contract.methods
      .approve("0x1361E46dd297a27e275DDc163e8222F78d4Af666", 1) //代币数量根据卖家卖的数量
      .send({
        //注册地址(代理)，代币数量 //代币数字*18个0
        from: this.account,
      });
    console.log(approveAddress);
  },
  async initAccount(accounts) {
    const web3 = window.web3;
    const cId = await web3.eth.net.getId();
    if (cId != chainID) {
      this.switchChainById(cId, false);
    } else {
      this.onWalletConnect(accounts[0]);
      localStorage.setItem("autoConnect", true);
      // await earnIndex.initUserInfo(false);
    }
  },
  notifyTransaction(type, time, show, message) {
    if (type == "warning") {
      Vue.prototype.$message({
        message: message || "Transaction Confirming",
        type: "warning",
        time: time || 5000,
        explorerShow: show || false,
      });
    } else if (type == "error") {
      Vue.prototype.$message({
        message: message || "Transaction Fail",
        type: "error",
        time: time || 5000,
        explorerShow: show || false,
      });
    } else {
      Vue.prototype.$message({
        message: message || "Transaction Successful",
        time: time || 5000,
        explorerShow: show || false,
      });
    }
  },
  onAccountsChanged() {
    const ethereum = window.ethereum;
    ethereum.on("accountsChanged", function (accounts) {
      console.log("accountsChanged=" + accounts[0]); //一旦切换账号这里就会执行
    });
  },
  getGasPrice() {
    const web3 = window.web3;
    web3.eth.getGasPrice().then((price) => {
      this.gasPrice = price;
    });
  },
  toIban(address) {
    const web3 = window.web3;
    return web3.eth.Iban.fromAddress(address);
  },
  toEthereumAddress(iban) {
    const web3 = window.web3;
    return web3.eth.Iban.toAddress(iban);
  },
  wei2Ether(num) {
    const web3 = window.web3;
    return web3.utils.fromWei(num.toString(), "ether");
  },
  wei2Gwei(num) {
    const web3 = window.web3;
    return web3.utils.fromWei(num, "gwei");
  },
  toSmallNum(num) {
    const web3 = window.web3;
    return Number(
      Number(web3.utils.fromWei(num.toString(), "ether")).toFixed(5)
    );
  },
  toBigNum(num) {
    const web3 = window.web3;
    console.log("toBigNum num=" + num);
    let result = web3.utils.toWei(num.toString(), "ether");
    return result;
  },
  toSqrtPriceX96(priceShow) {
    // priceShow = uint(sqrtPriceX96).mul(uint(sqrtPriceX96)) >> (96 * 2);
    let big96 = new BigNumber("79228162514264337593543950336");
    let sqrtPriceX96 = new BigNumber(priceShow)
      .sqrt()
      .multipliedBy(big96)
      .integerValue();
    return sqrtPriceX96;
  },
  //types:参数类型列表，如果函数有多个返回值，列表中类型的顺序应该符合定义的顺序
  //output: 解码前的数据
  //ignoreMethodHash：对函数返回值解码，ignoreMethodHash填写false，如果是对gettransactionbyid结果中的data字段解码时，ignoreMethodHash填写true
  async decodeParams(types, output, ignoreMethodHash) {
    if (!output || typeof output === "boolean") {
      ignoreMethodHash = output;
      output = types;
    }

    if (ignoreMethodHash && output.replace(/^0x/, "").length % 64 === 8)
      output = "0x" + output.replace(/^0x/, "").substring(8);

    const abiCoder = new AbiCoder();

    if (output.replace(/^0x/, "").length % 64)
      throw new Error(
        "The encoded string is not valid. Its length must be a multiple of 64."
      );
    return abiCoder.decode(types, output).reduce((obj, arg, index) => {
      if (types[index] == "address")
        arg = ADDRESS_PREFIX + arg.substr(2).toLowerCase();
      obj.push(arg);
      return obj;
    }, []);
  },
};
