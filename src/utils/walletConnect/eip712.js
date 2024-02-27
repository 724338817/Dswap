// simplified from https://github.com/ethereum/EIPs/blob/master/assets/eip-712/Example.js

const web3 = require('web3')
const abi = require('ethereumjs-abi')
const ethUtils = require('ethereumjs-util')

function encodeType (name, fields) {
  let result = `${name}(${fields.map(({ name, type }) => `${type} ${name}`).join(',')})`
  return result
}

function typeHash (name, fields) {
  //return web3.utils.sha3(encodeType(name, fields))
  //let value = ethUtils.keccakFromString(encodeType(name, fields), 256)
  return ethUtils.keccakFromString(encodeType(name, fields), 256)
}

function encodeData (name, fields, data) {
  let encTypes = []
  let encValues = []

  // Add typehash
  encTypes.push('bytes32')
  encValues.push(typeHash(name, fields))

  // Add field contents
  for (let field of fields) {
    let value = data[field.name]
    if (field.type === 'string') {
      encTypes.push('bytes32')
      //value = ethUtils.sha3(value)
      value = ethUtils.keccakFromString(value, 256)
      encValues.push(value)
    //由于web3.eth.abi.encodeParameters的结果是以Ox开头的hex，所以这里必须用keccakFromHexString而不是keccakFromString，如果用keccakFromString，则得到的结果和合约keccak256()得到的结果不同
    //但是需要注意在这里，只有staticExtradata才是bytes类型，页只有它才接收web3.eth.abi.encodeParameters的结果。如果是普通的string类型，必须用keccakFromString
    } else if (field.type === 'bytes') {
      encTypes.push('bytes32')
      //value = ethUtils.sha3(value)
      value = ethUtils.keccakFromHexString(value, 256)
      encValues.push(value)
    } else {
      encTypes.push(field.type)
      encValues.push(value)
    }
  }

  return abi.rawEncode(encTypes, encValues)
}

function structHash (name, fields, data) {
  //return web3.utils.sha3(encodeData(name, fields, data))
  return ethUtils.keccak256(encodeData(name, fields, data));
}

const eip712Domain = {
  name: 'EIP712Domain',
  fields: [
    { name: 'name', type: 'string' },
    { name: 'version', type: 'string' },
    { name: 'chainId', type: 'uint256' },
    { name: 'verifyingContract', type: 'address' }
  ]
}

function signHash (typedData) {
  //return web3.utils.sha3(
  return ethUtils.keccak256(
    Buffer.concat([
      Buffer.from('1901', 'hex'),
      structHash(eip712Domain.name, eip712Domain.fields, typedData.domain),
      structHash(typedData.name, typedData.fields, typedData.data)
    ])
  )
}

module.exports = {
  structHash,
  signHash,
  eip712Domain
}
