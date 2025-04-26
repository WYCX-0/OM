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
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$5 = {
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
          url: "http://192.168.245.195:9090/engineer/login",
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
              const wsURL = `ws://192.168.245.195:9090/ws/engineer/${res.data.data.id}`;
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
            formatAppLog("error", "at pages/login/login.vue:74", "登录请求失败", err);
            uni.showToast({
              title: "网络错误，请稍后重试",
              icon: "none"
            });
          }
        });
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-e4e4508d"], ["__file", "D:/app/om-engineer/pages/login/login.vue"]]);
  const _sfc_main$4 = {
    data() {
      return {
        modules: [
          {
            name: "维修",
            type: "repair",
            url: "http://192.168.47.195:9090/engineer/fail/getFail",
            // 维修模块接口
            method: "GET",
            // 请求方式
            detailUrl: "http://192.168.47.195:9090/engineer/fail/getById",
            // 维修详情接口
            detailPage: "/pages/fail/fail"
            // 维修详情页面路径
          },
          {
            name: "巡检",
            type: "inspection",
            url: "/",
            method: "POST",
            detailUrl: "/api/inspection/getById",
            // 巡检详情接口
            detailPage: "/pages/inspectionDetail"
            // 巡检详情页面路径
          },
          {
            name: "保养",
            type: "maintenance",
            url: "/api/maintenance/list",
            method: "GET",
            detailUrl: "/api/maintenance/getById",
            // 保养详情接口
            detailPage: "/pages/maintenanceDetail"
            // 保养详情页面路径
          },
          {
            name: "检测",
            type: "test",
            url: "http://192.168.47.195:9090/engineer/testOrder/getTestOrder",
            method: "GET",
            detailUrl: "http://192.168.47.195:9090/engineer/testOrder/getById",
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
        uni.stopPullDownRefresh();
      });
    },
    methods: {
      getAccessToken() {
        this.token = uni.getStorageSync("token");
      },
      getDeviceOptions() {
        uni.request({
          url: "http://192.168.47.195:9090/admin/device/get",
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
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
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
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-1cf27b2a"], ["__file", "D:/app/om-engineer/pages/index/index.vue"]]);
  const _sfc_main$3 = {
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
        defaultImageUrl: "https://via.placeholder.com/300x200?text=No+Image",
        deviceName: "",
        deviceOptions: [],
        token: ""
        // 请确保在实际使用中正确获取和存储 token
      };
    },
    onLoad(options) {
      if (options.detailData) {
        try {
          this.detailData = JSON.parse(decodeURIComponent(options.detailData));
          this.getDeviceOptions();
          this.getAccessToken();
        } catch (e) {
          formatAppLog("error", "at pages/fail/fail.vue:114", "解析详情数据失败", e);
          uni.showToast({
            title: "数据加载失败",
            icon: "none"
          });
        }
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
          formatAppLog("error", "at pages/fail/fail.vue:146", "日期格式化失败:", e);
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
                url: `http://192.168.47.195:9090/engineer/fail/deal/${this.detailData.id}`,
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
                  } else {
                    uni.showToast({
                      title: "您有正在处理中的工单",
                      icon: "none"
                    });
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
              url: "http://192.168.47.195:9090/upload",
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
                  formatAppLog("error", "at pages/fail/fail.vue:219", "解析响应失败", e);
                  uni.showToast({
                    title: "上传结果解析失败",
                    icon: "none"
                  });
                }
              },
              fail: (err) => {
                formatAppLog("error", "at pages/fail/fail.vue:227", "上传失败", err);
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
        formatAppLog("log", "at pages/fail/fail.vue:245", "finish:{}", this.finishUrl);
        uni.showModal({
          title: "确认完成",
          content: "确定已完成维修吗？",
          success: (res) => {
            if (res.confirm) {
              uni.request({
                url: `http://192.168.47.195:9090/engineer/fail/finish/${this.detailData.id}`,
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
          url: "http://192.168.47.195:9090/admin/device/get",
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
            formatAppLog("error", "at pages/fail/fail.vue:309", "获取设备列表失败", err);
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
        formatAppLog("log", "at pages/fail/fail.vue:355", "状态已更新为:", this.getStatusText(newStatus));
      }
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
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
              src: $data.detailData.beforeUrl || $data.defaultImageUrl,
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
            vue.createElementVNode("view", {
              class: "upload-area",
              onClick: _cache[1] || (_cache[1] = (...args) => $options.chooseImage && $options.chooseImage(...args))
            }, [
              vue.createElementVNode("text", { class: "upload-text" }, "点击上传图片")
            ]),
            $data.repairImageUrl ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "repair-image-container"
            }, [
              vue.createElementVNode("image", {
                src: $data.repairImageUrl,
                mode: "widthFix",
                class: "repair-image"
              }, null, 8, ["src"])
            ])) : vue.createCommentVNode("v-if", true)
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
          onClick: _cache[2] || (_cache[2] = (...args) => $options.startProcessing && $options.startProcessing(...args))
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
          onClick: _cache[3] || (_cache[3] = (...args) => $options.completeRepair && $options.completeRepair(...args))
        }, " 完成维修 ")
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesFailFail = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-4cd3f726"], ["__file", "D:/app/om-engineer/pages/fail/fail.vue"]]);
  const _sfc_main$2 = {
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
        countdown: 180,
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
          this.detailData = JSON.parse(decodeURIComponent(options.detailData));
          this.getDeviceOptions();
          this.getAccessToken();
          this.getFenceInfo();
          formatAppLog("log", "at pages/testOrder/testOrder.vue:127", this.detailData);
        } catch (e) {
          formatAppLog("error", "at pages/testOrder/testOrder.vue:129", "解析详情数据失败", e);
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
                url: `http://192.168.47.195:9090/engineer/testOrder/deal/${this.detailData.id}`,
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
          formatAppLog("error", "at pages/testOrder/testOrder.vue:225", "处理过程中出现错误:", error);
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
          formatAppLog("error", "at pages/testOrder/testOrder.vue:324", "获取位置失败:", error);
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
          formatAppLog("error", "at pages/testOrder/testOrder.vue:341", "检查位置时出错:", error);
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
        uni.request({
          url: `http://192.168.47.195:9090/admin/device/get4/${this.detailData.deviceId}`,
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
            formatAppLog("error", "at pages/testOrder/testOrder.vue:445", "周期定位检查失败:", e);
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
              url: "http://192.168.47.195:9090/upload",
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
                  formatAppLog("error", "at pages/testOrder/testOrder.vue:495", "解析响应失败", e);
                  uni.showToast({
                    title: "上传结果解析失败",
                    icon: "none"
                  });
                }
              },
              fail: (err) => {
                formatAppLog("error", "at pages/testOrder/testOrder.vue:503", "上传失败", err);
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
        formatAppLog("log", "at pages/testOrder/testOrder.vue:528", "finish:{}", this.finishUrl);
        uni.showModal({
          title: "确认完成",
          content: "确定已完成维修吗？",
          success: (res) => {
            formatAppLog("log", "at pages/testOrder/testOrder.vue:533", this.current);
            if (res.confirm) {
              uni.request({
                url: `http://192.168.47.195:9090/engineer/testOrder/finish/${this.detailData.id}`,
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
          formatAppLog("error", "at pages/testOrder/testOrder.vue:587", "日期格式化失败:", e);
          return "--";
        }
      },
      getAccessToken() {
        this.token = uni.getStorageSync("token");
      },
      getDeviceOptions() {
        uni.request({
          url: "http://192.168.47.195:9090/admin/device/get",
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
            formatAppLog("error", "at pages/testOrder/testOrder.vue:616", "获取设备列表失败", err);
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
        formatAppLog("log", "at pages/testOrder/testOrder.vue:662", "状态已更新为:", this.getStatusText(newStatus));
      },
      onRadioChange(e) {
        this.current = e.detail.value;
      }
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "container" }, [
        $data.fenceCenter ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "map-container"
        }, [
          vue.createElementVNode("map", {
            id: "mapContainer",
            style: { "width": "100%", "height": "300rpx" },
            latitude: $data.fenceCenter[1],
            longitude: $data.fenceCenter[0],
            markers: $data.markers,
            circles: $data.circles,
            "show-location": true,
            onRegionchange: _cache[0] || (_cache[0] = (...args) => _ctx.onRegionChange && _ctx.onRegionChange(...args))
          }, null, 40, ["latitude", "longitude", "markers", "circles"])
        ])) : vue.createCommentVNode("v-if", true),
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
          key: 1,
          class: "detail-card"
        }, [
          vue.createElementVNode("view", { class: "detail-header" }, [
            vue.createElementVNode("text", { class: "detail-label" }, "上传维修图片:")
          ]),
          vue.createElementVNode("view", { class: "detail-content" }, [
            vue.createElementVNode("view", { class: "upload-container" }, [
              vue.createElementVNode("view", {
                class: "upload-area",
                onClick: _cache[1] || (_cache[1] = (...args) => $options.chooseImage && $options.chooseImage(...args))
              }, [
                vue.createElementVNode("text", { class: "upload-text" }, "点击上传图片")
              ]),
              $data.repairImageUrl ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "repair-image-container"
              }, [
                vue.createElementVNode("image", {
                  src: $data.repairImageUrl,
                  mode: "widthFix",
                  class: "repair-image"
                }, null, 8, ["src"])
              ])) : vue.createCommentVNode("v-if", true)
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
            onClick: _cache[2] || (_cache[2] = (...args) => $options.startProcessing && $options.startProcessing(...args))
          }, " 开始处理 ")
        ])) : vue.createCommentVNode("v-if", true),
        vue.createCommentVNode(" 正常异常单选框 (仅当状态为处理中时显示) "),
        $data.detailData.status === 2 && $data.countdown === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 3,
          class: "action-button-container"
        }, [
          vue.createElementVNode(
            "radio-group",
            {
              onChange: _cache[3] || (_cache[3] = (...args) => $options.onRadioChange && $options.onRadioChange(...args))
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
          key: 4,
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
          key: 5,
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
          key: 6,
          class: "action-button-container"
        }, [
          vue.createElementVNode("button", {
            class: "action-button",
            "hover-class": "action-button-hover",
            onClick: _cache[4] || (_cache[4] = (...args) => $options.completeRepair && $options.completeRepair(...args))
          }, " 完成检测 ")
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesTestOrderTestOrder = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-7e3f3e94"], ["__file", "D:/app/om-engineer/pages/testOrder/testOrder.vue"]]);
  const _sfc_main$1 = {
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
          url: "http://192.168.47.195:9090/engineer/spare/add",
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
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
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
  const PagesSpareSpare = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-bd81fea5"], ["__file", "D:/app/om-engineer/pages/spare/spare.vue"]]);
  __definePage("pages/login/login", PagesLoginLogin);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/fail/fail", PagesFailFail);
  __definePage("pages/testOrder/testOrder", PagesTestOrderTestOrder);
  __definePage("pages/spare/spare", PagesSpareSpare);
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
