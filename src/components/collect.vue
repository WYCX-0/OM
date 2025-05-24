<template>
  <div class="chart-container">
    <div ref="chartRef" class="chart" style="width: 100%; height: 400px;"></div>
    <div v-if="loading" class="loading-mask">
      <i class="el-icon-loading"></i>
      <span>加载中...</span>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted, getCurrentInstance } from 'vue';
import * as echarts from 'echarts';
import request from "@/utils/request.js";

export default {
  name: 'FaultStatisticsChart',
  setup() {
    const chartRef = ref(null);
    const myChart = ref(null);
    const loading = ref(true);
    const deviceData = ref({});
    const deviceOptions = ref([]); // 存储设备选项列表
    const chartData = ref({
      categories: [],
      series: [{
        name: '故障数',
        type: 'bar',
        data: []
      }]
    });
    
    // 获取当前实例以访问全局属性
    const instance = getCurrentInstance();
    const { proxy } = instance; // 通过 proxy 访问 $router 和 $message
    
    // 获取设备选项列表
    const fetchDeviceOptions = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user0')) || {};
        const token = user.token;
        
        if (!token) {
          throw new Error('未获取到有效 Token');
        }
        
        const res = await request.get('/admin/device/get', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (res.code === 200) {
          deviceOptions.value = res.data.map(device => ({
            id: device.id,
            name: device.name
          }));
        } else {
          throw new Error(res.message || '获取设备列表失败');
        }
      } catch (error) {
        console.error('获取设备列表失败:', error);
        proxy?.$message?.error(error.message || '获取设备列表失败');
      }
    };
    
    // 获取故障数据
    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user0')) || {};
        const token = user.token;
        
        if (!token) {
          throw new Error('未获取到有效 Token');
        }

        loading.value = true;
        const res = await request.get('/admin/tong/collect', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('请求结果:', res);
        if (res.code === 200) {
          deviceData.value = res.data;
          // 确保设备选项已加载
          if (deviceOptions.value.length === 0) {
            await fetchDeviceOptions();
          }
          transformData();
          initChart();
        } else {
          throw new Error(res.message || '请求失败，状态码：' + res.code);
        }
      } catch (error) {
        console.error('数据请求失败:', error);
        proxy?.$message?.error(error.message || '请检查网络连接或重新登录');
        // 若 Token 失效，跳转登录页
        if (error.message.includes('Token') || error.message.includes('登录')) {
          proxy?.$router?.push('/login');
        }
      } finally {
        loading.value = false;
      }
    };

    // 数据格式转换
    const transformData = () => {
      chartData.value.categories = [];
      chartData.value.series[0].data = [];

      // 转换设备ID为数字进行比较
      const sortedData = Object.entries(deviceData.value)
        .map(([deviceId, count]) => ({
          deviceId: parseInt(deviceId, 10), // 转换为数字
          count
        }))
        .sort((a, b) => a.count - b.count); // 降序排列

      sortedData.forEach(item => {
        const device = deviceOptions.value.find(option => 
          option.id === item.deviceId // 直接比较数字ID
        );
        
        // 使用设备名称或回退显示
        const deviceName = device ? device.name : `设备${item.deviceId}`;
        
        chartData.value.categories.push(deviceName);
        chartData.value.series[0].data.push(item.count);
      });
    };
    // 初始化图表
    const initChart = () => {
      if (!chartRef.value) return;
      myChart.value = echarts.init(chartRef.value);
      updateChart();
      window.addEventListener('resize', handleResize);
    };

    // 更新图表配置
    const updateChart = () => {
      if (!myChart.value) return;
      const option = {
        title: { text: '设备故障统计', left: 'center' },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
        xAxis: { type: 'value', boundaryGap: [0, 0.01] },
        yAxis: { type: 'category', data: chartData.value.categories },
        series: chartData.value.series
      };
      myChart.value.setOption(option);
    };

    // 窗口Resize处理
    const handleResize = () => myChart.value?.resize();

    // 挂载钩子
    onMounted(() => {
      // 检查用户信息或 Token
      const user = JSON.parse(localStorage.getItem('user0')) || {};
      if (!user.token && !localStorage.getItem('token')) {
        proxy?.$message?.error('未获取到用户信息，请重新登录');
        proxy?.$router?.push('/login');
        return;
      }
      fetchData();
    });

    // 卸载钩子
    onUnmounted(() => {
      myChart.value?.dispose();
      window.removeEventListener('resize', handleResize);
    });

    return { chartRef, loading };
  }
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  margin: 20px auto;
  position: relative;
}

.chart {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
}

.loading-mask {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #606266;
  font-size: 14px;
  z-index: 10;
}

.loading-mask i {
  margin-bottom: 8px;
  font-size: 24px;
  animation: rotate 2s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>