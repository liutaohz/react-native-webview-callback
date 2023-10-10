import baseH5Api from './baseH5Api';
import baseReactNativeApi from './baseReactNativeApi';
import {
  useH5AddListener,
  h5CallreactNative,
  useReactNativeAddListener,
  reactNativeCallH5,
} from './events';
// 合并基础方法，将合并的方法返回到应用端，用户方法监听调用
const mergeReactNativeApi = (userApi = {}) => {
  return {
    ...baseReactNativeApi,
    ...userApi, // 用户定义APP接口
  };
};
// 合并基础方法，将合并的方法返回到应用端，用户方法监听调用
const mergeH5Api = (userApi = {}) => {
  return {
    ...baseH5Api,
    ...userApi, // 用户定义H5接口
  };
};

export default {
  mergeH5Api,
  useH5AddListener, // 只需要在入口文件初始化一次。初始化，将合并后的API作为参数传进去
  h5CallreactNative, // 在任何页面都可以直接调用
  mergeReactNativeApi,
  useReactNativeAddListener, // react native 初始化
  reactNativeCallH5, // react native 调用H5接口
};
