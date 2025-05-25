<template>
    <div class="work-order-detail">
      <el-card class="combined-card">
        <!-- 状态流程区域 -->
        <div class="flow-section">
          <div class="flowchart">
            <div 
              class="status-node" 
              v-for="status in processedStatusList" 
              :key="status.value"
            >
              <div 
                class="node-circle" 
                :style="{
                  backgroundColor: status.active ? status.color : '#f5f7fa',
                  borderColor: status.active ? status.color : '#dcdfe6'
                }"
              >
                <i v-if="status.active" class="el-icon-check"></i>
              </div>
              <div class="node-text" :class="{ active: status.active }">
                {{ status.text }}
              </div>
              <div 
                class="line" 
                :style="{ backgroundColor: status.lineActive ? status.color : '#ebeef5' }"
                v-if="!isLast(status)"
              ></div>
            </div>
          </div>
        </div>
  
        <!-- 工单信息区域 -->
        <div class="info-section">
          <div class="info-grid">
            <div class="info-column left-column">
              <div class="info-item">
                <label>工单ID：</label>
                <span>{{ workOrder.id || '--' }}</span>
              </div>
              <div class="info-item">
                <label>保养设备：</label>
                <span>{{ workOrder.deviceName }}</span>
              </div>
              <div class="info-item">
                <label>工程师：</label>
                <span>{{ workOrder.engineerName }}</span>
              </div>
              <div class="info-item">
                <label>创建时间：</label>
                <span>{{ formatDate(workOrder.createTime) }}</span>
              </div>
              <div class="status-display">
                <span>当前状态：</span>
                <span :style="{ color: getStatusColor(workOrder.status) }">
                  {{ getStatusText(workOrder.status) }}
                </span>
              </div>
            </div>

            <div class="info-column right-column">
              <div 
                class="info-item full-width"
                v-if="workOrder.status === 3"
              >
                <label>维修完成图片：</label>
                <div class="image-container">
                  <img 
                    :src="imageUrl" 
                    alt="维修后图片"
                    class="preview-image"
                  >
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>
    </div>
  </template>
  
<script>
import request from "@/utils/request";
import config from "@/utils/config";
import moment from "moment";

export default {
    data() {
        return {
            workOrder: {
                id: null,
                deviceId: null,
                deviceName: "加载中...",
                detail: "加载中...",
                engineerId: null,
                engineerName: "加载中...",
                createTime: "",
                status: 1
            },
            deviceOptions: [],
            engineerOptions: [],
            statusFlow: [
                { value: 1, text: "待处理", color: "#f56c6c" },
                { value: 2, text: "处理中", color: "#409eff" },
                { value: 3, text: "已完成", color: "#67c23a" },
                { value: 0, text: "已取消", color: "#c0c4cc" }
            ],
            token: ""
        };
    },
    computed: {
        getStatusText() {
            return status => this.statusFlow.find(s => s.value === status)?.text || "未知";
        },
        getStatusColor() {
            return status => this.statusFlow.find(s => s.value === status)?.color || "#999";
        },
        processedStatusList() {
            const currentStatus = this.workOrder.status;
            const isCanceled = currentStatus === 0;
            const normalStatus = [1, 2, 3];

            return this.statusFlow
                .filter(status =>
                    isCanceled
                        ? status.value === 0
                        : normalStatus.includes(status.value)
                )
                .map((status, index, arr) => {
                    const isActive = isCanceled
                        ? status.value === 0
                        : status.value <= currentStatus;

                    const nextStatus = arr[index + 1];
                    const lineActive = nextStatus
                        ? isCanceled
                            ? false
                            : nextStatus.value <= currentStatus
                        : false;

                    return {
                        ...status,
                        active: isActive,
                        lineActive
                    };
                });
        },
        imageUrl() {
            return `${config.baseUrl}${this.workOrder.finishUrl}`
        }
    },
    methods: {
     
        getToken() {
            const user = JSON.parse(localStorage.getItem("user0"));
            if (user?.token) {
                this.token = user.token;
            } else {
                this.$message.error("请先登录");
                this.$router.push("/login");
            }
        },
        getDeviceOptions() {
            return request.get("/admin/device/get", {
                headers: { Authorization: `Bearer ${this.token}` }
            }).then(res => {
                if (res.code === 200) this.deviceOptions = res.data;
            });
        },
        getEngineerOptions() {
            return request.get("/admin/engineer/get", {
                headers: { Authorization: `Bearer ${this.token}` }
            }).then(res => {
                if (res.code === 200) this.engineerOptions = res.data;
            });
        },
        async fetchWorkOrderDetail() {
            try {
                const id = this.$route.params.id;
                if (!id) return this.$message.error("缺少工单ID");

                const res = await request.get(`/admin/baoyangOrder/getById/${id}`, {
                    headers: { Authorization: `Bearer ${this.token}` }
                });

                if (res.code === 200) {
                    this.transformData(res.data);
                }
            } catch (error) {
                this.$message.error("获取工单详情失败");
            }
        },
        transformData(data) {
            const device = this.deviceOptions.find(d => d.id === data.deviceId);
            const engineer = this.engineerOptions.find(e => e.id === data.engineerId);

            this.workOrder = {
                ...data,
                deviceName: device?.name || "未知设备",
                engineerName: engineer?.name || "未分配",
                createTime: data.createTime || new Date().toISOString()
            };
        },
        formatDate(date) {
            return date ? moment(date).format("YYYY-MM-DD HH:mm") : "--";
        },
        isLast(status) {
            return this.processedStatusList.indexOf(status) === this.processedStatusList.length - 1;
        }
    },
    created() {
        this.getToken();
        if (this.token) {
            Promise.all([this.getDeviceOptions(), this.getEngineerOptions()])
                .then(() => this.fetchWorkOrderDetail())
                .catch(() => this.$message.error("数据加载失败"));
        }
    }
};
</script>
  
<style scoped>
.work-order-detail {
  padding: 20px;
  min-height: calc(100vh - 100px);
}

.combined-card {
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.flow-section {
  padding: 15px 20px;
  border-bottom: 1px solid #ebeef5;
  margin-bottom: 20px;
}

.info-section {
  padding: 0 20px 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 30px;
}

.info-column {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  align-items: flex-start;
  font-size: 14px;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item label {
  width: 100px;
  color: #909399;
  text-align: right;
  margin-right: 16px;
  flex-shrink: 0;
}

.info-item span {
  color: #303133;
  line-height: 1.6;
}

.detail-content {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 6px;
  line-height: 1.6;
  color: #606266;
  white-space: pre-wrap;
  width: 100%;
}

.image-container {
  margin-top: 8px;
  display: flex;
  gap: 15px;
}

.preview-image {
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.preview-image:hover {
  transform: scale(1.05);
}

.status-display {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
  font-size: 15px;
}

.status-display span:first-child {
  color: #909399;
  margin-right: 10px;
}

/* 流程样式调整 */
.flowchart {
  display: flex;
  justify-content: space-between;
  position: relative;
  max-width: 90%;
  margin: 20px auto 0;
}

.status-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 1;
  flex: 1;
}

.node-circle {
  width: 36px;
  height: 36px;
  border: 2px solid;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  transition: all 0.3s;
}

.node-circle i {
  color: white;
  font-size: 16px;
}

.node-text {
  font-size: 13px;
  color: #909399;
  text-align: center;
  white-space: nowrap;
}

.node-text.active {
  color: #303133;
  font-weight: 500;
}

.line {
  position: absolute;
  top: 18px;
  left: 50%;
  right: -50%;
  height: 2px;
  transform: translateY(-1px);
}

.left-column {
  grid-column: 1 / 2;
}

.right-column {
  grid-column: 2 / 3;
}

h3 {
  margin: 0 0 24px 0;
  color: #303133;
  font-size: 16px;
  font-weight: 600;
}
</style>