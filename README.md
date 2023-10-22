# react-native-webview-callback

[![NPM version](https://img.shields.io/npm/v/react-native-webview-callback.svg?style=flat)](https://npmjs.org/package/react-native-webview-callback)
[![NPM downloads](http://img.shields.io/npm/dm/react-native-webview-callback.svg?style=flat)](https://npmjs.org/package/react-native-webview-callback)

A lightweight tool library for connecting React Native and webview, providing communication and success and failure callback methods

## Usage

### Import Dependency Package

```
npm install react-native-webview-callback

```

### Configure and use on H5 end

#### Define your own methods to provide for React Native calls

You can define your own event API and incorporate it during subsequent initialization. eg(myEvent.ts)

``` js
// Define your own methods to provide for React Native calls
const myH5Method = (res: any) => {
  return new Promise((resolve, reject) => {
    if (res === 'Simulation success conditions') { // Some business judgments
      resolve(res) // Successful callback
    } else {
      reject(res)  // Failed callback
    }
  })
};
// other methods

export default {
  myH5Method: myH5Method,
  // other methods
}
```

#### Initialize listening in the entry file

Initialize listening methods in the entry file

``` js
import { useH5AddListener, mergeH5Api } from 'react-native-webview-callback';
import myEvent from './myEvent.ts';

// useH5AddListener(mergeH5Api({}))  // For testing purposes only, such as echoH5Test
useH5AddListener(mergeH5Api(myEvent)) // Merge into custom methods on listening objects

```


#### Use and get callback

eg:
``` js
import { h5CallreactNative } from 'react-native-webview-callback';

const testPostMessage = () => {
  h5CallreactNative({
    methodName: "echoReactNativeTest", // Or other interface functions that you customize on the React Native end， eg:“myReactNativeMethod”
    data: "hello world react-native", // Object data can also be passed, and the specific parameter format depends on the defined interface parameters
  })
    .then((data) => {
      alert("Successful from React Native callback");
      console.log("Successful data:", data);
    })
    .catch((error) => {
      alert("Failed from React Native callback");
      console.error("Failed data:", error);
    });
};


```



### Configure and use on the React Native end

#### Define your own methods to provide for H5 calls

You can define your own event API and incorporate it during subsequent initialization. eg(myEvent.ts)

``` js
// Define your own methods to provide for React Native calls
const myReactNativeMethod = (res: any) => {
  return new Promise((resolve, reject) => {
    if (res === 'Simulation success conditions') { // Some business judgments
      resolve(res) // Successful callback
    } else {
      reject(res)  // Failed callback
    }
  })
};
// other methods

export default {
  myReactNativeMethod: myReactNativeMethod,
  // other methods
}
```


#### Initialize listening in the entry file & Use and get callback

``` js
import React, {useRef} from 'react';
import {WebView} from 'react-native-webview';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { umergeReactNativeApi, useReactNativeAddListener } from 'react-native-webview-callback';
import myEvent from './myEvent.ts';

function App(): JSX.Element {
  const webViewRef = useRef(null);
  const onMessage = (event: any) => {
    //  Initialize listening in the entry file
    useReactNativeAddListener({
      bridgeReactNativeApi: mergeReactNativeApi(myEvent), // Merge into custom methods on listening objects
      webViewRef,
      event,
    });
    const {data} = event.nativeEvent;

    try {
      const messageData = JSON.parse(data);
      if (messageData.data === 'hello world react-native') { // Simulate triggering an event here, and the React Native side calls the H5 method
        reactNativeCallH5({
          dataParms: {
            methodName: 'echoH5Test', //
            data: 'hello world H5',
          },
          webViewRef: webViewRef,
        })
          .then(data => {
            alert('Successful from H5 callback');
            console.log('Successful data:', data);
          })
          .catch(error => {
            alert('Failed from H5 callback');
          });
      }
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <SafeAreaView style={styles.safeAreaView}>
      <WebView
        ref={webViewRef}
        source={{
          uri: `XXXX`, // Your H5 link

        }}
        originWhitelist={['*']}
        style={styles.webView}
        onMessage={onMessage}
        // ...
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    flex: 1,
    height: '100%',
  },
  webView: {
    flex: 1,
    height: '100%',
  },
});

export default App;

```

## examples
You can take a look at the usage examples in [react-native-webview-callback-demo](https://github.com/liutaohz/react-native-webview-callback-demo) soon。

## Development

```bash
# install dependencies
$ yarn install

# develop library by docs demo
$ yarn start

# build library source code
$ yarn run build

```

## LICENSE

MIT

Copyright (c) 2023 liutao
