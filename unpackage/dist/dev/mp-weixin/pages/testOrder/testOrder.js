"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_config = require("../../utils/config.js");
const _sfc_main = {
  data() {
    return {
      detailData: {
        id: "",
        deviceId: "",
        createTime: "",
        status: 0,
        current: ""
      },
      repairImageUrl: "",
      finishUrl: "",
      deviceName: "",
      deviceOptions: [],
      token: "",
      current: "",
      // 新增变量用于存储单选框的值
      // 新增数据项
      countdown: 5,
      // 3分钟倒计时（单位：秒）
      timer: null,
      // 倒计时定时器
      locationInterval: null,
      // 定位检查定时器
      fenceCenter: null,
      // 围栏中心坐标 [lng, lat]
      fenceRadius: null,
      // 围栏半径（米）
      // 新增地图相关数据
      markers: [],
      circles: [],
      userLocation: null,
      mapCtx: null
    };
  },
  onLoad(options) {
    if (options.detailData) {
      try {
        this.getAccessToken();
        this.detailData = JSON.parse(decodeURIComponent(options.detailData));
        this.getDeviceOptions();
        this.getFenceInfo();
        common_vendor.index.__f__("log", "at pages/testOrder/testOrder.vue:130", this.detailData);
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/testOrder/testOrder.vue:132", "解析详情数据失败", e);
        common_vendor.index.showToast({
          title: "数据加载失败",
          icon: "none"
        });
      }
    }
  },
  onReady() {
    this.mapCtx = common_vendor.index.createMapContext("mapContainer", this);
  },
  onShow() {
    this.getFenceInfo();
  },
  onUnload() {
    if (this.timer)
      clearInterval(this.timer);
    if (this.locationInterval)
      clearInterval(this.locationInterval);
  },
  computed: {
    // 正确声明计算属性
    formatCountdown() {
      const minutes = Math.floor(this.countdown / 60);
      const seconds = this.countdown % 60;
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
  },
  methods: {
    async startProcessing() {
      try {
        const confirmResult = await new Promise((resolve) => {
          common_vendor.index.showModal({
            title: "确认处理",
            content: "确定要开始处理该设备问题吗？",
            success: (res) => {
              resolve(res);
            }
          });
        });
        if (confirmResult.confirm) {
          const hasPermission = await this.checkAndroidPermission();
          if (!hasPermission)
            return;
          const location = await this.getCurrentLocation();
          const isInside = await this.checkInFence(location);
          if (!isInside) {
            common_vendor.index.showModal({
              title: "提示",
              content: "您不在电子围栏范围内，请移步",
              showCancel: false
            });
            return;
          }
          const requestResult = await new Promise((resolve, reject) => {
            common_vendor.index.request({
              url: `${utils_config.baseConfig.baseUrl}/engineer/testOrder/deal/${this.detailData.id}`,
              method: "POST",
              header: {
                "Authorization": `Bearer ${this.token}`
              },
              success: (res) => {
                resolve(res);
              },
              fail: (err) => {
                reject(err);
              }
            });
          });
          if (requestResult.data.code === 200) {
            common_vendor.index.showToast({
              title: "开始处理",
              icon: "success"
            });
            this.updateStatus(2);
            this.getFenceInfo();
            this.startLocationCheck();
          } else if (requestResult.data.code === 0) {
            const errorMessage = requestResult.data.msg;
            common_vendor.index.showModal({
              title: "提示",
              content: errorMessage,
              showCancel: false
            });
          }
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/testOrder/testOrder.vue:228", "处理过程中出现错误:", error);
        common_vendor.index.showToast({
          title: "处理失败",
          icon: "none"
        });
      }
    },
    // 安卓权限检查
    async checkAndroidPermission() {
      return new Promise((resolve) => {
        if (typeof plus !== "undefined" && plus.os.name === "Android") {
          plus.android.requestPermissions(
            ["android.permission.ACCESS_FINE_LOCATION"],
            () => {
              common_vendor.index.getLocation({
                type: "gcj02",
                success: () => resolve(true),
                fail: () => resolve(false)
              });
            },
            () => resolve(false)
          );
        } else {
          common_vendor.index.getLocation({
            type: "gcj02",
            success: () => resolve(true),
            fail: () => {
              common_vendor.index.showModal({
                title: "需要位置权限",
                content: "请在设置中开启定位服务",
                showCancel: false,
                success: () => resolve(false)
              });
            }
          });
        }
      });
    },
    // 初始化地图覆盖物
    initMapOverlays() {
      var _a, _b;
      if (!this.fenceCenter)
        return;
      const fenceMarker = {
        id: 0,
        latitude: this.fenceCenter[1],
        longitude: this.fenceCenter[0],
        title: "设备位置",
        iconPath: "/static/fence-marker.png",
        width: 30,
        height: 30
      };
      const fenceCircle = {
        latitude: this.fenceCenter[1],
        longitude: this.fenceCenter[0],
        radius: this.fenceRadius,
        strokeWidth: 2,
        strokeColor: "#FF0000",
        fillColor: "#FF000022"
      };
      const userMarker = {
        id: 1,
        latitude: (_a = this.userLocation) == null ? void 0 : _a.latitude,
        longitude: (_b = this.userLocation) == null ? void 0 : _b.longitude,
        title: "我的位置",
        iconPath: "/static/user-marker.png",
        width: 20,
        height: 20,
        rotate: 0
      };
      this.markers = [fenceMarker, userMarker].filter(Boolean);
      this.circles = [fenceCircle];
    },
    // 更新用户位置标记
    async updateUserPosition() {
      try {
        const location = await this.getCurrentLocation();
        this.userLocation = location;
        this.initMapOverlays();
        this.mapCtx.includePoints({
          points: [
            {
              latitude: this.fenceCenter[1],
              longitude: this.fenceCenter[0]
            },
            {
              latitude: location.latitude,
              longitude: location.longitude
            }
          ],
          padding: [50, 50, 50, 50]
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/testOrder/testOrder.vue:327", "获取位置失败:", error);
      }
    },
    // 定位检查方法
    async checkLocation() {
      try {
        const location = await this.getCurrentLocation();
        const isInside = await this.checkInFence(location);
        if (isInside) {
          if (!this.timer) {
            this.startCountdown();
          }
        } else {
          this.resetCountdown();
        }
        this.updateUserPosition();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/testOrder/testOrder.vue:344", "检查位置时出错:", error);
      }
    },
    // 检查是否在围栏内
    checkInFence(location) {
      if (!this.fenceCenter)
        return false;
      const [lng1, lat1] = this.fenceCenter;
      const lng2 = location.longitude;
      const lat2 = location.latitude;
      const distance = this.calculateDistance(lat1, lng1, lat2, lng2);
      return distance <= this.fenceRadius;
    },
    // 计算距离（Haversine公式）
    calculateDistance(lat1, lng1, lat2, lng2) {
      const toRad = (d) => d * Math.PI / 180;
      const R = 6378137;
      const φ1 = toRad(lat1);
      const φ2 = toRad(lat2);
      const Δφ = toRad(lat2 - lat1);
      const Δλ = toRad(lng2 - lng1);
      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    // 开始倒计时
    startCountdown() {
      if (this.timer)
        return;
      this.timer = setInterval(() => {
        if (this.countdown > 0) {
          this.countdown--;
        } else {
          clearInterval(this.timer);
          this.timer = null;
        }
      }, 1e3);
    },
    // 重置倒计时
    resetCountdown() {
      this.countdown = 180;
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    // 修改后的获取围栏信息方法
    getFenceInfo() {
      common_vendor.index.request({
        url: `${utils_config.baseConfig.baseUrl}/engineer/device/get/${this.detailData.deviceId}`,
        method: "GET",
        header: {
          "Authorization": `Bearer ${this.token}`
        },
        success: (res) => {
          if (res.data.code === 200) {
            this.fenceCenter = [res.data.data.centerLng, res.data.data.centerLat];
            this.fenceRadius = res.data.data.radius;
            this.initMapOverlays();
            this.updateUserPosition();
            this.$nextTick(() => {
              this.mapCtx = common_vendor.index.createMapContext("mapContainer", this);
            });
          }
        }
      });
    },
    // 安卓地图显示
    showFenceMap() {
      if (!this.fenceCenter || this.fenceCenter.length !== 2) {
        common_vendor.index.showToast({
          title: "无效的围栏坐标",
          icon: "none"
        });
        return;
      }
      const [longitude, latitude] = this.fenceCenter;
      if (typeof plus !== "undefined" && plus.maps) {
        const map = new plus.maps.Map("mapContainer");
        map.center = new plus.maps.LatLng(latitude, longitude);
        map.zoom = 17;
        const marker = new plus.maps.Marker(
          new plus.maps.LatLng(latitude, longitude)
        );
        map.addOverlay(marker);
      } else {
        common_vendor.index.showToast({
          title: "地图组件加载失败",
          icon: "none"
        });
      }
    },
    // 检查位置
    startLocationCheck() {
      if (this.locationInterval)
        return;
      this.locationInterval = setInterval(async () => {
        try {
          await this.checkLocation();
        } catch (e) {
          common_vendor.index.__f__("error", "at pages/testOrder/testOrder.vue:452", "周期定位检查失败:", e);
        }
      }, 5e3);
    },
    // 获取当前位置
    getCurrentLocation() {
      return new Promise((resolve, reject) => {
        common_vendor.index.getLocation({
          type: "gcj02",
          success: resolve,
          fail: reject
        });
      });
    },
    // 在组件销毁时清除定时器
    beforeDestroy() {
      if (this.timer)
        clearInterval(this.timer);
      if (this.locationInterval)
        clearInterval(this.locationInterval);
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
                common_vendor.index.__f__("error", "at pages/testOrder/testOrder.vue:502", "解析响应失败", e);
                common_vendor.index.showToast({
                  title: "上传结果解析失败",
                  icon: "none"
                });
              }
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/testOrder/testOrder.vue:510", "上传失败", err);
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
      if (!this.finishUrl) {
        common_vendor.index.showToast({
          title: "请先上传维修图片",
          icon: "none"
        });
        return;
      }
      if (!this.current) {
        common_vendor.index.showToast({
          title: "请选择设备状态",
          icon: "none"
        });
        return;
      }
      common_vendor.index.__f__("log", "at pages/testOrder/testOrder.vue:535", "finish:{}", this.finishUrl);
      common_vendor.index.showModal({
        title: "确认完成",
        content: "确定已完成维修吗？",
        success: (res) => {
          common_vendor.index.__f__("log", "at pages/testOrder/testOrder.vue:540", this.current);
          if (res.confirm) {
            common_vendor.index.request({
              url: `${utils_config.baseConfig.baseUrl}/engineer/testOrder/finish/${this.detailData.id}`,
              method: "POST",
              header: {
                "Authorization": `Bearer ${this.token}`,
                "Content-Type": "application/x-www-form-urlencoded"
              },
              // 添加 current 参数到请求数据中
              data: `finishUrl=${encodeURIComponent(this.finishUrl)}&current=${this.current}`,
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
        common_vendor.index.__f__("error", "at pages/testOrder/testOrder.vue:594", "日期格式化失败:", e);
        return "--";
      }
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
          common_vendor.index.__f__("error", "at pages/testOrder/testOrder.vue:623", "获取设备列表失败", err);
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
      common_vendor.index.__f__("log", "at pages/testOrder/testOrder.vue:669", "状态已更新为:", this.getStatusText(newStatus));
    },
    onRadioChange(e) {
      this.current = e.detail.value;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.markers,
    b: $data.circles,
    c: common_vendor.o((...args) => _ctx.onRegionChange && _ctx.onRegionChange(...args)),
    d: common_vendor.t($data.deviceName),
    e: common_vendor.t($options.formatBasicDate($data.detailData.createTime)),
    f: $data.detailData.status === 2 && $data.countdown === 0
  }, $data.detailData.status === 2 && $data.countdown === 0 ? common_vendor.e({
    g: common_vendor.o((...args) => $options.chooseImage && $options.chooseImage(...args)),
    h: $data.repairImageUrl
  }, $data.repairImageUrl ? {
    i: $data.repairImageUrl
  } : {}) : {}, {
    j: $data.detailData.status === 1
  }, $data.detailData.status === 1 ? {
    k: common_vendor.o((...args) => $options.startProcessing && $options.startProcessing(...args))
  } : {}, {
    l: $data.detailData.status === 2 && $data.countdown === 0
  }, $data.detailData.status === 2 && $data.countdown === 0 ? {
    m: $data.current === "1",
    n: $data.current === "0",
    o: common_vendor.o((...args) => $options.onRadioChange && $options.onRadioChange(...args))
  } : {}, {
    p: $data.detailData.status === 3
  }, $data.detailData.status === 3 ? common_vendor.e({
    q: $data.detailData.current === 1
  }, $data.detailData.current === 1 ? {} : {}, {
    r: $data.detailData.current === 0
  }, $data.detailData.current === 0 ? {} : {}) : {}, {
    s: $data.countdown > 0
  }, $data.countdown > 0 ? {
    t: common_vendor.t($options.formatCountdown)
  } : {}, {
    v: $data.detailData.status === 2 && $data.countdown === 0
  }, $data.detailData.status === 2 && $data.countdown === 0 ? {
    w: common_vendor.o((...args) => $options.completeRepair && $options.completeRepair(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-7e3f3e94"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/testOrder/testOrder.js.map
