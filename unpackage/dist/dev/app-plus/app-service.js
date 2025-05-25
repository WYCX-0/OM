if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
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
    socketTask = uni.connectSocket({
      url,
      header: {
        "Authorization": `Bearer ${token}`
      },
      success: () => formatAppLog("log", "at utils/websocket.js:45", "WebSocket 连接中..."),
      fail: (err) => formatAppLog("error", "at utils/websocket.js:46", "连接失败:", err)
    });
    socketTask.onOpen(() => {
      formatAppLog("log", "at utils/websocket.js:50", "WebSocket 已打开");
      startHeartbeat();
      uni.$emit("websocket-connected");
    });
    socketTask.onMessage((res) => {
      formatAppLog("log", "at utils/websocket.js:56", "收到消息:", res.data);
      if (globalMessageHandler) {
        globalMessageHandler(res.data);
      }
      uni.showModal({
        title: "新消息",
        content: res.data,
        showCancel: false
      });
    });
    socketTask.onError((err) => {
      formatAppLog("error", "at utils/websocket.js:69", "连接错误:", err);
      if (!isSocketClose)
        reconnect(url);
    });
    socketTask.onClose(() => {
      formatAppLog("log", "at utils/websocket.js:74", "连接已关闭");
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
      formatAppLog("log", "at utils/websocket.js:110", "尝试重连...");
      connect(url);
    }, 5e3);
  }
  const baseConfig = {
    baseUrl: "http://192.168.152.195:9090",
    wsBaseUrl: "ws://192.168.152.195:9090"
  };
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$a = {
    data() {
      return {
        engineerNo: "",
        password: ""
      };
    },
    methods: {
      handleLogin() {
        if (!this.engineerNo || !this.password) {
          uni.showToast({
            title: "请填写完整登录信息",
            icon: "none"
          });
          return;
        }
        uni.request({
          url: `${baseConfig.baseUrl}/engineer/login`,
          method: "POST",
          data: {
            engineerNo: this.engineerNo,
            password: this.password
          },
          success: (res) => {
            if (res.data.code === 200) {
              uni.setStorageSync("userInfo", {
                id: res.data.data.id,
                name: res.data.data.name
              });
              uni.setStorageSync("token", res.data.data.token);
              uni.setStorageSync("id", res.data.data.id);
              uni.setStorageSync("password", res.data.data.password);
              formatAppLog("log", "at pages/login/login.vue:62", res.data.data.token);
              const wsURL = `${baseConfig.wsBaseUrl}/ws/engineer/${res.data.data.id}`;
              websocketObj.connect(wsURL, res.data.data.token);
              uni.showToast({
                title: "登录成功",
                icon: "success"
              });
              uni.reLaunch({
                url: "/pages/index/index"
              });
            } else {
              uni.showToast({
                title: res.data.msg || "登录失败",
                icon: "none"
              });
            }
          },
          fail: (err) => {
            formatAppLog("error", "at pages/login/login.vue:81", "登录请求失败", err);
            uni.showToast({
              title: "网络错误，请稍后重试",
              icon: "none"
            });
          }
        });
      }
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "brand-container" }, [
        vue.createElementVNode("text", { class: "brand-text" }, "运"),
        vue.createElementVNode("text", { class: "brand-text accent" }, "维")
      ]),
      vue.createElementVNode("view", { class: "form-box" }, [
        vue.createElementVNode("view", { class: "input-item" }, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "text",
              placeholder: "请输入工号",
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.engineerNo = $event),
              class: "input"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.engineerNo]
          ])
        ]),
        vue.createElementVNode("view", { class: "input-item" }, [
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              type: "password",
              placeholder: "请输入密码",
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.password = $event),
              class: "input"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.password]
          ])
        ]),
        vue.createElementVNode("button", {
          class: "submit-btn",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.handleLogin && $options.handleLogin(...args))
        }, "登录")
      ])
    ]);
  }
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-e4e4508d"], ["__file", "D:/app/om-engineer/pages/login/login.vue"]]);
  const _sfc_main$9 = {
    data() {
      return {
        modules: [
          {
            name: "维修",
            type: "repair",
            url: `${baseConfig.baseUrl}/engineer/fail/getFail`,
            method: "GET",
            detailUrl: `${baseConfig.baseUrl}/engineer/fail/getById`,
            detailPage: "/pages/fail/fail"
          },
          {
            name: "巡检",
            type: "inspection",
            url: `${baseConfig.baseUrl}/engineer/rtestOrder/getRTestOrder`,
            method: "GET",
            detailUrl: `${baseConfig.baseUrl}/engineer/rtestOrder/getById`,
            detailPage: "/pages/rtestOrder/rtestOrder"
          },
          {
            name: "保养",
            type: "maintenance",
            url: `${baseConfig.baseUrl}/engineer/baoyangOrder/getBaoyangOrder`,
            method: "GET",
            detailUrl: `${baseConfig.baseUrl}/engineer/baoyangOrder/getById`,
            detailPage: "/pages/baoyangOrder/baoyangOrder"
          },
          {
            name: "检测",
            type: "test",
            url: `${baseConfig.baseUrl}/engineer/testOrder/getTestOrder`,
            method: "GET",
            detailUrl: `${baseConfig.baseUrl}/engineer/testOrder/getById`,
            detailPage: "/pages/testOrder/testOrder"
          }
        ],
        pendingOrder: false,
        pendingOrderType: null,
        pendingOrderId: null,
        activeModule: "repair",
        listData: [],
        token: "",
        deviceOptions: [],
        searchKeyword: ""
      };
    },
    mounted() {
      this.getAccessToken();
      this.checkPendingOrder();
      this.fetchData();
      this.getDeviceOptions();
    },
    onPullDownRefresh() {
      Promise.all([this.fetchData(), this.checkPendingOrder()]).finally(() => {
        uni.stopPullDownRefresh();
      });
    },
    methods: {
      handleFloatButtonClick() {
        uni.navigateTo({
          url: "/pages/my/my"
          // 修改为你的目标页面路径
        });
      },
      getOrderTypeName(type) {
        const typeMap = {
          "repair": "维修",
          "inspection": "巡检",
          "maintenance": "保养",
          "test": "检测"
        };
        return typeMap[type] || "未知";
      },
      async checkPendingOrder() {
        try {
          const {
            data
          } = await uni.request({
            url: `${baseConfig.baseUrl}/engineer/fail/test`,
            method: "POST",
            header: {
              "Authorization": `Bearer ${this.token}`
            }
          });
          if (data.code === 200 && data.data) {
            this.pendingOrder = true;
            this.pendingOrderType = data.data.type;
            this.pendingOrderId = data.data.id;
          } else {
            this.pendingOrder = false;
            this.pendingOrderType = null;
            this.pendingOrderId = null;
          }
        } catch (error) {
          formatAppLog("error", "at pages/index/index.vue:135", "工单检查失败:", error);
          this.pendingOrder = false;
        }
      },
      async handlePendingOrderClick() {
        if (!this.pendingOrderType || !this.pendingOrderId)
          return;
        const currentModule = this.modules.find((item) => item.type === this.pendingOrderType);
        if (currentModule) {
          const detailUrl = `${currentModule.detailUrl}/${this.pendingOrderId}`;
          const res = await uni.request({
            url: detailUrl,
            method: "GET",
            header: {
              "Authorization": `Bearer ${this.token}`
            }
          });
          if (res.data.code === 200) {
            const detailData = res.data.data;
            const encodedData = encodeURIComponent(JSON.stringify(detailData));
            uni.navigateTo({
              url: `${currentModule.detailPage}?detailData=${encodedData}`
            });
          } else {
            uni.showToast({
              title: "详情数据加载失败",
              icon: "none"
            });
          }
        }
      },
      getAccessToken() {
        this.token = uni.getStorageSync("token");
      },
      getDeviceOptions() {
        uni.request({
          url: `${baseConfig.baseUrl}/engineer/device/get`,
          method: "GET",
          header: {
            "Authorization": `Bearer ${this.token}`
          },
          success: (res) => {
            if (res.data.code === 200) {
              this.deviceOptions = res.data.data.map((device) => ({
                id: device.id,
                name: device.name
              }));
              if (this.listData.length > 0) {
                this.updateListDataDeviceNames();
              }
            }
          }
        });
      },
      getCurrentModule() {
        return this.modules.find((item) => item.type === this.activeModule);
      },
      async fetchData() {
        try {
          const currentModule = this.getCurrentModule();
          if (!currentModule)
            return;
          const requestConfig = {
            url: currentModule.url,
            method: currentModule.method,
            header: {
              "Authorization": `Bearer ${this.token}`
            }
          };
          if (currentModule.method === "GET") {
            requestConfig.data = {
              keyword: this.searchKeyword
            };
          } else {
            requestConfig.data = {
              keyword: this.searchKeyword
            };
          }
          const res = await uni.request(requestConfig);
          if (res.statusCode === 200) {
            this.listData = res.data.data;
            this.updateListDataDeviceNames();
          }
        } catch (error) {
          uni.showToast({
            title: "数据加载失败",
            icon: "none"
          });
        }
      },
      handleModuleClick(type) {
        this.activeModule = type;
        this.fetchData();
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
            return "";
        }
      },
      getDeviceName(deviceId) {
        var _a;
        if (!deviceId)
          return "未绑定设备";
        return ((_a = this.deviceOptions.find((item) => item.id === deviceId)) == null ? void 0 : _a.name) || "未知设备";
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
        const res = await uni.request({
          url: detailUrl,
          method: "GET",
          header: {
            "Authorization": `Bearer ${this.token}`
          }
        });
        if (res.data.code === 200) {
          const detailData = res.data.data;
          const encodedData = encodeURIComponent(JSON.stringify(detailData));
          uni.navigateTo({
            url: `${currentModule.detailPage}?detailData=${encodedData}`
          });
        } else {
          uni.showToast({
            title: "详情数据加载失败",
            icon: "none"
          });
        }
      }
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", {
        class: "float-button",
        onClick: _cache[0] || (_cache[0] = (...args) => $options.handleFloatButtonClick && $options.handleFloatButtonClick(...args))
      }, " + "),
      vue.createCommentVNode(" 功能模块 "),
      vue.createElementVNode("view", { class: "modules" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.modules, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: index,
              class: vue.normalizeClass(["module-item", { active: $data.activeModule === item.type }]),
              onClick: ($event) => $options.handleModuleClick(item.type)
            }, vue.toDisplayString(item.name), 11, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      $data.pendingOrder ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "pending-notice",
        onClick: _cache[1] || (_cache[1] = (...args) => $options.handlePendingOrderClick && $options.handlePendingOrderClick(...args))
      }, [
        vue.createElementVNode("text", null, [
          vue.createTextVNode("您有正在处理中的"),
          vue.createElementVNode(
            "text",
            { class: "order-type" },
            vue.toDisplayString($options.getOrderTypeName($data.pendingOrderType)),
            1
            /* TEXT */
          ),
          vue.createTextVNode("工单，点击查看详情")
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 数据列表 "),
      vue.createElementVNode("scroll-view", {
        class: "list-container",
        "scroll-y": ""
      }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.listData, (item, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: index,
              class: "list-item",
              onClick: ($event) => $options.handleItemClick(item)
            }, [
              vue.createElementVNode("view", { class: "item-content" }, [
                vue.createElementVNode("view", { class: "device-info" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "device-id" },
                    vue.toDisplayString($options.getDeviceName(item.deviceId)),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "detail" },
                    vue.toDisplayString(item.detail),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode(
                  "text",
                  {
                    class: vue.normalizeClass(["status", $options.getStatusClass(item.status)])
                  },
                  vue.toDisplayString($options.getStatusText(item.status)),
                  3
                  /* TEXT, CLASS */
                )
              ])
            ], 8, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        )),
        $data.listData.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty"
        }, "暂无数据")) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-1cf27b2a"], ["__file", "D:/app/om-engineer/pages/index/index.vue"]]);
  function speak(text) {
    const url = "https://tts.baidu.com/text2audio.mp3?tex=" + text + "&cuid=baike&amp&lan=ZH&amp&ctp=1&amp&pdt=301&amp&vol=100&amp&rate=32&amp&per=0&spd=10&pit=undefined";
    if (typeof Audio !== "undefined") {
      const audio = new Audio(url);
      audio.play();
    } else if (typeof wx !== "undefined" && wx.createInnerAudioContext) {
      const innerAudioContext = wx.createInnerAudioContext();
      innerAudioContext.src = url;
      innerAudioContext.play();
    } else if (typeof plus !== "undefined" && plus.audio) {
      const player = plus.audio.createPlayer(url);
      player.play(function() {
        formatAppLog("log", "at utils/tts.js:19", "Play success");
      }, function(e) {
        formatAppLog("log", "at utils/tts.js:21", "Play failed: " + e.message);
      });
    } else if (typeof my !== "undefined" && my.createInnerAudioContext) {
      const innerAudioContext = my.createInnerAudioContext();
      innerAudioContext.src = url;
      innerAudioContext.play();
    } else if (typeof swan !== "undefined" && swan.createInnerAudioContext) {
      const innerAudioContext = swan.createInnerAudioContext();
      innerAudioContext.src = url;
      innerAudioContext.play();
    } else if (typeof tt !== "undefined" && tt.createInnerAudioContext) {
      const innerAudioContext = tt.createInnerAudioContext();
      innerAudioContext.src = url;
      innerAudioContext.play();
    } else {
      formatAppLog("error", "at utils/tts.js:39", "Unsupported platform or Audio object is not defined");
    }
  }
  const speak$1 = {
    speak
  };
  const _sfc_main$8 = {
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
      };
    },
    onLoad(options) {
      if (options.detailData) {
        try {
          this.getAccessToken();
          this.detailData = JSON.parse(decodeURIComponent(options.detailData));
          this.getDeviceOptions();
        } catch (e) {
          formatAppLog("error", "at pages/fail/fail.vue:124", "解析详情数据失败", e);
          uni.showToast({
            title: "数据加载失败",
            icon: "none"
          });
        }
      }
    },
    computed: {
      processedBeforeUrl() {
        if (this.detailData.beforeUrl) {
          return `${baseConfig.baseUrl}${this.detailData.beforeUrl}`;
        }
        return this.defaultImageUrl;
      }
    },
    methods: {
      applySpare() {
        uni.navigateTo({
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
          formatAppLog("error", "at pages/fail/fail.vue:164", "日期格式化失败:", e);
          return "--";
        }
      },
      startProcessing() {
        uni.showModal({
          title: "确认处理",
          content: "确定要开始处理该设备问题吗？",
          success: (res) => {
            if (res.confirm) {
              uni.request({
                url: `${baseConfig.baseUrl}/engineer/fail/deal/${this.detailData.id}`,
                // 替换为实际的后端 API 地址
                method: "POST",
                header: {
                  "Authorization": `Bearer ${this.token}`
                  // ✅ 使用存储的 token
                },
                success: (response) => {
                  if (response.data.code === 200) {
                    this.updateStatus(2);
                    uni.showToast({
                      title: "开始处理",
                      icon: "success"
                    });
                    speak$1.speak("操作机械设备前，请检查设备状态，确保安全装置齐全有效");
                  } else {
                    uni.showToast({
                      title: "您有正在处理中的工单",
                      icon: "none"
                    });
                    speak$1.speak("您有正在处理中的工单，请稍后重试");
                  }
                },
                fail: () => {
                  uni.showToast({
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
        uni.chooseImage({
          count: 1,
          sizeType: ["original", "compressed"],
          sourceType: ["album", "camera"],
          success: (res) => {
            this.repairImageUrl = res.tempFilePaths[0];
            uni.uploadFile({
              url: `${baseConfig.baseUrl}/upload`,
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
                    uni.showToast({
                      title: "上传失败: " + data.msg,
                      icon: "none"
                    });
                  }
                } catch (e) {
                  formatAppLog("error", "at pages/fail/fail.vue:244", "解析响应失败", e);
                  uni.showToast({
                    title: "上传结果解析失败",
                    icon: "none"
                  });
                }
              },
              fail: (err) => {
                formatAppLog("error", "at pages/fail/fail.vue:252", "上传失败", err);
                uni.showToast({
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
          uni.showToast({
            title: "请先上传维修图片",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/fail/fail.vue:270", "finish:{}", this.finishUrl);
        uni.showModal({
          title: "确认完成",
          content: "确定已完成维修吗？",
          success: (res) => {
            if (res.confirm) {
              uni.request({
                url: `${baseConfig.baseUrl}/engineer/fail/finish/${this.detailData.id}`,
                method: "POST",
                header: {
                  "Authorization": `Bearer ${this.token}`,
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                data: `finishUrl=${encodeURIComponent(this.finishUrl)}`,
                success: (response) => {
                  if (response.data.code === 200) {
                    this.updateStatus(3);
                    uni.showToast({
                      title: "维修完成",
                      icon: "success"
                    });
                  } else {
                    uni.showToast({
                      title: "提交维修信息失败",
                      icon: "none"
                    });
                  }
                },
                fail: () => {
                  uni.showToast({
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
        this.token = uni.getStorageSync("token");
      },
      getDeviceOptions() {
        uni.request({
          url: `${baseConfig.baseUrl}/engineer/device/get`,
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
              uni.showToast({
                title: "获取设备列表失败",
                icon: "none"
              });
            }
          },
          fail: (err) => {
            formatAppLog("error", "at pages/fail/fail.vue:334", "获取设备列表失败", err);
            uni.showToast({
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
        formatAppLog("log", "at pages/fail/fail.vue:380", "状态已更新为:", this.getStatusText(newStatus));
      }
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 设备名称 "),
      vue.createElementVNode("view", { class: "detail-card" }, [
        vue.createElementVNode("view", { class: "detail-header" }, [
          vue.createElementVNode("text", { class: "detail-label" }, "设备名称:")
        ]),
        vue.createElementVNode("view", { class: "detail-content" }, [
          vue.createElementVNode(
            "text",
            { class: "detail-value" },
            vue.toDisplayString($data.deviceName),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createCommentVNode(" 详情 "),
      vue.createElementVNode("view", { class: "detail-card" }, [
        vue.createElementVNode("view", { class: "detail-header" }, [
          vue.createElementVNode("text", { class: "detail-label" }, "详情:")
        ]),
        vue.createElementVNode("view", { class: "detail-content" }, [
          vue.createElementVNode(
            "text",
            { class: "detail-value detail-text" },
            vue.toDisplayString($data.detailData.detail),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createElementVNode("view", { class: "detail-card" }, [
        vue.createElementVNode("view", { class: "detail-header" }, [
          vue.createElementVNode("text", { class: "detail-label" }, "创建时间:")
        ]),
        vue.createElementVNode("view", { class: "detail-content" }, [
          vue.createElementVNode(
            "text",
            { class: "detail-value" },
            vue.toDisplayString($options.formatBasicDate($data.detailData.createTime)),
            1
            /* TEXT */
          )
        ])
      ]),
      $data.detailData.status === 2 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "action-button-container"
      }, [
        vue.createElementVNode("button", {
          class: "action-button",
          "hover-class": "action-button-hover",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.applySpare && $options.applySpare(...args))
        }, " 申请备件 ")
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 前置图片 "),
      vue.createElementVNode("view", { class: "detail-card" }, [
        vue.createElementVNode("view", { class: "detail-header" }, [
          vue.createElementVNode("text", { class: "detail-label" }, "故障图片:")
        ]),
        vue.createElementVNode("view", { class: "detail-content" }, [
          vue.createElementVNode("view", { class: "image-container" }, [
            vue.createElementVNode("image", {
              src: $options.processedBeforeUrl,
              mode: "widthFix",
              class: "detail-image"
            }, null, 8, ["src"]),
            !$data.detailData.beforeUrl ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "placeholder-image"
            }, [
              vue.createElementVNode("text", { class: "placeholder-text" }, "暂无图片")
            ])) : vue.createCommentVNode("v-if", true)
          ])
        ])
      ]),
      vue.createCommentVNode(" 上传图片 (仅当状态为处理中时显示) "),
      $data.detailData.status === 2 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "detail-card"
      }, [
        vue.createElementVNode("view", { class: "detail-header" }, [
          vue.createElementVNode("text", { class: "detail-label" }, "上传维修图片:")
        ]),
        vue.createElementVNode("view", { class: "detail-content" }, [
          vue.createElementVNode("view", { class: "upload-container" }, [
            !$data.repairImageUrl ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "upload-area",
              onClick: _cache[1] || (_cache[1] = (...args) => $options.chooseImage && $options.chooseImage(...args))
            }, [
              vue.createElementVNode("text", { class: "upload-text" }, "点击上传图片")
            ])) : (vue.openBlock(), vue.createElementBlock("view", {
              key: 1,
              class: "repair-image-container",
              onClick: _cache[2] || (_cache[2] = (...args) => $options.chooseImage && $options.chooseImage(...args))
            }, [
              vue.createElementVNode("image", {
                src: $data.repairImageUrl,
                mode: "widthFix",
                class: "repair-image"
              }, null, 8, ["src"]),
              vue.createElementVNode("view", { class: "ql-image-overlay" }, [
                vue.createElementVNode("text", { class: "overlay-text" }, "点击更换图片")
              ])
            ]))
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 处理按钮 (仅当状态为待处理时显示) "),
      $data.detailData.status === 1 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "action-button-container"
      }, [
        vue.createElementVNode("button", {
          class: "action-button",
          "hover-class": "action-button-hover",
          onClick: _cache[3] || (_cache[3] = (...args) => $options.startProcessing && $options.startProcessing(...args))
        }, " 开始处理 ")
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 完成维修按钮 (仅当状态为处理中时显示) "),
      $data.detailData.status === 2 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 3,
        class: "action-button-container"
      }, [
        vue.createElementVNode("button", {
          class: "action-button",
          "hover-class": "action-button-hover",
          onClick: _cache[4] || (_cache[4] = (...args) => $options.completeRepair && $options.completeRepair(...args))
        }, " 完成维修 ")
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesFailFail = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-4cd3f726"], ["__file", "D:/app/om-engineer/pages/fail/fail.vue"]]);
  const _sfc_main$7 = {
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
        countdown: 0,
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
          this.countdown = this.detailData.time || 3;
          this.getDeviceOptions();
          this.getFenceInfo();
          formatAppLog("log", "at pages/testOrder/testOrder.vue:137", this.detailData);
        } catch (e) {
          formatAppLog("error", "at pages/testOrder/testOrder.vue:139", "解析详情数据失败", e);
          uni.showToast({
            title: "数据加载失败",
            icon: "none"
          });
        }
      }
    },
    onReady() {
      this.mapCtx = uni.createMapContext("mapContainer", this);
    },
    onShow() {
      this.getFenceInfo();
      if (this.detailData.status === 2) {
        this.countdown = this.detailData.time || 3;
        this.getFenceInfo();
        this.startLocationCheck();
      }
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
      navigateToMapPage() {
        uni.navigateTo({
          url: `/pages/map/map?lng=${this.fenceCenter[0]}&lat=${this.fenceCenter[1]}&radius=${this.fenceRadius}`
        });
      },
      async startProcessing() {
        try {
          const confirmResult = await new Promise((resolve) => {
            uni.showModal({
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
              uni.showModal({
                title: "提示",
                content: "您不在电子围栏范围内，请移步",
                showCancel: false
              });
              return;
            }
            const requestResult = await new Promise((resolve, reject) => {
              uni.request({
                url: `${baseConfig.baseUrl}/engineer/testOrder/deal/${this.detailData.id}`,
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
              uni.showToast({
                title: "开始处理",
                icon: "success"
              });
              this.updateStatus(2);
              this.getFenceInfo();
              this.startLocationCheck();
              speak$1.speak("操作机械设备前，请检查设备状态，确保安全装置齐全有效");
              this.countdown = this.detailData.time || 3;
            } else if (requestResult.data.code === 0) {
              const errorMessage = requestResult.data.msg;
              uni.showModal({
                title: "提示",
                content: errorMessage,
                showCancel: false
              });
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/testOrder/testOrder.vue:249", "处理过程中出现错误:", error);
          uni.showToast({
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
                uni.getLocation({
                  type: "gcj02",
                  success: () => resolve(true),
                  fail: () => resolve(false)
                });
              },
              () => resolve(false)
            );
          } else {
            uni.getLocation({
              type: "gcj02",
              success: () => resolve(true),
              fail: () => {
                uni.showModal({
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
          formatAppLog("error", "at pages/testOrder/testOrder.vue:348", "获取位置失败:", error);
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
          formatAppLog("error", "at pages/testOrder/testOrder.vue:365", "检查位置时出错:", error);
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
        this.countdown = this.detailData.time || 3;
        if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
        }
      },
      // 修改后的获取围栏信息方法
      getFenceInfo() {
        uni.request({
          url: `${baseConfig.baseUrl}/engineer/device/get/${this.detailData.deviceId}`,
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
                this.mapCtx = uni.createMapContext("mapContainer", this);
              });
            }
          }
        });
      },
      // 安卓地图显示
      showFenceMap() {
        if (!this.fenceCenter || this.fenceCenter.length !== 2) {
          uni.showToast({
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
          uni.showToast({
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
            formatAppLog("error", "at pages/testOrder/testOrder.vue:473", "周期定位检查失败:", e);
          }
        }, 5e3);
      },
      // 获取当前位置
      getCurrentLocation() {
        return new Promise((resolve, reject) => {
          uni.getLocation({
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
        uni.chooseImage({
          count: 1,
          sizeType: ["original", "compressed"],
          sourceType: ["album", "camera"],
          success: (res) => {
            this.repairImageUrl = res.tempFilePaths[0];
            uni.uploadFile({
              url: `${baseConfig.baseUrl}/upload`,
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
                    uni.showToast({
                      title: "上传失败: " + data.msg,
                      icon: "none"
                    });
                  }
                } catch (e) {
                  formatAppLog("error", "at pages/testOrder/testOrder.vue:523", "解析响应失败", e);
                  uni.showToast({
                    title: "上传结果解析失败",
                    icon: "none"
                  });
                }
              },
              fail: (err) => {
                formatAppLog("error", "at pages/testOrder/testOrder.vue:531", "上传失败", err);
                uni.showToast({
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
          uni.showToast({
            title: "请先上传维修图片",
            icon: "none"
          });
          return;
        }
        if (!this.current) {
          uni.showToast({
            title: "请选择设备状态",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/testOrder/testOrder.vue:556", "finish:{}", this.finishUrl);
        uni.showModal({
          title: "确认完成",
          content: "确定已完成维修吗？",
          success: (res) => {
            formatAppLog("log", "at pages/testOrder/testOrder.vue:561", this.current);
            if (res.confirm) {
              uni.request({
                url: `${baseConfig.baseUrl}/engineer/testOrder/finish/${this.detailData.id}`,
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
                    uni.showToast({
                      title: "维修完成",
                      icon: "success"
                    });
                  } else {
                    uni.showToast({
                      title: "提交维修信息失败",
                      icon: "none"
                    });
                  }
                },
                fail: () => {
                  uni.showToast({
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
          formatAppLog("error", "at pages/testOrder/testOrder.vue:615", "日期格式化失败:", e);
          return "--";
        }
      },
      getAccessToken() {
        this.token = uni.getStorageSync("token");
      },
      getDeviceOptions() {
        uni.request({
          url: `${baseConfig.baseUrl}/engineer/device/get`,
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
              uni.showToast({
                title: "获取设备列表失败",
                icon: "none"
              });
            }
          },
          fail: (err) => {
            formatAppLog("error", "at pages/testOrder/testOrder.vue:644", "获取设备列表失败", err);
            uni.showToast({
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
        formatAppLog("log", "at pages/testOrder/testOrder.vue:690", "状态已更新为:", this.getStatusText(newStatus));
      },
      onRadioChange(e) {
        this.current = e.detail.value;
      }
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "container" }, [
        vue.createElementVNode("view", { class: "map-button-container" }, [
          vue.createElementVNode("button", {
            class: "map-button",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.navigateToMapPage && $options.navigateToMapPage(...args))
          }, " 查看电子围栏地图 ")
        ]),
        vue.createCommentVNode(" 设备名称 "),
        vue.createElementVNode("view", { class: "detail-card" }, [
          vue.createElementVNode("view", { class: "detail-header" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "设备名称:")
          ]),
          vue.createElementVNode("view", { class: "detail-content" }, [
            vue.createElementVNode(
              "text",
              { class: "detail-value" },
              vue.toDisplayString($data.deviceName),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "detail-card" }, [
          vue.createElementVNode("view", { class: "detail-header" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "创建时间:")
          ]),
          vue.createElementVNode("view", { class: "detail-content" }, [
            vue.createElementVNode(
              "text",
              { class: "detail-value" },
              vue.toDisplayString($options.formatBasicDate($data.detailData.createTime)),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createCommentVNode(" 上传图片 (仅当状态为处理中时显示) "),
        $data.detailData.status === 2 && $data.countdown === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "detail-card"
        }, [
          vue.createElementVNode("view", { class: "detail-header" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "上传维修图片:")
          ]),
          vue.createElementVNode("view", { class: "detail-content" }, [
            vue.createElementVNode("view", { class: "upload-container" }, [
              !$data.repairImageUrl ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "upload-area",
                onClick: _cache[1] || (_cache[1] = (...args) => $options.chooseImage && $options.chooseImage(...args))
              }, [
                vue.createElementVNode("text", { class: "upload-text" }, "点击上传图片")
              ])) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "repair-image-container",
                onClick: _cache[2] || (_cache[2] = (...args) => $options.chooseImage && $options.chooseImage(...args))
              }, [
                vue.createElementVNode("image", {
                  src: $data.repairImageUrl,
                  mode: "widthFix",
                  class: "repair-image"
                }, null, 8, ["src"]),
                vue.createElementVNode("view", { class: "ql-image-overlay" }, [
                  vue.createElementVNode("text", { class: "overlay-text" }, "点击更换图片")
                ])
              ]))
            ])
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 处理按钮 (仅当状态为待处理时显示) "),
        $data.detailData.status === 1 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "action-button-container"
        }, [
          vue.createElementVNode("button", {
            class: "action-button",
            "hover-class": "action-button-hover",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.startProcessing && $options.startProcessing(...args))
          }, " 开始处理 ")
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 正常异常单选框 (仅当状态为处理中时显示) "),
        $data.detailData.status === 2 && $data.countdown === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "action-button-container"
        }, [
          vue.createElementVNode(
            "radio-group",
            {
              onChange: _cache[4] || (_cache[4] = (...args) => $options.onRadioChange && $options.onRadioChange(...args))
            },
            [
              vue.createElementVNode("label", null, [
                vue.createElementVNode("radio", {
                  value: "1",
                  checked: $data.current === "1"
                }, null, 8, ["checked"]),
                vue.createTextVNode(" 正常 ")
              ]),
              vue.createElementVNode("label", null, [
                vue.createElementVNode("radio", {
                  value: "0",
                  checked: $data.current === "0"
                }, null, 8, ["checked"]),
                vue.createTextVNode(" 异常 ")
              ])
            ],
            32
            /* NEED_HYDRATION */
          )
        ])) : vue.createCommentVNode("v-if", true),
        $data.detailData.status === 3 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 3,
          class: "action-button-container"
        }, [
          vue.createElementVNode("view", { class: "detail-header" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "设备状态:")
          ]),
          vue.createElementVNode("view", { class: "detail-content" }, [
            $data.detailData.current === 1 ? (vue.openBlock(), vue.createElementBlock("text", {
              key: 0,
              class: "detail-value"
            }, "正常")) : vue.createCommentVNode("v-if", true),
            $data.detailData.current === 0 ? (vue.openBlock(), vue.createElementBlock("text", {
              key: 1,
              class: "detail-value"
            }, "异常")) : vue.createCommentVNode("v-if", true)
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 新增倒计时显示 "),
        $data.countdown > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 4,
          class: "countdown-container"
        }, [
          vue.createElementVNode(
            "text",
            { class: "countdown-text" },
            "剩余时间: " + vue.toDisplayString($options.formatCountdown),
            1
            /* TEXT */
          )
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 修改后的完成维修按钮 "),
        $data.detailData.status === 2 && $data.countdown === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 5,
          class: "action-button-container"
        }, [
          vue.createElementVNode("button", {
            class: "action-button",
            "hover-class": "action-button-hover",
            onClick: _cache[5] || (_cache[5] = (...args) => $options.completeRepair && $options.completeRepair(...args))
          }, " 完成检测 ")
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesTestOrderTestOrder = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-7e3f3e94"], ["__file", "D:/app/om-engineer/pages/testOrder/testOrder.vue"]]);
  const _sfc_main$6 = {
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
          uni.showToast({
            title: "请填写备件详情",
            icon: "none"
          });
          return;
        }
        const token = uni.getStorageSync("token");
        const res = await uni.request({
          url: `${baseConfig.baseUrl}/engineer/spare/add`,
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
          uni.showToast({
            title: "申请提交成功",
            icon: "success"
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } else {
          uni.showToast({
            title: res.data.msg || "提交失败",
            icon: "none"
          });
        }
      }
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "form-card" }, [
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "form-label" }, "备件详情："),
          vue.withDirectives(vue.createElementVNode(
            "textarea",
            {
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.form.detail = $event),
              placeholder: "请输入备件详细信息",
              class: "form-textarea",
              "auto-height": ""
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.form.detail]
          ])
        ]),
        vue.createElementVNode("button", {
          class: "submit-button",
          "hover-class": "button-hover",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.submitApplication && $options.submitApplication(...args))
        }, " 提交申请 ")
      ])
    ]);
  }
  const PagesSpareSpare = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-bd81fea5"], ["__file", "D:/app/om-engineer/pages/spare/spare.vue"]]);
  const _sfc_main$5 = {
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
        countdown: 0,
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
          this.countdown = this.detailData.time || 3;
          this.getDeviceOptions();
          this.getFenceInfo();
          formatAppLog("log", "at pages/rtestOrder/rtestOrder.vue:137", this.detailData);
        } catch (e) {
          formatAppLog("error", "at pages/rtestOrder/rtestOrder.vue:139", "解析详情数据失败", e);
          uni.showToast({
            title: "数据加载失败",
            icon: "none"
          });
        }
      }
    },
    onReady() {
      this.mapCtx = uni.createMapContext("mapContainer", this);
    },
    onShow() {
      this.getFenceInfo();
      if (this.detailData.status === 2) {
        this.countdown = this.detailData.time || 3;
        this.getFenceInfo();
        this.startLocationCheck();
      }
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
      navigateToMapPage() {
        uni.navigateTo({
          url: `/pages/map/map?lng=${this.fenceCenter[0]}&lat=${this.fenceCenter[1]}&radius=${this.fenceRadius}`
        });
      },
      async startProcessing() {
        try {
          const confirmResult = await new Promise((resolve) => {
            uni.showModal({
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
              uni.showModal({
                title: "提示",
                content: "您不在电子围栏范围内，请移步",
                showCancel: false
              });
              return;
            }
            const requestResult = await new Promise((resolve, reject) => {
              uni.request({
                url: `${baseConfig.baseUrl}/engineer/rtestOrder/deal/${this.detailData.id}`,
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
              uni.showToast({
                title: "开始处理",
                icon: "success"
              });
              this.updateStatus(2);
              this.getFenceInfo();
              this.startLocationCheck();
              speak$1.speak("操作机械设备前，请检查设备状态，确保安全装置齐全有效，请不要退出该界面");
              this.countdown = this.detailData.time || 3;
            } else if (requestResult.data.code === 0) {
              const errorMessage = requestResult.data.msg;
              uni.showModal({
                title: "提示",
                content: errorMessage,
                showCancel: false
              });
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/rtestOrder/rtestOrder.vue:248", "处理过程中出现错误:", error);
          uni.showToast({
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
                uni.getLocation({
                  type: "gcj02",
                  success: () => resolve(true),
                  fail: () => resolve(false)
                });
              },
              () => resolve(false)
            );
          } else {
            uni.getLocation({
              type: "gcj02",
              success: () => resolve(true),
              fail: () => {
                uni.showModal({
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
          formatAppLog("error", "at pages/rtestOrder/rtestOrder.vue:347", "获取位置失败:", error);
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
          formatAppLog("error", "at pages/rtestOrder/rtestOrder.vue:364", "检查位置时出错:", error);
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
        this.countdown = this.detailData.time || 3;
        if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
        }
      },
      // 修改后的获取围栏信息方法
      getFenceInfo() {
        uni.request({
          url: `${baseConfig.baseUrl}/engineer/device/get/${this.detailData.deviceId}`,
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
                this.mapCtx = uni.createMapContext("mapContainer", this);
              });
            }
          }
        });
      },
      // 安卓地图显示
      showFenceMap() {
        if (!this.fenceCenter || this.fenceCenter.length !== 2) {
          uni.showToast({
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
          uni.showToast({
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
            formatAppLog("error", "at pages/rtestOrder/rtestOrder.vue:472", "周期定位检查失败:", e);
          }
        }, 5e3);
      },
      // 获取当前位置
      getCurrentLocation() {
        return new Promise((resolve, reject) => {
          uni.getLocation({
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
        uni.chooseImage({
          count: 1,
          sizeType: ["original", "compressed"],
          sourceType: ["album", "camera"],
          success: (res) => {
            this.repairImageUrl = res.tempFilePaths[0];
            uni.uploadFile({
              url: `${baseConfig.baseUrl}/upload`,
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
                    uni.showToast({
                      title: "上传失败: " + data.msg,
                      icon: "none"
                    });
                  }
                } catch (e) {
                  formatAppLog("error", "at pages/rtestOrder/rtestOrder.vue:522", "解析响应失败", e);
                  uni.showToast({
                    title: "上传结果解析失败",
                    icon: "none"
                  });
                }
              },
              fail: (err) => {
                formatAppLog("error", "at pages/rtestOrder/rtestOrder.vue:530", "上传失败", err);
                uni.showToast({
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
          uni.showToast({
            title: "请先上传维修图片",
            icon: "none"
          });
          return;
        }
        if (!this.current) {
          uni.showToast({
            title: "请选择设备状态",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/rtestOrder/rtestOrder.vue:555", "finish:{}", this.finishUrl);
        uni.showModal({
          title: "确认完成",
          content: "确定已完成维修吗？",
          success: (res) => {
            formatAppLog("log", "at pages/rtestOrder/rtestOrder.vue:560", this.current);
            if (res.confirm) {
              uni.request({
                url: `${baseConfig.baseUrl}/engineer/rtestOrder/finish/${this.detailData.id}`,
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
                    uni.showToast({
                      title: "维修完成",
                      icon: "success"
                    });
                  } else {
                    uni.showToast({
                      title: "提交维修信息失败",
                      icon: "none"
                    });
                  }
                },
                fail: () => {
                  uni.showToast({
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
          formatAppLog("error", "at pages/rtestOrder/rtestOrder.vue:614", "日期格式化失败:", e);
          return "--";
        }
      },
      getAccessToken() {
        this.token = uni.getStorageSync("token");
      },
      getDeviceOptions() {
        uni.request({
          url: `${baseConfig.baseUrl}/engineer/device/get`,
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
              uni.showToast({
                title: "获取设备列表失败",
                icon: "none"
              });
            }
          },
          fail: (err) => {
            formatAppLog("error", "at pages/rtestOrder/rtestOrder.vue:643", "获取设备列表失败", err);
            uni.showToast({
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
        formatAppLog("log", "at pages/rtestOrder/rtestOrder.vue:689", "状态已更新为:", this.getStatusText(newStatus));
      },
      onRadioChange(e) {
        this.current = e.detail.value;
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "container" }, [
        vue.createElementVNode("view", { class: "map-button-container" }, [
          vue.createElementVNode("button", {
            class: "map-button",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.navigateToMapPage && $options.navigateToMapPage(...args))
          }, " 查看电子围栏地图 ")
        ]),
        vue.createCommentVNode(" 设备名称 "),
        vue.createElementVNode("view", { class: "detail-card" }, [
          vue.createElementVNode("view", { class: "detail-header" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "设备名称:")
          ]),
          vue.createElementVNode("view", { class: "detail-content" }, [
            vue.createElementVNode(
              "text",
              { class: "detail-value" },
              vue.toDisplayString($data.deviceName),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "detail-card" }, [
          vue.createElementVNode("view", { class: "detail-header" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "创建时间:")
          ]),
          vue.createElementVNode("view", { class: "detail-content" }, [
            vue.createElementVNode(
              "text",
              { class: "detail-value" },
              vue.toDisplayString($options.formatBasicDate($data.detailData.createTime)),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createCommentVNode(" 上传图片 (仅当状态为处理中时显示) "),
        $data.detailData.status === 2 && $data.countdown === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "detail-card"
        }, [
          vue.createElementVNode("view", { class: "detail-header" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "上传巡检图片")
          ]),
          vue.createElementVNode("view", { class: "detail-content" }, [
            vue.createElementVNode("view", { class: "upload-container" }, [
              !$data.repairImageUrl ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "upload-area",
                onClick: _cache[1] || (_cache[1] = (...args) => $options.chooseImage && $options.chooseImage(...args))
              }, [
                vue.createElementVNode("text", { class: "upload-text" }, "点击上传图片")
              ])) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "repair-image-container",
                onClick: _cache[2] || (_cache[2] = (...args) => $options.chooseImage && $options.chooseImage(...args))
              }, [
                vue.createElementVNode("image", {
                  src: $data.repairImageUrl,
                  mode: "widthFix",
                  class: "repair-image"
                }, null, 8, ["src"]),
                vue.createElementVNode("view", { class: "ql-image-overlay" }, [
                  vue.createElementVNode("text", { class: "overlay-text" }, "点击更换图片")
                ])
              ]))
            ])
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 处理按钮 (仅当状态为待处理时显示) "),
        $data.detailData.status === 1 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "action-button-container"
        }, [
          vue.createElementVNode("button", {
            class: "action-button",
            "hover-class": "action-button-hover",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.startProcessing && $options.startProcessing(...args))
          }, " 开始处理 ")
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 正常异常单选框 (仅当状态为处理中时显示) "),
        $data.detailData.status === 2 && $data.countdown === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "action-button-container"
        }, [
          vue.createElementVNode(
            "radio-group",
            {
              onChange: _cache[4] || (_cache[4] = (...args) => $options.onRadioChange && $options.onRadioChange(...args))
            },
            [
              vue.createElementVNode("label", null, [
                vue.createElementVNode("radio", {
                  value: "1",
                  checked: $data.current === "1"
                }, null, 8, ["checked"]),
                vue.createTextVNode(" 正常 ")
              ]),
              vue.createElementVNode("label", null, [
                vue.createElementVNode("radio", {
                  value: "0",
                  checked: $data.current === "0"
                }, null, 8, ["checked"]),
                vue.createTextVNode(" 异常 ")
              ])
            ],
            32
            /* NEED_HYDRATION */
          )
        ])) : vue.createCommentVNode("v-if", true),
        $data.detailData.status === 3 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 3,
          class: "action-button-container"
        }, [
          vue.createElementVNode("view", { class: "detail-header" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "设备状态:")
          ]),
          vue.createElementVNode("view", { class: "detail-content" }, [
            $data.detailData.current === 1 ? (vue.openBlock(), vue.createElementBlock("text", {
              key: 0,
              class: "detail-value"
            }, "正常")) : vue.createCommentVNode("v-if", true),
            $data.detailData.current === 0 ? (vue.openBlock(), vue.createElementBlock("text", {
              key: 1,
              class: "detail-value"
            }, "异常")) : vue.createCommentVNode("v-if", true)
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 新增倒计时显示 "),
        $data.countdown > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 4,
          class: "countdown-container"
        }, [
          vue.createElementVNode(
            "text",
            { class: "countdown-text" },
            "剩余时间: " + vue.toDisplayString($options.formatCountdown),
            1
            /* TEXT */
          )
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 修改后的完成维修按钮 "),
        $data.detailData.status === 2 && $data.countdown === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 5,
          class: "action-button-container"
        }, [
          vue.createElementVNode("button", {
            class: "action-button",
            "hover-class": "action-button-hover",
            onClick: _cache[5] || (_cache[5] = (...args) => $options.completeRepair && $options.completeRepair(...args))
          }, " 完成检测 ")
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesRtestOrderRtestOrder = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-134de0b2"], ["__file", "D:/app/om-engineer/pages/rtestOrder/rtestOrder.vue"]]);
  const _sfc_main$4 = {
    data() {
      return {
        includePoints: [],
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
        countdown: 0,
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
          this.countdown = this.detailData.time || 3;
          this.getDeviceOptions();
          this.getFenceInfo();
        } catch (e) {
          formatAppLog("error", "at pages/baoyangOrder/baoyangOrder.vue:139", "解析详情数据失败", e);
          uni.showToast({
            title: "数据加载失败",
            icon: "none"
          });
        }
      }
    },
    onReady() {
      this.mapCtx = uni.createMapContext("mapContainer", this);
    },
    onShow() {
      this.getFenceInfo();
      if (this.detailData.status === 2) {
        this.countdown = this.detailData.time || 3;
        this.getFenceInfo();
        this.startLocationCheck();
      }
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
      navigateToMapPage() {
        uni.navigateTo({
          url: `/pages/map/map?lng=${this.fenceCenter[0]}&lat=${this.fenceCenter[1]}&radius=${this.fenceRadius}`
        });
      },
      // 修改后的获取围栏信息方法
      getFenceInfo() {
        uni.request({
          url: `${baseConfig.baseUrl}/engineer/device/get/${this.detailData.deviceId}`,
          method: "GET",
          header: {
            "Authorization": `Bearer ${this.token}`
          },
          success: (res) => {
            if (res.data.code === 200) {
              this.fenceCenter = [
                parseFloat(res.data.data.centerLng),
                parseFloat(res.data.data.centerLat)
              ];
              this.fenceRadius = parseFloat(res.data.data.radius);
              this.includePoints = [{
                latitude: this.fenceCenter[1],
                longitude: this.fenceCenter[0]
              }];
              this.initMapOverlays(true);
            }
          }
        });
      },
      async startProcessing() {
        try {
          const confirmResult = await new Promise((resolve) => {
            uni.showModal({
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
              uni.showModal({
                title: "提示",
                content: "您不在电子围栏范围内，请移步",
                showCancel: false
              });
              return;
            }
            const requestResult = await new Promise((resolve, reject) => {
              uni.request({
                url: `${baseConfig.baseUrl}/engineer/baoyangOrder/deal/${this.detailData.id}`,
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
              uni.showToast({
                title: "开始处理",
                icon: "success"
              });
              this.updateStatus(2);
              this.getFenceInfo();
              this.startLocationCheck();
              speak$1.speak("操作机械设备前，请检查设备状态，确保安全装置齐全有效");
              this.countdown = this.detailData.time || 3;
            } else if (requestResult.data.code === 0) {
              const errorMessage = requestResult.data.msg;
              uni.showModal({
                title: "提示",
                content: errorMessage,
                showCancel: false
              });
            }
          }
        } catch (error) {
          formatAppLog("error", "at pages/baoyangOrder/baoyangOrder.vue:278", "处理过程中出现错误:", error);
          uni.showToast({
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
                uni.getLocation({
                  type: "gcj02",
                  success: () => resolve(true),
                  fail: () => resolve(false)
                });
              },
              () => resolve(false)
            );
          } else {
            uni.getLocation({
              type: "gcj02",
              success: () => resolve(true),
              fail: () => {
                uni.showModal({
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
      initMapOverlays(force = false) {
        if (!this.fenceCenter || !this.fenceRadius)
          return;
        const fenceMarker = {
          id: 0,
          latitude: this.fenceCenter[1],
          // 纬度
          longitude: this.fenceCenter[0],
          // 经度
          title: "设备位置",
          iconPath: "/static/fence-marker.png",
          width: 30,
          height: 30
        };
        const fenceCircle = {
          latitude: this.fenceCenter[1],
          longitude: this.fenceCenter[0],
          radius: Number(this.fenceRadius),
          strokeWidth: 2,
          strokeColor: "#FF0000",
          fillColor: "#FF000022"
        };
        const userMarker = this.userLocation ? {
          id: 1,
          latitude: this.userLocation.latitude,
          longitude: this.userLocation.longitude,
          title: "我的位置",
          iconPath: "/static/user-marker.png",
          width: 20,
          height: 20
        } : null;
        this.markers = [fenceMarker].concat(userMarker || []);
        this.circles = [fenceCircle];
        formatAppLog("log", "at pages/baoyangOrder/baoyangOrder.vue:356", "当前覆盖物：", {
          markers: this.markers,
          circles: this.circles
        });
      },
      // 更新用户位置标记
      async updateUserPosition() {
        try {
          const location = await this.getCurrentLocation();
          this.userLocation = location;
          this.includePoints = [
            {
              latitude: this.fenceCenter[1],
              longitude: this.fenceCenter[0]
            },
            {
              latitude: location.latitude,
              longitude: location.longitude
            }
          ];
          this.initMapOverlays();
          if (uni.getSystemInfoSync().platform === "android") {
            this.$nextTick(() => {
              this.mapCtx.includePoints({
                points: this.includePoints,
                padding: [50, 50, 50, 50]
              });
            });
          }
        } catch (error) {
          formatAppLog("error", "at pages/baoyangOrder/baoyangOrder.vue:392", "获取位置失败:", error);
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
          formatAppLog("error", "at pages/baoyangOrder/baoyangOrder.vue:409", "检查位置时出错:", error);
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
        this.countdown = this.detailData.time || 3;
        if (this.timer) {
          clearInterval(this.timer);
          this.timer = null;
        }
      },
      // 安卓地图显示
      showFenceMap() {
        if (!this.fenceCenter || this.fenceCenter.length !== 2) {
          uni.showToast({
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
          uni.showToast({
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
            formatAppLog("error", "at pages/baoyangOrder/baoyangOrder.vue:496", "周期定位检查失败:", e);
          }
        }, 5e3);
      },
      // 获取当前位置
      getCurrentLocation() {
        return new Promise((resolve, reject) => {
          uni.getLocation({
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
        uni.chooseImage({
          count: 1,
          sizeType: ["original", "compressed"],
          sourceType: ["album", "camera"],
          success: (res) => {
            this.repairImageUrl = res.tempFilePaths[0];
            uni.uploadFile({
              url: `${baseConfig.baseUrl}/upload`,
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
                    uni.showToast({
                      title: "上传失败: " + data.msg,
                      icon: "none"
                    });
                  }
                } catch (e) {
                  formatAppLog("error", "at pages/baoyangOrder/baoyangOrder.vue:546", "解析响应失败", e);
                  uni.showToast({
                    title: "上传结果解析失败",
                    icon: "none"
                  });
                }
              },
              fail: (err) => {
                formatAppLog("error", "at pages/baoyangOrder/baoyangOrder.vue:554", "上传失败", err);
                uni.showToast({
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
          uni.showToast({
            title: "请先上传维修图片",
            icon: "none"
          });
          return;
        }
        if (!this.current) {
          uni.showToast({
            title: "请选择设备状态",
            icon: "none"
          });
          return;
        }
        formatAppLog("log", "at pages/baoyangOrder/baoyangOrder.vue:579", "finish:{}", this.finishUrl);
        uni.showModal({
          title: "确认完成",
          content: "确定已完成维修吗？",
          success: (res) => {
            formatAppLog("log", "at pages/baoyangOrder/baoyangOrder.vue:584", this.current);
            if (res.confirm) {
              uni.request({
                url: `${baseConfig.baseUrl}/engineer/baoyangOrder/finish/${this.detailData.id}`,
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
                    uni.showToast({
                      title: "维修完成",
                      icon: "success"
                    });
                  } else {
                    uni.showToast({
                      title: "提交维修信息失败",
                      icon: "none"
                    });
                  }
                },
                fail: () => {
                  uni.showToast({
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
          formatAppLog("error", "at pages/baoyangOrder/baoyangOrder.vue:638", "日期格式化失败:", e);
          return "--";
        }
      },
      getAccessToken() {
        this.token = uni.getStorageSync("token");
      },
      getDeviceOptions() {
        uni.request({
          url: `${baseConfig.baseUrl}/engineer/device/get`,
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
              uni.showToast({
                title: "获取设备列表失败",
                icon: "none"
              });
            }
          },
          fail: (err) => {
            formatAppLog("error", "at pages/baoyangOrder/baoyangOrder.vue:667", "获取设备列表失败", err);
            uni.showToast({
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
        formatAppLog("log", "at pages/baoyangOrder/baoyangOrder.vue:713", "状态已更新为:", this.getStatusText(newStatus));
      },
      onRadioChange(e) {
        this.current = e.detail.value;
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "container" }, [
        vue.createElementVNode("view", { class: "map-button-container" }, [
          vue.createElementVNode("button", {
            class: "map-button",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.navigateToMapPage && $options.navigateToMapPage(...args))
          }, " 查看电子围栏地图 ")
        ]),
        vue.createCommentVNode(" 设备名称 "),
        vue.createElementVNode("view", { class: "detail-card" }, [
          vue.createElementVNode("view", { class: "detail-header" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "设备名称:")
          ]),
          vue.createElementVNode("view", { class: "detail-content" }, [
            vue.createElementVNode(
              "text",
              { class: "detail-value" },
              vue.toDisplayString($data.deviceName),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createElementVNode("view", { class: "detail-card" }, [
          vue.createElementVNode("view", { class: "detail-header" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "创建时间:")
          ]),
          vue.createElementVNode("view", { class: "detail-content" }, [
            vue.createElementVNode(
              "text",
              { class: "detail-value" },
              vue.toDisplayString($options.formatBasicDate($data.detailData.createTime)),
              1
              /* TEXT */
            )
          ])
        ]),
        vue.createCommentVNode(" 上传图片 (仅当状态为处理中时显示) "),
        $data.detailData.status === 2 && $data.countdown === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "detail-card"
        }, [
          vue.createElementVNode("view", { class: "detail-header" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "上传维修图片:")
          ]),
          vue.createElementVNode("view", { class: "detail-content" }, [
            vue.createElementVNode("view", { class: "upload-container" }, [
              !$data.repairImageUrl ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "upload-area",
                onClick: _cache[1] || (_cache[1] = (...args) => $options.chooseImage && $options.chooseImage(...args))
              }, [
                vue.createElementVNode("text", { class: "upload-text" }, "点击上传图片")
              ])) : (vue.openBlock(), vue.createElementBlock("view", {
                key: 1,
                class: "repair-image-container",
                onClick: _cache[2] || (_cache[2] = (...args) => $options.chooseImage && $options.chooseImage(...args))
              }, [
                vue.createElementVNode("image", {
                  src: $data.repairImageUrl,
                  mode: "widthFix",
                  class: "repair-image"
                }, null, 8, ["src"]),
                vue.createElementVNode("view", { class: "ql-image-overlay" }, [
                  vue.createElementVNode("text", { class: "overlay-text" }, "点击更换图片")
                ])
              ]))
            ])
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 处理按钮 (仅当状态为待处理时显示) "),
        $data.detailData.status === 1 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "action-button-container"
        }, [
          vue.createElementVNode("button", {
            class: "action-button",
            "hover-class": "action-button-hover",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.startProcessing && $options.startProcessing(...args))
          }, " 开始处理 ")
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 正常异常单选框 (仅当状态为处理中时显示) "),
        $data.detailData.status === 2 && $data.countdown === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "action-button-container"
        }, [
          vue.createElementVNode(
            "radio-group",
            {
              onChange: _cache[4] || (_cache[4] = (...args) => $options.onRadioChange && $options.onRadioChange(...args))
            },
            [
              vue.createElementVNode("label", null, [
                vue.createElementVNode("radio", {
                  value: "1",
                  checked: $data.current === "1"
                }, null, 8, ["checked"]),
                vue.createTextVNode(" 正常 ")
              ]),
              vue.createElementVNode("label", null, [
                vue.createElementVNode("radio", {
                  value: "0",
                  checked: $data.current === "0"
                }, null, 8, ["checked"]),
                vue.createTextVNode(" 异常 ")
              ])
            ],
            32
            /* NEED_HYDRATION */
          )
        ])) : vue.createCommentVNode("v-if", true),
        $data.detailData.status === 3 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 3,
          class: "action-button-container"
        }, [
          vue.createElementVNode("view", { class: "detail-header" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "设备状态:")
          ]),
          vue.createElementVNode("view", { class: "detail-content" }, [
            $data.detailData.current === 1 ? (vue.openBlock(), vue.createElementBlock("text", {
              key: 0,
              class: "detail-value"
            }, "正常")) : vue.createCommentVNode("v-if", true),
            $data.detailData.current === 0 ? (vue.openBlock(), vue.createElementBlock("text", {
              key: 1,
              class: "detail-value"
            }, "异常")) : vue.createCommentVNode("v-if", true)
          ])
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 新增倒计时显示 "),
        $data.countdown > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 4,
          class: "countdown-container"
        }, [
          vue.createElementVNode(
            "text",
            { class: "countdown-text" },
            "剩余时间: " + vue.toDisplayString($options.formatCountdown),
            1
            /* TEXT */
          )
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 修改后的完成维修按钮 "),
        $data.detailData.status === 2 && $data.countdown === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 5,
          class: "action-button-container"
        }, [
          vue.createElementVNode("button", {
            class: "action-button",
            "hover-class": "action-button-hover",
            onClick: _cache[5] || (_cache[5] = (...args) => $options.completeRepair && $options.completeRepair(...args))
          }, " 完成检测 ")
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesBaoyangOrderBaoyangOrder = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-6915bd98"], ["__file", "D:/app/om-engineer/pages/baoyangOrder/baoyangOrder.vue"]]);
  const _sfc_main$3 = {
    data() {
      return {
        centerLng: 116.397428,
        // 默认北京中心坐标
        centerLat: 39.90923,
        radius: 100,
        // 电子围栏半径
        markers: [],
        // 地图标记
        circles: [],
        // 电子围栏圆形
        mapCtx: null,
        // 地图上下文
        locationInterval: null
        // 定位定时器
      };
    },
    onLoad(options) {
      if (options.lng && options.lat) {
        this.centerLng = parseFloat(options.lng);
        this.centerLat = parseFloat(options.lat);
      }
      if (options.radius) {
        this.radius = parseFloat(options.radius);
      }
      this.initMap();
      this.startLocationWatch();
    },
    methods: {
      // 初始化地图
      async initMap() {
        this.mapCtx = uni.createMapContext("mapContainer", this);
        this.circles = [{
          latitude: this.centerLat,
          longitude: this.centerLng,
          radius: this.radius,
          strokeWidth: 2,
          strokeColor: "#FF0000",
          fillColor: "#FF000033"
        }];
        this.markers.push({
          id: 0,
          latitude: this.centerLat,
          longitude: this.centerLng,
          iconPath: "/static/device-marker.png",
          width: 40,
          height: 40,
          title: "电子围栏中心"
        });
        try {
          const location = await this.getCurrentLocation();
          this.updateUserPosition(location);
        } catch (e) {
          uni.showToast({
            title: "获取位置失败",
            icon: "none"
          });
        }
      },
      // 获取当前位置
      getCurrentLocation() {
        return new Promise((resolve, reject) => {
          uni.getLocation({
            type: "gcj02",
            altitude: true,
            success: resolve,
            fail: reject
          });
        });
      },
      // 更新用户位置标记
      updateUserPosition(location) {
        const userMarker = {
          id: 1,
          latitude: location.latitude,
          longitude: location.longitude,
          iconPath: "/static/user-marker.png",
          width: 30,
          height: 30,
          title: "我的位置"
        };
        this.markers = [this.markers[0], userMarker];
        this.mapCtx.includePoints({
          points: [
            {
              latitude: this.centerLat,
              longitude: this.centerLng
            },
            {
              latitude: location.latitude,
              longitude: location.longitude
            }
          ],
          padding: [40, 40, 80, 40]
          // 下边距加大给按钮留空间
        });
      },
      // 开启持续定位
      startLocationWatch() {
        this.locationInterval = setInterval(async () => {
          try {
            const location = await this.getCurrentLocation();
            this.updateUserPosition(location);
          } catch (e) {
            formatAppLog("error", "at pages/map/map.vue:129", "位置更新失败:", e);
          }
        }, 5e3);
      },
      // 打开地图导航
      openNavigation() {
        uni.openLocation({
          latitude: this.centerLat,
          longitude: this.centerLng,
          name: "电子围栏中心",
          address: "目标位置",
          scale: 18
        });
      },
      // 返回上一页
      goBack() {
        uni.navigateBack({
          delta: 1
        });
      }
    },
    onUnload() {
      clearInterval(this.locationInterval);
      this.mapCtx = null;
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "map-container" }, [
      vue.createCommentVNode(" 地图组件 "),
      vue.createElementVNode("map", {
        id: "mapContainer",
        latitude: $data.centerLat,
        longitude: $data.centerLng,
        markers: $data.markers,
        circles: $data.circles,
        scale: 16,
        "show-location": true,
        style: { "width": "100%", "height": "100vh" }
      }, null, 8, ["latitude", "longitude", "markers", "circles"]),
      vue.createCommentVNode(" 使用普通view覆盖按钮 "),
      vue.createElementVNode("view", { class: "button-container" }, [
        vue.createElementVNode("button", {
          class: "nav-button",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.openNavigation && $options.openNavigation(...args))
        }, "导航"),
        vue.createElementVNode("button", {
          class: "nav-button back-button",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.goBack && $options.goBack(...args))
        }, "返回")
      ])
    ]);
  }
  const PagesMapMap = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__file", "D:/app/om-engineer/pages/map/map.vue"]]);
  const _sfc_main$2 = {
    data() {
      return {
        token: "",
        id: "",
        info: {
          name: "",
          phone: "",
          engineerNo: ""
        },
        to: {
          no: 0,
          yes: 0,
          total: 0
        },
        loading: true,
        // 添加加载状态
        error: null
        // 添加错误处理
      };
    },
    onLoad() {
      this.initData();
    },
    methods: {
      async initData() {
        try {
          this.getAccessToken();
          if (!this.token || !this.id) {
            throw new Error("用户凭证缺失，请重新登录");
          }
          await Promise.all([
            this.getInfo(),
            this.getTotal()
          ]);
        } catch (err) {
          this.error = err.message;
          formatAppLog("error", "at pages/my/my.vue:86", "数据加载失败:", err);
        } finally {
          this.loading = false;
        }
      },
      getAccessToken() {
        this.token = uni.getStorageSync("token");
        this.id = uni.getStorageSync("id");
        formatAppLog("log", "at pages/my/my.vue:94", "用户ID:", this.id);
      },
      getInfo() {
        return new Promise((resolve, reject) => {
          uni.request({
            url: `${baseConfig.baseUrl}/engineer/my/info/${this.id}`,
            method: "GET",
            header: {
              "Authorization": `Bearer ${this.token}`
            },
            success: (res) => {
              if (res.data.code === 200) {
                this.info = {
                  ...this.info,
                  name: res.data.data.name || "未设置",
                  phone: res.data.data.phone || "未设置",
                  engineerNo: res.data.data.engineerNo || "未设置"
                };
                resolve();
              } else {
                reject(new Error(`获取个人信息失败: ${res.data.message}`));
              }
            },
            fail: (err) => {
              reject(err);
            }
          });
        });
      },
      getTotal() {
        return new Promise((resolve, reject) => {
          uni.request({
            url: `${baseConfig.baseUrl}/engineer/my/random/${this.id}`,
            method: "GET",
            header: {
              "Authorization": `Bearer ${this.token}`
            },
            success: (res) => {
              if (res.data.code === 200) {
                this.to = {
                  no: res.data.data.no || 0,
                  yes: res.data.data.yes || 0,
                  total: res.data.data.total || 0
                };
                resolve();
              } else {
                reject(new Error(`获取统计信息失败: ${res.data.message}`));
              }
            },
            fail: (err) => {
              reject(err);
            }
          });
        });
      },
      changePassword() {
        uni.navigateTo({
          url: "/pages/password/password"
        });
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 个人信息 "),
      vue.createElementVNode("view", { class: "info-section" }, [
        vue.createElementVNode("view", { class: "info-item" }, [
          vue.createElementVNode("text", { class: "label" }, "姓名："),
          vue.createElementVNode(
            "text",
            { class: "value" },
            vue.toDisplayString($data.info.name),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "info-item" }, [
          vue.createElementVNode("text", { class: "label" }, "工号："),
          vue.createElementVNode(
            "text",
            { class: "value" },
            vue.toDisplayString($data.info.engineerNo),
            1
            /* TEXT */
          )
        ]),
        vue.createElementVNode("view", { class: "info-item" }, [
          vue.createElementVNode("text", { class: "label" }, "电话："),
          vue.createElementVNode(
            "text",
            { class: "value" },
            vue.toDisplayString($data.info.phone),
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createCommentVNode(" 状态卡片 "),
      vue.createElementVNode("view", { class: "status-container" }, [
        vue.createElementVNode("view", { class: "status-box pending" }, [
          vue.createElementVNode(
            "text",
            { class: "number" },
            vue.toDisplayString($data.to.no),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "text" }, "待处理")
        ]),
        vue.createElementVNode("view", { class: "status-box completed" }, [
          vue.createElementVNode(
            "text",
            { class: "number" },
            vue.toDisplayString($data.to.yes),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "text" }, "已完成")
        ]),
        vue.createElementVNode("view", { class: "status-box total" }, [
          vue.createElementVNode(
            "text",
            { class: "number" },
            vue.toDisplayString($data.to.total),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "text" }, "总工单")
        ])
      ]),
      vue.createCommentVNode(" 修改密码按钮 "),
      vue.createElementVNode("button", {
        class: "change-password-btn",
        onClick: _cache[0] || (_cache[0] = (...args) => $options.changePassword && $options.changePassword(...args))
      }, "修改密码")
    ]);
  }
  const PagesMyMy = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__file", "D:/app/om-engineer/pages/my/my.vue"]]);
  const _sfc_main$1 = {
    data() {
      return {
        user: {},
        form: {
          oldPassword: "",
          newPassword: "",
          confirmPassword: ""
        },
        engineer: {
          id: "",
          password: ""
        },
        pass: "",
        token: "",
        rules: {
          oldPassword: [{
            required: true,
            message: "请输入旧密码"
          }],
          newPassword: [
            {
              required: true,
              message: "请输入新密码"
            },
            {
              min: 6,
              message: "新密码长度不能少于6位"
            }
          ],
          confirmPassword: [
            {
              required: true,
              message: "请再次输入新密码"
            },
            {
              validator: "validateConfirmPassword",
              message: "两次输入的新密码不一致"
            }
          ]
        },
        errors: {
          oldPassword: "",
          newPassword: "",
          confirmPassword: ""
        },
        showNewPassword: false,
        showConfirmPassword: false
      };
    },
    methods: {
      getAccessToken() {
        this.token = uni.getStorageSync("token");
        this.engineer.id = uni.getStorageSync("id");
        this.pass = uni.getStorageSync("password");
        formatAppLog("log", "at pages/password/password.vue:110", "用户ID:", this.id);
      },
      validateField(field) {
        const value = this.form[field];
        const rules = this.rules[field] || [];
        let error = "";
        for (const rule of rules) {
          if (rule.required && !value.trim()) {
            error = rule.message;
            break;
          }
          if (rule.min && value.length < rule.min) {
            error = rule.message;
            break;
          }
          if (rule.validator === "validateConfirmPassword") {
            if (value !== this.form.newPassword) {
              error = rule.message;
              break;
            }
          }
        }
        this.errors[field] = error;
        return !error;
      },
      validateAllFields() {
        let isValid = true;
        ["oldPassword", "newPassword", "confirmPassword"].forEach((field) => {
          if (!this.validateField(field)) {
            isValid = false;
          }
        });
        return isValid;
      },
      toggleShowPassword(type) {
        if (type === "newPassword") {
          this.showNewPassword = !this.showNewPassword;
        } else {
          this.showConfirmPassword = !this.showConfirmPassword;
        }
      },
      submitForm() {
        if (this.validateAllFields()) {
          if (this.form.oldPassword === this.pass) {
            this.engineer.password = this.form.newPassword;
            uni.request({
              url: `${baseConfig.baseUrl}/engineer/password`,
              method: "POST",
              // 修正为大写POST
              header: {
                "Authorization": `Bearer ${this.token}`
              },
              data: this.engineer,
              // 添加data参数
              success: (res) => {
                if (res.data.code === 200) {
                  uni.showToast({
                    title: "修改成功",
                    icon: "success"
                  });
                  this.resetForm();
                  ({
                    pass: this.form.newPassword
                  });
                  setTimeout(() => {
                    uni.navigateBack();
                  }, 1500);
                } else {
                  uni.showToast({
                    title: res.data.message || "修改失败",
                    icon: "none"
                  });
                }
              },
              fail: (err) => {
                formatAppLog("error", "at pages/password/password.vue:197", "修改密码请求失败:", err);
                uni.showToast({
                  title: "网络错误，请稍后重试",
                  icon: "none"
                });
              }
            });
          } else {
            uni.showToast({
              title: "旧密码不正确",
              icon: "none"
            });
          }
        }
      },
      resetForm() {
        this.form = {
          oldPassword: "",
          newPassword: "",
          confirmPassword: ""
        };
        this.errors = {
          oldPassword: "",
          newPassword: "",
          confirmPassword: ""
        };
      }
    },
    onLoad() {
      this.getAccessToken();
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "card" }, [
        vue.createElementVNode("view", { class: "title" }, "修改密码"),
        vue.createElementVNode(
          "form",
          {
            onSubmit: _cache[8] || (_cache[8] = (...args) => $options.submitForm && $options.submitForm(...args)),
            onReset: _cache[9] || (_cache[9] = (...args) => $options.resetForm && $options.resetForm(...args))
          },
          [
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode("view", { class: "label" }, "旧密码"),
              vue.createElementVNode("view", { class: "input-wrapper" }, [
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.form.oldPassword = $event),
                    type: "password",
                    placeholder: "请输入旧密码",
                    onBlur: _cache[1] || (_cache[1] = ($event) => $options.validateField("oldPassword"))
                  },
                  null,
                  544
                  /* NEED_HYDRATION, NEED_PATCH */
                ), [
                  [vue.vModelText, $data.form.oldPassword]
                ]),
                $data.errors.oldPassword ? (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 0,
                    class: "error-message"
                  },
                  vue.toDisplayString($data.errors.oldPassword),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true)
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode("view", { class: "label" }, "新密码"),
              vue.createElementVNode("view", { class: "input-wrapper" }, [
                vue.createElementVNode("view", { class: "password-input" }, [
                  vue.withDirectives(vue.createElementVNode("input", {
                    "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.form.newPassword = $event),
                    type: $data.showNewPassword ? "text" : "password",
                    placeholder: "请输入新密码",
                    onBlur: _cache[3] || (_cache[3] = ($event) => $options.validateField("newPassword"))
                  }, null, 40, ["type"]), [
                    [vue.vModelDynamic, $data.form.newPassword]
                  ]),
                  vue.createElementVNode(
                    "text",
                    {
                      class: "iconfont",
                      onClick: _cache[4] || (_cache[4] = ($event) => $options.toggleShowPassword("newPassword"))
                    },
                    vue.toDisplayString($data.showNewPassword ? "👁️" : "👁️‍🗨️"),
                    1
                    /* TEXT */
                  )
                ]),
                $data.errors.newPassword ? (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 0,
                    class: "error-message"
                  },
                  vue.toDisplayString($data.errors.newPassword),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true)
              ])
            ]),
            vue.createElementVNode("view", { class: "form-item" }, [
              vue.createElementVNode("view", { class: "label" }, "确认新密码"),
              vue.createElementVNode("view", { class: "input-wrapper" }, [
                vue.createElementVNode("view", { class: "password-input" }, [
                  vue.withDirectives(vue.createElementVNode("input", {
                    "onUpdate:modelValue": _cache[5] || (_cache[5] = ($event) => $data.form.confirmPassword = $event),
                    type: $data.showConfirmPassword ? "text" : "password",
                    placeholder: "请再次输入新密码",
                    onBlur: _cache[6] || (_cache[6] = ($event) => $options.validateField("confirmPassword"))
                  }, null, 40, ["type"]), [
                    [vue.vModelDynamic, $data.form.confirmPassword]
                  ]),
                  vue.createElementVNode(
                    "text",
                    {
                      class: "iconfont",
                      onClick: _cache[7] || (_cache[7] = ($event) => $options.toggleShowPassword("confirmPassword"))
                    },
                    vue.toDisplayString($data.showConfirmPassword ? "👁️" : "👁️‍🗨️"),
                    1
                    /* TEXT */
                  )
                ]),
                $data.errors.confirmPassword ? (vue.openBlock(), vue.createElementBlock(
                  "view",
                  {
                    key: 0,
                    class: "error-message"
                  },
                  vue.toDisplayString($data.errors.confirmPassword),
                  1
                  /* TEXT */
                )) : vue.createCommentVNode("v-if", true)
              ])
            ]),
            vue.createElementVNode("view", { class: "button-group" }, [
              vue.createElementVNode("button", {
                type: "primary",
                "form-type": "submit"
              }, "提交"),
              vue.createElementVNode("button", {
                type: "default",
                "form-type": "reset"
              }, "重置")
            ])
          ],
          32
          /* NEED_HYDRATION */
        )
      ])
    ]);
  }
  const PagesPasswordPassword = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-f800cd94"], ["__file", "D:/app/om-engineer/pages/password/password.vue"]]);
  __definePage("pages/login/login", PagesLoginLogin);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/fail/fail", PagesFailFail);
  __definePage("pages/testOrder/testOrder", PagesTestOrderTestOrder);
  __definePage("pages/spare/spare", PagesSpareSpare);
  __definePage("pages/rtestOrder/rtestOrder", PagesRtestOrderRtestOrder);
  __definePage("pages/baoyangOrder/baoyangOrder", PagesBaoyangOrderBaoyangOrder);
  __definePage("pages/map/map", PagesMapMap);
  __definePage("pages/my/my", PagesMyMy);
  __definePage("pages/password/password", PagesPasswordPassword);
  const _sfc_main = {
    onLaunch() {
      websocketObj.setMessageHandler(this.handleGlobalMessage);
    },
    methods: {
      // 修正方法定义语法
      handleGlobalMessage(data) {
        if (data && data.message) {
          uni.showModal({
            title: "系统通知",
            content: data.message,
            showCancel: false
          });
        }
      }
    },
    onShow() {
      formatAppLog("log", "at App.vue:27", "App Show");
    },
    onHide() {
      formatAppLog("log", "at App.vue:31", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "D:/app/om-engineer/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
