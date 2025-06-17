# Inject Content Message

一个简单易用的浏览器事件通信库，支持类型安全的事件发送和监听。

## 特性

- 类型安全的事件通信
- 简单直观的 API
- 支持浏览器插件环境
- 支持普通网页环境

## 安装

```bash
npm install inject-content-message
```

## 使用方法

```typescript
import { defineEventMessaging } from 'inject-content-message';

// 定义事件协议
interface ProtocolMap {
  // 定义事件名称和对应的处理函数
  log: (message: string) => void;
  updateData: (data: { id: number; value: string }) => void;
}

// 创建事件通信实例
const { sendEvent, listenEvent } = defineEventMessaging<ProtocolMap>();

// 发送事件
sendEvent('log', 'Hello World');
sendEvent('updateData', { id: 1, value: 'test' });

// 监听事件
const unsubscribe = listenEvent('log', (message) => {
  console.log(message);
});

// 取消监听
unsubscribe();
```

## API

### defineEventMessaging<T>()

创建一个事件通信实例，返回 `sendEvent` 和 `listenEvent` 方法。

### sendEvent<K extends keyof T>(name: K, ...args: Parameters<T[K]>)

发送一个事件。

### listenEvent<K extends keyof T>(name: K, callback: T[K])

监听一个事件，返回取消监听的函数。

## License

MIT 