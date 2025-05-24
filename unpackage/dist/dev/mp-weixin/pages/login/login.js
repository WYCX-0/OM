"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_websocket = require("../../utils/websocket.js");
const utils_config = require("../../utils/config.js");
const _sfc_main = {
  data() {
    return {
      engineerNo: "",
      password: ""
    };
  },
  methods: {
    handleLogin() {
      if (!this.engineerNo || !this.password) {
        common_vendor.index.showToast({
          title: "请填写完整登录信息",
          icon: "none"
        });
        return;
      }
      common_vendor.index.request({
        url: `${utils_config.baseConfig.baseUrl}/engineer/login`,
        method: "POST",
        data: {
          engineerNo: this.engineerNo,
          password: this.password
        },
        success: (res) => {
          if (res.data.code === 200) {
            common_vendor.index.setStorageSync("userInfo", {
              id: res.data.data.id,
              name: res.data.data.name
            });
            common_vendor.index.setStorageSync("token", res.data.data.token);
            common_vendor.index.__f__("log", "at pages/login/login.vue:60", res.data.data.token);
            const wsURL = `${utils_config.baseConfig.wsBaseUrl}/ws/engineer/${res.data.data.id}`;
            utils_websocket.websocketObj.connect(wsURL, res.data.data.token);
            common_vendor.index.showToast({
              title: "登录成功",
              icon: "success"
            });
            common_vendor.index.reLaunch({
              url: "/pages/index/index"
            });
          } else {
            common_vendor.index.showToast({
              title: res.data.msg || "登录失败",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/login/login.vue:79", "登录请求失败", err);
          common_vendor.index.showToast({
            title: "网络错误，请稍后重试",
            icon: "none"
          });
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.engineerNo,
    b: common_vendor.o(($event) => $data.engineerNo = $event.detail.value),
    c: $data.password,
    d: common_vendor.o(($event) => $data.password = $event.detail.value),
    e: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
