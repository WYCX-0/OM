"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_config = require("../../utils/config.js");
const _sfc_main = {
  data() {
    return {
      detailData: {
        id: "",
        deviceId: "",
        detail: "",
        createTime: "",
        beforeUrl: "",
        status: 0
      },
      repairImageUrl: "",
      finishUrl: "",
      deviceName: "",
      deviceOptions: [],
      token: ""
      // 请确保在实际使用中正确获取和存储 token
    };
  },
  onLoad(options) {
    if (options.detailData) {
      try {
        this.getAccessToken();
        this.detailData = JSON.parse(decodeURIComponent(options.detailData));
        this.getDeviceOptions();
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/fail/fail.vue:119", "解析详情数据失败", e);
        common_vendor.index.showToast({
          title: "数据加载失败",
          icon: "none"
        });
      }
    }
  },
  computed: {
    processedBeforeUrl() {
      if (this.detailData.beforeUrl) {
        return `${utils_config.baseConfig.baseUrl}${this.detailData.beforeUrl}`;
      }
      return this.defaultImageUrl;
    }
  },
  methods: {
    applySpare() {
      common_vendor.index.navigateTo({
        url: `/pages/spare/spare?orderId=${this.detailData.id}`
      });
    },
    formatBasicDate(dateArray) {
      if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 6)
        return "--";
      try {
        const [year, month, day, hours, minutes, seconds] = dateArray;
        const padZero = (num) => String(num).padStart(2, "0");
        const date = new Date(year, month - 1, day, hours, minutes, seconds);
        if (isNaN(date.getTime()))
          return "--";
        return `${year}-${padZero(month)}-${padZero(day)} ${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/fail/fail.vue:159", "日期格式化失败:", e);
        return "--";
      }
    },
    startProcessing() {
      common_vendor.index.showModal({
        title: "确认处理",
        content: "确定要开始处理该设备问题吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.request({
              url: `${utils_config.baseConfig.baseUrl}/engineer/fail/deal/${this.detailData.id}`,
              // 替换为实际的后端 API 地址
              method: "POST",
              header: {
                "Authorization": `Bearer ${this.token}`
                // ✅ 使用存储的 token
              },
              success: (response) => {
                if (response.data.code === 200) {
                  this.updateStatus(2);
                  common_vendor.index.showToast({
                    title: "开始处理",
                    icon: "success"
                  });
                } else {
                  common_vendor.index.showToast({
                    title: "您有正在处理中的工单",
                    icon: "none"
                  });
                }
              },
              fail: () => {
                common_vendor.index.showToast({
                  title: "请求失败",
                  icon: "none"
                });
              }
            });
          }
        }
      });
    },
    chooseImage() {
      common_vendor.index.chooseImage({
        count: 1,
        sizeType: ["original", "compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          this.repairImageUrl = res.tempFilePaths[0];
          common_vendor.index.uploadFile({
            url: `${utils_config.baseConfig.baseUrl}/upload`,
            filePath: res.tempFilePaths[0],
            // 注意这里用 filePath 不是 src
            name: "file",
            // 必须与后端接收参数名一致
            header: {
              "Authorization": `Bearer ${this.token}`,
              "Content-Type": "multipart/form-data"
              // 明确指定内容类型
            },
            success: (uploadRes) => {
              try {
                const data = JSON.parse(uploadRes.data);
                if (data.code === 200) {
                  this.finishUrl = data.data;
                } else {
                  common_vendor.index.showToast({
                    title: "上传失败: " + data.msg,
                    icon: "none"
                  });
                }
              } catch (e) {
                common_vendor.index.__f__("error", "at pages/fail/fail.vue:232", "解析响应失败", e);
                common_vendor.index.showToast({
                  title: "上传结果解析失败",
                  icon: "none"
                });
              }
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/fail/fail.vue:240", "上传失败", err);
              common_vendor.index.showToast({
                title: `上传失败: ${err.errMsg}`,
                icon: "none"
              });
            }
          });
        }
      });
    },
    completeRepair() {
      common_vendor.index.__f__("log", "at pages/fail/fail.vue:258", "finish:{}", this.finishUrl);
      common_vendor.index.showModal({
        title: "确认完成",
        content: "确定已完成维修吗？",
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.request({
              url: `${utils_config.baseConfig.baseUrl}/engineer/fail/finish/${this.detailData.id}`,
              method: "POST",
              header: {
                "Authorization": `Bearer ${this.token}`,
                "Content-Type": "application/x-www-form-urlencoded"
              },
              data: `finishUrl=${encodeURIComponent(this.finishUrl)}`,
              success: (response) => {
                if (response.data.code === 200) {
                  this.updateStatus(3);
                  common_vendor.index.showToast({
                    title: "维修完成",
                    icon: "success"
                  });
                } else {
                  common_vendor.index.showToast({
                    title: "提交维修信息失败",
                    icon: "none"
                  });
                }
              },
              fail: () => {
                common_vendor.index.showToast({
                  title: "提交维修信息失败",
                  icon: "none"
                });
              }
            });
          }
        }
      });
    },
    getAccessToken() {
      this.token = common_vendor.index.getStorageSync("token");
    },
    getDeviceOptions() {
      common_vendor.index.request({
        url: `${utils_config.baseConfig.baseUrl}/engineer/device/get`,
        method: "GET",
        header: {
          "Authorization": `Bearer ${this.token}`
          // 确保正确使用存储的 token
        },
        success: (res) => {
          if (res.data.code === 200) {
            this.deviceOptions = res.data.data.map((device) => ({
              id: device.id,
              name: device.name
            }));
            this.updateDeviceName();
          } else {
            common_vendor.index.showToast({
              title: "获取设备列表失败",
              icon: "none"
            });
          }
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/fail/fail.vue:322", "获取设备列表失败", err);
          common_vendor.index.showToast({
            title: "获取设备列表失败，请检查网络连接",
            icon: "none"
          });
        }
      });
    },
    updateDeviceName() {
      const device = this.deviceOptions.find((item) => item.id === this.detailData.deviceId);
      if (device) {
        this.deviceName = device.name;
      } else {
        this.deviceName = "未知设备";
      }
    },
    getStatusClass(status) {
      switch (status) {
        case 0:
          return "status-cancel";
        case 1:
          return "status-pending";
        case 2:
          return "status-processing";
        case 3:
          return "status-complete";
        default:
          return "";
      }
    },
    getStatusText(status) {
      switch (status) {
        case 0:
          return "已取消";
        case 1:
          return "待处理";
        case 2:
          return "处理中";
        case 3:
          return "已完成";
        default:
          return "未知状态";
      }
    },
    updateStatus(newStatus) {
      this.detailData.status = newStatus;
      common_vendor.index.__f__("log", "at pages/fail/fail.vue:368", "状态已更新为:", this.getStatusText(newStatus));
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.deviceName),
    b: common_vendor.t($data.detailData.detail),
    c: common_vendor.t($options.formatBasicDate($data.detailData.createTime)),
    d: $data.detailData.status === 2
  }, $data.detailData.status === 2 ? {
    e: common_vendor.o((...args) => $options.applySpare && $options.applySpare(...args))
  } : {}, {
    f: $options.processedBeforeUrl,
    g: !$data.detailData.beforeUrl
  }, !$data.detailData.beforeUrl ? {} : {}, {
    h: $data.detailData.status === 2
  }, $data.detailData.status === 2 ? common_vendor.e({
    i: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args)),
    j: $data.repairImageUrl
  }, $data.repairImageUrl ? {
    k: $data.repairImageUrl
  } : {}) : {}, {
    l: $data.detailData.status === 1
  }, $data.detailData.status === 1 ? {
    m: common_vendor.o((...args) => $options.startProcessing && $options.startProcessing(...args))
  } : {}, {
    n: $data.detailData.status === 2
  }, $data.detailData.status === 2 ? {
    o: common_vendor.o((...args) => $options.completeRepair && $options.completeRepair(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-4cd3f726"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/fail/fail.js.map
