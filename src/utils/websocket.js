class WebSocketService {
    constructor(url, token) {
        this.socket = null;
        this.url = url;
        this.token = token;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    connect() {
        const wsUrl = `${this.url}?token=${encodeURIComponent(this.token)}`;
        this.socket = new WebSocket(wsUrl);

        this.socket.onopen = () => {
            console.log('WebSocket连接已建立');
            this.reconnectAttempts = 0;
        };

        this.socket.onmessage = (event) => {
            const data = event.data;
            console.log('收到消息:', data);
            // 触发全局事件
            window.dispatchEvent(new CustomEvent('websocket-message', { detail: data }));
        };

        this.socket.onclose = () => {
            console.log('WebSocket连接关闭');
            this.reconnect();
        };

        this.socket.onerror = (error) => {
            console.error('WebSocket错误:', error);
        };
    }

    reconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
                this.reconnectAttempts++;
                console.log(`尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
                this.connect();
            }, 3000);
        }
    }

    close() {
        if (this.socket) {
            this.socket.close();
        }
    }
}

export default WebSocketService;
    