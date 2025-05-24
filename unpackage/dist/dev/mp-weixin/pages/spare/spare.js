"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_config = require("../../utils/config.js");
const _sfc_main = {
  data() {
    return {
      form: {
        orderId: "",
        detail: ""
      }
    };
  },
  onLoad(options) {
    this.form.orderId = options.orderId;
  },
  methods: {
    async submitApplication() {
      if (!this.form.detail.trim()) {
        common_vendor.index.showToast({
          title: "请填写备件详情",
          icon: "none"
        });
        return;
      }
      const token = common_vendor.index.getStorageSync("token");
      const res = await common_vendor.index.request({
        url: `${utils_config.baseConfig.baseUrl}/engineer/spare/add`,
        method: "POST",
        header: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        data: {
          failId: this.form.orderId,
          detail: this.form.detail
        }
      });
      if (res.data.code === 200) {
        common_vendor.index.showToast({
          title: "申请提交成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } else {
        common_vendor.index.showToast({
          title: res.data.msg || "提交失败",
          icon: "none"
        });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.form.detail,
    b: common_vendor.o(($event) => $data.form.detail = $event.detail.value),
    c: common_vendor.o((...args) => $options.submitApplication && $options.submitApplication(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-bd81fea5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/spare/spare.js.map
