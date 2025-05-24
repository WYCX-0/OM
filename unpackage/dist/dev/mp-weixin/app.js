"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const utils_websocket = require("./utils/websocket.js");
if (!Math) {
  "./pages/login/login.js";
  "./pages/index/index.js";
  "./pages/fail/fail.js";
  "./pages/testOrder/testOrder.js";
  "./pages/spare/spare.js";
  "./pages/rtestOrder/rtestOrder.js";
  "./pages/baoyangOrder/baoyangOrder.js";
}
const _sfc_main = {
  onLaunch() {
    utils_websocket.websocketObj.setMessageHandler(this.handleGlobalMessage);
  },
  methods: {
    // 修正方法定义语法
    handleGlobalMessage(data) {
      if (data && data.message) {
        common_vendor.index.showModal({
          title: "系统通知",
          content: data.message,
          showCancel: false
        });
      }
    }
  },
  onShow() {
    common_vendor.index.__f__("log", "at App.vue:27", "App Show");
  },
  onHide() {
    common_vendor.index.__f__("log", "at App.vue:31", "App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
