# Inject Content Message

一个简单易用的浏览器事件通信库，支持类型安全的事件发送和监听，以及异步回调。

## 特性

- 类型安全的事件通信
- 支持异步回调
- 简单直观的 API
- 支持浏览器插件环境
- 支持普通网页环境

## 安装

### NPM 安装

```bash
npm install inject-content-message
```

### CDN 引入

你也可以通过 script 标签直接引入：

```html
<!-- 引入完整版本 -->
<script src="https://unpkg.com/inject-content-message@1.2.0/dist/index.umd.js"></script>

<!-- 或引入压缩版本 -->
<script src="https://unpkg.com/inject-content-message@1.2.0/dist/index.umd.min.js"></script>
```

## 使用方法

### ES 模块方式

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

### Script 标签方式

通过 script 标签引入后，库提供了两种使用方式：

#### 方式一：命名空间访问（推荐）

```html
<!DOCTYPE html>
<html>
<head>
    <script src="https://unpkg.com/inject-content-message@1.2.0/dist/index.umd.min.js"></script>
</head>
<body>
    <script>
        // 通过 InjectContentMessage 命名空间访问
        const { defineEventMessaging } = InjectContentMessage;

        // 创建事件通信实例
        const { sendEvent, listenEvent } = defineEventMessaging();

        // 使用方式与 ES 模块完全相同
        const unsubscribe = listenEvent('getData', async (id) => {
            return { id: id, value: `data for ${id}` };
        });

        sendEvent('getData', 123).then(result => {
            console.log(result); // { id: 123, value: 'data for 123' }
        });
    </script>
</body>
</html>
```

#### 方式二：直接从 window 访问

```html
<script src="https://unpkg.com/inject-content-message@1.2.0/dist/index.umd.min.js"></script>
<script>
    // defineEventMessaging 函数会自动挂载到 window 对象
    const { sendEvent, listenEvent } = defineEventMessaging();

    // 使用方式完全相同
    listenEvent('log', (message) => {
        console.log('收到消息:', message);
    });

    sendEvent('log', 'Hello World!');
</script>
```

## 构建版本

该库提供了多种构建版本以适应不同的使用场景：

- **ES Module** (`dist/index.esm.js`) - 用于现代打包工具（webpack、rollup、vite等）
- **CommonJS** (`dist/index.cjs.js`) - 用于 Node.js 环境
- **UMD** (`dist/index.umd.js`) - 用于浏览器 script 标签引入
- **UMD Minified** (`dist/index.umd.min.js`) - 压缩版本，适合生产环境

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