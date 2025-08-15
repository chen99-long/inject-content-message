// 定义事件通信函数
export function defineEventMessaging<T extends { [K in keyof T]: (...args: any[]) => any }>() {
  // 生成唯一ID
  const generateId = () => Math.random().toString(36).slice(2);

  // 发送事件
  function sendEvent<K extends keyof T>(
    name: K,
    ...args: Parameters<T[K]>
  ): Promise<any> {
    return new Promise((resolve) => {
      const callbackId = generateId();
      const callbackName = `${name as string}:callback:${callbackId}`;

      // 设置超时（5秒后返回 undefined）
      const timeoutId = setTimeout(() => {
        window.removeEventListener(callbackName, eventListener);
        resolve(undefined);
      }, 5000);

      // 监听回调
      const eventListener = ((event: CustomEvent<any>) => {
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
      
      // 处理回调
      if (data && typeof data === 'object' && data !== null && '_callbackId' in data) {
        const { _callbackId, data: actualData, ...rest } = data;

        // 如果有 data 字段，说明是通过 sendEventWithCallback 发送的
        const callbackData = actualData !== undefined ? actualData : rest;
        const result = callback(callbackData as any);

        // 发送回调结果
        window.dispatchEvent(new CustomEvent(`${name as string}:callback:${_callbackId}`, {
          detail: result
        }));
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