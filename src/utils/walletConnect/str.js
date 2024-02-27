// import ethImg from '@/assets/image/eth.svg'
// import usdtImg from '@/assets/image/usdc.svg'

var ethAddress = '0';

export default {
  usdtAddress: "0xfc1bdcD6F7dB7Bd8c797099245d6093E6A563AD4",
  hidden(str, frontLen, endLen) {
    var xing = "*****";
    return (
      str.substring(0, frontLen) + xing + str.substring(str.length - endLen)
    );
  },
  getTokenName(addr) {
    if (addr == this.usdtAddress) {
      return 'USDT'
    } else {
      return 'DOG';
    }
  },
  getTokenIcon(addr) {
    if (addr == this.usdtAddress) {
      return usdtImg
    } else {
      return ethImg;
    }
  },
  isEthAddr(addr) {
    return addr == ethAddress;
  },
  shortenAddressOrEns(address, length) {
    if (!length) {
      return "";
    }
    if (!address) {
      return address;
    }
    if (address.length < 10) {
      return address;
    }
    let left = address.includes(".") ? address.split(".")[1].length : Math.floor((length - 3) / 2) + 1;
    return address.substring(0, left) + "..." + address.substring(address.length - (length - (left + 3)), address.length);
  }
}
