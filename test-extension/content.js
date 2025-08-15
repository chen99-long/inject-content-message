// Content Script - 运行在隔离环境中
console.log('🔵 Content Script 已加载');

function defineEventMessaging(debug = false) {
    // 生成唯一ID
    const generateId = () => Math.random().toString(36).slice(2);
    // 调试日志函数
    const log = (message, ...args) => {
        if (debug) {
            console.log(`[EventMessaging] ${message}`, ...args);
        }
    };
    // 发送事件
    function sendEvent(name, ...args) {
        return new Promise((resolve) => {
            const callbackId = generateId();
            const callbackName = `${name}:callback:${callbackId}`;
            log(`发送事件: ${name}, callbackId: ${callbackId}`);
            // 设置超时（5秒后返回 undefined）
            const timeoutId = setTimeout(() => {
                log(`事件超时: ${name}, callbackId: ${callbackId}`);
                window.removeEventListener(callbackName, eventListener);
                resolve(undefined);
            }, 5000);
            // 监听回调
            const eventListener = ((event) => {
                log(`收到回调: ${callbackName}`, event.detail);
                clearTimeout(timeoutId);
                window.removeEventListener(callbackName, eventListener);
                resolve(event.detail);
            });
            window.addEventListener(callbackName, eventListener);
            // 发送事件，将数据包装并添加 _callbackId
            window.dispatchEvent(new CustomEvent(name, {
                detail: {
                    data: args[0],
                    _callbackId: callbackId
                }
            }));
        });
    }
    // 监听事件
    function listenEvent(name, callback) {
        const eventListener = ((event) => {
            const data = event.detail;
            log(`监听到事件: ${name}`, data);
            // 处理回调
            if (data && typeof data === 'object' && data !== null && '_callbackId' in data) {
                const { _callbackId, data: actualData, ...rest } = data;
                // 如果有 data 字段，说明是通过 sendEventWithCallback 发送的
                const callbackData = actualData !== undefined ? actualData : rest;
                const result = callback(callbackData);
                // 处理 Promise 结果
                Promise.resolve(result).then(resolvedResult => {
                    log(`发送回调: ${name}:callback:${_callbackId}`, resolvedResult);
                    window.dispatchEvent(new CustomEvent(`${name}:callback:${_callbackId}`, {
                        detail: resolvedResult
                    }));
                }).catch(error => {
                    log(`回调错误: ${name}:callback:${_callbackId}`, error);
                    window.dispatchEvent(new CustomEvent(`${name}:callback:${_callbackId}`, {
                        detail: undefined
                    }));
                });
            }
            else {
                callback(data);
            }
        });
        window.addEventListener(name, eventListener);
        return () => {
            window.removeEventListener(name, eventListener);
        };
    }
    return {
        sendEvent,
        listenEvent
    };
}


// 加载事件通信库到 Content Script 环境
const libScript = document.createElement('script');
libScript.src = chrome.runtime.getURL('index.umd.js');
libScript.onload = function() {
    console.log('📦 事件通信库已加载到 Content Script');
    
    // 初始化事件通信（启用调试模式）
    const { sendEvent, listenEvent } = defineEventMessaging(true);
    
    console.log('🎯 Content Script 已准备就绪');
    
    // 等待 inject script 准备就绪
    document.addEventListener('inject-ready', async () => {
        console.log('✅ Inject Script 已准备就绪，开始测试通信...');
        
        try {
            // 测试1: 发送字符串消息
            console.log('🚀 [CONTENT] 测试1: 发送字符串消息');
            const result1 = await sendEvent("fromContent", "Hello from Content Script!");
            console.log('✅ [CONTENT] 收到回调1:', result1);
            
            // 测试2: 请求数据
            console.log('🚀 [CONTENT] 测试2: 请求数据');
            const result2 = await sendEvent("getData", { id: 123 });
            console.log('✅ [CONTENT] 收到数据2:', result2);
            
            // 测试3: 发送复杂对象
            console.log('🚀 [CONTENT] 测试3: 发送复杂对象');
            const result3 = await sendEvent("fromContent", {
                type: "complex",
                data: { name: "test", values: [1, 2, 3] },
                timestamp: Date.now()
            });
            console.log('✅ [CONTENT] 收到回调3:', result3);
            
            console.log('🎉 [CONTENT] 所有测试完成！');
            
        } catch (error) {
            console.error('❌ [CONTENT] 测试失败:', error);
        }
    });
    
    // 5秒后如果还没收到 inject-ready 事件，手动开始测试
    setTimeout(async () => {
        console.log('⏰ [CONTENT] 超时，手动开始测试...');
        
        try {
            const result = await sendEvent("fromContent", "超时测试消息");
            console.log('✅ [CONTENT] 超时测试结果:', result);
        } catch (error) {
            console.error('❌ [CONTENT] 超时测试失败:', error);
        }
    }, 5000);
};

document.documentElement.appendChild(libScript);


// 注入 inject script
const script = document.createElement('script');
script.src = chrome.runtime.getURL('inject.js');
document.documentElement.appendChild(script);