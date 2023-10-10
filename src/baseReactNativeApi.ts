// 测试React Native 自定义基础API
const echoReactNativeTest = (res: any) => {
  return new Promise((resolve, reject) => {
    if (res === 'hello world react-native') {
      resolve(res) // 成功
    } else {
      reject(res)  // 失败
    }
  })
};

export default {
  echoReactNativeTest: echoReactNativeTest,
}