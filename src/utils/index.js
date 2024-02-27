function numMulti (num1, num2) {
  let baseNum = 0
  try {
    baseNum += num1.toString().split('.')[1].length
  } catch (e) {
  }
  try {
    baseNum += num2.toString().split('.')[1].length
  } catch (e) {
  }
  return Number(num1.toString().replace('.', '')) * Number(num2.toString().replace('.', '')) / Math.pow(10, baseNum)
};
export {
  numMulti
}
