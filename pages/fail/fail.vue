<template>
	<view class="container">
		<!-- 设备名称 -->
		<view class="detail-card">
			<view class="detail-header">
				<text class="detail-label">设备名称:</text>
			</view>
			<view class="detail-content">
				<text class="detail-value">{{ deviceName }}</text>
			</view>
		</view>

		<!-- 详情 -->
		<view class="detail-card">
			<view class="detail-header">
				<text class="detail-label">详情:</text>
			</view>
			<view class="detail-content">
				<text class="detail-value detail-text">{{ detailData.detail }}</text>
			</view>
		</view>

		<view class="detail-card">
			<view class="detail-header">
				<text class="detail-label">创建时间:</text>
			</view>
			<view class="detail-content">
				<text class="detail-value">{{ formatBasicDate(detailData.createTime) }}</text>
			</view>
		</view>

		<view v-if="detailData.status === 2" class="action-button-container">
			<button class="action-button" hover-class="action-button-hover" @click="applySpare">
				申请备件
			</button>
		</view>

		<!-- 前置图片 -->
		<view class="detail-card">
			<view class="detail-header">
				<text class="detail-label">故障图片:</text>
			</view>
			<view class="detail-content">
				<view class="image-container">
					<image :src="processedBeforeUrl" mode="widthFix" class="detail-image"></image>
					<view v-if="!detailData.beforeUrl" class="placeholder-image">
						<text class="placeholder-text">暂无图片</text>
					</view>
				</view>
			</view>
		</view>

		<!-- 上传图片 (仅当状态为处理中时显示) -->
		<view v-if="detailData.status === 2" class="detail-card">
			<view class="detail-header">
				<text class="detail-label">上传维修图片:</text>
			</view>
			<view class="detail-content">
				<view class="upload-container">
					<view class="upload-area" @click="chooseImage">
						<text class="upload-text">点击上传图片</text>
					</view>
					<view v-if="repairImageUrl" class="repair-image-container">
						<image :src="repairImageUrl" mode="widthFix" class="repair-image"></image>
					</view>
				</view>
			</view>
		</view>

		<!-- 处理按钮 (仅当状态为待处理时显示) -->
		<view v-if="detailData.status === 1" class="action-button-container">
			<button class="action-button" hover-class="action-button-hover" @click="startProcessing">
				开始处理
			</button>
		</view>

		<!-- 完成维修按钮 (仅当状态为处理中时显示) -->
		<view v-if="detailData.status === 2" class="action-button-container">
			<button class="action-button" hover-class="action-button-hover" @click="completeRepair">
				完成维修
			</button>
		</view>
	</view>
</template>

<script>
	import {
		baseConfig
	} from '../../utils/config';


	export default {
		data() {
			return {
				detailData: {
					id: '',
					deviceId: '',
					detail: '',
					createTime: '',
					beforeUrl: '',
					status: 0
				},
				repairImageUrl: '',
				finishUrl: '',
				deviceName: '',
				deviceOptions: [],
				token: '' // 请确保在实际使用中正确获取和存储 token
			};
		},
		onLoad(options) {
			// 从URL参数中获取数据
			if (options.detailData) {
				try {
					this.getAccessToken();
					this.detailData = JSON.parse(decodeURIComponent(options.detailData));
					this.getDeviceOptions(); // 获取设备选项

				} catch (e) {
					console.error('解析详情数据失败', e);
					uni.showToast({
						title: '数据加载失败',
						icon: 'none'
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
				if (!dateArray || !Array.isArray(dateArray) || dateArray.length < 6) return '--';

				try {
					// 解构数组并处理月份（月份从0开始）
					const [year, month, day, hours, minutes, seconds] = dateArray;

					// 补零函数
					const padZero = num => String(num).padStart(2, '0');

					// 注意：月份需要减1
					const date = new Date(year, month - 1, day, hours, minutes, seconds);
					if (isNaN(date.getTime())) return '--'; // 校验日期合法性

					// 拼接标准格式
					return `${year}-${padZero(month)}-${padZero(day)} ` +
						`${padZero(hours)}:${padZero(minutes)}:${padZero(seconds)}`;
				} catch (e) {
					console.error('日期格式化失败:', e);
					return '--';
				}
			},
			startProcessing() {
				uni.showModal({
					title: '确认处理',
					content: '确定要开始处理该设备问题吗？',
					success: (res) => {
						if (res.confirm) {
							// 向后端发送请求
							uni.request({
								url: `${baseConfig.baseUrl}/engineer/fail/deal/${this.detailData.id}`, // 替换为实际的后端 API 地址
								method: 'POST',
								header: {
									'Authorization': `Bearer ${this.token}` // ✅ 使用存储的 token
								},
								success: (response) => {
									if (response.data.code === 200) {
										this.updateStatus(2); // 更新状态为处理中
										uni.showToast({
											title: '开始处理',
											icon: 'success'
										});
									} else {
										uni.showToast({
											title: '您有正在处理中的工单',
											icon: 'none'
										});
									}
								},
								fail: () => {
									uni.showToast({
										title: '请求失败',
										icon: 'none'
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
					sizeType: ['original', 'compressed'],
					sourceType: ['album', 'camera'],
					success: (res) => {
						// 显示临时图片预览
						this.repairImageUrl = res.tempFilePaths[0];

						// 执行上传
						uni.uploadFile({
							url: `${baseConfig.baseUrl}/upload`,
							filePath: res.tempFilePaths[0], // 注意这里用 filePath 不是 src
							name: 'file', // 必须与后端接收参数名一致
							header: {
								'Authorization': `Bearer ${this.token}`,
								'Content-Type': 'multipart/form-data' // 明确指定内容类型
							},
							success: (uploadRes) => {
								try {
									const data = JSON.parse(uploadRes.data);
									if (data.code === 200) {
										this.finishUrl = data
											.data; // 假设返回结构为 { code:200, data:"url" }
									} else {
										uni.showToast({
											title: '上传失败: ' + data.msg,
											icon: 'none'
										});
									}
								} catch (e) {
									console.error('解析响应失败', e);
									uni.showToast({
										title: '上传结果解析失败',
										icon: 'none'
									});
								}
							},
							fail: (err) => {
								console.error('上传失败', err);
								uni.showToast({
									title: `上传失败: ${err.errMsg}`,
									icon: 'none'
								});
							}
						});
					}
				});
			},
			completeRepair() {
				if (!this.finishUrl) {
					uni.showToast({
						title: '请先上传维修图片',
						icon: 'none'
					});
					return;
				}
				console.log("finish:{}", this.finishUrl);
				uni.showModal({
					title: '确认完成',
					content: '确定已完成维修吗？',
					success: (res) => {
						if (res.confirm) {
							uni.request({
								url: `${baseConfig.baseUrl}/engineer/fail/finish/${this.detailData.id}`,
								method: 'POST',
								header: {
									'Authorization': `Bearer ${this.token}`,
									'Content-Type': 'application/x-www-form-urlencoded'
								},
								data: `finishUrl=${encodeURIComponent(this.finishUrl)}`,
								success: (response) => {
									if (response.data.code === 200) {
										this.updateStatus(3); // 更新状态为已完成
										uni.showToast({
											title: '维修完成',
											icon: 'success'
										});
									} else {
										uni.showToast({
											title: '提交维修信息失败',
											icon: 'none'
										});
									}
								},
								fail: () => {
									uni.showToast({
										title: '提交维修信息失败',
										icon: 'none'
									});
								}
							});
						}
					}
				});
			},
			getAccessToken() {
				this.token = uni.getStorageSync('token');
			},
			getDeviceOptions() {
				uni.request({
					url: `${baseConfig.baseUrl}/engineer/device/get`,
					method: 'GET',
					header: {
						'Authorization': `Bearer ${this.token}` // 确保正确使用存储的 token
					},
					success: (res) => {
						if (res.data.code === 200) {
							this.deviceOptions = res.data.data.map(device => ({
								id: device.id,
								name: device.name
							}));
							this.updateDeviceName(); // 更新设备名称
						} else {
							uni.showToast({
								title: '获取设备列表失败',
								icon: 'none'
							});
						}
					},
					fail: (err) => {
						console.error('获取设备列表失败', err);
						uni.showToast({
							title: '获取设备列表失败，请检查网络连接',
							icon: 'none'
						});
					}
				});
			},
			updateDeviceName() {
				const device = this.deviceOptions.find(item => item.id === this.detailData.deviceId);
				if (device) {
					this.deviceName = device.name;
				} else {
					this.deviceName = '未知设备';
				}
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
						return '未知状态';
				}
			},
			updateStatus(newStatus) {
				this.detailData.status = newStatus;
				console.log('状态已更新为:', this.getStatusText(newStatus));
			}
		}
	};
</script>

<style scoped>
	/* 全局样式 */
	.container {
		padding: 20rpx;
		background-color: #f5f7fa;
		min-height: 100vh;
	}

	/* 页面标题 */
	.page-header {
		margin-bottom: 20rpx;
		padding: 20rpx 0;
	}

	.page-title {
		font-size: 36rpx;
		font-weight: bold;
		color: #333;
		text-align: center;
	}

	/* 卡片样式 */
	.detail-card {
		background-color: white;
		border-radius: 16rpx;
		margin-bottom: 20rpx;
		overflow: hidden;
		box-shadow: none;
		border: none;
	}

	.detail-header {
		padding: 20rpx;
	}

	.detail-label {
		font-size: 28rpx;
		font-weight: bold;
		color: #333;
	}

	.detail-content {
		padding: 20rpx;
	}

	.detail-value {
		font-size: 28rpx;
		color: #666;
		word-break: break-all;
	}

	.detail-text {
		line-height: 1.6;
	}

	/* 图片样式 */
	.image-container {
		width: 100%;
		position: relative;
	}

	.detail-image {
		width: 100%;
		border-radius: 8rpx;
		margin: 10rpx 0;
	}

	.placeholder-image {
		width: 100%;
		height: 300rpx;
		background-color: #f5f5f5;
		border-radius: 8rpx;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.placeholder-text {
		color: #999;
		font-size: 24rpx;
	}

	/* 上传区域样式 */
	.upload-container {
		width: 100%;
	}

	.upload-area {
		width: 100%;
		height: 200rpx;
		background-color: #f5f5f5;
		border-radius: 8rpx;
		display: flex;
		justify-content: center;
		align-items: center;
		border: 2rpx dashed #ccc;
		margin-bottom: 20rpx;
	}

	.upload-text {
		color: #999;
		font-size: 24rpx;
	}

	.repair-image-container {
		width: 100%;
	}

	.repair-image {
		width: 100%;
		border-radius: 8rpx;
	}

	/* 状态样式 */
	.status-badge {
		padding: 12rpx 24rpx;
		border-radius: 30rpx;
		font-size: 24rpx;
		font-weight: bold;
		display: inline-block;
		box-shadow: none;
	}

	.status-cancel {
		background-color: #f5f5f5;
		color: #999;
	}

	.status-pending {
		background-color: #fff7e6;
		color: #fa8c16;
	}

	.status-processing {
		background-color: #e6f7ff;
		color: #1890ff;
	}

	.status-complete {
		background-color: #f6ffed;
		color: #52c41a;
	}

	/* 按钮样式 */
	.action-button-container {
		margin: 40rpx 0;
	}

	.action-button {
		background: linear-gradient(to right, #1890ff, #40a9ff);
		color: white;
		border: none;
		border-radius: 8rpx;
		font-size: 28rpx;
		padding: 16rpx 0;
		width: 100%;
		box-shadow: 0 4rpx 12rpx rgba(24, 144, 255, 0.3);
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.action-button-hover {
		transform: translateY(2rpx);
		box-shadow: 0 2rpx 8rpx rgba(24, 144, 255, 0.2);
	}
</style>