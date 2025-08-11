import { defineEventMessaging } from './index';

// 导出给UMD使用
export { defineEventMessaging };

// 在浏览器环境下，同时挂载到 window 对象上以便直接使用
declare global {
  interface Window {
    defineEventMessaging: typeof defineEventMessaging;
  }
}

// 自动挂载到window对象
try {
  if (typeof window !== 'undefined') {
    (window as any).defineEventMessaging = defineEventMessaging;
  }
} catch (e) {
  // 静默处理错误
}
