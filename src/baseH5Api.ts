// 测试React Native 自定义基础API
const echoH5Test = (res: any) => {
  return new Promise((resolve, reject) => {
    if (res === 'hello world H5') {
      resolve(res) // 成功
    } else {
      reject(res)  // 失败
    }
  })
};

export default {
  echoH5Test: echoH5Test,
}