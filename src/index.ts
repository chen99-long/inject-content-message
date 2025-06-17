// 定义事件通信函数
export function defineEventMessaging<T extends Record<string, (...args: any[]) => any>>() {
  // 生成唯一ID
  const generateId = () => Math.random().toString(36).slice(2);

  // 发送事件
  function sendEvent<K extends keyof T>(
    name: K,
    ...args: Parameters<T[K]>
  ): ReturnType<T[K]> extends Promise<any> ? Promise<Awaited<ReturnType<T[K]>>> : void {
    // 如果处理函数返回 Promise，则等待回调
    if (typeof args[0] === 'object' && args[0] !== null) {
      return new Promise((resolve) => {
        const callbackId = generateId();
        const callbackName = `${name as string}:callback:${callbackId}`;

        // 监听回调
        const eventListener = ((event: CustomEvent<Awaited<ReturnType<T[K]>>>) => {
          window.removeEventListener(callbackName, eventListener);
          resolve(event.detail);
        }) as EventListener;

        window.addEventListener(callbackName, eventListener);

        // 发送事件
        window.dispatchEvent(new CustomEvent(name as string, { 
          detail: {
            ...args[0],
            _callbackId: callbackId
          }
        }));
      }) as any;
    }

    // 普通事件直接发送
    window.dispatchEvent(new CustomEvent(name as string, { 
      detail: args[0] 
    }));
    return undefined as any;
  }

  // 监听事件
  function listenEvent<K extends keyof T>(
    name: K,
    callback: T[K]
  ) {
    const eventListener = ((event: CustomEvent<Parameters<T[K]>[0]>) => {
      const data = event.detail;
      
      // 处理回调
      if (data && '_callbackId' in data) {
        const { _callbackId, ...rest } = data;
        const result = callback(rest as any);
        
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