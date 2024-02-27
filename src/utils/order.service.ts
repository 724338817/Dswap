import { Injectable } from "@nestjs/common";
import { SellOrderManager } from "../Manager/sellOrder.manager";
import { BuyOrderManager } from "../Manager/buyOrder.manager";
import { SellOrder } from "../Model/sellOrder.model";
import { BuyOrder } from "../Model/buyOrder.model";
import { MathResult } from "../Common/ReqRspParam/matchResult";
import { TokenConstant } from "../Common/Constant/TokenConstant";
import Web3 from 'web3';
import ContractUtils from "../Common/Utils/ContractUtils";
import TestERC20 from './contract/artifacts/TestERC20.json';
import WyvernExchange from "./contract/artifacts/WyvernExchange.json";
import { ChainNameEnum } from "../Common/Enum";
import {wrap,ZERO_BYTES32} from "./contract/exchange";
import config from "../Config/index";
//import HDWalletProvider from '@truffle/hdwallet-provider';
//import fs from 'fs';
//const mnemonic = fs.readFileSync("../QJGJ8esRue1.csv").toString().trim();
//const provider = new HDWalletProvider(mnemonic, `https://kovan.infura.io/v3/9d39a211c9504ba1ad35a7d6f11fa99f`);

@Injectable()
export class OrderService {
  constructor(
    private readonly sellOrderManager: SellOrderManager,
    private readonly buyOrderManager: BuyOrderManager
  ) {}

  async matchMarketSell(targetSellAmount: bigint, sellOrder: SellOrder, buyOrder: BuyOrder) {
    var matchResult:  MathResult;
    var erc20Seller = ContractUtils.getEthersContract(TestERC20, TokenConstant.TP_ADDRESS);
    var erc20Buyer = ContractUtils.getEthersContract(TestERC20, TokenConstant.YD_ADDRESS);
    var exchange = wrap(ContractUtils.getEthersContract(WyvernExchange, config.WyvernExchange.polygon_test.contractAddress));
    var web3 = ContractUtils.caseWeb3Provider(ChainNameEnum.POLYGON_TEST);
    const limitSelector = web3.eth.abi.encodeFunctionSignature('anyERC20ForERC20Limit(bytes,address[7],uint8[2],uint256[6],bytes,bytes)');
    const marketSelector = web3.eth.abi.encodeFunctionSignature('anyERC20ForERC20Market(bytes,address[7],uint8[2],uint256[6],bytes,bytes)')
    const paramsOne = web3.eth.abi.encodeParameters(
      ['address[2]', 'uint256[2]'],
      [[erc20Seller.address, erc20Buyer.address], [0, sellOrder.sellPrice]]
      ) 
  
    const paramsTwo = web3.eth.abi.encodeParameters(
      ['address[2]', 'uint256[2]'],
      [[erc20Buyer.address, erc20Seller.address], [1, buyOrder.buyPrice]]
      )
    const one = {registry: config.WyvernRegistry.polygon_test.contractAddress, maker: sellOrder.seller, staticTarget: config.StaticMarket.polygon_test.contractAddress, staticSelector: marketSelector, staticExtradata: paramsOne, maximumFill: sellOrder.totalAmount, listingTime: '0', expirationTime: '0', salt: sellOrder.salt};
    const two = {registry: config.WyvernRegistry.polygon_test.contractAddress, maker: buyOrder.buyer, staticTarget: config.StaticMarket.polygon_test.contractAddress, staticSelector: limitSelector, staticExtradata: paramsTwo, maximumFill: buyOrder.totalCostAmount, listingTime: '0', expirationTime: '0', salt: buyOrder.salt};
    //先判断限价单（买单）的可用匹配额是否足够
    var targetExchangeAmount = targetSellAmount * buyOrder.buyPrice * BigInt(Math.pow(10, (TokenConstant.YD_DECIMAL-TokenConstant.TP_DECIMAL)));
    //如果限价单（买单）的可用匹配额不够
    if(targetExchangeAmount > buyOrder.totalCostAmount-buyOrder.hasCostAmount){
      //TODO:校验actualSellAmount>0
      var actualSellAmount = (buyOrder.totalCostAmount-buyOrder.hasCostAmount) * BigInt(Math.pow(10, (TokenConstant.TP_DECIMAL-TokenConstant.YD_DECIMAL))) / buyOrder.buyPrice;
      var actualBuyAmount = actualSellAmount * buyOrder.buyPrice * BigInt(Math.pow(10, (TokenConstant.YD_DECIMAL-TokenConstant.TP_DECIMAL)));
      const firstData = erc20Seller.methods.transferFrom(sellOrder.seller, buyOrder.buyer, actualSellAmount).encodeABI();
      const secondData = erc20Buyer.methods.transferFrom(buyOrder.buyer, sellOrder.seller, actualBuyAmount).encodeABI();
      const firstCall = {target: erc20Seller.address, howToCall: 0, data: firstData};
		  const secondCall = {target: erc20Buyer.address, howToCall: 0, data: secondData};
      var result = await exchange.atomicMatch(one, sellOrder.orderSignature, firstCall, two, buyOrder.orderSignature, secondCall, ZERO_BYTES32);
      matchResult.buyAmount = actualBuyAmount;
      matchResult.sellAmount = actualSellAmount;
      matchResult.limitOrderOver = true;
      matchResult.marketOrderOver = false;
      matchResult.price = buyOrder.buyPrice;
      //matchResult.succesful = result.
    }else{//如果足够
      const firstData = erc20Seller.methods.transferFrom(sellOrder.seller, buyOrder.buyer, targetSellAmount).encodeABI();
      const secondData = erc20Buyer.methods.transferFrom(buyOrder.buyer, sellOrder.seller, targetExchangeAmount).encodeABI();
      const firstCall = {target: erc20Seller.address, howToCall: 0, data: firstData};
		  const secondCall = {target: erc20Buyer.address, howToCall: 0, data: secondData};
      await exchange.atomicMatch(one, sellOrder.orderSignature, firstCall, two, buyOrder.orderSignature, secondCall, ZERO_BYTES32);
      matchResult.buyAmount = targetExchangeAmount;
      matchResult.sellAmount = targetSellAmount;
      matchResult.limitOrderOver = true;
      matchResult.marketOrderOver = false;
      matchResult.price = buyOrder.buyPrice;
    }
    console.log(matchResult);
    return matchResult;
  }

  async matchMarketBuy(targetBuyAmount: bigint, sellOrder: SellOrder, buyOrder: BuyOrder) {
    var matchResult:  MathResult;
    //TODO:检验targetBuyAmount在当前价格能不能够买最小份额的对手token
    var erc20Seller = ContractUtils.getEthersContract(TestERC20, TokenConstant.TP_ADDRESS);
    var erc20Buyer = ContractUtils.getEthersContract(TestERC20, TokenConstant.YD_ADDRESS);
    var exchange = wrap(ContractUtils.getEthersContract(WyvernExchange, config.WyvernExchange.polygon_test.contractAddress));
    var web3 = ContractUtils.caseWeb3Provider(ChainNameEnum.POLYGON_TEST);
    const limitSelector = web3.eth.abi.encodeFunctionSignature('anyERC20ForERC20Limit(bytes,address[7],uint8[2],uint256[6],bytes,bytes)');
    const marketSelector = web3.eth.abi.encodeFunctionSignature('anyERC20ForERC20Market(bytes,address[7],uint8[2],uint256[6],bytes,bytes)')
    const paramsOne = web3.eth.abi.encodeParameters(
      ['address[2]', 'uint256[2]'],
      [[erc20Seller.address, erc20Buyer.address], [1, sellOrder.sellPrice]]
      ) 
  
    const paramsTwo = web3.eth.abi.encodeParameters(
      ['address[2]', 'uint256[2]'],
      [[erc20Buyer.address, erc20Seller.address], [0, buyOrder.buyPrice]]
      )
    const one = {registry: config.WyvernRegistry.polygon_test.contractAddress, maker: sellOrder.seller, staticTarget: config.StaticMarket.polygon_test.contractAddress, staticSelector: limitSelector, staticExtradata: paramsOne, maximumFill: sellOrder.totalAmount, listingTime: '0', expirationTime: '0', salt: sellOrder.salt};
    const two = {registry: config.WyvernRegistry.polygon_test.contractAddress, maker: buyOrder.buyer, staticTarget: config.StaticMarket.polygon_test.contractAddress, staticSelector: marketSelector, staticExtradata: paramsTwo, maximumFill: buyOrder.totalCostAmount, listingTime: '0', expirationTime: '0', salt: buyOrder.salt};
    //先判断限价单（卖单）的可用匹配额是否足够
    var targetExchangeAmount = targetBuyAmount * BigInt(Math.pow(10, (TokenConstant.TP_DECIMAL-TokenConstant.YD_DECIMAL))) / sellOrder.sellPrice;
    //如果限价单（卖单）的可用匹配额不够
    if(targetExchangeAmount > sellOrder.totalAmount-sellOrder.hasAmount){
      //TODO:校验actualSellAmount>0
      var actualBuyAmount = (sellOrder.totalAmount-sellOrder.hasAmount) * buyOrder.buyPrice * BigInt(Math.pow(10, (TokenConstant.YD_DECIMAL-TokenConstant.TP_DECIMAL)));
      const firstData = erc20Seller.methods.transferFrom(sellOrder.seller, buyOrder.buyer, sellOrder.totalAmount-sellOrder.hasAmount).encodeABI();
      const secondData = erc20Buyer.methods.transferFrom(buyOrder.buyer, sellOrder.seller, actualBuyAmount).encodeABI();
      const firstCall = {target: erc20Seller.address, howToCall: 0, data: firstData};
		  const secondCall = {target: erc20Buyer.address, howToCall: 0, data: secondData};
      var result = await exchange.atomicMatch(one, sellOrder.orderSignature, firstCall, two, buyOrder.orderSignature, secondCall, ZERO_BYTES32);
      matchResult.buyAmount = actualBuyAmount;
      matchResult.sellAmount = sellOrder.totalAmount-sellOrder.hasAmount;
      matchResult.limitOrderOver = true;
      matchResult.marketOrderOver = false;
      matchResult.price = buyOrder.buyPrice;
      //matchResult.succesful = result.
    }else{//如果足够
      var actualSellAmount = targetBuyAmount * BigInt(Math.pow(10, (TokenConstant.TP_DECIMAL-TokenConstant.YD_DECIMAL))) / buyOrder.buyPrice;
      var actualBuyAmount = actualSellAmount * buyOrder.buyPrice * BigInt(Math.pow(10, (TokenConstant.YD_DECIMAL-TokenConstant.TP_DECIMAL)));
      const firstData = erc20Seller.methods.transferFrom(sellOrder.seller, buyOrder.buyer, actualSellAmount).encodeABI();
      const secondData = erc20Buyer.methods.transferFrom(buyOrder.buyer, sellOrder.seller, actualBuyAmount).encodeABI();
      const firstCall = {target: erc20Seller.address, howToCall: 0, data: firstData};
		  const secondCall = {target: erc20Buyer.address, howToCall: 0, data: secondData};
      await exchange.atomicMatch(one, sellOrder.orderSignature, firstCall, two, buyOrder.orderSignature, secondCall, ZERO_BYTES32);
      matchResult.buyAmount = actualBuyAmount;
      matchResult.sellAmount = actualSellAmount;
      matchResult.limitOrderOver = true;
      matchResult.marketOrderOver = false;
      matchResult.price = buyOrder.buyPrice;
    }
    console.log(matchResult);
    return matchResult;
  }

}
