// Inject Script - 运行在页面主环境中
console.log('🟢 Inject Script 已加载');
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

// 加载事件通信库

    console.log('📦 事件通信库已加载到 Inject Script');
    
    // 初始化事件通信（启用调试模式）
    const { sendEvent, listenEvent } = defineEventMessaging(true);
    
    console.log('🎯 设置 Inject Script 监听器...');
    
    // 监听来自 Content Script 的消息
    listenEvent("fromContent", async (message) => {
        console.log('📨 [INJECT] 收到来自 Content Script 的消息:', message);
        
        // 在页面上显示收到的消息
        const div = document.createElement('div');
        div.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: #4CAF50;
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 10000;
            font-family: Arial, sans-serif;
            max-width: 300px;
        `;
        div.textContent = `Inject收到: ${JSON.stringify(message)}`;
        document.body.appendChild(div);
        
        // 3秒后移除
        setTimeout(() => div.remove(), 3000);
        
        // 返回回调
        return `Inject Script 回复: 已处理 ${JSON.stringify(message)}`;
    });
    
    // 监听数据请求
    listenEvent("getData", async (data) => {
        console.log('📨 [INJECT] 收到数据请求:', data);
        
        return {
            id: data.id,
            value: `来自 inject script 的数据 ${data.id}`,
            timestamp: Date.now(),
            url: window.location.href
        };
    });
    
    console.log('✅ [INJECT] 监听器设置完成');
    
    // 通知 Content Script 已准备就绪
    document.dispatchEvent(new CustomEvent('inject-ready'));


