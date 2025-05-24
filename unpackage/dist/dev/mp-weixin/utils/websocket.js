"use strict";
const common_vendor = require("../common/vendor.js");
let isSocketClose = false;
let reconnectCount = 60;
let heartbeatInterval = null;
let socketTask = null;
let againTimer = null;
let globalMessageHandler = null;
const websocketObj = {
  connect,
  close: stop,
  sendMsg,
  setMessageHandler: (handler) => {
    globalMessageHandler = handler;
  }
};
function connect(url, token = "") {
  if (socketTask && socketTask.readyState === 1)
    return;
  isSocketClose = false;
  if (socketTask) {
    stop();
  }
  socketTask = common_vendor.index.connectSocket({
    url,
    header: {
      "Authorization": `Bearer ${token}`
    },
    success: () => common_vendor.index.__f__("log", "at utils/websocket.js:45", "WebSocket 连接中..."),
    fail: (err) => common_vendor.index.__f__("error", "at utils/websocket.js:46", "连接失败:", err)
  });
  socketTask.onOpen(() => {
    common_vendor.index.__f__("log", "at utils/websocket.js:50", "WebSocket 已打开");
    startHeartbeat();
    common_vendor.index.$emit("websocket-connected");
  });
  socketTask.onMessage((res) => {
    common_vendor.index.__f__("log", "at utils/websocket.js:56", "收到消息:", res.data);
    if (globalMessageHandler) {
      globalMessageHandler(res.data);
    }
    common_vendor.index.showModal({
      title: "新消息",
      content: res.data,
      showCancel: false
    });
  });
  socketTask.onError((err) => {
    common_vendor.index.__f__("error", "at utils/websocket.js:69", "连接错误:", err);
    if (!isSocketClose)
      reconnect(url);
  });
  socketTask.onClose(() => {
    common_vendor.index.__f__("log", "at utils/websocket.js:74", "连接已关闭");
    if (!isSocketClose)
      reconnect(url);
  });
}
function startHeartbeat() {
  heartbeatInterval = setInterval(() => {
    sendMsg(JSON.stringify({
      type: "heartbeat"
    }));
  }, 6e4);
}
function sendMsg(msg) {
  if (socketTask && socketTask.readyState === 1) {
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
  if (reconnectCount <= 0)
    return;
  reconnectCount--;
  againTimer = setTimeout(() => {
    common_vendor.index.__f__("log", "at utils/websocket.js:110", "尝试重连...");
    connect(url);
  }, 5e3);
}
exports.websocketObj = websocketObj;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/websocket.js.map
