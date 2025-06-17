// 定义事件通信函数
export function defineEventMessaging<T extends Record<string, (...args: any[]) => any>>() {
  // 发送事件
  function sendEvent<K extends keyof T>(
    name: K,
    ...args: Parameters<T[K]>
  ) {
    window.dispatchEvent(new CustomEvent(name as string, { 
      detail: args[0] 
    }));
  }

  // 监听事件
  function listenEvent<K extends keyof T>(
    name: K,
    callback: T[K]
  ) {
    const eventListener = ((event: CustomEvent<Parameters<T[K]>[0]>) => {
      callback(event.detail);
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