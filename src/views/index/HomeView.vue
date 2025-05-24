<template>
  <div class="dashboard-container">
    <!-- 左侧区域 -->
    <div class="left-panel">
      <div class="total">
        <!-- 左侧图表组件 -->
        <Chart1 :item="item" />
      </div>
    </div>
    
    <!-- 右侧区域 -->
    <div class="right-panel">
      <!-- 右侧图表组件示例 -->
      <div class="chart-container">
        <Chart2 />
      </div>
    </div>
  </div>
</template>

<script>
// 组件名使用驼峰式引用（符合 Vue 规范）
import Chart1 from "@/components/collect.vue";
import Chart2 from "@/components/summary.vue";

export default {
  name: "DashboardLayout",
  data() {
    return {
      item: {
        processed: 190,
        untreated: 120
      }
    };
  },
  components: {
    Chart1, // 组件名使用驼峰式注册
    Chart2 // 补充右侧组件注册（示例）
  }
};
</script>

<style scoped>
.dashboard-container {
  display: flex;
  min-height: calc(100vh - 40px); /* 避免内容撑破容器 */
  margin: 20px;
}

.left-panel,
.right-panel {
  flex: 1;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); /* 添加卡片阴影 */
}

.left-panel {
  background-color: #f9f9f9;
  margin-right: 20px; /* 左右区域间距 */
}

.right-panel {
  background-color: #ffffff;
}

/* 图表容器样式（示例） */
.chart-container {
  height: 400px;
}

/* 废弃原有占位符样式，改用更通用的图表容器 */
/* .placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
} */

h3 {
  font-size: 1.25rem; /* 改用相对单位 */
  color: #333;
  margin-bottom: 1rem; /* 改用相对单位 */
}

p {
  color: #666;
  line-height: 1.5; /* 改善可读性 */
}
</style>