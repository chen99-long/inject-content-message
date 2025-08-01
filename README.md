# Inject Content Message

一个简单易用的浏览器事件通信库，支持类型安全的事件发送和监听，以及异步回调。

## 特性

- 类型安全的事件通信
- 支持异步回调
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
  // 普通事件
  log: (message: string) => void;
  // 带回调的事件
  getData: (id: number) => Promise<{ id: number; value: string }>;
}

// 创建事件通信实例
const { sendEvent, listenEvent } = defineEventMessaging<ProtocolMap>();

// 监听事件
const unsubscribe = listenEvent('getData', async (id) => {
  const data = await fetchData(id);
  return data;
});

// 取消监听（防止内存泄漏）
unsubscribe();

// 发送普通事件
sendEvent('log', 'Hello World');

// 发送带回调的事件
const result = await sendEvent('getData', 123);
console.log(result); // { id: 123, value: 'some data' }
```

## API

### defineEventMessaging<T>()

创建一个事件通信实例，返回 `sendEvent` 和 `listenEvent` 方法。

### sendEvent<K extends keyof T>(name: K, ...args: Parameters<T[K]>)

发送一个事件。如果事件处理函数返回 Promise，则该方法也会返回一个 Promise。

### listenEvent<K extends keyof T>(name: K, callback: T[K])

监听一个事件，返回取消监听的函数。如果事件需要返回结果，处理函数可以返回一个值或 Promise。

**返回值**: 返回一个函数，调用该函数可以取消事件监听，防止内存泄漏。

**使用示例**:
```typescript
// 监听事件
const unsubscribe = listenEvent('getData', async (id) => {
  const data = await fetchData(id);
  return data;
});

// 取消监听（防止内存泄漏）
unsubscribe();
```

## License

MIT 