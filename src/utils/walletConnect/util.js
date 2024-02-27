const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider('http://127.0.0.1:7545');
var web3 = new Web3(provider);
const ethUtils = require('ethereumjs-util');
const { eip712Domain, structHash, signHash } = require('./eip712.js');

const accountsParaDev = {
    '0x5eE4a8e12dB5104E590fca5930369FF664f6ed1E':
        '0xf71509aa023b9923b0a722df5de4ac4e0426de0b01d1c318cdafd8a52084007d',
    '0x11e49Cbe4925213e6D0315A7145a90E5Bc00D239':
        '0x8dcef7abc86fc0ff35d4ca6b1ddd50bf580046d14a4c2d960e7b5faf6cc5bd19',
    '0x4A61e5b052A816D9991636320c78Bc6DFD17d9D3':
        '0x961cc03c01fe5bd7db30e1909cd30f5919b39bcaf0a99b858ead610436bdba99',
    '0x68133CB8BEd343f4bB1e50d7441269063e7eb732':
        '0xeb193c798f1cca42e8f3fc3fde59a2f426d76a507b2cfccce637c1f59f62a211',
    '0x35CC12a8A037018D1daf25211c0bE64988e55Ece':
        '0xaf77c124bb971e5dd2f15946f80ec0c4cb9a8db8d1e5eda3909cd946e6c3fe1d',
    '0x64b82E35cce16F3d3BfAf593b476aC8e203672C2':
        '0x76b87e4655cce7c9fedfda620753d4d22084d365d7f5d8d088df0794991ff92d',
    '0xB8081793bD29ea8e94C4215a9faa90D2BfB7E63D':
        '0xf2dec2a9217cfaea19661c6bf6f9d16b2759b9b3eb19b794342ab88a5bda0c91',
    '0x4fCe7BA251D6f3bFAa994A66B220981bA0430F4b':
        '0x8dd1eb9597145e70fecaa9fd41ac66e79b203b262cbf0983d1f91570c8fd83b3',
    '0x83461ce713D7d4b4ed70A646357F08f7ea52907b':
        '0x307ef8dbe75271de24d2be162f49dc4c9bb9511ef70d958e043d7204343c5d62',
    '0x5fFCa97001a28f467C8Ca0e389840DCb43c2bCe8':
        '0xd57d5c71aae75e004b9114dad87dff00c38942c473c0d6c4bbbf2eda9f1c453c',
};

const accountsParaGan = {
    '0x3941efAA01EEc273f9d049eCC33cde71883DA7F3':
        '0xc716fa29cbca2c2d94a4af6de85b771c54441b2f6bb672d1d15823feca748517',
    '0x581875FE58b4cED8Fa5C1655C7e4f56DB4c8c9ef':
        '0x45619214f9a4ea8078f3dea122943a6d8739899b61491e98d6c238274f860f1e',
    '0x9BA305919eb3905f844a1d0A478a874E5e1933D7':
        '0xe31e4a2713ad3befa83aee5b00e6a51d83686f461f1c2593dcb25284e3bb922d',
    '0xaD1d52902f78CF6768329c0ff60C9CB2B9650dFe':
        '0x65b8f79d5b5eb84a95a75ebe3dd0880025955944620dee3a0e8299c116d40fb4',
    '0x5f8Ab763E2C8159741eD277A908A376a0AaE6fe3':
        '0xc9c7f4797e96aa700916565b4f6c7b6a50e67bf6944082f76593bf2e7e85acd2',
    '0x9806a2DB6487F4b7fC7ad88f624A2Fd2e2C125C4':
        '0xf371fe200cded072355269754e7c0bcae6a699884eb04c2b2594abbf27630710',
    '0x0FB637f201912F68572E842f025dAF879129E738':
        '0x411d35289343dd887956c85ff9858dc967e0aa826e58d503c819409c62acd27a',
    '0x31A94f009b46f020622dA9d4af82b0FA702973Fb':
        '0x92c30738a40ce229e29512b0f98b243ef2ecbaee5b90982235b59ee097ed3acc',
    '0xfe5bF3EdDef172d1416aC2532c30C5996F5dd68f':
        '0xab3311c05296a524011061d44690ab1c84ec2164f457a1d0bfcda0905d11403e',
    '0x3670B18E21e08c9119F8e820598634B774031935':
        '0xd518e07f2fe0f5fbabe4f5df912d89ce64df957677bf9475b13e2669bc72d7a3',
};

// Truffle does not expose chai so it is impossible to add chai-as-promised.
// This is a simple replacement function.
// https://github.com/trufflesuite/truffle/issues/2090
const assertIsRejected = (promise, error_match, message) => {
    let passed = false;
    return promise
        .then(() => {
            passed = true;
            return assert.fail();
        })
        .catch(error => {
            if (passed) return assert.fail(message || 'Expected promise to be rejected');
            if (error_match) {
                if (typeof error_match === 'string')
                    return assert.equal(error_match, error.message, message);
                if (error_match instanceof RegExp)
                    return (
                        error.message.match(error_match) ||
                        assert.fail(
                            error.message,
                            error_match.toString(),
                            `'${
                                error.message
                            }' does not match ${error_match.toString()}: ${message}`
                        )
                    );
                return assert.instanceOf(error, error_match, message);
            }
        });
};

const increaseTime = seconds => {
    return new Promise(resolve =>
        web3.currentProvider.send(
            {
                jsonrpc: '2.0',
                method: 'evm_increaseTime',
                params: [seconds],
                id: 0,
            },
            resolve
        )
    );
};

const eip712Order = {
    name: 'Order',
    fields: [
        { name: 'registry', type: 'address' },
        { name: 'maker', type: 'address' },
        { name: 'staticTarget', type: 'address' },
        { name: 'staticSelector', type: 'bytes4' },
        { name: 'staticExtradata', type: 'bytes' },
        { name: 'maximumFill', type: 'uint256' },
        { name: 'listingTime', type: 'uint256' },
        { name: 'expirationTime', type: 'uint256' },
        { name: 'salt', type: 'uint256' },
    ],
};

web3 = web3.extend({
    methods: [
        {
            name: 'signTypedData',
            call: 'eth_signTypedData',
            params: 2,
            inputFormatter: [web3.extend.formatters.inputAddressFormatter, null],
        },
    ],
});

const hashOrder = order => {
    //return '0x' + structHash(eip712Order.name, eip712Order.fields, order).toString('hex')
    return ethUtils.bufferToHex(structHash(eip712Order.name, eip712Order.fields, order));
};

const structToSign = (order, exchange) => {
    return {
        name: eip712Order.name,
        fields: eip712Order.fields,
        domain: {
            name: 'Wyvern Exchange',
            version: '3.1',
            chainId: 80001,
            verifyingContract: exchange,
        },
        data: order,
    };
};

const hashToSign = (order, exchange) => {
    //return '0x' + signHash(structToSign(order, exchange)).toString('hex')
    return ethUtils.bufferToHex(signHash(structToSign(order, exchange)));
};

const parseSig = bytes => {
    bytes = bytes.substr(2);
    const r = '0x' + bytes.slice(0, 64);
    const s = '0x' + bytes.slice(64, 128);
    const v = parseInt('0x' + bytes.slice(128, 130), 16);
    return { v, r, s };
};

const wrap = inst => {
    var obj = {
        inst: inst,
        hashOrder: order =>
            inst.hashOrder_.call(
                order.registry,
                order.maker,
                order.staticTarget,
                order.staticSelector,
                order.staticExtradata,
                order.maximumFill,
                order.listingTime,
                order.expirationTime,
                order.salt
            ),
        hashToSign: order => {
            return inst.hashOrder_
                .call(
                    order.registry,
                    order.maker,
                    order.staticTarget,
                    order.staticSelector,
                    order.staticExtradata,
                    order.maximumFill,
                    order.listingTime,
                    order.expirationTime,
                    order.salt
                )
                .then(hash => {
                    return inst.hashToSign_.call(hash);
                });
        },
        validateOrderParameters: order =>
            inst.validateOrderParameters_.call(
                order.registry,
                order.maker,
                order.staticTarget,
                order.staticSelector,
                order.staticExtradata,
                order.maximumFill,
                order.listingTime,
                order.expirationTime,
                order.salt
            ),
        validateOrderAuthorization: (hash, maker, sig, misc) =>
            inst.validateOrderAuthorization_.call(
                hash,
                maker,
                web3.eth.abi.encodeParameters(
                    ['uint8', 'bytes32', 'bytes32'],
                    [sig.v, sig.r, sig.s]
                ) + (sig.suffix || ''),
                misc
            ),
        approveOrderHash: hash => inst.approveOrderHash_(hash),
        approveOrder: (order, inclusion, misc) =>
            inst.approveOrder_(
                order.registry,
                order.maker,
                order.staticTarget,
                order.staticSelector,
                order.staticExtradata,
                order.maximumFill,
                order.listingTime,
                order.expirationTime,
                order.salt,
                inclusion,
                misc
            ),
        setOrderFill: (order, fill) => inst.setOrderFill_(hashOrder(order), fill),
        atomicMatch: (order, sig, call, counterorder, countersig, countercall, metadata) =>
            inst.atomicMatch_(
                [
                    order.registry,
                    order.maker,
                    order.staticTarget,
                    order.maximumFill,
                    order.listingTime,
                    order.expirationTime,
                    order.salt,
                    call.target,
                    counterorder.registry,
                    counterorder.maker,
                    counterorder.staticTarget,
                    counterorder.maximumFill,
                    counterorder.listingTime,
                    counterorder.expirationTime,
                    counterorder.salt,
                    countercall.target,
                ],
                [order.staticSelector, counterorder.staticSelector],
                order.staticExtradata,
                call.data,
                counterorder.staticExtradata,
                countercall.data,
                [call.howToCall, countercall.howToCall],
                metadata,
                web3.eth.abi.encodeParameters(
                    ['uint8', 'bytes32', 'bytes32'],
                    [sig.v, sig.r, sig.s]
                ) + (sig.suffix || ''),
                web3.eth.abi.encodeParameters(
                    ['uint8', 'bytes32', 'bytes32'],
                    [countersig.v, countersig.r, countersig.s]
                ) + (countersig.suffix || '')
                /*
      web3.eth.abi.encodeParameters(['bytes', 'bytes'], [
        web3.eth.abi.encodeParameters(['uint8', 'bytes32', 'bytes32'], [sig.v, sig.r, sig.s]) + (sig.suffix || ''),
        web3.eth.abi.encodeParameters(['uint8', 'bytes32', 'bytes32'], [countersig.v, countersig.r, countersig.s]) + (countersig.suffix || '')
      ])
      */
            ),
        atomicMatchWith: (
            order,
            sig,
            call,
            counterorder,
            countersig,
            countercall,
            metadata,
            misc
        ) =>
            inst.atomicMatch_(
                [
                    order.registry,
                    order.maker,
                    order.staticTarget,
                    order.maximumFill,
                    order.listingTime,
                    order.expirationTime,
                    order.salt,
                    call.target,
                    counterorder.registry,
                    counterorder.maker,
                    counterorder.staticTarget,
                    counterorder.maximumFill,
                    counterorder.listingTime,
                    counterorder.expirationTime,
                    counterorder.salt,
                    countercall.target,
                ],
                [order.staticSelector, counterorder.staticSelector],
                order.staticExtradata,
                call.data,
                counterorder.staticExtradata,
                countercall.data,
                [call.howToCall, countercall.howToCall],
                metadata,
                web3.eth.abi.encodeParameters(
                    ['uint8', 'bytes32', 'bytes32'],
                    [sig.v, sig.r, sig.s]
                ) + (sig.suffix || ''),
                web3.eth.abi.encodeParameters(
                    ['uint8', 'bytes32', 'bytes32'],
                    [countersig.v, countersig.r, countersig.s]
                ) + (countersig.suffix || ''),
                /*
      web3.eth.abi.encodeParameters(['bytes', 'bytes'], [
        web3.eth.abi.encodeParameters(['uint8', 'bytes32', 'bytes32'], [sig.v, sig.r, sig.s]) + (sig.suffix || ''),
        web3.eth.abi.encodeParameters(['uint8', 'bytes32', 'bytes32'], [countersig.v, countersig.r, countersig.s]) + (countersig.suffix || '')
      ]),
      */
                misc
            ),
    };
    obj.sign = (order, account) => {
        /*
    const str = structToSign(order, inst.address)
    return web3.signTypedData(account, {
      types: {
        EIP712Domain: eip712Domain.fields,
        Order: eip712Order.fields
      },
      domain: str.domain,
      primaryType: 'Order',
      message: order
    }).then(sigBytes => {
      const sig = parseSig(sigBytes)
      return sig
    })
    */
        const calculatedHashToSign = signHash(structToSign(order, inst.address));
        //console.log("exchange:"+inst.address)
        //console.log("sign hash:"+ethUtils.bufferToHex(calculatedHashToSign))
        //这里的私钥注意改成对应账号的私钥
        //const privateKey = ethUtils.toBuffer(accountsParaDev[account])
        const privateKey = ethUtils.toBuffer(accountsParaGan[account]);
        return ethUtils.ecsign(calculatedHashToSign, privateKey);
    };
    obj.personalSign = (order, account) => {
        const calculatedHashToSign = hashToSign(order, inst.address);
        return web3.eth.sign(calculatedHashToSign, account).then(sigBytes => {
            let sig = parseSig(sigBytes);
            //sig.v += 27
            sig.suffix = '03'; // EthSign suffix like 0xProtocol
            return sig;
        });
    };
    return obj;
};

const randomUint = () => {
    return Math.floor(Math.random() * 1e10);
};

const handledSignature = bytes => {
    bytes = bytes.substr(3);
    const r = '0x' + bytes.slice(0, 64);
    const s = '0x' + bytes.slice(64, 128);
    const v = '0x' + bytes.slice(128, 130);
    return web3.eth.abi.encodeParameters(['uint8', 'bytes32', 'bytes32'], [v, r, s]);
};

const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
const ZERO_BYTES32 = '0x0000000000000000000000000000000000000000000000000000000000000000';
const NULL_SIG = { v: 27, r: ZERO_BYTES32, s: ZERO_BYTES32 };
const CHAIN_ID = 5777;

module.exports = {
    hashOrder,
    hashToSign,
    increaseTime,
    assertIsRejected,
    wrap,
    randomUint,
    structToSign,
    ZERO_ADDRESS,
    ZERO_BYTES32,
    NULL_SIG,
    CHAIN_ID,
    handledSignature,
};
