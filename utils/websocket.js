// utils/websocket.js

let isSocketClose = false;
let reconnectCount = 60;
let heartbeatInterval = null;
let socketTask = null;
let againTimer = null;

// 全局消息监听回调
let globalMessageHandler = null;

let currentConnectParams = {
	url: '',
	token: ''
};

export const websocketObj = {
	connect,
	close: stop,
	sendMsg,
	setMessageHandler: (handler) => {
		globalMessageHandler = handler;
	}
};

function connect(url, token = '') {
	if (socketTask && socketTask.readyState === 1) return; // 检查状态为 OPEN（1）

	isSocketClose = false;
	currentConnectParams = {
		url: '',
		token: ''
	};

	// 清理旧连接
	if (socketTask) {
		stop();
	}

	socketTask = uni.connectSocket({
		url: url,
		header: {
			'Authorization': `Bearer ${token}`
		},
		success: () => console.log("WebSocket 连接中..."),
		fail: (err) => console.error("连接失败:", err)
	});

	socketTask.onOpen(() => {
		console.log('WebSocket 已打开');
		startHeartbeat();
		uni.$emit('websocket-connected'); // 全局事件通知
	});

	socketTask.onMessage((res) => {
		console.log('收到消息:', res.data);
		if (globalMessageHandler) {
			globalMessageHandler(res.data);
		}
		// 触发全局弹窗
		uni.showModal({
			title: '新消息',
			content: res.data,
			showCancel: false
		});
	});

	socketTask.onError((err) => {
		console.error('连接错误:', err);
		if (!isSocketClose) reconnect(url);
	});

	socketTask.onClose(() => {
		console.log('连接已关闭');
		if (!isSocketClose) reconnect(url);
	});
}

function startHeartbeat() {
	heartbeatInterval = setInterval(() => {
		sendMsg(JSON.stringify({
			type: 'heartbeat'
		}));
	}, 60000);
}

function sendMsg(msg) {
	if (socketTask && socketTask.readyState === 1) { // 检查状态为 OPEN（1）
		socketTask.send({
			data: msg
		});
	}
}

function stop() {
	isSocketClose = true;
	clearInterval(heartbeatInterval);
	clearTimeout(againTimer);
	if (socketTask) {
		socketTask.close();
		socketTask = null;
	}
}

function reconnect(url) {
	if (reconnectCount <= 0) return;
	reconnectCount--;

	againTimer = setTimeout(() => {
		console.log('尝试重连...');
		connect(url);
	}, 5000);
}