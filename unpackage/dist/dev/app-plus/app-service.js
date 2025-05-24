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
  const baseConfig = {
    baseUrl: "http://192.168.55.195:9090",
    wsBaseUrl: "ws://192.168.55.195:9090"
  };
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$1 = {
    data() {
      return {
        form: {
          detail: "",
          deviceId: "",
          beforeUrl: "",
          additionalInfo: ""
        },
        deviceOptions: [],
        deviceIndex: -1,
        isSubmitting: false,
        tempFilePath: null
      };
    },
    computed: {
      isFormValid() {
        return this.form.detail.trim() !== "" && this.form.deviceId !== "" && this.form.beforeUrl !== "";
      }
    },
    onLoad() {
      this.getDeviceOptions();
    },
    methods: {
      // 获取设备列表
      getDeviceOptions() {
        uni.showLoading({
          title: "加载中..."
        });
        uni.request({
          url: `${baseConfig.baseUrl}/user/device/get`,
          method: "GET",
          success: (res) => {
            uni.hideLoading();
            if (res.data.code === 200) {
              this.deviceOptions = res.data.data.map((device) => ({
                id: device.id,
                name: device.name
              }));
              if (this.deviceOptions.length > 0 && this.deviceIndex === -1) {
                this.deviceIndex = 0;
                this.form.deviceId = this.deviceOptions[0].id;
              }
            } else {
              uni.showToast({
                title: "获取设备列表失败",
                icon: "none"
              });
            }
          },
          fail: (err) => {
            uni.hideLoading();
            formatAppLog("error", "at pages/fail/fail.vue:126", "获取设备列表失败", err);
            uni.showToast({
              title: "获取设备列表失败，请检查网络连接",
              icon: "none"
            });
          }
        });
      },
      // 设备选择变更
      deviceChange(e) {
        this.deviceIndex = e.detail.value;
        this.form.deviceId = this.deviceOptions[this.deviceIndex].id;
      },
      // 选择并上传图片
      chooseImage() {
        uni.chooseImage({
          count: 1,
          sizeType: ["original", "compressed"],
          sourceType: ["album", "camera"],
          success: (res) => {
            this.tempFilePath = res.tempFilePaths[0];
            this.form.beforeUrl = this.tempFilePath;
            uni.showLoading({
              title: "图片上传中..."
            });
            uni.uploadFile({
              url: `${baseConfig.baseUrl}/upload`,
              filePath: this.tempFilePath,
              name: "file",
              header: {
                "Content-Type": "multipart/form-data"
              },
              success: (uploadRes) => {
                uni.hideLoading();
                try {
                  const data = JSON.parse(uploadRes.data);
                  if (data.code === 200) {
                    this.form.beforeUrl = data.data;
                    uni.showToast({
                      title: "图片上传成功"
                    });
                  } else {
                    this.form.beforeUrl = "";
                    uni.showToast({
                      title: "上传失败: " + data.msg,
                      icon: "none"
                    });
                  }
                } catch (e) {
                  this.form.beforeUrl = "";
                  uni.showToast({
                    title: "上传失败，服务器响应格式错误",
                    icon: "none"
                  });
                }
              },
              fail: (err) => {
                this.form.beforeUrl = "";
                uni.hideLoading();
                uni.showToast({
                  title: "上传失败，请检查网络连接",
                  icon: "none"
                });
              }
            });
          }
        });
      },
      submitForm() {
        if (!this.isFormValid) {
          uni.showToast({
            title: "请填写必填字段",
            icon: "none"
          });
          return;
        }
        this.isSubmitting = true;
        uni.request({
          url: `${baseConfig.baseUrl}/user/fail/add`,
          method: "POST",
          data: this.form,
          success: (response) => {
            this.isSubmitting = false;
            if (response.data.code === 200) {
              uni.showToast({
                title: "报修完成",
                icon: "success"
              });
              this.form.detail = "";
              this.form.beforeUrl = "";
              this.form.deviceId = this.deviceOptions.length > 0 ? this.deviceOptions[0].id : "";
              this.deviceIndex = this.deviceOptions.length > 0 ? 0 : -1;
            } else {
              uni.showToast({
                title: "提交失败: " + response.data.msg,
                icon: "none"
              });
            }
          },
          fail: (err) => {
            this.isSubmitting = false;
            uni.showToast({
              title: "网络请求失败，请检查连接",
              icon: "none"
            });
            formatAppLog("error", "at pages/fail/fail.vue:242", "请求失败详情:", err);
          }
        });
      }
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "form-container" }, [
      vue.createCommentVNode(" 报修表单头部 "),
      vue.createElementVNode("view", { class: "form-header" }, [
        vue.createElementVNode("text", { class: "form-title" }, "设备报修单")
      ]),
      vue.createCommentVNode(" 表单主体 "),
      vue.createElementVNode("view", { class: "form-body" }, [
        vue.createCommentVNode(" 报修细节 "),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "报修细节"),
          vue.createElementVNode("view", { class: "detail-input" }, [
            vue.withDirectives(vue.createElementVNode(
              "input",
              {
                type: "text",
                placeholder: "请输入报修细节",
                "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.form.detail = $event),
                class: "input"
              },
              null,
              512
              /* NEED_PATCH */
            ), [
              [vue.vModelText, $data.form.detail]
            ])
          ])
        ]),
        vue.createCommentVNode(" 报修设备 "),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "报修设备"),
          vue.createElementVNode("picker", {
            onChange: _cache[1] || (_cache[1] = (...args) => $options.deviceChange && $options.deviceChange(...args)),
            value: $data.deviceIndex,
            range: $data.deviceOptions,
            "range-key": "name",
            class: "device-picker"
          }, [
            vue.createElementVNode("view", { class: "picker" }, [
              vue.createTextVNode(
                vue.toDisplayString($data.deviceIndex !== -1 ? $data.deviceOptions[$data.deviceIndex].name : "请选择报修设备") + " ",
                1
                /* TEXT */
              ),
              vue.createElementVNode("i", { class: "fa fa-chevron-down picker-icon" })
            ])
          ], 40, ["value", "range"])
        ]),
        vue.createCommentVNode(" 上传图片 "),
        vue.createElementVNode("view", { class: "form-item" }, [
          vue.createElementVNode("text", { class: "label" }, "故障图片"),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["upload-container", { "has-image": $data.form.beforeUrl }])
            },
            [
              vue.createCommentVNode(" 没有图片时显示上传区域 "),
              !$data.form.beforeUrl ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "upload-area",
                onClick: _cache[2] || (_cache[2] = (...args) => $options.chooseImage && $options.chooseImage(...args))
              }, [
                vue.createElementVNode("i", { class: "fa fa-camera upload-icon" }),
                vue.createElementVNode("text", { class: "upload-text" }, "点击上传图片")
              ])) : (vue.openBlock(), vue.createElementBlock(
                vue.Fragment,
                { key: 1 },
                [
                  vue.createCommentVNode(" 有图片时显示图片，并可点击重新上传 "),
                  vue.createElementVNode("view", {
                    class: "repair-image-container",
                    onClick: _cache[3] || (_cache[3] = (...args) => $options.chooseImage && $options.chooseImage(...args))
                  }, [
                    vue.createElementVNode("image", {
                      src: $data.form.beforeUrl,
                      mode: "aspectFill",
                      class: "repair-image"
                    }, null, 8, ["src"]),
                    vue.createElementVNode("view", { class: "image-overlay" }, [
                      vue.createElementVNode("text", { class: "overlay-text" }, "点击更换图片")
                    ])
                  ])
                ],
                2112
                /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
              ))
            ],
            2
            /* CLASS */
          ),
          vue.createElementVNode("text", { class: "image-hint" }, "请上传能清晰显示故障的图片")
        ]),
        vue.createCommentVNode(" 提交按钮 "),
        vue.createElementVNode("button", {
          disabled: !$options.isFormValid || $data.isSubmitting,
          class: vue.normalizeClass([{ "btn-disabled": !$options.isFormValid || $data.isSubmitting }, "submit-btn"]),
          type: "primary",
          onClick: _cache[4] || (_cache[4] = (...args) => $options.submitForm && $options.submitForm(...args))
        }, [
          $data.isSubmitting ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "提交中...")) : (vue.openBlock(), vue.createElementBlock("text", { key: 1 }, "提交报修"))
        ], 10, ["disabled"])
      ])
    ]);
  }
  const PagesFailFail = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-4cd3f726"], ["__file", "D:/app/om-user/pages/fail/fail.vue"]]);
  __definePage("pages/fail/fail", PagesFailFail);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:7", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:10", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "D:/app/om-user/App.vue"]]);
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
