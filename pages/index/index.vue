<template>

	<view class="container">
		<!-- 功能模块 -->
		<view class="modules">
			<view v-for="(item, index) in modules" :key="index" class="module-item"
				:class="{ active: activeModule === item.type }" @click="handleModuleClick(item.type)">
				{{ item.name }}
			</view>
		</view>

		<view v-if="pendingOrder" class="pending-notice" @click="handlePendingOrderClick">
			<text>您有正在处理中的<text class="order-type">{{ getOrderTypeName(pendingOrderType) }}</text>工单，点击查看详情</text>
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
	import {
		baseConfig
	} from '../../utils/config';

	export default {
		data() {
			return {
				modules: [{
						name: '维修',
						type: 'repair',
						url: `${baseConfig.baseUrl}/engineer/fail/getFail`,
						method: 'GET',
						detailUrl: `${baseConfig.baseUrl}/engineer/fail/getById`,
						detailPage: '/pages/fail/fail'
					},
					{
						name: '巡检',
						type: 'inspection',
						url: `${baseConfig.baseUrl}/engineer/rtestOrder/getRTestOrder`,
						method: 'GET',
						detailUrl: `${baseConfig.baseUrl}/engineer/rtestOrder/getById`,
						detailPage: '/pages/rtestOrder/rtestOrder'
					},
					{
						name: '保养',
						type: 'maintenance',
						url: `${baseConfig.baseUrl}/engineer/baoyangOrder/getBaoyangOrder`,
						method: 'GET',
						detailUrl: `${baseConfig.baseUrl}/engineer/baoyangOrder/getById`,
						detailPage: '/pages/baoyangOrder/baoyangOrder'
					},
					{
						name: '检测',
						type: 'test',
						url: `${baseConfig.baseUrl}/engineer/testOrder/getTestOrder`,
						method: 'GET',
						detailUrl: `${baseConfig.baseUrl}/engineer/testOrder/getById`,
						detailPage: '/pages/testOrder/testOrder'
					}
				],
				pendingOrder: false,
				pendingOrderType: null,
				pendingOrderId: null,
				activeModule: 'repair',
				listData: [],
				token: '',
				deviceOptions: [],
				searchKeyword: ''
			};
		},
		mounted() {
			this.getAccessToken();
			this.checkPendingOrder();
			this.fetchData();
			this.getDeviceOptions();
		},
		onPullDownRefresh() {
			// 同时刷新数据列表和待处理工单状态
			Promise.all([this.fetchData(), this.checkPendingOrder()])
				.finally(() => {
					uni.stopPullDownRefresh();
				});
		},
		methods: {
			getOrderTypeName(type) {
				const typeMap = {
					'repair': '维修',
					'inspection': '巡检',
					'maintenance': '保养',
					'test': '检测'
				};
				return typeMap[type] || '未知';
			},
			async checkPendingOrder() {
				try {
					const {
						data
					} = await uni.request({
						url: `${baseConfig.baseUrl}/engineer/fail/test`,
						method: 'POST',
						header: {
							'Authorization': `Bearer ${this.token}`
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
					console.error('工单检查失败:', error);
					this.pendingOrder = false;
				}
			},

			async handlePendingOrderClick() {
				if (!this.pendingOrderType || !this.pendingOrderId) return;

				const currentModule = this.modules.find(item => item.type === this.pendingOrderType);
				if (currentModule) {
					const detailUrl = `${currentModule.detailUrl}/${this.pendingOrderId}`;
					const res = await uni.request({
						url: detailUrl,
						method: 'GET',
						header: {
							'Authorization': `Bearer ${this.token}`
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
							title: '详情数据加载失败',
							icon: 'none'
						});
					}
				}
			},

			getAccessToken() {
				this.token = uni.getStorageSync('token');
			},

			getDeviceOptions() {
				uni.request({
					url: `${baseConfig.baseUrl}/engineer/device/get`,
					method: 'GET',
					header: {
						'Authorization': `Bearer ${this.token}`
					},
					success: (res) => {
						if (res.data.code === 200) {
							this.deviceOptions = res.data.data.map(device => ({
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
				return this.modules.find(item => item.type === this.activeModule);
			},

			async fetchData() {
				try {
					const currentModule = this.getCurrentModule();
					if (!currentModule) return;

					const requestConfig = {
						url: currentModule.url,
						method: currentModule.method,
						header: {
							'Authorization': `Bearer ${this.token}`
						}
					};

					if (currentModule.method === 'GET') {
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
						title: '数据加载失败',
						icon: 'none'
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
				if (!deviceId) return '未绑定设备';
				return this.deviceOptions.find(item => item.id === deviceId)?.name || '未知设备';
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

				const detailUrl = `${currentModule.detailUrl}/${item.id}`;
				const res = await uni.request({
					url: detailUrl,
					method: 'GET',
					header: {
						'Authorization': `Bearer ${this.token}`
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
						title: '详情数据加载失败',
						icon: 'none'
					});
				}
			}
		}
	};
</script>

<style scoped>
	.order-type {
		color: #007AFF;
		font-weight: bold;
		margin: 0 4rpx;
	}

	.pending-notice {
		background: #fffbe6;
		border: 1px solid #ffe58f;
		border-radius: 8rpx;
		padding: 20rpx 30rpx;
		margin: 0 20rpx 20rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		color: #d48806;
		animation: fadeIn 0.3s;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}

		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

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