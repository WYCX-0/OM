<template>
	<view class="container">
		<!-- 功能模块 -->
		<view class="modules">
			<view v-for="(item, index) in modules" :key="index" class="module-item"
				:class="{ active: activeModule === item.type }" @click="handleModuleClick(item.type)">
				{{ item.name }}
			</view>
		</view>

		<!-- 数据列表 -->
		<scroll-view class="list-container" scroll-y>
			<view v-for="(item, index) in listData" :key="index" class="list-item" @click="handleItemClick(item)">
				<view class="item-content">
					<view class="device-info">
						<text class="device-id">{{ getDeviceName(item.deviceId) }}</text>
						<text class="detail">{{ item.detail }}</text>
					</view>
					<text class="status" :class="getStatusClass(item.status)">{{ getStatusText(item.status) }}</text>
				</view>
			</view>
			<view v-if="listData.length === 0" class="empty">暂无数据</view>
		</scroll-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				modules: [{
						name: '维修',
						type: 'repair',
						url: 'http://192.168.47.195:9090/engineer/fail/getFail', // 维修模块接口
						method: 'GET', // 请求方式
						detailUrl: 'http://192.168.47.195:9090/engineer/fail/getById', // 维修详情接口
						detailPage: '/pages/fail/fail' // 维修详情页面路径
					},
					{
						name: '巡检',
						type: 'inspection',
						url: '/',
						method: 'POST',
						detailUrl: '/api/inspection/getById', // 巡检详情接口
						detailPage: '/pages/inspectionDetail' // 巡检详情页面路径
					},
					{
						name: '保养',
						type: 'maintenance',
						url: '/api/maintenance/list',
						method: 'GET',
						detailUrl: '/api/maintenance/getById', // 保养详情接口
						detailPage: '/pages/maintenanceDetail' // 保养详情页面路径
					},
					{
						name: '检测',
						type: 'test',
						url: 'http://192.168.47.195:9090/engineer/testOrder/getTestOrder',
						method: 'GET',
						detailUrl: 'http://192.168.47.195:9090/engineer/testOrder/getById', // 检测详情接口
						detailPage: '/pages/testOrder/testOrder' // 检测详情页面路径
					}
				],
				activeModule: 'repair',
				listData: [], // 存储列表数据
				token: '',
				deviceOptions: []
			};
		},
		mounted() {
			this.getAccessToken();
			this.fetchData();
			this.getDeviceOptions();
		},
		onPullDownRefresh() {
			// 调用获取数据的方法
			this.fetchData().then(() => {
				// 数据获取完成后停止下拉刷新动画
				uni.stopPullDownRefresh();
			});
		},
		methods: {
			getAccessToken() {
				this.token = uni.getStorageSync('token');
			},
			getDeviceOptions() {
				uni.request({
					url: 'http://192.168.47.195:9090/admin/device/get',
					method: 'GET',
					header: {
						'Authorization': `Bearer ${this.token}` // ✅ 使用存储的 token
					},
					success: (res) => {
						if (res.data.code === 200) {
							this.deviceOptions = res.data.data.map(device => ({
								id: device.id,
								name: device.name
							}));
							// 数据获取后更新列表数据中的设备名称
							this.updateListDataDeviceNames();
						}
					}
				});
			},
			// 获取当前模块配置
			getCurrentModule() {
				return this.modules.find(item => item.type === this.activeModule);
			},

			// 获取数据（修改后）
			async fetchData() {
				try {
					const currentModule = this.getCurrentModule();
					if (!currentModule) return;

					const requestConfig = {
						url: currentModule.url,
						method: currentModule.method,
						data: {}
					};

					// 根据请求方式组织参数
					if (currentModule.method === 'GET') {
						requestConfig.data = {
							moduleType: this.activeModule,
							keyword: this.searchKeyword
						};
						requestConfig.header = {
							'Authorization': `Bearer ${this.token}`
						};
					} else { // POST请求
						requestConfig.header = {
							'Authorization': `Bearer ${this.token}`
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
						// 数据获取后更新列表数据中的设备名称
						this.updateListDataDeviceNames();
					}
				} catch (error) {
					uni.showToast({
						title: '数据加载失败',
						icon: 'none'
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
						return 'status-cancel';
					case 1:
						return 'status-pending';
					case 2:
						return 'status-processing';
					case 3:
						return 'status-complete';
					default:
						return '';
				}
			},

			getStatusText(status) {
				switch (status) {
					case 0:
						return '已取消';
					case 1:
						return '待处理';
					case 2:
						return '处理中';
					case 3:
						return '已完成';
					default:
						return '';
				}
			},
			getDeviceName(deviceId) {
				const device = this.deviceOptions.find(item => item.id === deviceId);
				return device ? device.name : '未知设备';
			},
			updateListDataDeviceNames() {
				this.listData = this.listData.map(item => {
					return {
						...item,
						deviceName: this.getDeviceName(item.deviceId)
					};
				});
			},
			async handleItemClick(item) {
				const currentModule = this.getCurrentModule();
				if (!currentModule) return;

				const detailUrl = `${currentModule.detailUrl}/${item.id}`; // 确保URL格式正确
				const res = await uni.request({
					url: detailUrl,
					method: 'GET',
					header: {
						'Authorization': `Bearer ${this.token}`
					}
				});

				// 检查HTTP状态码和业务状态码
				if (res.data.code === 200) {
					const detailData = res.data.data;
					// 编码参数
					const encodedData = encodeURIComponent(JSON.stringify(detailData));
					uni.navigateTo({
						url: `${currentModule.detailPage}?detailData=${encodedData}`
					});
				} else {
					uni.showToast({
						title: '详情数据加载失败',
						icon: 'none'
					});
				}
			}
		}
	};
</script>

<style scoped>
	.item-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
	}

	.device-info {
		display: flex;
		flex-direction: column;
	}

	.device-id {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.detail {
		font-size: 24rpx;
		color: #666;
	}

	.status {
		font-size: 24rpx;
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
	}

	.status-cancel {
		color: #999;
		border: 1rpx solid #999;
	}

	.status-pending {
		color: #FF4D4F;
		border: 1rpx solid #FF4D4F;
		font-weight: bold;
	}

	.status-processing {
		color: #007AFF;
		border: 1rpx solid #007AFF;
	}

	.status-complete {
		color: #4CD964;
		border: 1rpx solid #4CD964;
		font-weight: bold;
	}

	.container {
		padding: 20rpx;
	}

	.search-bar {
		margin-bottom: 30rpx;
	}

	.modules {
		display: flex;
		justify-content: space-between;
		margin-bottom: 30rpx;
	}

	.module-item {
		flex: 1;
		text-align: center;
		padding: 20rpx;
		margin: 0 10rpx;
		background-color: #f5f5f5;
		border-radius: 10rpx;
		transition: all 0.3s;
	}

	.module-item.active {
		background-color: #007AFF;
		color: white;
	}

	.list-container {
		height: calc(100vh - 300rpx);
	}

	.list-item {
		padding: 30rpx;
		background: white;
		margin-bottom: 20rpx;
		border-radius: 10rpx;
		display: flex;
		justify-content: space-between;
		box-shadow: 0 2rpx 6rpx rgba(0, 0, 0, 0.1);
		cursor: pointer;
	}

	.time {
		color: #888;
		font-size: 24rpx;
	}

	.empty {
		text-align: center;
		color: #999;
		padding: 50rpx;
	}
</style>