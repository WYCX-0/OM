"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_config = require("../../utils/config.js");
const _sfc_main = {
  data() {
    return {
      modules: [
        {
          name: "维修",
          type: "repair",
          url: `${utils_config.baseConfig.baseUrl}/engineer/fail/getFail`,
          // 维修模块接口
          method: "GET",
          // 请求方式
          detailUrl: `${utils_config.baseConfig.baseUrl}/engineer/fail/getById`,
          // 维修详情接口
          detailPage: "/pages/fail/fail"
          // 维修详情页面路径
        },
        {
          name: "巡检",
          type: "inspection",
          url: `${utils_config.baseConfig.baseUrl}/engineer/rtestOrder/getRTestOrder`,
          method: "GET",
          detailUrl: `${utils_config.baseConfig.baseUrl}/engineer/rtestOrder/getById`,
          detailPage: "/pages/rtestOrder/rtestOrder"
          // 巡检详情页面路径
        },
        {
          name: "保养",
          type: "maintenance",
          url: `${utils_config.baseConfig.baseUrl}/engineer/baoyangOrder/getBaoyangOrder`,
          method: "GET",
          detailUrl: `${utils_config.baseConfig.baseUrl}/engineer/baoyangOrder/getById`,
          detailPage: "/pages/baoyangOrder/baoyangOrder"
          // 保养详情页面路径
        },
        {
          name: "检测",
          type: "test",
          url: `${utils_config.baseConfig.baseUrl}/engineer/testOrder/getTestOrder`,
          method: "GET",
          detailUrl: `${utils_config.baseConfig.baseUrl}/engineer/testOrder/getById`,
          // 检测详情接口
          detailPage: "/pages/testOrder/testOrder"
          // 检测详情页面路径
        }
      ],
      activeModule: "repair",
      listData: [],
      // 存储列表数据
      token: "",
      deviceOptions: []
    };
  },
  mounted() {
    this.getAccessToken();
    this.fetchData();
    this.getDeviceOptions();
  },
  onPullDownRefresh() {
    this.fetchData().then(() => {
      common_vendor.index.stopPullDownRefresh();
    });
  },
  methods: {
    getAccessToken() {
      this.token = common_vendor.index.getStorageSync("token");
    },
    getDeviceOptions() {
      common_vendor.index.request({
        url: `${utils_config.baseConfig.baseUrl}/engineer/device/get`,
        method: "GET",
        header: {
          "Authorization": `Bearer ${this.token}`
          // ✅ 使用存储的 token
        },
        success: (res) => {
          if (res.data.code === 200) {
            this.deviceOptions = res.data.data.map((device) => ({
              id: device.id,
              name: device.name
            }));
            this.updateListDataDeviceNames();
          }
        }
      });
    },
    // 获取当前模块配置
    getCurrentModule() {
      return this.modules.find((item) => item.type === this.activeModule);
    },
    // 获取数据（修改后）
    async fetchData() {
      try {
        const currentModule = this.getCurrentModule();
        if (!currentModule)
          return;
        const requestConfig = {
          url: currentModule.url,
          method: currentModule.method,
          data: {}
        };
        if (currentModule.method === "GET") {
          requestConfig.data = {
            moduleType: this.activeModule,
            keyword: this.searchKeyword
          };
          requestConfig.header = {
            "Authorization": `Bearer ${this.token}`
          };
        } else {
          requestConfig.header = {
            "Authorization": `Bearer ${this.token}`
          };
          requestConfig.data = {
            queryParams: {
              keyword: this.searchKeyword
            }
          };
          requestConfig.data = JSON.stringify(requestConfig.data);
        }
        const res = await common_vendor.index.request(requestConfig);
        if (res.statusCode === 200) {
          this.listData = res.data.data;
          this.updateListDataDeviceNames();
        }
      } catch (error) {
        common_vendor.index.showToast({
          title: "数据加载失败",
          icon: "none"
        });
      }
    },
    handleModuleClick(type) {
      this.activeModule = type;
      this.fetchData();
    },
    // 状态处理方法
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
          return "";
      }
    },
    getDeviceName(deviceId) {
      const device = this.deviceOptions.find((item) => item.id === deviceId);
      return device ? device.name : "未知设备";
    },
    updateListDataDeviceNames() {
      this.listData = this.listData.map((item) => {
        return {
          ...item,
          deviceName: this.getDeviceName(item.deviceId)
        };
      });
    },
    async handleItemClick(item) {
      const currentModule = this.getCurrentModule();
      if (!currentModule)
        return;
      const detailUrl = `${currentModule.detailUrl}/${item.id}`;
      const res = await common_vendor.index.request({
        url: detailUrl,
        method: "GET",
        header: {
          "Authorization": `Bearer ${this.token}`
        }
      });
      if (res.data.code === 200) {
        const detailData = res.data.data;
        const encodedData = encodeURIComponent(JSON.stringify(detailData));
        common_vendor.index.navigateTo({
          url: `${currentModule.detailPage}?detailData=${encodedData}`
        });
      } else {
        common_vendor.index.showToast({
          title: "详情数据加载失败",
          icon: "none"
        });
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.modules, (item, index, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: index,
        c: $data.activeModule === item.type ? 1 : "",
        d: common_vendor.o(($event) => $options.handleModuleClick(item.type), index)
      };
    }),
    b: common_vendor.f($data.listData, (item, index, i0) => {
      return {
        a: common_vendor.t($options.getDeviceName(item.deviceId)),
        b: common_vendor.t(item.detail),
        c: common_vendor.t($options.getStatusText(item.status)),
        d: common_vendor.n($options.getStatusClass(item.status)),
        e: index,
        f: common_vendor.o(($event) => $options.handleItemClick(item), index)
      };
    }),
    c: $data.listData.length === 0
  }, $data.listData.length === 0 ? {} : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
