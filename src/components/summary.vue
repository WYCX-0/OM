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
    const engineerData = ref([]);
    const engineerOptions = ref([]);
    const chartData = ref({
      categories: [],
      series: [
        { name: '故障数', stack: 'total', data: [] },
        { name: '测试数', stack: 'total', data: [] },
        { name: '巡检数', stack: 'total', data: [] },
        { name: '保养数', stack: 'total', data: [] }
      ]
    });

    const instance = getCurrentInstance();
    const { proxy } = instance;

    const fetchEngineerOptions = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user0')) || {};
        const token = user.token;
        
        if (!token) throw new Error('未获取到有效 Token');
        
        const res = await request.get('/admin/engineer/get', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.code === 200) {
          engineerOptions.value = res.data.map(engineer => ({
            id: engineer.id,
            name: engineer.name
          }));
        }
      } catch (error) {
        console.error('获取工程师列表失败:', error);
        proxy?.$message?.error(error.message || '获取工程师列表失败');
      }
    };

    const fetchData = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user0')) || {};
        const token = user.token;
        if (!token) throw new Error('未获取到有效 Token');

        loading.value = true;
        const res = await request.get('/admin/tong/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.code === 200) {
          engineerData.value = res.data;
          await fetchEngineerOptions();
          transformData();
          initChart();
          console.log(res.data);
        }
      } catch (error) {
        console.error('数据请求失败:', error);
        proxy?.$message?.error(error.message || '请检查网络连接或重新登录');
        if (error.message.includes('Token')) proxy?.$router?.push('/login');
      } finally {
        loading.value = false;
      }
    };

    const transformData = () => {
      // 按总工单数降序排序（修正排序逻辑为totalB - totalA）
      const sortedData = [...engineerData.value].sort((a, b) => {
        const totalA = a.totalOrders || 0;
        const totalB = b.totalOrders || 0;
        return totalA - totalB; // 升序排序
      });

      // 重置数据
      chartData.value.categories = [];
      chartData.value.series.forEach(s => s.data = []);

      sortedData.forEach(item => {
        const engineer = engineerOptions.value.find(e => e.id === item.engineerId);
        chartData.value.categories.push(engineer?.name || `工程师 ${item.engineerId}`);

        // 按顺序填充各个系列数据
        chartData.value.series[0].data.push(item.failCount);
        chartData.value.series[1].data.push(item.testCount);
        chartData.value.series[2].data.push(item.rtestCount);
        chartData.value.series[3].data.push(item.baoyangCount);
      });
    };

    const initChart = () => {
      if (!chartRef.value) return;
      myChart.value = echarts.init(chartRef.value);
      updateChart();
      window.addEventListener('resize', handleResize);
    };

    const updateChart = () => {
      const option = {
        title: { text: '工程师工单统计', left: 'center' },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { 
          data: chartData.value.series.map(s => s.name), 
          bottom: 10, // 图例移至底部
          left: 'center', // 居中显示
          orient: 'horizontal' // 水平排列
        },
        grid: { 
          left: '3%', 
          right: '4%', 
          bottom: '10%', // 预留图例空间
          containLabel: true 
        },
        xAxis: { type: 'value' },
        yAxis: {
          type: 'category',
          data: chartData.value.categories
        },
        series: chartData.value.series.map(s => ({
          ...s,
          type: 'bar',
          label: { show: true },
          emphasis: { focus: 'series' }
        }))
      };
      myChart.value.setOption(option);
    };

    const handleResize = () => myChart.value?.resize();

    onMounted(() => {
      const user = JSON.parse(localStorage.getItem('user0')) || {};
      if (!user.token) {
        proxy?.$message?.error('请重新登录');
        proxy?.$router?.push('/login');
        return;
      }
      fetchData();
    });

    onUnmounted(() => {
      myChart.value?.dispose();
      window.removeEventListener('resize', handleResize);
    });

    return { chartRef, loading };
  }
};
</script>

<style scoped>
/* 保持原有样式不变 */
.chart-container {
  width: 100%;
  margin: 20px auto;
  position: relative;
}

.chart {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  margin-bottom: 40px; /* 预留图例显示空间 */
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