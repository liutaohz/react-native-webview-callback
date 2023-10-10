//
import {useEffect} from 'react';
import {EventEmitter} from 'events';
export const eventEmiter = new EventEmitter();
export enum CallType {
  call = 'call', // 调用
  callBack = 'callBack', // 回调
}
declare global {
  interface Window {
    ReactNativeWebView: any
  }
}
export const defaultChannelName = 'ReactNativeWebView'; // 默认渠道名称

export interface MethodArgs {
  channelName?: string; // 渠道名称，默认'ReactNativeWebView'，一般都使用同一个渠道，不同业务或者应用可以使用不同的渠道名，避免通信污染
  methodType?: CallType; // 当前是调用还是响应调用即【回调】
  methodName: string; // 方法名称，用户自定义，一般是一个有意义并且唯一的字符串
  data?: any; // 传输的数据，any类型
}

export interface MethodCallArgs extends MethodArgs {
  timeStr: string; // 时间戳
  sourceMethodName: string; // 保留原始方法名
  successKey: string; // 成功回调的key值
  errorKey: string; // 失败回调的key值
}
// H5初始化监听
export const useH5AddListener = (bridgeH5Api: any) => {
  // 可以传进来一个meargeApi进来
  useEffect(() => {
    const messageFn = event => {
      try {
        let dataSource = event?.data;
        if (dataSource) {
          const messageData: MethodCallArgs = JSON.parse(dataSource);
          const {
            channelName,
            methodType,
            methodName,
            data,
            sourceMethodName,
            successKey,
            errorKey,
          } = messageData;
          if (channelName === defaultChannelName) {
            if (methodType === CallType.callBack) {
              // react native 回调到H5
              eventEmiter.emit(methodName, data);
              eventEmiter.off(successKey, () => {});
              eventEmiter.off(errorKey, () => {});
            } else if (methodType === CallType.call) {
              // react native 调用H5的方法
              if (
                bridgeH5Api.hasOwnProperty(sourceMethodName) &&
                typeof bridgeH5Api[sourceMethodName] === 'function'
              ) {
                bridgeH5Api[sourceMethodName](data)
                  .then((res: any) => {
                    const successObj = {
                      ...messageData,
                      data: res,
                      methodType: CallType.callBack,
                      methodName: successKey,
                    };
                    window?.ReactNativeWebView?.postMessage(
                      JSON.stringify(successObj),
                    );
                  })
                  .catch(err => {
                    const errObj = {
                      ...messageData,
                      data: err,
                      methodType: CallType.callBack,
                      methodName: errorKey,
                    };
                    window?.ReactNativeWebView?.postMessage(
                      JSON.stringify(errObj),
                    );
                  });
              }
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    };
    window?.addEventListener('message', messageFn, {
      capture: true,
      passive: true,
    });
    return () => {
      window?.removeEventListener('message', messageFn);
    };
  }, []);
};

export interface useReactNativeAddListenerArgs {
  bridgeReactNativeApi: any;
  webViewRef: any;
  event: any;
}
export const useReactNativeAddListener = (
  messageProps: useReactNativeAddListenerArgs,
) => {
  const {bridgeReactNativeApi, webViewRef, event} = messageProps;
  const dataSource = event?.nativeEvent?.data;
  try {
    const messageData: MethodCallArgs = JSON.parse(dataSource);
    const {
      channelName,
      methodType,
      methodName,
      data,
      sourceMethodName,
      successKey,
      errorKey,
    } = messageData;
    if (channelName === defaultChannelName) {
      if (methodType === CallType.callBack) {
        // H5 回调到react native
        eventEmiter.emit(methodName, data);
        eventEmiter.off(successKey, () => {});
        eventEmiter.off(errorKey, () => {});
      } else if (methodType === CallType.call) {
        // H5调用react native的方法
        if (
          bridgeReactNativeApi.hasOwnProperty(sourceMethodName) &&
          typeof bridgeReactNativeApi[sourceMethodName] === 'function'
        ) {
          bridgeReactNativeApi[sourceMethodName](data)
            .then((res: any) => {
              const successObj = {
                ...messageData,
                data: res,
                methodType: CallType.callBack,
                methodName: successKey,
              };
              webViewRef?.current?.postMessage(JSON.stringify(successObj), '*');
            })
            .catch(err => {
              const errObj = {
                ...messageData,
                data: err,
                methodType: CallType.callBack,
                methodName: errorKey,
              };
              webViewRef?.current?.postMessage(JSON.stringify(errObj), '*');
            });
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
};

// 统一封装H5调用react native 及回调返回，通过promise的方式
export const h5CallreactNative = (dataParms: MethodArgs) => {
  return new Promise((resolve, reject) => {
    const {
      channelName = defaultChannelName,
      methodType = CallType.call,
      methodName = 'methodName',
      data = '',
    } = dataParms;
    const timeStr = `${new Date().getTime()}`;
    const successKey = `${methodName}_${timeStr}_success`;
    const errorKey = `${methodName}_${timeStr}_error`;
    const obj: MethodCallArgs = {
      channelName,
      methodType,
      methodName,
      sourceMethodName: methodName,
      data,
      timeStr,
      successKey,
      errorKey,
    };
    // 挂载成功的回调
    eventEmiter.on(successKey, res => {
      resolve(res);
    });
    // 挂载失败的回调
    eventEmiter.on(errorKey, err => {
      reject(err);
    });
    window?.ReactNativeWebView?.postMessage(JSON.stringify(obj));
  });
};

export interface reactNativeCallH5Args {
  dataParms: MethodArgs;
  webViewRef: any;
}
// 统一封装react native调用H5及回调返回，通过promise的方式
export const reactNativeCallH5 = (
  reactNativeCallH5Props: reactNativeCallH5Args,
) => {
  const {dataParms, webViewRef} = reactNativeCallH5Props;
  return new Promise((resolve, reject) => {
    const {
      channelName = defaultChannelName,
      methodType = CallType.call,
      methodName = 'methodName',
      data = '',
    } = dataParms;
    const timeStr = `${new Date().getTime()}`;
    const successKey = `${methodName}_${timeStr}_success`;
    const errorKey = `${methodName}_${timeStr}_error`;
    const obj: MethodCallArgs = {
      channelName,
      methodType,
      methodName,
      sourceMethodName: methodName,
      data,
      timeStr,
      successKey,
      errorKey,
    };
    // 挂载成功的回调
    eventEmiter.on(successKey, res => {
      resolve(res);
    });
    // 挂载失败的回调
    eventEmiter.on(errorKey, err => {
      reject(err);
    });
    webViewRef?.current?.postMessage(JSON.stringify(obj), '*');
  });
};
