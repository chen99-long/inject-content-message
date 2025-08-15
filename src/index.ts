// 定义事件通信函数
export function defineEventMessaging<T extends { [K in keyof T]: (...args: any[]) => any }>(debug: boolean = false) {
  // 生成唯一ID
  const generateId = () => Math.random().toString(36).slice(2);

  // 调试日志函数
  const log = (message: string, ...args: any[]) => {
    if (debug) {
      console.log(`[EventMessaging] ${message}`, ...args);
    }
  };

  // 发送事件
  function sendEvent<K extends keyof T>(
    name: K,
    ...args: Parameters<T[K]>
  ): Promise<any> {
    return new Promise((resolve) => {
      const callbackId = generateId();
      const callbackName = `${name as string}:callback:${callbackId}`;

      log(`发送事件: ${name as string}, callbackId: ${callbackId}`);

      // 设置超时（5秒后返回 undefined）
      const timeoutId = setTimeout(() => {
        log(`事件超时: ${name as string}, callbackId: ${callbackId}`);
        window.removeEventListener(callbackName, eventListener);
        resolve(undefined);
      }, 5000);

      // 监听回调
      const eventListener = ((event: CustomEvent<any>) => {
        log(`收到回调: ${callbackName}`, event.detail);
        clearTimeout(timeoutId);
        window.removeEventListener(callbackName, eventListener);
        resolve(event.detail);
      }) as EventListener;

      window.addEventListener(callbackName, eventListener);

      // 发送事件，将数据包装并添加 _callbackId
      window.dispatchEvent(new CustomEvent(name as string, {
        detail: {
          data: args[0],
          _callbackId: callbackId
        }
      }));
    });
  }

  // 监听事件
  function listenEvent<K extends keyof T>(
    name: K,
    callback: T[K]
  ) {
    const eventListener = ((event: CustomEvent<Parameters<T[K]>[0]>) => {
      const data = event.detail;
      log(`监听到事件: ${name as string}`, data);

      // 处理回调
      if (data && typeof data === 'object' && data !== null && '_callbackId' in data) {
        const { _callbackId, data: actualData, ...rest } = data;

        // 如果有 data 字段，说明是通过 sendEventWithCallback 发送的
        const callbackData = actualData !== undefined ? actualData : rest;
        const result = callback(callbackData as any);

        // 处理 Promise 结果
        Promise.resolve(result).then(resolvedResult => {
          log(`发送回调: ${name as string}:callback:${_callbackId}`, resolvedResult);
          window.dispatchEvent(new CustomEvent(`${name as string}:callback:${_callbackId}`, {
            detail: resolvedResult
          }));
        }).catch(error => {
          log(`回调错误: ${name as string}:callback:${_callbackId}`, error);
          window.dispatchEvent(new CustomEvent(`${name as string}:callback:${_callbackId}`, {
            detail: undefined
          }));
        });
      } else {
        callback(data);
      }
    }) as EventListener;

    window.addEventListener(name as string, eventListener);
    return () => {
      window.removeEventListener(name as string, eventListener);
    };
  }

  return {
    sendEvent,
    listenEvent
  };
}